const messages = require("../messages");
const userModel = require("../models/User");
const logger = require("../logger");

// функция обработки описания профиля

exports.editBioHandler = async function (ctx) {
	let msg = ctx.message.text;
	msg = `${msg.slice(0, 297)}` + `...`;
	const user = await userModel.findOne({ telegramId: ctx.message.from.id });
	try {
		if (user.rating.profileBioBonus > 0) {
			await userModel.updateOne(
				{ telegramId: ctx.message.from.id },
				{
					$set: {
						profileBio: msg,
					},
				}
			);
		} else {
			await userModel.updateOne(
				{ telegramId: ctx.message.from.id },
				{
					$set: {
						profileBio: msg,
						"rating.profileBioBonus": 10,
						"rating.profileBioBonusDate": Date.now(),
					},
				}
			);
			await userModel.updateOne({ telegramId: ctx.message.from.id }, { $inc: { "rating.totalRating": 10 } });
		}
		await ctx.reply(
			`
💡 Описание обновлено 💡
<b>Новый текст:</b>
${msg}
`,
			{
				parse_mode: "HTML",
			}
		);
		ctx.scene.enter("profile");
	} catch (error) {
		logger.error(error, { tgMessage: ctx.message, tgQuery: ctx.callbackQuery });
		ctx.reply(messages.defaultErrorMessage);
		ctx.scene.reenter();
	}
};
