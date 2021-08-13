const Telegraf = require("telegraf");
const { Extra, Markup, Stage, session } = Telegraf;

require("dotenv").config();

// const generatePdf = require("./create-pdf");
// const db = require("./db");
// const date = require("./date");
const messages = require("./messages");
// const uModel = require("./models/User");
const bot = new Telegraf(process.env.BOT_TOKEN);
// bot.use(Telegraf.log());

// Scenes

const SceneGenerator = require("./scenes");
const curScene = new SceneGenerator();
const mainScene = curScene.GenMainScene();
const findСontractor = curScene.GenFindСontractorScene();
const findCourt = curScene.GenFindCourtScene();
const editName = curScene.GenEditNameScene();
const editLastname = curScene.GenEditLastnameScene();
const editRegion = curScene.GenEditRegionScene();
const editContractorStatus = curScene.GenEditContractorStatus();
const editCustomerStatus = curScene.GenEditCustomerStatus();
const deleteProfile = curScene.GenDeleteProfileScene();
const checkCourt = curScene.GenCheckCourtScene();

const stage = new Stage([
	mainScene,
	editName,
	editLastname,
	editRegion,
	findСontractor,
	findCourt,
	editContractorStatus,
	editCustomerStatus,
	deleteProfile,
	checkCourt,
]);

bot.use(session());
bot.use(stage.middleware());

// Main commands

bot.start(async (ctx) => {
	ctx.reply(messages.greeter);
	ctx.scene.enter("main");
});

bot.help((ctx) => ctx.reply(messages.helpMessage));

// bot.command("reg", (ctx) => {
// 	let registerMessage = `В качестве кого Вы хотели бы зарегистрироваться?`;
// 	currentUser.telegramId = ctx.message.from.id;
// 	bot.telegram.sendMessage(ctx.chat.id, registerMessage, {
// 		reply_markup: {
// 			inline_keyboard: [
// 				[{ text: "Зарегистрироваться как Заказчик", callback_data: "register_customer" }],
// 				[{ text: "Зарегистрироваться как Исполнитель", callback_data: "register_contractor" }],
// 			],
// 		},
// 	});
// 	return currentUser;
// });

// bot.command("age", async (ctx) => {
// 	ctx.scene.enter("age");
// });

// bot.action("register_customer", (ctx) => {
// 	bot.telegram.sendMessage(ctx.chat.id, `Введите свое имя`);
// 	console.log(currentUser);
// 	let firstName = ctx.message.from.first_name;
// 	ctx.deleteMessage();
// });

// bot.command("ak", (ctx) => {
// 	let company = {
// 		title: "СРО Меркурий",
// 		tin: 7710458616,
// 		region: 77,
// 		services: ["оценочные услуги"],
// 	};
// 	try {
// 		db.saveCompany(company);
// 		ctx.reply(`Компания ${company.title} сохранена.`);
// 	} catch (error) {
// 		console.log(error);
// 	}
// });

// bot.command("time", (ctx) => {
// 	ctx.reply(date.dateNow);
// });

// bot.command("pdf", async (ctx) => {
// 	generatePdf.getPdf();
// 	ctx.replyWithDocument({ source: `./pdf/${generatePdf.fileName}` });
// });

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
