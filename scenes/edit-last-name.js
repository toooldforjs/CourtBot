const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { newUserMenuMarkup, registeredUserMenuMarkup } = require("../components/keyboards");
const userModel = require("../models/User");
const replyMessages = require("../message-handlers/edit-lastname");

// сцена заполнения фамилии при редактировании профиля или при первичной регистрации

exports.GenEditLastnameScene = function () {
	const editLastname = new Scene("editLastname");
	editLastname.enter(async (ctx) => {
		ctx.scene.state.sceneName = "editLastname";
		let replyMsg = replyMessages.editUserLastname(ctx.scene.state);
		if (ctx.scene.state.action == "register") {
			ctx.reply(replyMsg.sceneEnterMessage, newUserMenuMarkup);
		} else {
			ctx.reply(replyMsg.sceneEnterMessage, registeredUserMenuMarkup);
		}
	});
	editLastname.on("text", async (ctx) => {
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
				if (ctx.scene.state.action == "register") {
					try {
						await userModel.updateOne({ telegramId: ctx.message.from.id }, { $set: { lastName: msg } });
						ctx.scene.enter("editRegion", ctx.scene.state);
					} catch (error) {
						ctx.reply("Ошибка сохранения фамилии. Попробуйте сначала.");
						ctx.scene.reenter();
					}
				} else {
					try {
						await userModel.updateOne({ telegramId: ctx.message.from.id }, { $set: { lastName: msg } });
						ctx.scene.enter("main");
					} catch (error) {
						ctx.reply("Ошибка обновления фамилии. Попробуйте сначала.");
						ctx.scene.reenter();
					}
					ctx.reply(`Фамилия обновлена. Новая фамилия: ${msg}`);
				}
				break;
		}
	});
	editLastname.on("message", (ctx) =>
		ctx.reply(`
Если это Ваша фамилия, то я бы советовал ее сменить.
А если серьезно, давайте фамилию. Буквами.
    `)
	);
	return editLastname;
};
