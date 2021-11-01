const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { confirmEditButtons } = require("../components/keyboards");
const userModel = require("../models/User");

// сцена редактирования параметров профиля

exports.GenEditProfileScene = function () {
	const editProfile = new Scene("editProfile");
	editProfile.enter(async (ctx) => {
		ctx.scene.state.sceneName = "editProfile";
		ctx.scene.state.action = "edit";
		ctx.reply(
			`
💡 Редактирование профиля. 💡
Выберите с помощью кнопок под сообщением что именно Вы хотите изменить.
        `,
			confirmEditButtons
		);
	});
	editProfile.on("text", async (ctx) => {
		switch (ctx.message.text) {
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
				ctx.reply("Не нужно ничего писать. Пользуйтесь кнопками.");
				break;
		}
	});
	editProfile.action("editProfileName", (ctx) => {
		ctx.answerCbQuery();
		ctx.scene.enter("editName", ctx.scene.state);
	});
	editProfile.action("editProfileLastname", (ctx) => {
		ctx.answerCbQuery();
		ctx.scene.enter("editLastname", ctx.scene.state);
	});
	editProfile.action("editProfileRegion", (ctx) => {
		ctx.answerCbQuery();
		ctx.scene.enter("editRegion", ctx.scene.state);
	});
	editProfile.action("editProfileContractor", (ctx) => {
		ctx.answerCbQuery();
		ctx.scene.enter("editContractorStatus", ctx.scene.state);
	});
	editProfile.action("editProfileCustomer", (ctx) => {
		ctx.answerCbQuery();
		ctx.scene.enter("editCustomerStatus", ctx.scene.state);
	});
	editProfile.on("message", (ctx) => ctx.reply(messages.messageTypeWarningMessage));
	return editProfile;
};
