const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { registeredUserMenuMarkup, userProfileButtons } = require("../components/keyboards");
const { getID, datesFunction } = require("../components/scene-functions");
const userModel = require("../models/User");
const courtModel = require("../models/Court");

exports.GenProfileScene = function () {
	const profile = new Scene("profile");
	profile.enter(async (ctx) => {
		ctx.scene.state.sceneName = "profile";
		let mainID = getID(ctx.message, ctx.callbackQuery);
		try {
			const userProfile = await userModel.findOne({ telegramId: mainID });
			if (userProfile) {
				let courtProfile = await courtModel.findOne({ COURTNUMBER: userProfile.region });
				let dates = datesFunction(userProfile);
				await ctx.reply(
					`
⭐ Мой профиль ⭐

                `,
					registeredUserMenuMarkup
				);
				await ctx.reply(
					`
<b>Имя:</b> ${userProfile.firstName == undefined ? "Неизвестно" : userProfile.firstName}
<b>Фамилия:</b> ${userProfile.lastName == undefined ? "Неизвестна" : userProfile.lastName}
<b>Номер суда:</b> ${userProfile.region == undefined ? "Неизвестен" : userProfile.region}
<b>Название суда:</b> ${courtProfile == null || undefined ? "Неизвестно" : courtProfile.COURTNAME}

<b>Зарегистрирован как исполнитель:</b> ${
						userProfile.contractorStatus == undefined
							? "❌ НЕТ"
							: userProfile.contractorStatus == false
							? "❌ НЕТ"
							: "✅ ДА"
					}${
						dates.contractorRD == undefined
							? ""
							: `\n\n<b>Дата регистрации как исполнителя:</b> ⏰ ${dates.contractorRD}`
					}

<b>Зарегистрирован как заказчик:</b> ${
						userProfile.customerStatus == undefined
							? "❌ НЕТ"
							: userProfile.customerStatus == false
							? "❌ НЕТ"
							: "✅ ДА"
					}${dates.customerRD == undefined ? "" : `\n\n<b>Дата регистрации как заказчика:</b> ⏰ ${dates.customerRD}`}
`,
					userProfileButtons
				);
			} else {
				ctx.reply(
					"Похоже мы еще не знакомы. Личный кабинет и профиль станут доступны после того, Вы как зарегистрируетесь."
				);
				ctx.scene.enter("main");
			}
		} catch (error) {
			console.log(error);
			await ctx.reply("Ошибка поиска профиля в базе");
			ctx.scene.enter("main");
		}
	});
	profile.action("deleteProfile", (ctx) => {
		ctx.answerCbQuery();
		ctx.scene.enter("deleteProfile");
	});
	profile.action("editProfile", (ctx) => {
		ctx.answerCbQuery();
		ctx.scene.enter("editProfile");
	});
	profile.on("text", async (ctx) => {
		const msg = ctx.message.text;
		switch (msg) {
			case "Регистрация":
				ctx.reply("Вы уже зарегистрированы.");
				break;
			case "Найти исполнителя":
				const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
				if (isUserRegistered) {
					if (isUserRegistered.customerStatus) {
						ctx.scene.enter("findСontractor");
					} else {
						ctx.reply(
							"Похоже Вы не завершили регистрацию в качестве Заказчика. Перейдите в профиль и укажите этот параметр."
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
				ctx.scene.reenter();
				break;
			default:
				ctx.reply("Пользуйтесь кнопками. Не пишите ничего, пока я об этом не попрошу.");
				break;
		}
	});
	profile.on("message", (ctx) =>
		ctx.reply(
			"Не нужно ничего отправлять. В профиле можно изменить параметры или удалить сведения о себе полностью. Хотите выйти из профиля - воспользуйтесь кнопками внизу."
		)
	);
	return profile;
};
