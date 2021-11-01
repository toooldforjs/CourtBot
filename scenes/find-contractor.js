const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { correctQuery, whatMarkup, getID, searchCourt, courtList, userList } = require("../components/scene-functions");
const db = require("../db");
const userModel = require("../models/User");
const courtModel = require("../models/Court");

// сцена поиска Исполнителя в базе бота

exports.GenFindСontractorScene = function () {
	const findСontractor = new Scene("findСontractor");
	findСontractor.enter(async (ctx) => {
		ctx.scene.state.sceneName = "findСontractor";
		let mainID = getID(ctx.message, ctx.callbackQuery);
		ctx.reply(
			`
💡
Это поиск Исполнителя для ознакомления с судебным делом.
Введите регион или город суда, в котором нужно провести ознакомление, и я предложу подходящие суды.
Когда определимся с судом я помогу найти местного Исполнителя, готового туда сходить.`,
			await whatMarkup(mainID)
		);
	});
	findСontractor.on("text", async (ctx) => {
		let msg = correctQuery(ctx.message.text);
		switch (msg) {
			case "Главное меню":
				ctx.scene.enter("main");
				break;
			case "Регистрация":
				if (await db.isRegistered(ctx.message.from.id)) {
					ctx.reply(messages.alreadyRegistered);
				} else {
					ctx.scene.state.action = "register";
					ctx.scene.enter("editName", ctx.scene.state);
				}
				break;
			case "Найти исполнителя":
				const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
				if (isUserRegistered) {
					if (isUserRegistered.contractorStatus) {
						ctx.scene.enter("findСontractor");
					} else {
						ctx.reply(
							"Похоже Вы не завершили регистрацию в качестве Заказчика. Перейдите в профиль и укажите этот параметр"
						);
					}
				} else {
					ctx.reply("Вы еще не зарегистрированы. Искать Исполнителя можно только тем, кого я знаю по имени.");
				}
				break;
			case "Помощь":
			case "/help":
				ctx.reply(messages.helpMessage);
				break;
			case "Мой профиль":
				ctx.scene.enter("profile");
				break;
			case "/start":
				ctx.scene.reenter();
				break;
			case "/admin":
				ctx.scene.enter("adminScene");
				break;
			default:
				try {
					if (await db.isRegistered(ctx.message.from.id)) {
						let courts = await searchCourt(ctx.message.from.id, msg);
						if (courts.length > 0) {
							await ctx.reply(
								"🔎 Вот, что удалось найти. Выберите один из результатов с помощью кнопки. Если не нашли нужный - попробуйте уточнить запрос. 🔍"
							);

							courts.forEach((element) => {
								return courtList(element, ctx);
							});
						} else {
							ctx.reply("⚠️ Поиск не дал результатов. Переформулируйте запрос и попробуйте снова.");
						}
					} else {
						await ctx.reply("⚠️ Похоже Вы не зарегистрированы в системе. Загрегистрируйтесь и возвращайтесь.");
						ctx.scene.enter("main");
					}
				} catch (error) {
					console.error(error);
					await ctx.reply(messages.defaultErrorMessage);
					ctx.scene.reenter();
				}
		}
	});
	findСontractor.action(/^dbid_.+/, async (ctx) => {
		ctx.answerCbQuery();
		let dbid = ctx.callbackQuery.data.slice(5);
		try {
			const chosenCourt = await courtModel.findOne({ _id: dbid });
			const foundedUsers = await userModel.aggregate([
				{ $match: { region: chosenCourt.COURTNUMBER } },
				{ $sample: { size: 3 } },
			]);
			await ctx.reply(`
🔎 Вот кто у нас есть в этом регионе. 🔍
Если нужно уточнить поиск - просто введите регион или город снова.
`);
			foundedUsers.forEach((element) => {
				return userList(element, ctx);
			});
		} catch (error) {
			console.error(error);
			ctx.reply(messages.defaultErrorMessage);
			ctx.scene.reenter();
		}
	});
	findСontractor.action(/^user_.+/, async (ctx) => {
		ctx.answerCbQuery();
		let DbUserId = ctx.callbackQuery.data.slice(5);
		try {
			const chosenUser = await userModel.findOne({ _id: DbUserId });
			await ctx.telegram.sendMessage(
				chosenUser.telegramId,
				`
🎉 Здравствуйте, <b>${chosenUser.firstName}</b>! 🎉
Вам отправлена заявка на услугу ознакомления с материалами судебного дела в Арбитражном суде Вашего региона.

Заказчик: 👔 <b>${ctx.callbackQuery.from.first_name} ${ctx.callbackQuery.from.last_name}</b>.
Написать заказчику: 💬 @${ctx.callbackQuery.from.username}.
            `,
				{ parse_mode: "HTML" }
			);
			await ctx.reply(
				`
💡
Сообщение для <b>${chosenUser.firstName} ${chosenUser.lastName}</b> отправлено.
Если понадобится - можете написать ему лично: @${chosenUser.username}
`,
				{ parse_mode: "HTML" }
			);
		} catch (error) {
			console.error(error);
			ctx.reply(messages.defaultErrorMessage);
			ctx.scene.reenter();
		}
	});
	findСontractor.on("message", (ctx) => ctx.reply(messages.messageTypeWarningMessage));
	return findСontractor;
};
