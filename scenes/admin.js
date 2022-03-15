const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { adminButtons } = require("../components/keyboards");
const { getID } = require("../components/scene-functions");
const { isRegistered } = require("../components/scene-functions");
const userModel = require("../models/User");
const courtModel = require("../models/Court");
const fs = require("fs");
const path = require("path");
const logger = require("../logger");
require("dotenv").config();

// сцена для админа

exports.GenAdminScene = function () {
	const adminScene = new Scene("adminScene");
	adminScene.enter(async (ctx) => {
		ctx.scene.state.sceneName = "adminScene";
		let mainID = getID(ctx.message, ctx.callbackQuery);
		if (
			(await isRegistered(mainID)) &&
			(await userModel.findOne({ telegramId: mainID })).telegramId === Number.parseInt(process.env.ADMIN_ID)
		) {
			ctx.reply(
				`
Центр Управления Полетами
            `,
				adminButtons
			);
		} else {
			ctx.reply("Извини, друг. Ты не админ");
			ctx.scene.enter("main");
		}
	});
	adminScene.on("text", async (ctx) => {
		const msg = ctx.message.text;
		switch (msg) {
			case "Найти исполнителя":
				const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
				if (isUserRegistered) {
					if (isUserRegistered.contractorStatus) {
						ctx.scene.enter("findСontractor");
					} else {
						ctx.reply(
							"Похоже Вы не завершили регистрацию в качестве Заказчика. Перейдите в профиль и укажите этот параметр"
						);
					}
				} else {
					ctx.reply("Вы еще не зарегистрированы. Искать Исполнителя можно только тем, кого я знаю по имени.");
				}
				break;
			case "Помощь":
			case "/help":
				ctx.reply(messages.helpMessage);
				break;
			case "Главное меню":
			case "/start":
				ctx.scene.enter("main");
				break;
			case "Мой профиль":
				ctx.scene.enter("profile");
				break;
			default:
				ctx.reply(
					`
Кхм... Кнопки...
        `
				);
				break;
		}
	});
	adminScene.action("callStats", async (ctx) => {
		ctx.answerCbQuery();

		const popularContractorRegions = await userModel.aggregate([
			{
				$match: {
					contractorStatus: true,
				},
			},
			{
				$group: {
					_id: "$region",
					count: {
						$sum: 1,
					},
				},
			},
			{
				$sort: {
					count: -1,
				},
			},
		]);

		const popularCustomerRegions = await userModel.aggregate([
			{
				$match: {
					customerStatus: true,
				},
			},
			{
				$group: {
					_id: "$region",
					count: {
						$sum: 1,
					},
				},
			},
			{
				$sort: {
					count: -1,
				},
			},
		]);
		const contractorCourt = await courtModel.findOne({ COURTNUMBER: popularContractorRegions[0]._id });
		const customerCourt = await courtModel.findOne({ COURTNUMBER: popularCustomerRegions[0]._id });

		ctx.reply(`
Пользователей всего 📈 ${await userModel.countDocuments({})}
Пользователей за последние 7 дней 📈 ${await userModel.countDocuments({
			registrationDate: { $gt: new Date(Date.now() - 1000 * 60 * 60 * 168) },
		})}
Исполнителей всего 📈 ${await userModel.countDocuments({
			contractorStatus: true,
		})}
Заказчиков всего 📈 ${await userModel.countDocuments({
			customerStatus: true,
		})}
Исполнителей за последние 7 дней 📈 ${await userModel.countDocuments({
			contractorRegisterDate: { $gt: new Date(Date.now() - 1000 * 60 * 60 * 168) },
			contractorStatus: true,
		})}
Заказчиков за последние 7 дней 📈 ${await userModel.countDocuments({
			customerRegisterDate: { $gt: new Date(Date.now() - 1000 * 60 * 60 * 168) },
			customerStatus: true,
		})}
Больше всего Исполнителей из 📈 ${popularContractorRegions[0].count} из ${contractorCourt.COURTNAME}
Больше всего Заказчиков из 📈 ${popularCustomerRegions[0].count} из ${customerCourt.COURTNAME}
`);
	});
	adminScene.action("errorsLog", async (ctx) => {
		ctx.answerCbQuery();
		fs.readdir(path.join(__dirname, "../logs"), (err, files) => {
			if (err) {
				ctx.scene.enter("main");
			} else {
				ctx.reply(files);
				let logFiles = files.filter((element) => !element.includes(".json"));
				try {
					logFiles.forEach(async (element) => {
						await ctx.telegram.sendDocument(ctx.callbackQuery.from.id, {
							source: path.join(__dirname, "../logs", element),
						});
					});
				} catch (error) {
					logger.error(error, { tgMessage: ctx.message, tgQuery: ctx.callbackQuery });
				}
			}
		});
	});
	return adminScene;
};
