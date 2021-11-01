const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { whatMarkup, getID } = require("../components/scene-functions");
const db = require("../db");
const userModel = require("../models/User");

exports.GenMainScene = function () {
	const main = new Scene("main");
	main.enter(async (ctx) => {
		ctx.scene.state.sceneName = "main";
		let mainID = getID(ctx.message, ctx.callbackQuery);
		ctx.reply(
			`
Вы находитесь в главном меню. Что хотите сделать?

⬇️ Смотрите на кнопки внизу. ⬇️

Если кнопки не видны - нажмите специальную кнопку справа от поля ввода текста чтобы их показать.
        `,
			await whatMarkup(mainID)
		);
	});
	main.on("message", async (ctx) => {
		let msg = ctx.message.text;
		switch (msg) {
			case "Регистрация":
				if (await db.isRegistered(ctx.message.from.id)) {
					ctx.reply(messages.alreadyRegistered);
					ctx.scene.reenter();
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
			case "Главное меню":
				ctx.reply("Вы уже в главном меню. Выберите действие с помощью кнопок внизу.");
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
				ctx.reply(`
                Пока не нужно ничего писать. Просто выберите одну из функций на кнопках, или перейдите в раздел помощи (/help).
                `);
				break;
		}
	});
	return main;
};
