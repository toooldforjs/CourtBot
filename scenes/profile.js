const Scene = require("telegraf/scenes/base");
const { userProfileButtons } = require("../components/keyboards");
const { getID, datesFunction } = require("../components/scene-functions");
const { switcher } = require("../components/switcher");
const userModel = require("../models/User");
const courtModel = require("../models/Court");
require("dotenv").config();

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
					await ctx.telegram.sendPhoto(ctx.message.chat.id, `${userProfile.profilePic}`, {
						caption: `
Имя: 🔸 ${userProfile.firstName == undefined ? "Неизвестно" : userProfile.firstName}
Фамилия: 🔸 ${userProfile.lastName == undefined ? "Неизвестна" : userProfile.lastName}
Номер суда: 🔸 ${userProfile.region == undefined ? "Неизвестен" : userProfile.region}
Название суда: 🔸 ${courtProfile == null || undefined ? "Неизвестно" : courtProfile.COURTNAME}
Описание: 🔸
${userProfile.profileBio == null || undefined ? "Не указано" : userProfile.profileBio}

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
					await ctx.reply("⭐ ⭐ ⭐ Мой профиль ⭐ ⭐ ⭐");
				}
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
		switcher(ctx);
	});
	profile.on("message", async (ctx) => {
		try {
			let a = await ctx.telegram.getUserProfilePhotos(127429898);
			let b = a.photos[0][0].file_id;
			let c = await ctx.telegram.getFile(`${b}`);
			console.log(c);
			console.log(ctx.message.chat.id);
			ctx.telegram.sendPhoto(ctx.message.chat.id, `${c.file_id}`);
		} catch (error) {
			console.error(error);
		}
	});
	return profile;
};
