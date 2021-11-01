const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { userStatusButtons } = require("../components/keyboards");
const userModel = require("../models/User");
const replyMessages = require("../message-handlers/edit-customer-status");

// сцена регистрации в качестве Заказчика в системе

exports.GenEditCustomerStatus = function () {
	const editCustomerStatus = new Scene("editCustomerStatus");
	editCustomerStatus.enter(async (ctx) => {
		ctx.scene.state.sceneName = "editCustomerStatus";
		let replyMsg = replyMessages.editUserCustomerStatus(ctx.scene.state);
		if (ctx.scene.state.action == "register") {
			ctx.reply(replyMsg.sceneEnterMessage, userStatusButtons);
		} else {
			ctx.reply(replyMsg.sceneEnterMessage, userStatusButtons);
		}
	});
	editCustomerStatus.on("text", async (ctx) => {
		const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
		let checkCustomerRegStatus = () => {
			let updateDate = undefined;
			if (isUserRegistered.customerStatus == true) {
				// если статус заказчика в базе == ДА
				updateDate = isUserRegistered.customerRegisterDate; // оставляем старую дату
			} else {
				updateDate = Date.now(); // записываем текущую дату
			}
			return updateDate;
		};
		const msg = ctx.message.text;
		switch (msg) {
			case "Регистрация":
				ctx.reply(replyMsg.registerationUserMessage);
				break;
			case "Мой профиль":
				ctx.scene.enter("profile");
				break;
			case "Найти исполнителя":
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
			case "Главное меню":
			case "/start":
				ctx.scene.enter("main");
				break;
			case "ДА":
				if (ctx.scene.state.action == "register") {
					try {
						await userModel.updateOne(
							{ telegramId: ctx.message.from.id },
							{ $set: { customerStatus: true, customerRegisterDate: checkCustomerRegStatus() } }
						);
						await ctx
							.reply("💡 Вы зарегистрированы как Заказчик! Можете приступать к поиску Исполнителя.")
							.then(ctx.scene.enter("main"));
					} catch (error) {
						console.log(error);
						ctx.reply(messages.defaultErrorMessage);
						ctx.scene.enter("editCustomerStatus", ctx.scene.state);
					}
				} else {
					try {
						await userModel.updateOne(
							{ telegramId: ctx.message.from.id },
							{ $set: { customerStatus: true, customerRegisterDate: checkCustomerRegStatus() } }
						);
						ctx.reply("💡 Теперь Вы зарегистрированы как Заказчик. Можете приступать к поиску Исполнителя.");
						ctx.scene.enter("profile");
					} catch (error) {
						console.log(error);
						ctx.reply(messages.defaultErrorMessage);
						ctx.scene.enter("editCustomerStatus", ctx.scene.state);
					}
				}

				break;
			case "НЕТ":
				if (ctx.scene.state.action == "register") {
					try {
						await userModel.updateOne(
							{ telegramId: ctx.message.from.id },
							{ $set: { customerStatus: false, customerRegisterDate: undefined } }
						);
						ctx.reply(
							"💡 Вы отказались от регистрации как Заказчик. Теперь Вы не сможете искать Исполнителей для ознакомления с делами. Если передумаете - измените настройку в профиле."
						);
						ctx.scene.enter("main");
					} catch (error) {
						console.log(error);
						ctx.reply(messages.defaultErrorMessage);
						ctx.scene.enter("editCustomerStatus", ctx.scene.state);
					}
				} else {
					try {
						await userModel.updateOne(
							{ telegramId: ctx.message.from.id },
							{ $set: { customerStatus: false, customerRegisterDate: undefined } }
						);
						ctx.reply(
							"💡 Вы отказались от статуса Заказчика. Теперь Вы не сможете искать Исполнителей для ознакомления с делами. Если передумаете - измените настройку в профиле."
						);
						ctx.scene.enter("profile");
					} catch (error) {
						console.log(error);
						ctx.reply(messages.defaultErrorMessage);
						ctx.scene.enter("editCustomerStatus", ctx.scene.state);
					}
				}

				break;
			default:
				ctx.reply("Нажмите на одну из кнопок внизу. ДА или НЕТ.");
				break;
		}
	});
	editCustomerStatus.on("message", (ctx) => ctx.reply(messages.messageTypeWarningMessage));
	return editCustomerStatus;
};
