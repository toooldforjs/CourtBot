const messages = require("../messages");
const userModel = require("../models/User");
const logger = require("../logger");

// функция обновления фамилии пользователя

exports.editLastnameHandler = async function (ctx) {
	const msg = ctx.message.text;
	try {
		const user = await userModel.findOne({ telegramId: ctx.message.from.id });
		if (user.rating.lastNameBonus > 0) {
			await userModel.updateOne(
				{ telegramId: ctx.message.from.id },
				{
					$set: {
						lastName: msg,
					},
				}
			);
		} else {
			await userModel.updateOne(
				{ telegramId: ctx.message.from.id },
				{
					$set: {
						lastName: msg,
						"rating.lastNameBonus": 10,
						"rating.lastNameBonusDate": Date.now(),
					},
				}
			);
			await userModel.updateOne({ telegramId: ctx.message.from.id }, { $inc: { "rating.totalRating": 10 } });
		}
		if (ctx.scene.state.action == "register") {
			ctx.scene.enter("editRegion", ctx.scene.state);
		} else {
			await ctx.reply(
				`
💡 Фамилия обновлена. 💡
`
			);
			ctx.scene.enter("profile");
		}
	} catch (error) {
		logger.error(error, { tgMessage: ctx.message, tgQuery: ctx.callbackQuery });
		ctx.reply(messages.defaultErrorMessage);
		ctx.scene.reenter();
	}
};
