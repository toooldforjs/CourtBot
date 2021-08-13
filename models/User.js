const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		telegramId: Number,
		firstName: String,
		lastName: String,
		region: String,
		customerStatus: Boolean,
		customerRegisterDate: Date,
		contractorStatus: Boolean,
		contractorRegisterDate: Date,
		isAdmin: Boolean,
	},
	{ collection: "users" }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
