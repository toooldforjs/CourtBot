const moment = require("moment");
moment.locale("ru");
const { newUserMenuMarkup, registeredUserMenuMarkup } = require("../components/keyboards");
const db = require("../db");
const userModel = require("../models/User");
const courtModel = require("../models/Court");
require("dotenv").config();

// функция фильтрует запрос пользователя удаляя лишние слова из массива запроса

exports.correctQuery = function (query) {
	const badWords = [
		"АС",
		"область",
		"области",
		"пер.",
		"просп.",
		"проспект",
		"г.",
		"д.",
		"ул.",
		"корп.",
		"стр.",
		"край",
		"края",
	];
	let arr = query
		.split(" ")
		.filter(function (item) {
			let a = badWords.includes(item);
			return !a;
		})
		.join(" ");
	return arr;
};

// функция возвращает разные клавиатуры для зарегистрированного и нового пользователя
exports.whatMarkup = async function (tgID) {
	if (await db.isRegistered(tgID)) {
		return registeredUserMenuMarkup;
	} else {
		return newUserMenuMarkup;
	}
};

// функция возвращает ID пользователя, взятое из сообщения или колбэк-даты, в зависимости от того из чего переход вв сцену

exports.getID = function (message, callback_data) {
	if (message) {
		return message.from.id;
	} else {
		return callback_data.from.id;
	}
};

// функция поиска в базе суда/региона

exports.searchCourt = async function (tgID, request) {
	try {
		const userProfile = await userModel.findOne({ telegramId: tgID });
		if (userProfile) {
			const dbResults = await courtModel.find({ $text: { $search: request } });
			if (dbResults) {
				return dbResults;
			} else {
				console.log("Court not found!");
			}
		} else {
			console.log("User not registered!");
		}
	} catch (error) {
		console.log("Ошибка обращения к базе");
		console.log(error);
	}
};

// функция приводит формат времени в читаемый или заменяет его на undefined

exports.datesFunction = function (userProfile) {
	let dates = {};
	if (userProfile.contractorRegisterDate === null) {
		dates.contractorRD = undefined;
	} else {
		dates.contractorRD = moment(userProfile.contractorRegisterDate).format("DD.MM.YYYY | HH:mm:ss");
	}
	if (userProfile.customerRegisterDate === null) {
		dates.customerRD = undefined;
	} else {
		dates.customerRD = moment(userProfile.customerRegisterDate).format("DD.MM.YYYY | HH:mm:ss");
	}
	return dates;
};

// генерация кнопок выбора суда из найденных в базе совпадений

exports.courtList = function (item, ctx) {
	const chooseRegionButtons = {
		reply_markup: {
			inline_keyboard: [[{ text: item.COURTNAME, callback_data: `dbid_${item._id}` }]],
		},
		parse_mode: "HTML",
	};
	ctx.reply(
		`
🏛️ <b>${item.COURTNAME}</b>
Номер суда: ${item.COURTNUMBER}
Адрес: ${item.COURTADDRESS}
	
	`,
		chooseRegionButtons
	);
};
// генерация кнопок выбора Исполнителя из найденных в базе совпадений по региону

exports.userList = function (item, ctx) {
	const chooseUserButtons = {
		reply_markup: {
			inline_keyboard: [[{ text: `Написать ☝️ ${item.firstName}`, callback_data: `user_${item._id}` }]],
		},
		parse_mode: "HTML",
	};
	ctx.reply(
		`
📌 <b>${item.firstName} ${item.lastName}</b>
Является Исполнителем с: <b>${moment(item.contractorRegisterDate).format("DD.MM.YYYY")}</b>
`,
		chooseUserButtons
	);
};
