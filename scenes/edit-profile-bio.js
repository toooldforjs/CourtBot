const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { switcher } = require("../components/switcher");
const { editBioHandler } = require("../components/edit-bio-handler");

// сцена заполнения фамилии при редактировании профиля или при первичной регистрации

exports.GenEditProfileBio = function () {
	const editProfileBio = new Scene("editProfileBio");
	editProfileBio.enter(async (ctx) => {
		ctx.scene.state.sceneName = "editProfileBio";
		ctx.reply(
			`
💡 Расскажите о себе, своем опыте, чем-то, что может быть важно для заказчика.
Не более 300 знаков. Будет длиннее - я сам сокращу.
💰 <b>Это заметно прибавит обращений к Вам с заказами.</b> 💰
        `,
			{
				parse_mode: "HTML",
			}
		);
	});
	editProfileBio.on("text", async (ctx) => {
		switcher(ctx, editBioHandler);
	});
	editProfileBio.on("message", (ctx) => {
		ctx.reply(messages.messageTypeWarningMessage);
	});
	return editProfileBio;
};
