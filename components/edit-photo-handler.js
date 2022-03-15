const userModel = require("../models/User");
const messages = require("../messages");
const logger = require("../logger");

// функция обновления аватара пользователя

exports.editPhotoHandler = async function (ctx) {
	try {
		const user = await userModel.findOne({ telegramId: ctx.message.from.id });
		if (user.rating.profilePicBonus > 0) {
			await userModel.updateOne(
				{ telegramId: ctx.message.from.id },
				{
					$set: {
						profilePic: ctx.message.photo[0].file_id,
					},
				}
			);
		} else {
			await userModel.updateOne(
				{ telegramId: ctx.message.from.id },
				{
					$set: {
						profilePic: ctx.message.photo[0].file_id,
						"rating.profilePicBonus": 10,
						"rating.profilePicBonusDate": Date.now(),
					},
				}
			);
			await userModel.updateOne({ telegramId: ctx.message.from.id }, { $inc: { "rating.totalRating": 10 } });
		}
		await ctx.reply("💡 Изображение сохранено");
		ctx.scene.enter("profile");
	} catch (error) {
		logger.error(error, { tgMessage: ctx.message, tgQuery: ctx.callbackQuery });
		ctx.reply(messages.defaultErrorMessage);
		ctx.scene.reenter();
	}
};
