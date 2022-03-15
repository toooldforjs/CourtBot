const messages = require("../messages");
const userModel = require("../models/User");

// функция удаления профиля

exports.deleteProfileHandler = async function (ctx) {
	try {
		await userModel.deleteOne({ telegramId: ctx.message.from.id });
		ctx.reply(
			`
💡 Ваш аккаунт удален. 💡
Возвращайтесь, если понадоблюсь.
`
		);
		ctx.scene.enter("main");
	} catch (error) {
		ctx.reply(messages.defaultErrorMessage);
		ctx.scene.enter("main");
	}
};
