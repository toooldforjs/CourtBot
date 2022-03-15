const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { confirmDeleteButtons } = require("../components/keyboards");
const { switcher } = require("../components/switcher");
const { deleteProfileHandler } = require("../components/delete-profile-handler");

// сцена удаления профиля

exports.GenDeleteProfileScene = function () {
	const deleteProfile = new Scene("deleteProfile");
	deleteProfile.enter(async (ctx) => {
		ctx.scene.state.sceneName = "deleteProfile";
		ctx.reply(
			`
🔥 ❗ ВНИМАНИЕ ❗ 🔥
Вы приступили к удалению своего профиля. После удаления Вам снова будет недоступен функционал бота. Если передумаете - придется регистрироваться заново.
        `,
			confirmDeleteButtons
		);
	});
	deleteProfile.on("text", async (ctx) => {
		switcher(ctx, deleteProfileHandler);
	});
	deleteProfile.on("message", (ctx) => ctx.reply(messages.messageTypeWarningMessage));
	return deleteProfile;
};
