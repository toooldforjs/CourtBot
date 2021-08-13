const mongoose = require("mongoose");

const courtSchema = new mongoose.Schema(
	{
		COURTNAME: {
			type: String,
			required: true,
		},
		COURTNUMBER: {
			type: String,
			required: true,
		},
		COURTADDRESS: {
			type: String,
			required: true,
		},
		COURTPHONE: {
			type: String,
			required: true,
		},
		COURTSITE: {
			type: String,
			required: true,
		},
	},
	{ collection: "courts" }
);

module.exports = mongoose.model("Court", courtSchema);
