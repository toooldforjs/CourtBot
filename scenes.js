const Scene = require("telegraf/scenes/base");
const messages = require("./messages");
const {
	newUserMenuMarkup,
	registeredUserMenuMarkup,
	userStatusButtons,
	userProfileButtons,
	confirmEditButtons,
	adminButtons,
	confirmDeleteButtons,
} = require("./components/keyboards");
const {
	correctQuery,
	whatMarkup,
	getID,
	searchCourt,
	datesFunction,
	courtList,
	userList,
} = require("./components/scene-functions");
const db = require("./db");
const userModel = require("./models/User");
const courtModel = require("./models/Court");
const replyMessages = require("./message-handlers/edit-name");
require("dotenv").config();

// наборы кнопок для разных сцен и ситуаций

// const newUserMenuMarkup = {
// 	reply_markup: {
// 		keyboard: [[{ text: "Регистрация" }, { text: "Главное меню" }], [{ text: "Помощь" }]],
// 		resize_keyboard: true,
// 	},
// 	parse_mode: "HTML",
// 	disable_web_page_preview: true,
// };
// const registeredUserMenuMarkup = {
// 	reply_markup: {
// 		keyboard: [
// 			[{ text: "Найти исполнителя" }, { text: "Мой профиль" }],
// 			[{ text: "Помощь" }, { text: "Главное меню" }],
// 			[{ text: "/admin" }, { text: "Москва" }],
// 		],
// 		resize_keyboard: true,
// 	},
// 	parse_mode: "HTML",
// 	disable_web_page_preview: true,
// };

// const userStatusButtons = {
// 	reply_markup: {
// 		keyboard: [[{ text: "ДА" }, { text: "НЕТ" }]],
// 		resize_keyboard: true,
// 	},
// 	parse_mode: "HTML",
// };

// const userProfileButtons = {
// 	reply_markup: {
// 		inline_keyboard: [
// 			[{ text: "Редактировать профиль", callback_data: "editProfile" }],
// 			[{ text: "Удалить профиль", callback_data: "deleteProfile" }],
// 		],
// 	},
// 	parse_mode: "HTML",
// };

// const confirmEditButtons = {
// 	reply_markup: {
// 		inline_keyboard: [
// 			[{ text: "Изменить имя", callback_data: "editProfileName" }],
// 			[{ text: "Изменить фамилию", callback_data: "editProfileLastname" }],
// 			[{ text: "Изменить суд/регион", callback_data: "editProfileRegion" }],
// 			[{ text: "Изменить статус Исполнителя", callback_data: "editProfileContractor" }],
// 			[{ text: "Изменить статус Заказчика", callback_data: "editProfileCustomer" }],
// 		],
// 	},
// 	parse_mode: "HTML",
// };

// const adminButtons = {
// 	reply_markup: {
// 		inline_keyboard: [[{ text: "Stats", callback_data: "callStats" }]],
// 	},
// };

// const confirmDeleteButtons = {
// 	reply_markup: {
// 		keyboard: [[{ text: "УДАЛИТЬ" }, { text: "ВЕРНУТЬСЯ" }]],
// 		resize_keyboard: true,
// 	},
// 	parse_mode: "HTML",
// 	one_time_keyboard: true,
// };

// // функция фильтрует запрос пользователя удаляя лишние слова из массива запроса

// function correctQuery(query) {
// 	const badWords = [
// 		"АС",
// 		"область",
// 		"области",
// 		"пер.",
// 		"просп.",
// 		"проспект",
// 		"г.",
// 		"д.",
// 		"ул.",
// 		"корп.",
// 		"стр.",
// 		"край",
// 		"края",
// 	];
// 	let arr = query
// 		.split(" ")
// 		.filter(function (item) {
// 			let a = badWords.includes(item);
// 			return !a;
// 		})
// 		.join(" ");
// 	return arr;
// }

// // функция возвращает разные клавиатуры для зарегистрированного и нового пользователя
// async function whatMarkup(tgID) {
// 	if (await db.isRegistered(tgID)) {
// 		return registeredUserMenuMarkup;
// 	} else {
// 		return newUserMenuMarkup;
// 	}
// }

// // функция возвращает ID пользователя, взятое из сообщения или колбэк-даты, в зависимости от того из чего переход вв сцену

// function getID(message, callback_data) {
// 	if (message) {
// 		return message.from.id;
// 	} else {
// 		return callback_data.from.id;
// 	}
// }

// // функция поиска в базе суда/региона

// async function searchCourt(tgID, request) {
// 	try {
// 		const userProfile = await userModel.findOne({ telegramId: tgID });
// 		if (userProfile) {
// 			const dbResults = await courtModel.find({ $text: { $search: request } });
// 			if (dbResults) {
// 				return dbResults;
// 			} else {
// 				console.log("Court not found!");
// 			}
// 		} else {
// 			console.log("User not registered!");
// 		}
// 	} catch (error) {
// 		console.log("Ошибка обращения к базе");
// 		console.log(error);
// 	}
// }

// // функция приводит формат времени в читаемый или заменяет его на undefined

// function datesFunction(userProfile) {
// 	let dates = {};
// 	if (userProfile.contractorRegisterDate === null) {
// 		dates.contractorRD = undefined;
// 	} else {
// 		dates.contractorRD = moment(userProfile.contractorRegisterDate).format("DD.MM.YYYY | HH:mm:ss");
// 	}
// 	if (userProfile.customerRegisterDate === null) {
// 		dates.customerRD = undefined;
// 	} else {
// 		dates.customerRD = moment(userProfile.customerRegisterDate).format("DD.MM.YYYY | HH:mm:ss");
// 	}
// 	return dates;
// }

// // генерация кнопок выбора суда из найденных в базе совпадений

// function courtList(item, ctx) {
// 	const chooseRegionButtons = {
// 		reply_markup: {
// 			inline_keyboard: [[{ text: item.COURTNAME, callback_data: `dbid_${item._id}` }]],
// 		},
// 		parse_mode: "HTML",
// 	};
// 	ctx.reply(
// 		`
// 🏛️ <b>${item.COURTNAME}</b>
// Номер суда: ${item.COURTNUMBER}
// Адрес: ${item.COURTADDRESS}

// 	`,
// 		chooseRegionButtons
// 	);
// }
// // генерация кнопок выбора Исполнителя из найденных в базе совпадений по региону

// function userList(item, ctx) {
// 	const chooseUserButtons = {
// 		reply_markup: {
// 			inline_keyboard: [[{ text: `Написать ☝️ ${item.firstName}`, callback_data: `user_${item._id}` }]],
// 		},
// 		parse_mode: "HTML",
// 	};
// 	ctx.reply(
// 		`
// 📌 <b>${item.firstName} ${item.lastName}</b>
// Является Исполнителем с: <b>${moment(item.contractorRegisterDate).format("DD.MM.YYYY")}</b>
// `,
// 		chooseUserButtons
// 	);
// }

// генерация сцен

class SceneGenerator {
	GenMainScene() {
		const main = new Scene("main");
		main.enter(async (ctx) => {
			let mainID = getID(ctx.message, ctx.callbackQuery);
			ctx.reply(
				`
Вы находитесь в главном меню. Что хотите сделать?

⬇️ Смотрите на кнопки внизу. ⬇️

Если кнопки не видны - нажмите специальную кнопку справа от поля ввода текста чтобы их показать.
			`,
				await whatMarkup(mainID)
			);
		});
		main.on("message", async (ctx) => {
			let msg = ctx.message.text;
			switch (msg) {
				case "Регистрация":
					if (await db.isRegistered(ctx.message.from.id)) {
						ctx.reply(messages.alreadyRegistered);
						ctx.scene.reenter();
					} else {
						ctx.scene.state.action = "register";
						ctx.scene.enter("editName", ctx.scene.state);
					}
					break;
				case "Найти исполнителя":
					const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
					if (isUserRegistered) {
						if (isUserRegistered.contractorStatus) {
							ctx.scene.enter("findСontractor");
						} else {
							ctx.reply(
								"Похоже Вы не завершили регистрацию в качестве Заказчика. Перейдите в профиль и укажите этот параметр"
							);
						}
					} else {
						ctx.reply("Вы еще не зарегистрированы. Искать Исполнителя можно только тем, кого я знаю по имени.");
					}
					break;
				case "Помощь":
				case "/help":
					ctx.reply(messages.helpMessage);
					break;
				case "Главное меню":
					ctx.reply("Вы уже в главном меню. Выберите действие с помощью кнопок внизу.");
					break;
				case "Мой профиль":
					ctx.scene.enter("profile");
					break;
				case "/start":
					ctx.scene.reenter();
					break;
				case "/admin":
					ctx.scene.enter("adminScene");
					break;

				default:
					ctx.reply(`
					Пока не нужно ничего писать. Просто выберите одну из функций на кнопках, или перейдите в раздел помощи (/help).
					`);
					break;
			}
		});
		return main;
	}

	// 	GenProfileScene() {
	// 		const profile = new Scene("profile");
	// 		profile.enter(async (ctx) => {
	// 			let mainID = getID(ctx.message, ctx.callbackQuery);
	// 			try {
	// 				const userProfile = await userModel.findOne({ telegramId: mainID });
	// 				if (userProfile) {
	// 					let courtProfile = await courtModel.findOne({ COURTNUMBER: userProfile.region });
	// 					let dates = datesFunction(userProfile);
	// 					await ctx.reply(
	// 						`
	// ⭐ Мой профиль ⭐

	// 					`,
	// 						registeredUserMenuMarkup
	// 					);
	// 					await ctx.reply(
	// 						`
	// <b>Имя:</b> ${userProfile.firstName == undefined ? "Неизвестно" : userProfile.firstName}
	// <b>Фамилия:</b> ${userProfile.lastName == undefined ? "Неизвестна" : userProfile.lastName}
	// <b>Номер суда:</b> ${userProfile.region == undefined ? "Неизвестен" : userProfile.region}
	// <b>Название суда:</b> ${courtProfile == null || undefined ? "Неизвестно" : courtProfile.COURTNAME}

	// <b>Зарегистрирован как исполнитель:</b> ${
	// 							userProfile.contractorStatus == undefined
	// 								? "❌ НЕТ"
	// 								: userProfile.contractorStatus == false
	// 								? "❌ НЕТ"
	// 								: "✅ ДА"
	// 						}${
	// 							dates.contractorRD == undefined
	// 								? ""
	// 								: `\n\n<b>Дата регистрации как исполнителя:</b> ⏰ ${dates.contractorRD}`
	// 						}

	// <b>Зарегистрирован как заказчик:</b> ${
	// 							userProfile.customerStatus == undefined
	// 								? "❌ НЕТ"
	// 								: userProfile.customerStatus == false
	// 								? "❌ НЕТ"
	// 								: "✅ ДА"
	// 						}${dates.customerRD == undefined ? "" : `\n\n<b>Дата регистрации как заказчика:</b> ⏰ ${dates.customerRD}`}
	// `,
	// 						userProfileButtons
	// 					);
	// 				} else {
	// 					ctx.reply(
	// 						"Похоже мы еще не знакомы. Личный кабинет и профиль станут доступны после того, Вы как зарегистрируетесь."
	// 					);
	// 					ctx.scene.enter("main");
	// 				}
	// 			} catch (error) {
	// 				console.log(error);
	// 				await ctx.reply("Ошибка поиска профиля в базе");
	// 				ctx.scene.enter("main");
	// 			}
	// 		});
	// 		profile.action("deleteProfile", (ctx) => {
	// 			ctx.answerCbQuery();
	// 			ctx.scene.enter("deleteProfile");
	// 		});
	// 		profile.action("editProfile", (ctx) => {
	// 			ctx.answerCbQuery();
	// 			ctx.scene.enter("editProfile");
	// 		});
	// 		profile.on("text", async (ctx) => {
	// 			const msg = ctx.message.text;
	// 			switch (msg) {
	// 				case "Регистрация":
	// 					ctx.reply("Вы уже зарегистрированы.");
	// 					break;
	// 				case "Найти исполнителя":
	// 					const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
	// 					if (isUserRegistered) {
	// 						if (isUserRegistered.customerStatus) {
	// 							ctx.scene.enter("findСontractor");
	// 						} else {
	// 							ctx.reply(
	// 								"Похоже Вы не завершили регистрацию в качестве Заказчика. Перейдите в профиль и укажите этот параметр."
	// 							);
	// 						}
	// 					} else {
	// 						ctx.reply("Вы еще не зарегистрированы. Искать Исполнителя можно только тем, кого я знаю по имени.");
	// 					}
	// 					break;
	// 				case "Помощь":
	// 				case "/help":
	// 					ctx.reply(messages.helpMessage);
	// 					break;
	// 				case "Главное меню":
	// 				case "/start":
	// 					ctx.scene.enter("main");
	// 					break;
	// 				case "Мой профиль":
	// 					ctx.scene.reenter();
	// 					break;
	// 				default:
	// 					ctx.reply("Пользуйтесь кнопками. Не пишите ничего, пока я об этом не попрошу.");
	// 					break;
	// 			}
	// 		});
	// 		profile.on("message", (ctx) =>
	// 			ctx.reply(
	// 				"Не нужно ничего отправлять. В профиле можно изменить параметры или удалить сведения о себе полностью. Хотите выйти из профиля - воспользуйтесь кнопками внизу."
	// 			)
	// 		);
	// 		return profile;
	// 	}

	GenEditNameScene() {
		const editName = new Scene("editName");
		editName.enter(async (ctx) => {
			let replyMsg = replyMessages.editUserName(ctx.scene.state);
			if (ctx.scene.state.action == "register") {
				ctx.reply(replyMsg.sceneEnterMessage, newUserMenuMarkup);
			} else {
				ctx.reply(replyMsg.sceneEnterMessage, registeredUserMenuMarkup);
			}
		});
		editName.on("text", async (ctx) => {
			const msg = ctx.message.text;
			switch (msg) {
				case "Регистрация":
					ctx.reply(replyMsg.registerationUserMessage);
					break;
				case "Мой профиль":
					ctx.scene.enter("profile");
					break;
				case "Найти исполнителя":
					const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
					if (isUserRegistered) {
						if (isUserRegistered.contractorStatus) {
							ctx.scene.enter("findСontractor");
						} else {
							ctx.reply(replyMsg.notRegisteredContractorMessage);
						}
					} else {
						ctx.reply(replyMsg.notRegisteredUserMessage);
					}
					break;
				case "Помощь":
				case "/help":
					ctx.reply(messages.helpMessage);
					break;
				case "Главное меню":
				case "/start":
					ctx.scene.enter("main");
					break;
				default:
					if (ctx.scene.state.action == "register") {
						if (await db.isRegistered(ctx.message.from.id)) {
							await ctx.reply("❗ Похоже такой пользователь уже зарегистрирован. Посмотрите профиль.❗");
							ctx.scene.state.action = "edit";
							ctx.scene.enter("main", ctx.scene.state);
						} else {
							let userParams = {
								telegramId: ctx.message.from.id,
								username: ctx.message.from.username,
								firstName: msg,
								registrationDate: Date.now(),
							};
							try {
								db.saveUser(userParams);
								ctx.scene.enter("editLastname", ctx.scene.state);
							} catch (error) {
								ctx.reply("Ошибка сохранения имени и ID. Попробуйте сначала.");
								ctx.scene.reenter();
							}
						}
					} else {
						try {
							await userModel.updateOne({ telegramId: ctx.message.from.id }, { $set: { firstName: msg } });
							ctx.reply(`Имя обновлено. Новое имя: ${msg}`);
							ctx.scene.enter("main");
						} catch (error) {
							ctx.reply("Ошибка обновления имени. Попробуйте сначала.");
							ctx.scene.reenter();
						}
					}

					break;
			}
		});
		editName.on("message", (ctx) => ctx.reply("Нет. Имя. Текстом. Все просто."));
		return editName;
	}

	GenEditLastnameScene() {
		const editLastname = new Scene("editLastname");
		editLastname.enter(async (ctx) => {
			let replyMsg;
			replyMsg = replyMessages.editUserLastname(ctx.scene.state);
			if (ctx.scene.state.action == "register") {
				ctx.reply(replyMsg.sceneEnterMessage, newUserMenuMarkup);
			} else {
				ctx.reply(replyMsg.sceneEnterMessage, registeredUserMenuMarkup);
			}
		});
		editLastname.on("text", async (ctx) => {
			const msg = ctx.message.text;
			switch (msg) {
				case "Регистрация":
					ctx.reply(replyMsg.registerationUserMessage);
					break;
				case "Мой профиль":
					ctx.scene.enter("profile");
					break;
				case "Найти исполнителя":
					const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
					if (isUserRegistered) {
						if (isUserRegistered.contractorStatus) {
							ctx.scene.enter("findСontractor");
						} else {
							ctx.reply(replyMsg.notRegisteredContractorMessage);
						}
					} else {
						ctx.reply(replyMsg.notRegisteredUserMessage);
					}
					break;
				case "Помощь":
				case "/help":
					ctx.reply(messages.helpMessage);
					break;
				case "Главное меню":
				case "/start":
					ctx.scene.enter("main");
					break;
				default:
					console.log(ctx.scene.state.action);
					if (ctx.scene.state.action == "register") {
						try {
							await userModel.updateOne({ telegramId: ctx.message.from.id }, { $set: { lastName: msg } });
							ctx.scene.enter("editRegion", ctx.scene.state);
						} catch (error) {
							ctx.reply("Ошибка сохранения фамилии. Попробуйте сначала.");
							ctx.scene.reenter();
						}
					} else {
						try {
							await userModel.updateOne({ telegramId: ctx.message.from.id }, { $set: { lastName: msg } });
							ctx.scene.enter("main");
						} catch (error) {
							ctx.reply("Ошибка обновления фамилии. Попробуйте сначала.");
							ctx.scene.reenter();
						}
						ctx.reply(`Фамилия обновлена. Новая фамилия: ${msg}`);
					}
					break;
			}
		});
		editLastname.on("message", (ctx) =>
			ctx.reply(`
Если это Ваша фамилия, то я бы советовал ее сменить.
А если серьезно, давайте фамилию. Буквами.
		`)
		);
		return editLastname;
	}
	GenEditRegionScene() {
		const editRegion = new Scene("editRegion");
		editRegion.enter(async (ctx) => {
			let replyMsg;
			replyMsg = replyMessages.editUserRegion(ctx.scene.state);
			if (ctx.scene.state.action == "register") {
				ctx.reply(replyMsg.sceneEnterMessage, newUserMenuMarkup);
			} else {
				ctx.reply(replyMsg.sceneEnterMessage, registeredUserMenuMarkup);
			}
		});
		editRegion.on("text", async (ctx) => {
			const msg = ctx.message.text;
			switch (msg) {
				case "Регистрация":
					ctx.reply(replyMsg.registerationUserMessage);
					break;
				case "Мой профиль":
					ctx.scene.enter("profile");
					break;
				case "Найти исполнителя":
					const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
					if (isUserRegistered) {
						if (isUserRegistered.contractorStatus) {
							ctx.scene.enter("findСontractor");
						} else {
							ctx.reply(replyMsg.notRegisteredContractorMessage);
						}
					} else {
						ctx.reply(replyMsg.notRegisteredUserMessage);
					}
					break;
				case "Помощь":
				case "/help":
					ctx.reply(messages.helpMessage);
					break;
				case "Главное меню":
				case "/start":
					ctx.scene.enter("main");
					break;
				default:
					try {
						let courts = await searchCourt(ctx.message.from.id, ctx.message.text);
						if (courts.length > 0) {
							await ctx.reply(
								"Вот, что удалось найти. Выберите один из результатов с помощью кнопки. Если не нашли нужный - попробуйте уточнить запрос."
							);
							courts.forEach((element) => {
								return courtList(element, ctx);
							});
						} else {
							ctx.reply("Поиск не дал результатов. Переформулируйте запрос.");
						}
					} catch (error) {
						console.log(error);
						ctx.reply("Ошибка в сцене поиска суда.");
					}
					break;
			}
		});
		editRegion.action(/^dbid_.+/, async (ctx) => {
			let dbid = ctx.callbackQuery.data.slice(5);
			try {
				ctx.answerCbQuery();
				const chosenCourt = await courtModel.findOne({ _id: dbid });
				await userModel.updateOne(
					{ telegramId: ctx.callbackQuery.from.id },
					{ $set: { region: chosenCourt.COURTNUMBER } }
				);
				ctx.reply("Регион и суд обновлены.");
				if (ctx.scene.state.action == "edit") {
					ctx.scene.enter("profile");
				} else {
					ctx.scene.enter("editContractorStatus", ctx.scene.state);
				}
			} catch (error) {
				console.log(error);
				ctx.reply("Ошибка сохранения информации. Попробуйте снова.");
				ctx.scene.reenter();
			}
		});
		editRegion.on("message", (ctx) =>
			ctx.reply(
				`
<b>Введите <u>регион</u> Вашего Арбитражного суда.</b>
Можно написать город, индекс, улицу. Я поищу в своей базе и предложу варианты.
		`,
				{
					parse_mode: "HTML",
					disable_web_page_preview: true,
				}
			)
		);
		return editRegion;
	}

	GenEditContractorStatus() {
		const editContractorStatus = new Scene("editContractorStatus");
		editContractorStatus.enter(async (ctx) => {
			ctx.reply(
				`
<b>Укажите, планируете ли Вы выступить в качестве Исполнителя?</b>
Исполнитель принимает заказы на ознакомление с делами в судах своего региона. Можно одновременно быть зарегистрированным и как Заказчик, и как Исполнитель.
`,
				userStatusButtons
			);
		});
		editContractorStatus.on("text", async (ctx) => {
			const msg = ctx.message.text;
			const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
			let checkContractorRegStatus = () => {
				let updateDate = undefined;
				if (isUserRegistered.contractorStatus == true) {
					// если статус исполнителя в базе == ДА
					updateDate = isUserRegistered.contractorRegisterDate; // оставляем старую дату
				} else {
					updateDate = Date.now(); // записываем текущую дату
				}
				return updateDate;
			};
			switch (msg) {
				case "Регистрация":
					ctx.reply(
						"Читайте сообщения внимательно. Сейчас Вам нужно указать, хотите ли Вы зарегистрироваться как Исполнитель."
					);
					break;
				case "Мой профиль":
					ctx.scene.enter("profile");
					break;
				case "Найти исполнителя":
					if (isUserRegistered) {
						if (isUserRegistered.contractorStatus) {
							ctx.scene.enter("findСontractor");
						} else {
							ctx.reply(
								"Похоже Вы не завершили регистрацию в качестве Заказчика. Перейдите в профиль и укажите этот параметр"
							);
						}
					} else {
						ctx.reply("Вы еще не зарегистрированы. Искать Исполнителей Вам пока нельзя.");
					}
					break;
				case "Помощь":
				case "/help":
					ctx.reply(messages.helpMessage);
					break;
				case "Главное меню":
				case "/start":
					ctx.scene.enter("main");
					break;
				case "ДА":
					if (ctx.scene.state.action == "register") {
						try {
							await userModel.updateOne(
								{ telegramId: ctx.message.from.id },
								{ $set: { contractorStatus: true, contractorRegisterDate: checkContractorRegStatus() } }
							);
							await ctx
								.reply("Вам присвоен статус Исполнителя! Ждите сообщений о заказах.")
								.then(ctx.scene.enter("editCustomerStatus", ctx.scene.state));
						} catch (error) {
							console.log(error);
							ctx.reply("Ошибка сохранения статуса Исполнителя.");
							ctx.scene.enter("editContractorStatus", ctx.scene.state);
						}
					} else {
						try {
							await userModel.updateOne(
								{ telegramId: ctx.message.from.id },
								{ $set: { contractorStatus: true, contractorRegisterDate: checkContractorRegStatus() } }
							);
							ctx
								.reply("Cтатус Исполнителя изменен. Теперь ожидайте сообщений о заказах.")
								.then(ctx.scene.enter("profile"));
						} catch (error) {
							console.log(error);
							ctx.reply("Ошибка сохранения статуса Исполнителя.");
							ctx.scene.enter("editContractorStatus", ctx.scene.state);
						}
					}

					break;
				case "НЕТ":
					if (ctx.scene.state.action == "register") {
						try {
							await userModel.updateOne(
								{ telegramId: ctx.message.from.id },
								{ $set: { contractorStatus: false, contractorRegisterDate: undefined } }
							);
							ctx
								.reply(
									"Вы отказались регистрироваться в качестве Исполнителя. Возможно Вы здесь чтобы заказать услугу?"
								)
								.then(ctx.scene.enter("editCustomerStatus", ctx.scene.state));
						} catch (error) {
							console.log(error);
							ctx.reply("Ошибка сохранения статуса Исполнителя.");
							ctx.scene.enter("editContractorStatus", ctx.scene.state);
						}
					} else {
						try {
							await userModel.updateOne(
								{ telegramId: ctx.message.from.id },
								{ $set: { contractorStatus: false, contractorRegisterDate: undefined } }
							);
							ctx.reply("Вы отказались от статуса Исполнителя. Если передумаете - измените статус в профиле.");
							ctx.scene.enter("profile");
						} catch (error) {
							console.log(error);
							ctx.reply("Ошибка сохранения статуса Исполнителя.");
							ctx.scene.enter("editContractorStatus", ctx.scene.state);
						}
					}

					break;
				default:
					ctx.reply("Нажмите на одну из кнопок внизу. ДА или НЕТ.");
					break;
			}
		});
		editContractorStatus.on("message", (ctx) =>
			ctx.reply(
				`
Просто нажмите на одну из кнопок внизу. ДА или НЕТ.
		`
			)
		);
		return editContractorStatus;
	}

	GenEditCustomerStatus() {
		const editCustomerStatus = new Scene("editCustomerStatus");
		editCustomerStatus.enter(async (ctx) => {
			ctx.reply(
				`
<b>Укажите, планируете ли Вы выступить в качестве Заказчика?</b>
Заказчик получает доступ к базе Исполнителей на ознакомление с демали в судах разных регионов. Можно одновременно быть зарегистрированным и как Заказчик, и как Исполнитель.
`,
				userStatusButtons
			);
		});
		editCustomerStatus.on("text", async (ctx) => {
			const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
			let checkCustomerRegStatus = () => {
				let updateDate = undefined;
				if (isUserRegistered.customerStatus == true) {
					// если статус заказчика в базе == ДА
					updateDate = isUserRegistered.customerRegisterDate; // оставляем старую дату
				} else {
					updateDate = Date.now(); // записываем текущую дату
				}
				return updateDate;
			};
			const msg = ctx.message.text;
			switch (msg) {
				case "Регистрация":
					ctx.reply(
						"Вы уже в процессе регистрации. Читайте сообщения внимательно. Сейчас Вам нужно указать, хотите ли Вы зарегистрироваться как Заказчик."
					);
					break;
				case "Мой профиль":
					ctx.scene.enter("profile");
					break;
				case "Найти исполнителя":
					if (isUserRegistered) {
						if (isUserRegistered.contractorStatus) {
							ctx.scene.enter("findСontractor");
						} else {
							ctx.reply(
								"Похоже Вы не завершили регистрацию в качестве Заказчика. Перейдите в профиль и укажите этот параметр"
							);
						}
					} else {
						ctx.reply("Вы еще не зарегистрированы. Искать Исполнителя можно только тем, кого я знаю по имени.");
					}
					break;
				case "Помощь":
				case "/help":
					ctx.reply(messages.helpMessage);
					break;
				case "Главное меню":
				case "/start":
					ctx.scene.enter("main");
					break;
				case "ДА":
					if (ctx.scene.state.action == "register") {
						try {
							await userModel.updateOne(
								{ telegramId: ctx.message.from.id },
								{ $set: { customerStatus: true, customerRegisterDate: checkCustomerRegStatus() } }
							);
							await ctx
								.reply(
									"Вы зарегистрированы как Заказчик! Процесс регистрации завершен. Можете приступать к поиску Исполнителя."
								)
								.then(ctx.scene.enter("main"));
						} catch (error) {
							console.log(error);
							ctx.reply("Ошибка сохранения статуса Заказчика.");
							ctx.scene.enter("editCustomerStatus", ctx.scene.state);
						}
					} else {
						try {
							await userModel.updateOne(
								{ telegramId: ctx.message.from.id },
								{ $set: { customerStatus: true, customerRegisterDate: checkCustomerRegStatus() } }
							);
							ctx.reply("Теперь Вы зарегистрированы как Заказчик. Можете приступать к поиску Исполнителя.");
							ctx.scene.enter("profile");
						} catch (error) {
							console.log(error);
							ctx.reply("Ошибка сохранения статуса Заказчика.");
							ctx.scene.enter("editCustomerStatus", ctx.scene.state);
						}
					}

					break;
				case "НЕТ":
					if (ctx.scene.state.action == "register") {
						try {
							await userModel.updateOne(
								{ telegramId: ctx.message.from.id },
								{ $set: { customerStatus: false, customerRegisterDate: undefined } }
							);
							ctx.reply("Вы отказались от регистрации как Заказчик. Процесс регистрации завершен.");
							ctx.scene.enter("main");
						} catch (error) {
							console.log(error);
							ctx.reply("Ошибка сохранения статуса Заказчика.");
							ctx.scene.enter("editCustomerStatus", ctx.scene.state);
						}
					} else {
						try {
							await userModel.updateOne(
								{ telegramId: ctx.message.from.id },
								{ $set: { customerStatus: false, customerRegisterDate: undefined } }
							);
							ctx.reply(
								"Вы отказались от статуса Заказчика. Теперь Вы не сможете искать Исполнителей для ознакомления с делами. Если передумаете - измените настройку в профиле."
							);
							ctx.scene.enter("profile");
						} catch (error) {
							console.log(error);
							ctx.reply("Ошибка сохранения статуса Заказчика.");
							ctx.scene.enter("editCustomerStatus", ctx.scene.state);
						}
					}

					break;
				default:
					ctx.reply("Нажмите на одну из кнопок внизу. ДА или НЕТ.");
					break;
			}
		});
		editCustomerStatus.on("message", (ctx) =>
			ctx.reply(
				`
Просто нажмите на одну из кнопок внизу. ДА или НЕТ.
		`
			)
		);
		return editCustomerStatus;
	}

	GenFindСontractorScene() {
		const findСontractor = new Scene("findСontractor");
		findСontractor.enter(async (ctx) => {
			let mainID = getID(ctx.message, ctx.callbackQuery);
			ctx.reply(
				"Это поиск Исполнителя для ознакомления с судебным делом. Введите регион или город суда, в котором нужно провести ознакомление, и я предложу суды, в который готовы сходить местные Исполнители. А после я предложу уже Исполнителей.",
				await whatMarkup(mainID)
			);
		});
		findСontractor.on("text", async (ctx) => {
			let msg = correctQuery(ctx.message.text);
			switch (msg) {
				case "Главное меню":
					ctx.scene.enter("main");
					break;
				case "Регистрация":
					if (await db.isRegistered(ctx.message.from.id)) {
						ctx.reply(messages.alreadyRegistered);
					} else {
						ctx.scene.state.action = "register";
						ctx.scene.enter("editName", ctx.scene.state);
					}
					break;
				case "Найти исполнителя":
					const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
					if (isUserRegistered) {
						if (isUserRegistered.contractorStatus) {
							ctx.scene.enter("findСontractor");
						} else {
							ctx.reply(
								"Похоже Вы не завершили регистрацию в качестве Заказчика. Перейдите в профиль и укажите этот параметр"
							);
						}
					} else {
						ctx.reply("Вы еще не зарегистрированы. Искать Исполнителя можно только тем, кого я знаю по имени.");
					}
					break;
				case "Помощь":
				case "/help":
					ctx.reply(messages.helpMessage);
					break;
				case "Главное меню":
					ctx.reply("Вы уже в главном меню. Выберите действие с помощью кнопок внизу.");
					break;
				case "Мой профиль":
					ctx.scene.enter("profile");
					break;
				case "/start":
					ctx.scene.reenter();
					break;
				case "/admin":
					ctx.scene.enter("adminScene");
					break;
				default:
					try {
						if (await db.isRegistered(ctx.message.from.id)) {
							let courts = await searchCourt(ctx.message.from.id, msg);
							if (courts.length > 0) {
								await ctx.reply(
									"🔎 Вот, что удалось найти. Выберите один из результатов с помощью кнопки. Если не нашли нужный - попробуйте уточнить запрос. 🔍"
								);

								courts.forEach((element) => {
									return courtList(element, ctx);
								});
							} else {
								ctx.reply("Поиск не дал результатов. Переформулируйте запрос.");
							}
						} else {
							await ctx.reply("Не зарегистрирован");
							ctx.scene.enter("main");
						}
					} catch (error) {
						console.error(error);
						await ctx.reply("Ошибка поиска");
						ctx.scene.reenter();
					}
			}
		});
		findСontractor.action(/^dbid_.+/, async (ctx) => {
			ctx.answerCbQuery();
			let dbid = ctx.callbackQuery.data.slice(5);
			try {
				const chosenCourt = await courtModel.findOne({ _id: dbid });
				const foundedUsers = await userModel.aggregate([
					{ $match: { region: chosenCourt.COURTNUMBER } },
					{ $sample: { size: 3 } },
				]);
				await ctx.reply(`
🔎 Вот кто у нас есть в этом регионе. 🔍
Если нужно уточнить поиск - просто введите регион или город снова.
`);
				foundedUsers.forEach((element) => {
					return userList(element, ctx);
				});
			} catch (error) {
				console.error(error);
				ctx.reply("Ошибка сохранения информации. Попробуйте снова.");
				ctx.scene.reenter();
			}
		});
		findСontractor.action(/^user_.+/, async (ctx) => {
			ctx.answerCbQuery();
			let DbUserId = ctx.callbackQuery.data.slice(5);
			try {
				const chosenUser = await userModel.findOne({ _id: DbUserId });
				await ctx.telegram.sendMessage(
					chosenUser.telegramId,
					`
🎉 Здравствуйте, <b>${chosenUser.firstName}</b>! 🎉
Вам отправлена заявка на услугу ознакомления с материалами судебного дела в Арбитражном суде Вашего региона.

Заказчик: 👔 <b>${ctx.callbackQuery.from.first_name} ${ctx.callbackQuery.from.last_name}</b>.
Написать заказчику: 💬 @${ctx.callbackQuery.from.username}.
				`,
					{ parse_mode: "HTML" }
				);
				await ctx.reply(
					`
💡
Сообщение для <b>${chosenUser.firstName} ${chosenUser.lastName}</b> отправлено.
Если понадобится - можете написать ему лично: @${chosenUser.username}
`,
					{ parse_mode: "HTML" }
				);
			} catch (error) {
				console.error(error);
				ctx.reply("Ошибка сохранения информации. Попробуйте снова.");
				ctx.scene.reenter();
			}
		});
		findСontractor.on("message", (ctx) => ctx.reply("Читайте инструкции."));
		return findСontractor;
	}

	GenFindCourtScene() {
		const findCourt = new Scene("findCourt");
		findCourt.enter((ctx) => {
			ctx.reply("Это поиск суда. Введите номер суда, который ищете, и получите в ответ сведения о нем.");
		});
		findCourt.on("text", async (ctx) => {
			switch (ctx.message.text) {
				case "Главное меню":
					ctx.scene.enter("main");
					break;
				default:
					const courtNum = ctx.message.text;
					try {
						const courtProfile = await courtModel.findOne({ COURTNUMBER: courtNum });
						ctx.reply(`
${courtProfile.COURTNUMBER}
${courtProfile.COURTNAME}
${courtProfile.COURTADDRESS}
`);
					} catch (error) {
						console.log(error);
						ctx.reply("Ошибка поиска");
						ctx.scene.reenter();
					}
			}
		});
		findCourt.on("message", (ctx) => ctx.reply("Это явно не номер суда!"));
		return findCourt;
	}

	// сцена редактирования параметров профиля

	GenEditProfileScene() {
		const editProfile = new Scene("editProfile");
		editProfile.enter(async (ctx) => {
			ctx.scene.state.action = "edit";
			ctx.reply(
				`
Вы перешли к редактированию своего профиля. Выберите с помощью кнопок под сообщением что именно Вы хотите изменить.
			`,
				confirmEditButtons
			);
		});
		editProfile.on("text", async (ctx) => {
			switch (ctx.message.text) {
				case "Найти исполнителя":
					const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
					if (isUserRegistered) {
						if (isUserRegistered.contractorStatus) {
							ctx.scene.enter("findСontractor");
						} else {
							ctx.reply(
								"Похоже Вы не завершили регистрацию в качестве Заказчика. Перейдите в профиль и укажите этот параметр"
							);
						}
					} else {
						ctx.reply("Вы еще не зарегистрированы. Искать Исполнителя можно только тем, кого я знаю по имени.");
					}
					break;
				case "Помощь":
				case "/help":
					ctx.reply(messages.helpMessage);
					break;
				case "Главное меню":
				case "/start":
					ctx.scene.enter("main");
					break;
				case "Мой профиль":
					ctx.scene.enter("profile");
					break;
				default:
					ctx.reply("Не нужно ничего писать. Пользуйтесь кнопками.");
					break;
			}
		});
		editProfile.action("editProfileName", (ctx) => {
			ctx.answerCbQuery();
			ctx.scene.enter("editName", ctx.scene.state);
		});
		editProfile.action("editProfileLastname", (ctx) => {
			ctx.answerCbQuery();
			ctx.scene.enter("editLastname", ctx.scene.state);
		});
		editProfile.action("editProfileRegion", (ctx) => {
			ctx.answerCbQuery();
			ctx.scene.enter("editRegion", ctx.scene.state);
		});
		editProfile.action("editProfileContractor", (ctx) => {
			ctx.answerCbQuery();
			ctx.scene.enter("editContractorStatus", ctx.scene.state);
		});
		editProfile.action("editProfileCustomer", (ctx) => {
			ctx.answerCbQuery();
			ctx.scene.enter("editCustomerStatus", ctx.scene.state);
		});
		editProfile.on("message", (ctx) =>
			ctx.reply(
				`
Не нужно ничего сейчас писать. Используйте кнопки.
`
			)
		);
		return editProfile;
	}
	// сцена удаления профиля

	GenDeleteProfileScene() {
		const deleteProfile = new Scene("deleteProfile");
		deleteProfile.enter(async (ctx) => {
			ctx.reply(
				`
🔥 ❗ ВНИМАНИЕ ❗ 🔥
Вы приступили к удалению своего профиля. После удаления Вам снова будет недоступен функционал бота. Если передумаете - придется регистрироваться заново.
			`,
				confirmDeleteButtons
			);
		});
		deleteProfile.on("text", async (ctx) => {
			const msg = ctx.message.text;
			switch (msg) {
				case "Найти исполнителя":
					const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
					if (isUserRegistered) {
						if (isUserRegistered.contractorStatus) {
							ctx.scene.enter("findСontractor");
						} else {
							ctx.reply(
								"Похоже Вы не завершили регистрацию в качестве Заказчика. Перейдите в профиль и укажите этот параметр"
							);
						}
					} else {
						ctx.reply("Вы еще не зарегистрированы. Искать Исполнителя можно только тем, кого я знаю по имени.");
					}
					break;
				case "Помощь":
				case "/help":
					ctx.reply(messages.helpMessage);
					break;
				case "Главное меню":
				case "/start":
					ctx.scene.enter("main");
					break;
				case "Мой профиль":
					ctx.scene.enter("profile");
					break;
				case "ВЕРНУТЬСЯ":
					ctx.reply("Правильный выбор! С возвращением!");
					ctx.scene.enter("main");
					break;
				case "УДАЛИТЬ":
					try {
						await userModel.deleteOne({ telegramId: ctx.message.from.id });
						ctx.reply("Ваш аккаунт удален. Возвращайтесь, если понадоблюсь.");
						ctx.scene.enter("main");
					} catch (error) {
						console.log(error);
						ctx.reply(`
🔴 Ошибка удаления аккаунта. 🔴
Попробуйте позже, или обратитесь в поддержку /help
`);
						ctx.scene.enter("main");
					}
					break;
				default:
					ctx.reply(
						`
Вы в процессе удаления аккаунта. Внизу экрана есть 2 кнопки. Сделайте выбор.
			`
					);
					break;
			}
		});
		deleteProfile.on("message", (ctx) =>
			ctx.reply(
				`
Вы в процессе удаления аккаунта. Внизу экрана есть 2 кнопки. Сделайте выбор.
	`
			)
		);
		return deleteProfile;
	}
	GenCheckCourtScene() {
		const checkCourt = new Scene("checkCourt");

		checkCourt.on("text", async (ctx) => {
			try {
				let courts = await searchCourt(ctx.message.from.id, ctx.message.text);
				if (courts.length > 0) {
					ctx.reply(
						"Вот, что удалось найти. Выберите один из результатов. Если не нашли нужный - попробуйте ввести более точный запрос."
					);

					courts.forEach((element) => {
						return courtList(element);
					});
				} else {
					ctx.reply("Поиск не дал результатов. Переформулируйте запрос.");
				}
			} catch (error) {
				console.log(error);
				ctx.reply("Ошибка в сцене поиска суда.");
			}
		});
		checkCourt.action(/^dbid_.+/, (ctx) => {
			ctx.answerCbQuery();
			ctx.reply("works!");
		});
		return checkCourt;
	}

	// сцена для админа

	GenAdminScene() {
		const adminScene = new Scene("adminScene");
		adminScene.enter(async (ctx) => {
			let mainID = getID(ctx.message, ctx.callbackQuery);
			if (
				(await db.isRegistered(mainID)) &&
				(await userModel.findOne({ telegramId: mainID })).telegramId === Number.parseInt(process.env.ADMIN_ID)
			) {
				ctx.reply(
					`
Центр Управления Полетами
				`,
					adminButtons
				);
			} else {
				ctx.reply("Сори, друг. Ты не админ");
				ctx.scene.enter("main");
			}
		});
		adminScene.on("text", async (ctx) => {
			const msg = ctx.message.text;
			switch (msg) {
				case "Найти исполнителя":
					const isUserRegistered = await userModel.findOne({ telegramId: ctx.message.from.id });
					if (isUserRegistered) {
						if (isUserRegistered.contractorStatus) {
							ctx.scene.enter("findСontractor");
						} else {
							ctx.reply(
								"Похоже Вы не завершили регистрацию в качестве Заказчика. Перейдите в профиль и укажите этот параметр"
							);
						}
					} else {
						ctx.reply("Вы еще не зарегистрированы. Искать Исполнителя можно только тем, кого я знаю по имени.");
					}
					break;
				case "Помощь":
				case "/help":
					ctx.reply(messages.helpMessage);
					break;
				case "Главное меню":
				case "/start":
					ctx.scene.enter("main");
					break;
				case "Мой профиль":
					ctx.scene.enter("profile");
					break;
				default:
					ctx.reply(
						`
Кхм... Кнопки...
			`
					);
					break;
			}
		});
		adminScene.action("callStats", async (ctx) => {
			ctx.answerCbQuery();
			ctx.reply(`
Пользователей всего 📈 ${await userModel.countDocuments({})}
Пользователей за последние 7 дней 📈 ${await userModel.countDocuments({
				registrationDate: { $gt: new Date(Date.now() - 1000 * 60 * 60 * 168) },
			})}
`);
		});
		return adminScene;
	}
}

module.exports = SceneGenerator;
