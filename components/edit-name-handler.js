const messages = require("../messages");
const userModel = require("../models/User");
const logger = require("../logger");

// функция обновления имени

exports.editNameHandler = async function (ctx) {
	const msg = ctx.message.text;
	if (ctx.scene.state.action == "register") {
		try {
			let registeredUser = new userModel({
				telegramId: ctx.message.from.id,
				username: ctx.message.from.username,
				firstName: msg,
				registrationDate: Date.now(),
				rating: { firstNameBonus: 10, firstNameBonusDate: Date.now(), totalRating: 10 },
			});
			await registeredUser.save();
			ctx.scene.enter("editLastname", ctx.scene.state);
		} catch (error) {
			logger.error(error, { tgMessage: ctx.message, tgQuery: ctx.callbackQuery });
			ctx.reply(messages.defaultErrorMessage);
			ctx.scene.reenter();
		}
	} else {
		try {
			const user = await userModel.findOne({ telegramId: ctx.message.from.id });
			if (user.rating.firstNameBonus > 0) {
				await userModel.updateOne({ telegramId: ctx.message.from.id }, { $set: { firstName: msg } });
			} else {
				await userModel.updateOne(
					{ telegramId: ctx.message.from.id },
					{
						$set: {
							firstName: msg,
							"rating.firstNameBonus": 10,
							"rating.firstNameBonusDate": Date.now(),
						},
					}
				);
				await userModel.updateOne({ telegramId: ctx.message.from.id }, { $inc: { "rating.totalRating": 10 } });
			}
			await ctx.reply(
				`
💡 Имя обновлено. 💡
`
			);
			ctx.scene.enter("profile");
		} catch (error) {
			logger.error(error, { tgMessage: ctx.message, tgQuery: ctx.callbackQuery });
			ctx.reply(messages.defaultErrorMessage);
			ctx.scene.reenter();
		}
	}
};
