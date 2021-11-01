const userModel = require("../models/User");
const messages = require("../messages");
const db = require("../db");

exports.switcher = async function (ctx, handler) {
	const message = ctx.message.text;
	const sceneName = ctx.scene.state.sceneName;
	if (message === "Мой профиль") {
		switch (sceneName) {
			case "profile":
				ctx.reply("⚠️ Вы уже в своем профиле. Здесь можно изменить данные о себе или удалить профиль");
				break;
			default:
				ctx.scene.enter("profile");
				break;
		}
		return;
	} else if (message === "Главное меню" || message === "/start") {
		switch (sceneName) {
			case "main":
				ctx.reply("⚠️ Вы уже в главном меню. Выберите действие с помощью кнопок внизу.");
				break;
			default:
				console.log("to main");
				ctx.scene.enter("main");
				break;
		}
		return;
	} else if (message === "Регистрация") {
		switch (sceneName) {
			case "editName":
			case "editLastname":
			case "editRegion":
			case "editCustomerStatus":
			case "editContractorStatus":
				ctx.reply(replyMsg.registerationUserMessage);
				break;
			default:
				if (await db.isRegistered(ctx.message.from.id)) {
					ctx.reply("⚠️ Похоже, что Вы уже зарегистрированы в системе.");
					ctx.scene.enter("profile");
				} else {
					ctx.scene.state.action = "register";
					ctx.scene.enter("editName", ctx.scene.state);
				}
				break;
		}
		return;
	} else if (message === "Помощь" || message === "/help") {
		return ctx.reply(messages.helpMessage);
	} else if (message === "Найти исполнителя") {
		const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
		if (isUserRegistered) {
			if (isUserRegistered.customerStatus) {
				ctx.scene.enter("findСontractor");
			} else {
				ctx.reply(
					"⚠️ Похоже Вы не завершили регистрацию в качестве Заказчика. Перейдите в профиль и укажите этот параметр."
				);
			}
		} else {
			ctx.reply("⚠️ Вы еще не зарегистрированы. Искать Исполнителя можно только тем, кого я знаю по имени.");
		}
		return;
	} else if (message === "ВЕРНУТЬСЯ") {
		switch (sceneName) {
			case "deleteProfile":
				ctx.reply("Правильный выбор! С возвращением!");
				ctx.scene.enter("profile");
				break;
			default:
				break;
		}
	} else if (message === "УДАЛИТЬ") {
		switch (sceneName) {
			case "deleteProfile":
				handler(ctx);
				break;
			default:
				break;
		}
	}
};
