const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { newUserMenuMarkup, registeredUserMenuMarkup } = require("../components/keyboards");
const { searchCourt, courtList } = require("../components/scene-functions");
const userModel = require("../models/User");
const courtModel = require("../models/Court");
const replyMessages = require("../message-handlers/edit-region");

// сцена указания региона при редактировании профиля или при первичной регистрации

exports.GenEditRegionScene = function () {
	const editRegion = new Scene("editRegion");
	editRegion.enter(async (ctx) => {
		ctx.scene.state.sceneName = "editRegion";
		let replyMsg = replyMessages.editUserRegion(ctx.scene.state);
		if (ctx.scene.state.action == "register") {
			ctx.reply(replyMsg.sceneEnterMessage, newUserMenuMarkup);
		} else {
			ctx.reply(replyMsg.sceneEnterMessage, registeredUserMenuMarkup);
		}
	});
	editRegion.on("text", async (ctx) => {
		const msg = ctx.message.text;
		switch (msg) {
			case "Регистрация":
				ctx.reply(replyMsg.registerationUserMessage);
				break;
			case "Мой профиль":
				ctx.scene.enter("profile");
				break;
			case "Найти исполнителя":
				const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
				if (isUserRegistered) {
					if (isUserRegistered.contractorStatus) {
						ctx.scene.enter("findСontractor");
					} else {
						ctx.reply(replyMsg.notRegisteredContractorMessage);
					}
				} else {
					ctx.reply(replyMsg.notRegisteredUserMessage);
				}
				break;
			case "Помощь":
			case "/help":
				ctx.reply(messages.helpMessage);
				break;
			case "Главное меню":
			case "/start":
				ctx.scene.enter("main");
				break;
			default:
				try {
					let courts = await searchCourt(ctx.message.from.id, ctx.message.text);
					if (courts.length > 0) {
						await ctx.reply(
							`
🔎 Вот, что удалось найти. 🔎
Выберите один из результатов с помощью кнопки. Если не нашли нужный - попробуйте уточнить запрос.`
						);
						courts.forEach((element) => {
							return courtList(element, ctx);
						});
					} else {
						ctx.reply("⚠️ Поиск не дал результатов. Переформулируйте запрос.");
					}
				} catch (error) {
					console.log(error);
					ctx.reply(messages.defaultErrorMessage);
				}
				break;
		}
	});
	editRegion.action(/^dbid_.+/, async (ctx) => {
		let dbid = ctx.callbackQuery.data.slice(5);
		try {
			ctx.answerCbQuery();
			const chosenCourt = await courtModel.findOne({ _id: dbid });
			await userModel.updateOne(
				{ telegramId: ctx.callbackQuery.from.id },
				{ $set: { region: chosenCourt.COURTNUMBER } }
			);
			ctx.reply("💡 Регион и суд обновлены.");
			if (ctx.scene.state.action == "edit") {
				ctx.scene.enter("profile");
			} else {
				ctx.scene.enter("editContractorStatus", ctx.scene.state);
			}
		} catch (error) {
			console.log(error);
			ctx.reply(messages.defaultErrorMessage);
			ctx.scene.reenter();
		}
	});
	editRegion.on("message", (ctx) =>
		ctx.reply(
			`
💡 <b>Введите <u>регион</u> Вашего Арбитражного суда.</b> 💡
Можно написать город, индекс, улицу. Я поищу в своей базе и предложу варианты.
    `,
			{
				parse_mode: "HTML",
				disable_web_page_preview: true,
			}
		)
	);
	return editRegion;
};
