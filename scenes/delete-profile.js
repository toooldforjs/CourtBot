const Scene = require("telegraf/scenes/base");
// const messages = require("../messages");
const { confirmDeleteButtons } = require("../components/keyboards");
const userModel = require("../models/User");
const { switcher } = require("../components/switcher");
const { dashLogger } = require("../logger");

// сцена удаления профиля

let deleteProfileHandler = async function (ctx) {
	try {
		await userModel.deleteOne({ telegramId: ctx.message.from.id });
		ctx.reply("Ваш аккаунт удален. Возвращайтесь, если понадоблюсь.");
		ctx.scene.enter("main");
	} catch (error) {
		dashLogger.error(`Error : ${error}, Scene: ${ctx.scene.state.sceneName}`);
		console.log(error);
		ctx.reply(`
🔴 Ошибка удаления аккаунта. 🔴
Попробуйте позже, или обратитесь в поддержку /help
`);
		ctx.scene.enter("main");
	}
};

exports.GenDeleteProfileScene = function () {
	const deleteProfile = new Scene("deleteProfile");
	deleteProfile.enter(async (ctx) => {
		ctx.scene.state.sceneName = "deleteProfile";
		ctx.reply(
			`
🔥 ❗ ВНИМАНИЕ ❗ 🔥
Вы приступили к удалению своего профиля. После удаления Вам снова будет недоступен функционал бота. Если передумаете - придется регистрироваться заново.
        `,
			confirmDeleteButtons
		);
	});
	deleteProfile.on("text", async (ctx) => {
		switcher(ctx, deleteProfileHandler);
		// const msg = ctx.message.text;
		// 		switch (msg) {
		// 			case "Найти исполнителя":
		// 				const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
		// 				if (isUserRegistered) {
		// 					if (isUserRegistered.contractorStatus) {
		// 						ctx.scene.enter("findСontractor");
		// 					} else {
		// 						ctx.reply(
		// 							"Похоже Вы не завершили регистрацию в качестве Заказчика. Перейдите в профиль и укажите этот параметр"
		// 						);
		// 					}
		// 				} else {
		// 					ctx.reply("Вы еще не зарегистрированы. Искать Исполнителя можно только тем, кого я знаю по имени.");
		// 				}
		// 				break;
		// 			case "Помощь":
		// 			case "/help":
		// 				ctx.reply(messages.helpMessage);
		// 				break;
		// 			case "Главное меню":
		// 			case "/start":
		// 				ctx.scene.enter("main");
		// 				break;
		// 			case "Мой профиль":
		// 				ctx.scene.enter("profile");
		// 				break;
		// 			case "ВЕРНУТЬСЯ":
		// 				ctx.reply("Правильный выбор! С возвращением!");
		// 				ctx.scene.enter("main");
		// 				break;
		// 			case "УДАЛИТЬ":
		// 				try {
		// 					await userModel.deleteOne({ telegramId: ctx.message.from.id });
		// 					ctx.reply("Ваш аккаунт удален. Возвращайтесь, если понадоблюсь.");
		// 					ctx.scene.enter("main");
		// 				} catch (error) {
		// 					console.log(error);
		// 					ctx.reply(`
		// 🔴 Ошибка удаления аккаунта. 🔴
		// Попробуйте позже, или обратитесь в поддержку /help
		// `);
		// 					ctx.scene.enter("main");
		// 				}
		// 				break;
		// 			default:
		// 				ctx.reply(
		// 					`
		// Вы в процессе удаления аккаунта. Внизу экрана есть 2 кнопки. Сделайте выбор.
		//         `
		// 				);
		// 				break;
		// 		}
	});
	deleteProfile.on("message", (ctx) =>
		ctx.reply(
			`
Вы в процессе удаления аккаунта. Внизу экрана есть 2 кнопки. Сделайте выбор.
`
		)
	);
	return deleteProfile;
};
