const Scene = require("telegraf/scenes/base");
const { switcher } = require("../components/switcher");
const { editPhotoHandler } = require("../components/edit-photo-handler");

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
		if (ctx.message.photo) {
			editPhotoHandler(ctx);
		} else {
			await ctx.reply(`
	🔴 Произошла ошибка. 🔴
	Нужно отправить именно фото/картинку. Не файл, не стикер. Попробуйте снова или обратитесь в поддержку /help.]
			`);
		}
	});
	return editProfilePhoto;
};
