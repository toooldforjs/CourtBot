// наборы кнопок для разных сцен и ситуаций

exports.newUserMenuMarkup = {
	reply_markup: {
		keyboard: [[{ text: "Регистрация" }, { text: "Главное меню" }], [{ text: "Помощь" }]],
		resize_keyboard: true,
	},
	parse_mode: "HTML",
	disable_web_page_preview: true,
};
exports.registeredUserMenuMarkup = {
	reply_markup: {
		keyboard: [
			[{ text: "Найти исполнителя" }, { text: "Мой профиль" }],
			[{ text: "Помощь" }, { text: "Главное меню" }],
			[{ text: "тест" }, { text: "Москва" }],
		],
		resize_keyboard: true,
	},
	parse_mode: "HTML",
	disable_web_page_preview: true,
};

exports.userStatusButtons = {
	reply_markup: {
		keyboard: [[{ text: "ДА" }, { text: "НЕТ" }]],
		resize_keyboard: true,
	},
	parse_mode: "HTML",
};

exports.userProfileButtons = {
	inline_keyboard: [
		[{ text: "Редактировать профиль", callback_data: "editProfile" }],
		[{ text: "Удалить профиль", callback_data: "deleteProfile" }],
	],
};

exports.confirmEditButtons = {
	reply_markup: {
		inline_keyboard: [
			[{ text: "Изменить имя", callback_data: "editProfileName" }],
			[{ text: "Изменить фамилию", callback_data: "editProfileLastname" }],
			[{ text: "Изменить суд/регион", callback_data: "editProfileRegion" }],
			[{ text: "Изменить aватар", callback_data: "editProfilePic" }],
			[{ text: "Изменить описание", callback_data: "editProfileBio" }],
			[{ text: "Изменить статус Исполнителя", callback_data: "editProfileContractor" }],
			[{ text: "Изменить статус Заказчика", callback_data: "editProfileCustomer" }],
		],
	},
	parse_mode: "HTML",
};

exports.adminButtons = {
	reply_markup: {
		inline_keyboard: [[{ text: "Stats", callback_data: "callStats" }]],
	},
};

exports.confirmDeleteButtons = {
	reply_markup: {
		keyboard: [[{ text: "УДАЛИТЬ" }, { text: "ВЕРНУТЬСЯ" }]],
		resize_keyboard: true,
	},
	parse_mode: "HTML",
	one_time_keyboard: true,
};
