const Telegraf = require("telegraf");
const { Stage, session } = Telegraf;

require("dotenv").config();

const messages = require("./messages");
const { switcher } = require("./components/switcher");
const bot = new Telegraf(process.env.BOT_TOKEN);

// Scenes
const main = require("./scenes/main");
const admin = require("./scenes/admin");
const profile = require("./scenes/profile");
const editProfile = require("./scenes/edit-profile");
const deleteProfile = require("./scenes/delete-profile");
const editName = require("./scenes/edit-name");
const editLastName = require("./scenes/edit-last-name");
const editRegion = require("./scenes/edit-region");
const editContractorStatus = require("./scenes/edit-contractor-status");
const editCustomerStatus = require("./scenes/edit-customer-status");
const findСontractor = require("./scenes/find-contractor");

const mainScene = main.GenMainScene();
const adminScene = admin.GenAdminScene();
const profileScene = profile.GenProfileScene();
const editProfileScene = editProfile.GenEditProfileScene();
const deleteProfileScene = deleteProfile.GenDeleteProfileScene();
const editNameScene = editName.GenEditNameScene();
const editLastNameScene = editLastName.GenEditLastnameScene();
const editRegionScene = editRegion.GenEditRegionScene();
const editContractorStatusScene = editContractorStatus.GenEditContractorStatus();
const editCustomerStatusScene = editCustomerStatus.GenEditCustomerStatus();
const findСontractorScene = findСontractor.GenFindСontractorScene();

const stage = new Stage([
	mainScene,
	adminScene,
	profileScene,
	editProfileScene,
	deleteProfileScene,
	editNameScene,
	editLastNameScene,
	editRegionScene,
	editContractorStatusScene,
	editCustomerStatusScene,
	findСontractorScene,
]);

bot.use(session());
bot.use(stage.middleware());

// Main commands

bot.start(async (ctx) => {
	await ctx.reply(messages.greeter);
	ctx.scene.enter("main");
});
bot.on("text", (ctx) => {
	switcher(ctx);
});

// bot.on("text", (ctx) => {
// 	const msg = ctx.message.text;
// 	switch (msg) {
// 		case "Главное меню":
// 		case "Регистрация":
// 			ctx.scene.enter("main");
// 			break;
// 		case "Помощь":
// 			ctx.reply(messages.helpMessage);
// 			break;
// 		case "Мой профиль":
// 			ctx.scene.enter("profile");
// 			break;
// 		case "Найти исполнителя":
// 			ctx.scene.enter("findСontractor");
// 			break;
// 		default:
// 			ctx.reply("Пользуйтесь кнопками. Не пишите ничего, пока я об этом не попрошу.");
// 			break;
// 	}
// });

bot.help((ctx) => ctx.reply(messages.helpMessage));

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
