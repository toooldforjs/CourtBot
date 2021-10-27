const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { newUserMenuMarkup, registeredUserMenuMarkup } = require("../components/keyboards");
const db = require("../db");
const userModel = require("../models/User");
const replyMessages = require("../message-handlers/edit-name");

// сцена заполнения имени при редактировании профиля или при первичной регистрации

exports.GenEditNameScene = function () {
	const editName = new Scene("editName");
	editName.enter(async (ctx) => {
		let replyMsg = replyMessages.editUserName(ctx.scene.state);
		if (ctx.scene.state.action == "register") {
			ctx.reply(replyMsg.sceneEnterMessage, newUserMenuMarkup);
		} else {
			ctx.reply(replyMsg.sceneEnterMessage, registeredUserMenuMarkup);
		}
	});
	editName.on("text", async (ctx) => {
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
					if (await db.isRegistered(ctx.message.from.id)) {
						await ctx.reply("❗ Похоже такой пользователь уже зарегистрирован. Посмотрите профиль.❗");
						ctx.scene.state.action = "edit";
						ctx.scene.enter("main", ctx.scene.state);
					} else {
						let userParams = {
							telegramId: ctx.message.from.id,
							username: ctx.message.from.username,
							firstName: msg,
							registrationDate: Date.now(),
						};
						try {
							db.saveUser(userParams);
							ctx.scene.enter("editLastname", ctx.scene.state);
						} catch (error) {
							ctx.reply("Ошибка сохранения имени и ID. Попробуйте сначала.");
							ctx.scene.reenter();
						}
					}
				} else {
					try {
						await userModel.updateOne({ telegramId: ctx.message.from.id }, { $set: { firstName: msg } });
						ctx.reply(`Имя обновлено. Новое имя: ${msg}`);
						ctx.scene.enter("main");
					} catch (error) {
						ctx.reply("Ошибка обновления имени. Попробуйте сначала.");
						ctx.scene.reenter();
					}
				}

				break;
		}
	});
	editName.on("message", (ctx) => ctx.reply("Нет. Имя. Текстом. Все просто."));
	return editName;
};
