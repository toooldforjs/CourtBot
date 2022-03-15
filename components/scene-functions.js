const moment = require("moment");
moment.locale("ru");
const { newUserMenuMarkup, registeredUserMenuMarkup } = require("../components/keyboards");
const messages = require("../messages");
const userModel = require("../models/User");
const courtModel = require("../models/Court");
require("dotenv").config();
const logger = require("../logger");

// функция проверяет зарегистрирован ли пользователь

exports.isRegistered = async (telegramId) => {
	const result = await userModel.find({ telegramId: telegramId }).limit(1).countDocuments();
	return result > 0 ? true : false;
};

// функция фильтрует запрос пользователя удаляя лишние слова из массива запроса
exports.correctQuery = function (query) {
	const badWords = [
		"АС",
		"и",
		"в",
		"АО",
		"ПСП",
		"автономного",
		"автономный",
		"округа",
		"округ",
		"-",
		"города",
		"город",
		"области",
		"область",
		"края",
		"край",
		"г.",
		"пл.",
		"пр.",
		"ул.",
		"бульвар",
		"пер.",
		"корп.",
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
	if (await userModel.find({ telegramId: tgID }).limit(1).countDocuments()) {
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
				ctx.reply("Такой суд в базе не найден.");
			}
		} else {
			ctx.reply("Искать суды в базе могут только зарегистрированные пользователи.");
		}
	} catch (error) {
		logger.error(error, { tgMessage: ctx.message, tgQuery: ctx.callbackQuery });
		ctx.reply(messages.defaultErrorMessage);
		ctx.scene.reenter();
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

exports.userList = async function (item, ctx) {
	const chooseUserButtons = {
		inline_keyboard: [
			[
				{
					text: `Написать ☝️ ${typeof item.firstName === "string" ? item.firstName : "этому исполнителю"}`,
					callback_data: `user_${item._id}`,
				},
			],
		],
	};
	if (item.profilePic) {
		await ctx.telegram.sendPhoto(ctx.update.callback_query.message.chat.id, `${item.profilePic}`, {
			caption: `
🔶 ${typeof item.firstName === "string" ? item.firstName : ""} ${typeof item.lastName === "string" ? item.lastName : ""}

🔸 Об исполнителе: ${item.profileBio ? item.profileBio : "Нет описания"}
🔸 Является Исполнителем с ${moment(item.contractorRegisterDate).format("DD.MM.YYYY")}
🔸 Рейтинг: ${item.rating.totalRating}
		`,
			reply_markup: chooseUserButtons,
		});
	} else {
		ctx.reply(
			`
🔶 ${typeof item.firstName === "string" ? item.firstName : ""} ${typeof item.lastName === "string" ? item.lastName : ""}

🔸 Об исполнителе: ${item.profileBio ? item.profileBio : "Нет описания"}
🔸 Является Исполнителем с ${moment(item.contractorRegisterDate).format("DD.MM.YYYY")}
🔸 Рейтинг: ${item.rating.totalRating}
	`,
			{ reply_markup: chooseUserButtons }
		);
	}
};

// функция проверки нужно ли перезаписать дату регистрации пользователя как исполнителя

exports.contractorRegDate = async function (ctx) {
	const user = await userModel.findOne({ telegramId: ctx.message.from.id });
	let updateDate = undefined;
	if (user.contractorStatus == true) {
		// если статус исполнителя в базе == ДА
		updateDate = user.contractorRegisterDate;
		// оставляем старую дату
	} else {
		updateDate = Date.now();
		// записываем текущую дату
	}
	return updateDate;
};

// функция проверки нужно ли перезаписать дату регистрации пользователя как заказчика

exports.customerRegDate = async function (ctx) {
	const user = await userModel.findOne({ telegramId: ctx.message.from.id });
	let updateDate = undefined;
	if (user.customerStatus == true) {
		// если статус исполнителя в базе == ДА
		updateDate = user.customerRegisterDate;
		// оставляем старую дату
	} else {
		updateDate = Date.now();
		// записываем текущую дату
	}
	return updateDate;
};
