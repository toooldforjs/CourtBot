const Scene = require("telegraf/scenes/base");
const { userProfileButtons } = require("../components/keyboards");
const { getID, datesFunction } = require("../components/scene-functions");
const { switcher } = require("../components/switcher");
const userModel = require("../models/User");
const courtModel = require("../models/Court");
const logger = require("../logger");

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
				if (userProfile.profilePic) {
					await ctx.telegram.sendPhoto(mainID, `${userProfile.profilePic}`, {
						caption: `
Имя: 🔸 ${userProfile.firstName == undefined ? "Неизвестно" : userProfile.firstName}
Фамилия: 🔸 ${userProfile.lastName == undefined ? "Неизвестна" : userProfile.lastName}
Номер суда: 🔸 ${userProfile.region == undefined ? "Неизвестен" : userProfile.region}
Название суда: 🔸 ${courtProfile == null || undefined ? "Неизвестно" : courtProfile.COURTNAME}
Описание: 🔸 ${userProfile.profileBio}

Мой рейтинг: 🔸 ${userProfile.rating.totalRating}
Как повысить рейтинг? /help

Исполнитель? ${
							userProfile.contractorStatus == undefined
								? "❌ НЕТ"
								: userProfile.contractorStatus == false
								? "❌ НЕТ"
								: "✅ ДА"
						}${dates.contractorRD == undefined ? "" : `\nИсполнитель с ${dates.contractorRD}`}

Заказчик? ${
							userProfile.customerStatus == undefined
								? "❌ НЕТ"
								: userProfile.customerStatus == false
								? "❌ НЕТ"
								: "✅ ДА"
						}${dates.customerRD == undefined ? "" : `\nЗаказчик с ${dates.customerRD}`}
`,
						reply_markup: userProfileButtons,
					});
				} else {
					await ctx.reply(
						`
Имя: 🔸 ${userProfile.firstName == undefined ? "Неизвестно" : userProfile.firstName}
Фамилия: 🔸 ${userProfile.lastName == undefined ? "Неизвестна" : userProfile.lastName}
Номер суда: 🔸 ${userProfile.region == undefined ? "Неизвестен" : userProfile.region}
Название суда: 🔸 ${courtProfile == null || undefined ? "Неизвестно" : courtProfile.COURTNAME}
Описание: 🔸 ${userProfile.profileBio}

Мой рейтинг: 🔸 ${userProfile.rating.totalRating}
Как повысить рейтинг? /help

Исполнитель? ${
							userProfile.contractorStatus == undefined
								? "❌ НЕТ"
								: userProfile.contractorStatus == false
								? "❌ НЕТ"
								: "✅ ДА"
						}${dates.contractorRD == undefined ? "" : `\nИсполнитель с ${dates.contractorRD}`}

Заказчик? ${
							userProfile.customerStatus == undefined
								? "❌ НЕТ"
								: userProfile.customerStatus == false
								? "❌ НЕТ"
								: "✅ ДА"
						}${dates.customerRD == undefined ? "" : `\nЗаказчик с ${dates.customerRD}`}
					`,
						{ reply_markup: userProfileButtons }
					);
				}
			} else {
				ctx.reply(
					"Похоже мы еще не знакомы. Личный кабинет и профиль станут доступны после того, Вы как зарегистрируетесь."
				);
				ctx.scene.enter("main");
			}
		} catch (error) {
			logger.error(error, { tgMessage: ctx.message, tgQuery: ctx.callbackQuery });
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
		switcher(ctx);
	});
	profile.on("message", async (ctx) => {
		ctx.reply("⚠️ Не нужно ничего отправлять, пока я об этом не попрошу.");
	});
	return profile;
};
