const messages = require("../messages");
const { correctQuery, searchCourt, courtList } = require("../components/scene-functions");
const { isRegistered } = require("../components/scene-functions");
const logger = require("../logger");

// функция генерации списка найденных судов/регионов

exports.findContractorHandler = async function (ctx) {
	let msg = correctQuery(ctx.message.text);
	try {
		if (await isRegistered(ctx.message.from.id)) {
			let courts = await searchCourt(ctx.message.from.id, msg);
			if (courts.length > 0) {
				await ctx.reply(
					"🔎 Вот, что удалось найти. Выберите один из результатов с помощью кнопки. Если не нашли нужный - попробуйте уточнить запрос. 🔍"
				);

				courts.forEach((element) => {
					return courtList(element, ctx);
				});
			} else {
				ctx.reply("⚠️ Поиск не дал результатов. Переформулируйте запрос и попробуйте снова.");
			}
		} else {
			await ctx.reply("⚠️ Похоже Вы не зарегистрированы в системе. Загрегистрируйтесь и возвращайтесь.");
			ctx.scene.enter("main");
		}
	} catch (error) {
		logger.error(error, { tgMessage: ctx.message, tgQuery: ctx.callbackQuery });
		await ctx.reply(messages.defaultErrorMessage);
		ctx.scene.reenter();
	}
};
