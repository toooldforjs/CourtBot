const mongoose = require("mongoose");
require("dotenv").config();
const userModel = require("./models/User");

mongoose.connect(
	process.env.DB_CONNECTION,
	{ useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true },
	() => console.log("-- Connected to DB (mongoose) --")
);

module.exports.saveUser = (user) => {
	let registeredUser = new userModel({
		telegramId: user.telegramId,
		username: user.username,
		firstName: user.firstName,
		lastName: user.lastName,
		region: user.region,
		customerStatus: user.customerStatus,
		customerRegisterDate: user.customerRegisterDate,
		contractorStatus: user.contractorStatus,
		contractorRegisterDate: user.contractorRegisterDate,
		registrationDate: user.registrationDate,
	});
	registeredUser.save(function (err) {
		if (err) return console.error(err);
	});
};

module.exports.isRegistered = async (telegramId) => {
	const result = await userModel.find({ telegramId: telegramId }).limit(1).countDocuments();
	return result > 0 ? true : false;
};
