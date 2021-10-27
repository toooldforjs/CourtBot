const Telegraf = require("telegraf");
const { Extra, Markup, Stage, session } = Telegraf;

require("dotenv").config();

const messages = require("./messages");
const bot = new Telegraf(process.env.BOT_TOKEN);

// Scenes

const SceneGenerator = require("./scenes");
const curScene = new SceneGenerator();
const mainScene = curScene.GenMainScene();
// const profileScene = curScene.GenProfileScene();
const PScene = require("./scenes/profile");
const profileScene = PScene.GenProfileScene();
const findСontractor = curScene.GenFindСontractorScene();
const findCourt = curScene.GenFindCourtScene();
const editName = curScene.GenEditNameScene();
const editLastname = curScene.GenEditLastnameScene();
const editRegion = curScene.GenEditRegionScene();
const editContractorStatus = curScene.GenEditContractorStatus();
const editCustomerStatus = curScene.GenEditCustomerStatus();
const editProfile = curScene.GenEditProfileScene();
const deleteProfile = curScene.GenDeleteProfileScene();
const checkCourt = curScene.GenCheckCourtScene();
const adminScene = curScene.GenAdminScene();

const stage = new Stage([
	mainScene,
	profileScene,
	editName,
	editLastname,
	editRegion,
	findСontractor,
	findCourt,
	editContractorStatus,
	editCustomerStatus,
	editProfile,
	deleteProfile,
	checkCourt,
	adminScene,
]);

bot.use(session());
bot.use(stage.middleware());

// Main commands

bot.start(async (ctx) => {
	await ctx.reply(messages.greeter);
	ctx.scene.enter("main");
});
bot.on("text", (ctx) => {
	const msg = ctx.message.text;
	switch (msg) {
		case "Главное меню":
		case "Регистрация":
			ctx.scene.enter("main");
			break;
		case "Помощь":
			ctx.reply(messages.helpMessage);
			break;
		case "Мой профиль":
			ctx.scene.enter("profile");
			break;
		case "Найти исполнителя":
			ctx.scene.enter("findСontractor");
			break;
		default:
			ctx.reply("Пользуйтесь кнопками. Не пишите ничего, пока я об этом не попрошу.");
			break;
	}
});

bot.help((ctx) => ctx.reply(messages.helpMessage));

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
