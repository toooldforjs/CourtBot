const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { whatMarkup, getID } = require("../components/scene-functions");
const userModel = require("../models/User");
const courtModel = require("../models/Court");
const replyMessages = require("../message-handlers/edit-region");
const { switcher } = require("../components/switcher");
const { editRegionHandler } = require("../components/edit-region-handler");
const logger = require("../logger");

// сцена указания региона при редактировании профиля или при первичной регистрации

exports.GenEditRegionScene = function () {
	const editRegion = new Scene("editRegion");
	editRegion.enter(async (ctx) => {
		ctx.scene.state.sceneName = "editRegion";
		let replyMsg = replyMessages.editUserRegion(ctx.scene.state);
		let mainID = getID(ctx.message, ctx.callbackQuery);
		ctx.reply(replyMsg.sceneEnterMessage, await whatMarkup(mainID));
	});
	editRegion.on("text", async (ctx) => {
		switcher(ctx, editRegionHandler);
	});
	editRegion.action(/^dbid_.+/, async (ctx) => {
		let dbid = ctx.callbackQuery.data.slice(5);
		let mainID = getID(ctx.message, ctx.callbackQuery);
		try {
			ctx.answerCbQuery();
			const chosenCourt = await courtModel.findOne({ _id: dbid });
			const user = await userModel.findOne({ telegramId: mainID });
			if (user.rating.regionBonus > 0) {
				await userModel.updateOne(
					{ telegramId: mainID },
					{
						$set: {
							region: chosenCourt.COURTNUMBER,
						},
					}
				);
			} else {
				await userModel.updateOne(
					{ telegramId: mainID },
					{
						$set: {
							region: chosenCourt.COURTNUMBER,
							"rating.regionBonus": 10,
							"rating.regionBonusDate": Date.now(),
						},
					}
				);
				await userModel.updateOne({ telegramId: mainID }, { $inc: { "rating.totalRating": 10 } });
			}
			if (ctx.scene.state.action == "edit") {
				ctx.reply("💡 Регион и суд обновлены.");
				ctx.scene.enter("profile");
			} else {
				ctx.reply("💡 Регион и суд заполнены.");
				ctx.scene.enter("editContractorStatus", ctx.scene.state);
			}
		} catch (error) {
			logger.error(error, { tgMessage: ctx.message, tgQuery: ctx.callbackQuery });
			ctx.reply(messages.defaultErrorMessage);
			ctx.scene.reenter();
		}
	});
	editRegion.on("message", (ctx) =>
		ctx.reply(
			`
💡 <b>Введите <u>регион</u> Вашего Арбитражного суда.</b> 💡
Можно написать город, индекс, улицу. Я поищу в своей базе и предложу варианты.
    `,
			{
				parse_mode: "HTML",
				disable_web_page_preview: true,
			}
		)
	);
	return editRegion;
};
