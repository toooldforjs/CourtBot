const Scene = require("telegraf/scenes/base");
const messages = require("../messages");
const { userStatusButtons } = require("../components/keyboards");
const { editCustomerStatusHandler } = require("../components/edit-customer-status-handler");
const { switcher } = require("../components/switcher");
const replyMessages = require("../message-handlers/edit-customer-status");

// сцена регистрации в качестве Заказчика в системе

exports.GenEditCustomerStatus = function () {
	const editCustomerStatus = new Scene("editCustomerStatus");
	editCustomerStatus.enter(async (ctx) => {
		ctx.scene.state.sceneName = "editCustomerStatus";
		let replyMsg = replyMessages.editUserCustomerStatus(ctx.scene.state);
		ctx.reply(replyMsg.sceneEnterMessage, userStatusButtons);
	});
	editCustomerStatus.on("text", async (ctx) => {
		switcher(ctx, editCustomerStatusHandler);
	});
	editCustomerStatus.on("message", (ctx) => ctx.reply(messages.messageTypeWarningMessage));
	return editCustomerStatus;
};
