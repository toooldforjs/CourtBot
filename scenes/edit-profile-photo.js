const Scene = require("telegraf/scenes/base");
const userModel = require("../models/User");
const { switcher } = require("../components/switcher");

// сцена фото при редактировании профиля

exports.GenEditProfilePhotoScene = function () {
	const editProfilePhoto = new Scene("editProfilePhoto");
	editProfilePhoto.enter(async (ctx) => {
		ctx.scene.state.sceneName = "editProfilePhoto";
		ctx.reply(
			`
💡 Загрузите фото, аватар или иную картинку, чтобы Вас было легче узнать.
Это очень помогает Исполнителям
💰 <b>получать больше заказов.</b> 💰
        `,
			{
				parse_mode: "HTML",
			}
		);
	});
	editProfilePhoto.on("text", async (ctx) => {
		switcher(ctx);
	});
	editProfilePhoto.on("message", async (ctx) => {
		try {
			if (ctx.message.photo) {
				await userModel.updateOne(
					{ telegramId: ctx.message.from.id },
					{ $set: { profilePic: ctx.message.photo[0].file_id } }
				);
				await ctx.reply("💡 Изображение сохранено");
			} else {
				await ctx.reply(`
🔴 Произошла ошибка. 🔴
Нужно отправить именно фото/картинку. Не файл, не стикер. Попробуйте снова или обратитесь в поддержку /help.]
                `);
			}
		} catch (error) {
			console.error(error);
		}
	});
	return editProfilePhoto;
};
