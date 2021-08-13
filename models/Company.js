const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	tin: {
		type: Number,
		required: true,
	},
	region: {
		type: Number,
		required: true,
	},
	services: {
		type: Array,
		required: true,
	},
});

module.exports = mongoose.model("Company", companySchema);
