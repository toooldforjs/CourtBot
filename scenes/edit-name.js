const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { newUserMenuMarkup, registeredUserMenuMarkup } = require("../components/keyboards");
const { editNameHandler } = require("../components/edit-name-handler");
const { switcher } = require("../components/switcher");
const replyMessages = require("../message-handlers/edit-name");

// сцена заполнения имени при редактировании профиля или при первичной регистрации

exports.GenEditNameScene = function () {
	const editName = new Scene("editName");
	editName.enter(async (ctx) => {
		ctx.scene.state.sceneName = "editName";
		let replyMsg = replyMessages.editUserName(ctx.scene.state);
		if (ctx.scene.state.action == "register") {
			ctx.reply(replyMsg.sceneEnterMessage, newUserMenuMarkup);
		} else {
			ctx.reply(replyMsg.sceneEnterMessage, registeredUserMenuMarkup);
		}
	});
	editName.on("text", async (ctx) => {
		switcher(ctx, editNameHandler);
	});
	editName.on("message", (ctx) => ctx.reply(messages.messageTypeWarningMessage));
	return editName;
};
