const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { userStatusButtons } = require("../components/keyboards");
const userModel = require("../models/User");
const replyMessages = require("../message-handlers/edit-contractor-status");

// сцена регистрации в качестве Исполнителя в системе

exports.GenEditContractorStatus = function () {
	const editContractorStatus = new Scene("editContractorStatus");
	editContractorStatus.enter(async (ctx) => {
		ctx.scene.state.sceneName = "editContractorStatus";
		let replyMsg = replyMessages.editUserContractorStatus(ctx.scene.state);
		if (ctx.scene.state.action == "register") {
			ctx.reply(replyMsg.sceneEnterMessage, userStatusButtons);
		} else {
			ctx.reply(replyMsg.sceneEnterMessage, userStatusButtons);
		}
	});
	editContractorStatus.on("text", async (ctx) => {
		const msg = ctx.message.text;
		const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
		let checkContractorRegStatus = () => {
			let updateDate = undefined;
			if (isUserRegistered.contractorStatus == true) {
				// если статус исполнителя в базе == ДА
				updateDate = isUserRegistered.contractorRegisterDate; // оставляем старую дату
			} else {
				updateDate = Date.now(); // записываем текущую дату
			}
			return updateDate;
		};
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
					ctx.reply("Вы еще не зарегистрированы. Искать Исполнителей Вам пока нельзя.");
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
							{ $set: { contractorStatus: true, contractorRegisterDate: checkContractorRegStatus() } }
						);
						await ctx
							.reply("💡 Вам присвоен статус Исполнителя! Ждите сообщений о заказах.")
							.then(ctx.scene.enter("editCustomerStatus", ctx.scene.state));
					} catch (error) {
						console.log(error);
						ctx.reply(messages.defaultErrorMessage);
						ctx.scene.enter("editContractorStatus", ctx.scene.state);
					}
				} else {
					try {
						await userModel.updateOne(
							{ telegramId: ctx.message.from.id },
							{ $set: { contractorStatus: true, contractorRegisterDate: checkContractorRegStatus() } }
						);
						ctx
							.reply("💡 Cтатус Исполнителя изменен. Теперь ожидайте сообщений о заказах.")
							.then(ctx.scene.enter("profile"));
					} catch (error) {
						console.log(error);
						ctx.reply(messages.defaultErrorMessage);
						ctx.scene.enter("editContractorStatus", ctx.scene.state);
					}
				}

				break;
			case "НЕТ":
				if (ctx.scene.state.action == "register") {
					try {
						await userModel.updateOne(
							{ telegramId: ctx.message.from.id },
							{ $set: { contractorStatus: false, contractorRegisterDate: undefined } }
						);
						ctx
							.reply(
								"💡 Вы отказались от статуса Исполнителя и не сможете получать сообщения о заказах. Если передумаете - измените статус в профиле."
							)
							.then(ctx.scene.enter("editCustomerStatus", ctx.scene.state));
					} catch (error) {
						console.log(error);
						ctx.reply(messages.defaultErrorMessage);
						ctx.scene.enter("editContractorStatus", ctx.scene.state);
					}
				} else {
					try {
						await userModel.updateOne(
							{ telegramId: ctx.message.from.id },
							{ $set: { contractorStatus: false, contractorRegisterDate: undefined } }
						);
						ctx.reply(
							"💡 Вы отказались от статуса Исполнителя и не сможете получать сообщения о заказах. Если передумаете - измените статус в профиле."
						);
						ctx.scene.enter("profile");
					} catch (error) {
						console.log(error);
						ctx.reply(messages.defaultErrorMessage);
						ctx.scene.enter("editContractorStatus", ctx.scene.state);
					}
				}

				break;
			default:
				ctx.reply("Нажмите на одну из кнопок внизу. ДА или НЕТ.");
				break;
		}
	});
	editContractorStatus.on("message", (ctx) => ctx.reply(messages.messageTypeWarningMessage));
	return editContractorStatus;
};
