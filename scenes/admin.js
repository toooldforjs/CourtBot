const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { adminButtons } = require("../components/keyboards");
const { getID } = require("../components/scene-functions");
const db = require("../db");
const userModel = require("../models/User");
require("dotenv").config();

// сцена для админа

exports.GenAdminScene = function () {
	const adminScene = new Scene("adminScene");
	adminScene.enter(async (ctx) => {
		ctx.scene.state.sceneName = "adminScene";
		let mainID = getID(ctx.message, ctx.callbackQuery);
		if (
			(await db.isRegistered(mainID)) &&
			(await userModel.findOne({ telegramId: mainID })).telegramId === Number.parseInt(process.env.ADMIN_ID)
		) {
			ctx.reply(
				`
Центр Управления Полетами
            `,
				adminButtons
			);
		} else {
			ctx.reply("Извини, друг. Ты не админ");
			ctx.scene.enter("main");
		}
	});
	adminScene.on("text", async (ctx) => {
		const msg = ctx.message.text;
		switch (msg) {
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
			case "Главное меню":
			case "/start":
				ctx.scene.enter("main");
				break;
			case "Мой профиль":
				ctx.scene.enter("profile");
				break;
			default:
				ctx.reply(
					`
Кхм... Кнопки...
        `
				);
				break;
		}
	});
	adminScene.action("callStats", async (ctx) => {
		ctx.answerCbQuery();
		ctx.reply(`
Пользователей всего 📈 ${await userModel.countDocuments({})}
Пользователей за последние 7 дней 📈 ${await userModel.countDocuments({
			registrationDate: { $gt: new Date(Date.now() - 1000 * 60 * 60 * 168) },
		})}
Исполнителей всего 📈 
Заказчиков всего 📈 
Исполнителей за последние 7 дней 📈 
Заказчиков за последние 7 дней 📈 
Обращений к исполнителям всего
Больше всего Исполнителей из
Больше всего Заказчиков из
`);
	});
	return adminScene;
};
