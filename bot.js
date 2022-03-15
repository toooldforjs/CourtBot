const Telegraf = require("telegraf");
const { Stage, session } = Telegraf;
const mongoose = require("mongoose");
require("dotenv").config();
const winston = require("winston");
const logger = require("./logger");

const messages = require("./messages");
const { switcher } = require("./components/switcher");
const bot = new Telegraf(process.env.BOT_TOKEN);
const PORT = process.env.PORT || 5000;
const { BOT_TOKEN, URL } = process.env;

// Scenes
const main = require("./scenes/main");
const admin = require("./scenes/admin");
const profile = require("./scenes/profile");
const editProfile = require("./scenes/edit-profile");
const deleteProfile = require("./scenes/delete-profile");
const editName = require("./scenes/edit-name");
const editLastName = require("./scenes/edit-last-name");
const editRegion = require("./scenes/edit-region");
const editProfilePhoto = require("./scenes/edit-profile-photo");
const editProfileBio = require("./scenes/edit-profile-bio");
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
const editProfilePhotoScene = editProfilePhoto.GenEditProfilePhotoScene();
const editProfileBioScene = editProfileBio.GenEditProfileBio();
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
	editProfilePhotoScene,
	editProfileBioScene,
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

if (process.env.NODE_ENV === "production") {
	bot.telegram.setWebhook(`${URL}/bot${BOT_TOKEN}`);
	bot.startWebhook(`/bot${BOT_TOKEN}`, null, PORT);
	mongoose.connect(process.env.DB_CONNECTION, {
		useUnifiedTopology: true,
		useNewUrlParser: true,
		useCreateIndex: true,
	});
} else {
	bot
		.launch()
		.then((res) => console.log("-- Started local --"))
		.then((res) =>
			mongoose.connect(
				process.env.DB_CONNECTION,
				{ useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true },
				() => console.log("-- Connected to DB (mongoose) --")
			)
		)
		.then((res) =>
			logger.add(
				new winston.transports.Console({
					format: winston.format.combine(winston.format.prettyPrint()),
				})
			)
		)
		.catch((error) => console.log(error));
}
