const messages = require("../messages");
const { searchCourt, courtList } = require("../components/scene-functions");
const logger = require("../logger");

// функция обработки обновления релиона/суда

exports.editRegionHandler = async function (ctx) {
	try {
		let courts = await searchCourt(ctx.message.from.id, ctx.message.text);
		if (courts.length > 0) {
			await ctx.reply(
				`
🔎 Вот, что удалось найти. 🔎
Выберите один из результатов с помощью кнопки. Если не нашли нужный - попробуйте уточнить запрос.`
			);
			courts.forEach((element) => {
				return courtList(element, ctx);
			});
		} else {
			ctx.reply("⚠️ Поиск не дал результатов. Переформулируйте запрос.");
		}
	} catch (error) {
		logger.error(error, { tgMessage: ctx.message, tgQuery: ctx.callbackQuery });
		ctx.reply(messages.defaultErrorMessage);
	}
};
