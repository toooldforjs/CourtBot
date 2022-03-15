const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		telegramId: Number,
		username: String,
		firstName: String,
		lastName: String,
		region: String,
		profilePic: {
			type: String,
			default: "AgACAgIAAxkBAAIkAWGC3DIuYo198SxA0zOMrIC3OWVnAAK5tjEbUnsRSPNg_-ApzTgGAQADAgADcwADIQQ",
		},
		profileBio: { type: String, default: "Не указано" },
		customerStatus: { type: Boolean, default: false },
		customerRegisterDate: Date,
		contractorStatus: { type: Boolean, default: false },
		contractorRegisterDate: Date,
		registrationDate: Date,
		rating: {
			userProfileId: String,
			totalRating: { type: Number, default: 0 },
			firstNameBonus: { type: Number, default: 0 },
			firstNameBonusDate: { type: Date, default: undefined },
			lastNameBonus: { type: Number, default: 0 },
			lastNameBonusDate: { type: Date, default: undefined },
			regionBonus: { type: Number, default: 0 },
			regionBonusDate: { type: Date, default: undefined },
			profilePicBonus: { type: Number, default: 0 },
			profilePicBonusDate: { type: Date, default: undefined },
			profileBioBonus: { type: Number, default: 0 },
			profileBioBonusDate: { type: Date, default: undefined },
			contractorRating: { type: Number, default: 0 },
		},
	},
	{ collection: "users" }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
