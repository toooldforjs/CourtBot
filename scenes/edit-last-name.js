const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { whatMarkup, getID } = require("../components/scene-functions");
const replyMessages = require("../message-handlers/edit-lastname");
const { editLastnameHandler } = require("../components/edit-lastname-handler");
const { switcher } = require("../components/switcher");

// сцена заполнения фамилии при редактировании профиля или при первичной регистрации

exports.GenEditLastnameScene = function () {
	const editLastname = new Scene("editLastname");
	editLastname.enter(async (ctx) => {
		ctx.scene.state.sceneName = "editLastname";
		let replyMsg = await replyMessages.editUserLastname(ctx.scene.state);
		let mainID = getID(ctx.message, ctx.callbackQuery);
		ctx.reply(replyMsg.sceneEnterMessage, await whatMarkup(mainID));
	});
	editLastname.on("text", async (ctx) => {
		switcher(ctx, editLastnameHandler);
	});
	editLastname.on("message", (ctx) => ctx.reply(messages.messageTypeWarningMessage));
	return editLastname;
};
