const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		telegramId: Number,
		username: String,
		firstName: String,
		lastName: String,
		region: String,
		customerStatus: Boolean,
		customerRegisterDate: Date,
		contractorStatus: Boolean,
		contractorRegisterDate: Date,
		registrationDate: Date,
	},
	{ collection: "users" }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
