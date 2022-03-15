const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { userStatusButtons } = require("../components/keyboards");
const { switcher } = require("../components/switcher");
const { editContractorStatusHandler } = require("../components/edit-contractor-status-handler");
const replyMessages = require("../message-handlers/edit-contractor-status");

// сцена регистрации в качестве Исполнителя в системе

exports.GenEditContractorStatus = function () {
	const editContractorStatus = new Scene("editContractorStatus");
	editContractorStatus.enter(async (ctx) => {
		ctx.scene.state.sceneName = "editContractorStatus";
		let replyMsg = replyMessages.editUserContractorStatus(ctx.scene.state);
		if (ctx.scene.state.action == "register") {
			ctx.reply(replyMsg.sceneEnterMessage, userStatusButtons);
		} else {
			ctx.reply(replyMsg.sceneEnterMessage, userStatusButtons);
		}
	});
	editContractorStatus.on("text", async (ctx) => {
		switcher(ctx, editContractorStatusHandler);
	});

	editContractorStatus.on("message", (ctx) => ctx.reply(messages.messageTypeWarningMessage));
	return editContractorStatus;
};
