const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const userModel = require("../models/User");
const { switcher } = require("../components/switcher");

// сцена заполнения фамилии при редактировании профиля или при первичной регистрации

const switcherHandler = async function (ctx) {
	let msg = ctx.message.text;
	if (msg.length >= 197) {
		try {
			msg = `${msg.slice(0, 197)}` + `...`;
			await userModel.updateOne({ telegramId: ctx.message.from.id }, { $set: { lastName: msg } });
			ctx.reply(
				`
💡 Описание обновлено 💡
<b>Новый текст:</b>
${msg}
`,
				{
					parse_mode: "HTML",
				}
			);
		} catch (error) {
			console.log(error);
		}
	} else {
		try {
			await userModel.updateOne({ telegramId: ctx.message.from.id }, { $set: { profileBio: msg } });
			ctx.reply(
				`
💡 Описание обновлено 💡
<b>Новый текст:</b>
${msg}
`,
				{
					parse_mode: "HTML",
				}
			);
		} catch (error) {
			console.log(error);
		}
	}
};

exports.GenEditProfileBio = function () {
	const editProfileBio = new Scene("editProfileBio");
	editProfileBio.enter(async (ctx) => {
		ctx.scene.state.sceneName = "editProfileBio";
		ctx.reply(
			`
💡 Расскажите о себе, своем опыте, чем-то, что может быть важно для заказчика.
Не более 200 знаков. Будет длиннее - я сам сокращу.
💰 <b>Это заметно прибавит обращений к Вам с заказами.</b> 💰
        `,
			{
				parse_mode: "HTML",
			}
		);
	});
	editProfileBio.on("text", async (ctx) => {
		switcher(ctx, switcherHandler);
	});
	editProfileBio.on("message", (ctx) => {
		ctx.reply(messages.messageTypeWarningMessage);
	});
	return editProfileBio;
};
