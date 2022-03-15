const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { confirmEditButtons } = require("../components/keyboards");
const { switcher } = require("../components/switcher");

// сцена редактирования параметров профиля

exports.GenEditProfileScene = function () {
	const editProfile = new Scene("editProfile");
	editProfile.enter(async (ctx) => {
		ctx.scene.state.sceneName = "editProfile";
		ctx.scene.state.action = "edit";
		ctx.reply(
			`
💡 Редактирование профиля. 💡
Выберите с помощью кнопок под сообщением что именно Вы хотите изменить.
        `,
			confirmEditButtons
		);
	});
	editProfile.on("text", async (ctx) => {
		switcher(ctx);
	});
	editProfile.action("editProfileName", (ctx) => {
		ctx.answerCbQuery();
		ctx.scene.enter("editName", ctx.scene.state);
	});
	editProfile.action("editProfileLastname", (ctx) => {
		ctx.answerCbQuery();
		ctx.scene.enter("editLastname", ctx.scene.state);
	});
	editProfile.action("editProfileRegion", (ctx) => {
		ctx.answerCbQuery();
		ctx.scene.enter("editRegion", ctx.scene.state);
	});
	editProfile.action("editProfilePic", (ctx) => {
		ctx.answerCbQuery();
		ctx.scene.enter("editProfilePhoto");
	});
	editProfile.action("editProfileBio", (ctx) => {
		ctx.answerCbQuery();
		ctx.scene.enter("editProfileBio");
	});
	editProfile.action("editProfileContractor", (ctx) => {
		ctx.answerCbQuery();
		ctx.scene.enter("editContractorStatus", ctx.scene.state);
	});
	editProfile.action("editProfileCustomer", (ctx) => {
		ctx.answerCbQuery();
		ctx.scene.enter("editCustomerStatus", ctx.scene.state);
	});
	editProfile.on("message", (ctx) => ctx.reply(messages.messageTypeWarningMessage));
	return editProfile;
};
