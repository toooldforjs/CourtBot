const messages = require("../messages");
const { whatMarkup, contractorRegDate } = require("../components/scene-functions");
const userModel = require("../models/User");
const logger = require("../logger");

// функция обработки выбора статуса исполнителя

exports.editContractorStatusHandler = async function (ctx) {
	const msg = ctx.message.text;
	if (msg === "ДА") {
		try {
			await userModel.updateOne(
				{ telegramId: ctx.message.from.id },
				{ $set: { contractorStatus: true, contractorRegisterDate: await contractorRegDate(ctx) } }
			);
			if (ctx.scene.state.action == "register") {
				await ctx.reply(
					"💡 Вам присвоен статус Исполнителя! Ждите сообщений о заказах.",
					await whatMarkup(ctx.message.from.id)
				);
				ctx.scene.enter("editCustomerStatus", ctx.scene.state);
			} else {
				ctx.reply(
					"💡 Cтатус Исполнителя изменен. Теперь ожидайте сообщений о заказах.",
					await whatMarkup(ctx.message.from.id)
				);
				ctx.scene.enter("profile");
			}
		} catch (error) {
			logger.error(error, { tgMessage: ctx.message, tgQuery: ctx.callbackQuery });
			ctx.reply(messages.defaultErrorMessage);
			ctx.scene.reenter();
		}
	} else if (msg === "НЕТ") {
		try {
			await userModel.updateOne(
				{ telegramId: ctx.message.from.id },
				{ $set: { contractorStatus: false, contractorRegisterDate: undefined } }
			);
			if (ctx.scene.state.action == "register") {
				ctx.reply(
					"💡 Вы отказались от статуса Исполнителя и не сможете получать сообщения о заказах. Если передумаете - измените статус в профиле."
					// await whatMarkup(ctx.message.from.id)
				);
				ctx.scene.enter("editCustomerStatus", ctx.scene.state);
			} else {
				ctx.reply(
					"💡 Вы отказались от статуса Исполнителя и не сможете получать сообщения о заказах. Если передумаете - измените статус в профиле.",
					await whatMarkup(ctx.message.from.id)
				);
				ctx.scene.enter("profile");
			}
		} catch (error) {
			logger.error(error, { tgMessage: ctx.message, tgQuery: ctx.callbackQuery });
			ctx.reply(messages.defaultErrorMessage);
			ctx.scene.reenter();
		}
	} else {
		ctx.reply(messages.defaultErrorMessage);
		ctx.scene.reenter();
	}
};
