const messages = require("../messages");
const { whatMarkup, customerRegDate } = require("../components/scene-functions");
const userModel = require("../models/User");
const logger = require("../logger");

// функция присвоения пользователю статуса заказчика

exports.editCustomerStatusHandler = async function (ctx) {
	const msg = ctx.message.text;
	if (msg === "ДА") {
		try {
			await userModel.updateOne(
				{ telegramId: ctx.message.from.id },
				{ $set: { customerStatus: true, customerRegisterDate: await customerRegDate(ctx) } }
			);
			if (ctx.scene.state.action == "register") {
				await ctx.reply(
					"💡 Вы зарегистрированы как Заказчик! Можете приступать к поиску Исполнителя.",
					await whatMarkup(ctx.message.from.id)
				);
				ctx.scene.enter("main");
			} else {
				ctx.reply(
					"💡 Теперь Вы зарегистрированы как Заказчик. Можете приступать к поиску Исполнителя.",
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
				{ $set: { customerStatus: false, customerRegisterDate: undefined } }
			);
			ctx.reply(
				"💡 Вы отказались от регистрации как Заказчик. Теперь Вы не сможете искать Исполнителей для ознакомления с делами. Если передумаете - измените настройку в профиле.",
				await whatMarkup(ctx.message.from.id)
			);
			if (ctx.scene.state.action == "register") {
				ctx.scene.enter("main");
			} else {
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
