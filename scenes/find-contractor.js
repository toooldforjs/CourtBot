const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { getID, userList, whatMarkup } = require("../components/scene-functions");
const userModel = require("../models/User");
const courtModel = require("../models/Court");
require("dotenv").config();
const { switcher } = require("../components/switcher");
const { findContractorHandler } = require("../components/find-contractor-handler");
const logger = require("../logger");

// сцена поиска Исполнителя в базе бота

exports.GenFindСontractorScene = function () {
	const findСontractor = new Scene("findСontractor");
	let dbid; // сюда будет писаться id выбранного суда/региона
	let foundedCounter; // сюда будет писаться количество найденных по запросу исполнителей
	findСontractor.enter(async (ctx) => {
		ctx.scene.state.sceneName = "findСontractor";
		ctx.scene.state.contractorsPage = 1; // номер страницы результатов поиска исполнителей
		let mainID = getID(ctx.message, ctx.callbackQuery);
		ctx.reply(
			`
💡
Это поиск Исполнителя для ознакомления с судебным делом.
Введите регион или город суда, в котором нужно провести ознакомление, и я предложу подходящие суды.
Когда определимся с судом я помогу найти местного Исполнителя, готового туда сходить.`,
			await whatMarkup(mainID)
		);
	});
	findСontractor.on("text", async (ctx) => {
		switcher(ctx, findContractorHandler);
	});
	findСontractor.action(/^dbid_.+/, async (ctx) => {
		ctx.answerCbQuery();
		dbid = ctx.callbackQuery.data.slice(5);
		try {
			const chosenCourt = await courtModel.findOne({ _id: dbid });
			foundedCounter = await userModel.aggregate([
				{
					$match: {
						contractorStatus: true,
						region: chosenCourt.COURTNUMBER,
						$and: [
							{ telegramId: { $ne: process.env.ADMIN_ID } },
							{ telegramId: { $ne: ctx.update.callback_query.message.chat.id } },
						],
					},
				},
				{
					$count: "telegramId",
				},
			]);
			const dbRequestResults = await userModel.aggregate([
				{
					$match: {
						contractorStatus: true,
						region: chosenCourt.COURTNUMBER,
						$and: [
							{ telegramId: { $ne: process.env.ADMIN_ID } },
							{ telegramId: { $ne: ctx.update.callback_query.message.chat.id } },
						],
					},
				},
				{ $sort: { "rating.totalRating": -1 } },
			]);
			if (dbRequestResults.length > 0) {
				await ctx.reply(`
🔎 В этом регионе есть ${foundedCounter[0].telegramId} исполнителей. 🔍
Вот они, отсортированные по рейтингу.
`);
				const moreContractorsButton = () => {
					if (dbRequestResults.length > 3) {
						return {
							reply_markup: {
								inline_keyboard: [[{ text: "⬇️ Еще ⬇️", callback_data: "more_contractors" }]],
							},
							parse_mode: "HTML",
						};
					}
				};
				async function orderedMessages(array) {
					const newArray = array.slice(0, 3);
					for (const element of newArray) {
						await userList(element, ctx);
					}
					ctx.reply(
						`
Показано ${foundedCounter[0].telegramId < 3 ? foundedCounter[0].telegramId : 3} из ${
							foundedCounter[0].telegramId
						} исполнителей, найденных в этом регионе.
`,
						moreContractorsButton()
					);
				}
				orderedMessages(dbRequestResults);
			} else {
				ctx.reply(`
⚠️ Исполнителей в этом регионе не найдено ⚠️

Попробуйте вернуться позже.

Пожалуйста, распространите информацию об этом боте среди своих коллег @oznakomim_bot.
`);
			}
		} catch (error) {
			logger.error(error, { tgMessage: ctx.message, tgQuery: ctx.callbackQuery });
			ctx.reply(messages.defaultErrorMessage);
			ctx.scene.reenter();
		}
	});
	findСontractor.action(/^user_.+/, async (ctx) => {
		ctx.answerCbQuery();
		const DbUserId = ctx.callbackQuery.data.slice(5);
		try {
			const chosenUser = await userModel.findOne({ _id: DbUserId });
			await userModel.updateOne(
				{ telegramId: chosenUser.telegramId },
				{ $inc: { "rating.contractorRating": 1, "rating.totalRating": 1 } }
			);
			const currentCustomer = await userModel.findOne({ telegramId: ctx.callbackQuery.from.id });
			await ctx.telegram.sendMessage(
				chosenUser.telegramId,
				`
🎉 Здравствуйте! 🎉
Вам отправлена заявка на услугу ознакомления с материалами судебного дела в Арбитражном суде Вашего региона.

Заказчик: 👔 <b>${typeof currentCustomer.firstName === "string" ? currentCustomer.firstName : ""} ${
					typeof currentCustomer.lastName === "string" ? currentCustomer.lastName : ""
				}</b>.
${
	currentCustomer.username === undefined
		? `Ожидайте от Заказчика сообщения с подробностями.`
		: `Написать заказчику: 💬 @${currentCustomer.username}`
}
`,
				{ parse_mode: "HTML" }
			);
			await ctx.reply(
				`
💡
Сообщение для <b>${typeof chosenUser.firstName === "string" ? chosenUser.firstName : ""} ${
					typeof chosenUser.lastName === "string" ? chosenUser.lastName : ""
				}</b> отправлено.
${
	currentCustomer.username === undefined
		? `Для обсуждения деталей Вам лучше выйти на связь первым по этому контакту: <a href="tg://user?id=${chosenUser.telegramId}">@${chosenUser.firstName}</a>`
		: `Если понадобится - можете написать ему/ей лично: <a href="tg://user?id=${chosenUser.telegramId}">@${chosenUser.firstName}</a>`
}
`,
				{ parse_mode: "HTML" }
			);
		} catch (error) {
			logger.error(error, { tgMessage: ctx.message, tgQuery: ctx.callbackQuery });
			logger.error(error, { tgMessage: ctx.message, tgQuery: ctx.callbackQuery });
			ctx.reply(messages.defaultErrorMessage);
			ctx.scene.reenter();
		}
	});

	findСontractor.action("more_contractors", async (ctx) => {
		ctx.answerCbQuery();
		ctx.scene.state.contractorsPage++;
		try {
			const chosenCourt = await courtModel.findOne({ _id: dbid });
			const dbRequestResults = await userModel.aggregate([
				{
					$match: {
						region: chosenCourt.COURTNUMBER,
						contractorStatus: true,
						$and: [
							{ telegramId: { $ne: ctx.update.callback_query.message.chat.id } },
							{ telegramId: { $ne: process.env.ADMIN_ID } },
						],
					},
				},
				{ $sort: { "rating.totalRating": -1 } },
				{ $skip: (ctx.scene.state.contractorsPage - 1) * 3 },
			]);
			const moreContractorsButton = () => {
				if (dbRequestResults.length > 0) {
					return {
						reply_markup: {
							inline_keyboard: [[{ text: "⬇️ Еще ⬇️", callback_data: "more_contractors" }]],
						},
						parse_mode: "HTML",
					};
				}
			};
			async function orderedMessages(array) {
				const newArray = array.splice(0, (ctx.scene.state.contractorsPage - 1) * 3);
				for (const element of newArray) {
					await userList(element, ctx);
				}
				ctx.reply(
					`
Показаны исполнители с ${(ctx.scene.state.contractorsPage - 1) * 3 + 1} по ${
						(ctx.scene.state.contractorsPage - 1) * 3 + 3 >= foundedCounter[0].telegramId
							? foundedCounter[0].telegramId
							: (ctx.scene.state.contractorsPage - 1) * 3 + 3
					} из ${foundedCounter[0].telegramId}, найденных в этом регионе.
`,
					moreContractorsButton()
				);
			}
			orderedMessages(dbRequestResults);
		} catch (error) {
			logger.error(error, { tgMessage: ctx.message, tgQuery: ctx.callbackQuery });
			ctx.reply(messages.defaultErrorMessage);
			ctx.scene.reenter();
		}
	});

	findСontractor.on("message", (ctx) => ctx.reply(messages.messageTypeWarningMessage));
	return findСontractor;
};
