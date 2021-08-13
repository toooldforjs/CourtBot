const Scene = require("telegraf/scenes/base");
const messages = require("./messages");
const db = require("./db");
const userModel = require("./models/User");
const courtModel = require("./models/Court");

// наборы кнопок для разных сцен и ситуаций

async function whatMarkup(tgID) {
	let newUserMenuMarkup = {
		reply_markup: {
			keyboard: [[{ text: "Регистрация" }, { text: "Главное меню" }], [{ text: "Помощь" }]],
			resize_keyboard: true,
		},
		parse_mode: "HTML",
	};
	let registeredUserMenuMarkup = {
		reply_markup: {
			keyboard: [
				[{ text: "Найти исполнителя" }, { text: "Мой профиль" }],
				[{ text: "Помощь" }, { text: "Главное меню" }],
			],
			resize_keyboard: true,
		},
		parse_mode: "HTML",
	};
	if (await db.isRegistered(tgID)) {
		return registeredUserMenuMarkup;
	} else {
		return newUserMenuMarkup;
	}
}

const userStatusButtons = {
	reply_markup: {
		keyboard: [[{ text: "ДА" }, { text: "НЕТ" }]],
		resize_keyboard: true,
	},
	parse_mode: "HTML",
};

const userProfileButtons = {
	reply_markup: {
		inline_keyboard: [
			[{ text: "Редактировать профиль", callback_data: "editProfile" }],
			[{ text: "Удалить профиль", callback_data: "deleteProfile" }],
		],
	},
	parse_mode: "HTML",
};

const confirmEditButtons = {
	reply_markup: {
		inline_keyboard: [
			[{ text: "Изменить имя", callback_data: "editProfileName" }],
			[{ text: "Изменить фамилию", callback_data: "editProfileLastname" }],
			[{ text: "Изменить суд/регион", callback_data: "editProfileLastname" }],
			[{ text: "Изменить статус Заказчика", callback_data: "editProfileLastname" }],
			[{ text: "Изменить статус Исполнителя", callback_data: "editProfileLastname" }],
		],
	},
	parse_mode: "HTML",
};

const confirmDeleteButtons = {
	reply_markup: {
		keyboard: [[{ text: "УДАЛИТЬ" }, { text: "ВЕРНУТЬСЯ" }]],
		resize_keyboard: true,
	},
	parse_mode: "HTML",
	one_time_keyboard: true,
};

// поиск в базе суда/региона

async function searchCourt(tgID, courtID) {
	try {
		const userProfile = await userModel.findOne({ telegramId: tgID });
		if (userProfile) {
			let courtProfile = await courtModel.findOne({ COURTNUMBER: courtID });
			if (courtProfile) {
				console.log(courtProfile);
				return courtProfile;
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
}

// генерация сцен

class SceneGenerator {
	GenMainScene() {
		const main = new Scene("main");
		main.enter(async (ctx) => {
			ctx.reply(
				`
Вы находитесь в главном меню. Что хотите сделать?

⬇️ Смотрите на кнопки внизу. ⬇️

Если кнопки не видны - нажмите специальную кнопку чтобы их показать справа от поля ввода текста.
			`,
				await whatMarkup(ctx.message.from.id)
			);
		});
		main.action("deleteProfile", (ctx) => {
			ctx.scene.enter("deleteProfile");
		});
		main.action("editProfile", (ctx) => {
			ctx.scene.enter("editProfile");
		});
		main.on("message", async (ctx) => {
			let msg = ctx.message.text;
			switch (msg) {
				case "Регистрация":
					if (await db.isRegistered(ctx.message.from.id)) {
						ctx.reply(messages.alreadyRegistered);
						ctx.scene.reenter();
					} else {
						ctx.scene.enter("editName");
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
					ctx.reply("Вы уже в главном меню.");
					break;
				case "Мой профиль":
					try {
						const userProfile = await userModel.findOne({ telegramId: ctx.message.from.id });
						if (userProfile) {
							let courtProfile = await courtModel.findOne({ COURTNUMBER: userProfile.region });
							await ctx.reply(
								`
<b>ID в Телеграм:</b> ${userProfile.telegramId}
<b>Имя:</b> ${userProfile.firstName == undefined ? "Неизвестно" : userProfile.firstName}
<b>Фамилия:</b> ${userProfile.lastName == undefined ? "Неизвестна" : userProfile.lastName}
<b>Номер суда:</b> ${userProfile.region == undefined ? "Неизвестен" : userProfile.region}
<b>Название суда:</b> ${courtProfile == null ? "Неизвестно" : courtProfile.COURTNAME}

<b>Зарегистрирован как заказчик:</b> ${
									userProfile.customerStatus == undefined ? "Нет" : userProfile.customerStatus == false ? "Нет" : "Да"
								}${
									userProfile.customerRegisterDate == undefined
										? ""
										: `\n<b>Дата регистрации как заказчика:</b> ${userProfile.customerRegisterDate}`
								}

<b>Зарегистрирован как исполнитель:</b> ${
									userProfile.contractorStatus == undefined
										? "Нет"
										: userProfile.contractorStatus == false
										? "Нет"
										: "Да"
								}${
									userProfile.contractorRegisterDate == undefined
										? ""
										: `\n<b>Дата регистрации как исполнителя:</b> ${userProfile.contractorRegisterDate}`
								}
`,
								userProfileButtons
							);
						} else {
							ctx.reply("Такого пользователя не существует. Сначала зарегистрируйтесь.");
							ctx.scene.reenter();
						}
					} catch (error) {
						console.log(error);
						ctx.reply("Ошибка поиска профиля в базе");
						ctx.scene.reenter();
					}
					break;
				case "/start":
					ctx.reply("Вы уже в главном меню. Выберите действие с помощью кнопок внизу.");
					break;
				case "/find":
					ctx.scene.enter("checkCourt");
					break;
				case "/court":
					ctx.scene.enter("findСourt");
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

	GenEditNameScene() {
		const editName = new Scene("editName");
		editName.enter((ctx) => {
			ctx.reply(messages.editName, {
				parse_mode: "HTML",
			});
		});
		editName.on("text", async (ctx) => {
			const msg = ctx.message.text;
			switch (msg) {
				case "Регистрация":
					ctx.reply("Вы уже в процессе регистрации. Читайте сообщения внимательно. Сейчас Вам нужно ввести свое имя.");
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
				case "/start":
					ctx.scene.enter("main");
					break;
				default:
					ctx.scene.state.contactData = {};
					const firstName = ctx.message.text;
					if (await db.isRegistered(ctx.message.from.id)) {
						await ctx.reply("❗ Похоже такой пользователь у меня уже зарегистрирован. Посмотрите профиль.❗");
						ctx.scene.enter("main");
					} else {
						try {
							ctx.scene.state.contactData.telegramId = ctx.message.from.id;
							ctx.scene.state.contactData.firstName = firstName;
							db.saveUser(ctx.scene.state.contactData);
							ctx.scene.enter("editLastname", ctx.scene.state);
						} catch (error) {
							console.log(error);
							ctx.reply("Ошибка сохранения имени и ID.");
						}
						await ctx.scene.leave();
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
			ctx.reply(
				`
Здравствуйте, ${ctx.scene.state.contactData.firstName}.
<b><u>Теперь введите фамилию.</u></b>
Так же, ничего лишнего.
Если Вы переживаете за свои персональные данные, их сохранность и конфиденциальность, то Вы всегда можете удалить всё в Профиле.
`,
				{
					parse_mode: "HTML",
				}
			);
		});
		editLastname.on("text", async (ctx) => {
			const msg = ctx.message.text;
			switch (msg) {
				case "Регистрация":
					ctx.reply(
						"Вы уже в процессе регистрации. Читайте сообщения внимательно. Сейчас Вам нужно ввести свою фамилию."
					);
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
				case "/start":
					ctx.scene.enter("main");
					break;
				default:
					ctx.scene.state.contactData.lastName = ctx.message.text;
					try {
						await userModel.updateOne(
							{ telegramId: ctx.message.from.id },
							{ $set: { lastName: ctx.scene.state.contactData.lastName } }
						);
						ctx.scene.enter("editRegion", ctx.scene.state);
					} catch (error) {
						console.log(error);
						ctx.reply("Ошибка сохранения фамилии.");
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
			ctx.reply(
				`
Приятно познакомиться, ${ctx.scene.state.contactData.firstName} ${ctx.scene.state.contactData.lastName}.
<b>Теперь введите <u>номер арбитражного суда</u> Вашего региона проживания (работы).</b>
Это номер суда вместе с буквой "А" перед номером. Например, если Вы живете в Москве, то номер Вашего суда будет "А40". Его и нужно ввести.
Если Вы не помните этот номер, или хотите перепроверить, то можете посмотреть на сайте <a href="http://arbitr.ru/as/subj">arbitr.ru</a>
`,
				{
					parse_mode: "HTML",
					disable_web_page_preview: true,
				}
			);
		});
		editRegion.on("text", async (ctx) => {
			const msg = ctx.message.text;
			switch (msg) {
				case "Регистрация":
					ctx.reply(
						"Вы уже в процессе регистрации. Читайте сообщения внимательно. Сейчас Вам нужно ввести номер арбитражного суда Вашего региона проживания (работы)."
					);
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
				case "/start":
					ctx.scene.enter("main");
					break;
				default:
					ctx.scene.state.contactData.region = ctx.message.text;
					try {
						await userModel.updateOne(
							{ telegramId: ctx.message.from.id },
							{ $set: { region: ctx.scene.state.contactData.region } }
						);
						ctx.reply("Номер суда сохранен.");
						ctx.scene.enter("editContractorStatus", ctx.scene.state);
					} catch (error) {
						console.log(error);
						ctx.reply("Ошибка сохранения региона.");
						ctx.scene.enter("main");
					}
					break;
			}
		});
		editRegion.on("message", (ctx) =>
			ctx.reply(
				`
Номер региона нужно вводить буквами и цифрами. Например "А41" (без кавычек).
Если Вы не помните этот номер, или хотите перепроверить, то можете посмотреть на сайте <a href="http://arbitr.ru/as/subj">arbitr.ru</a>
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
<b>Укажите, хотите ли Вы зарегистрироваться как Исполнитель?</b>
Исполнитель принимает заказы на ознакомление с демали в судах своего региона. Можно одновременно быть зарегистрированным и как Заказчик, и как Исполнитель.
`,
				userStatusButtons
			);
		});
		editContractorStatus.on("text", async (ctx) => {
			const msg = ctx.message.text;
			switch (msg) {
				case "Регистрация":
					ctx.reply(
						"Вы уже в процессе регистрации. Читайте сообщения внимательно. Сейчас Вам нужно указать, хотите ли Вы зарегистрироваться как Исполнитель."
					);
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
				case "/start":
					ctx.scene.enter("main");
					break;
				case "ДА":
					try {
						await userModel.updateOne(
							{ telegramId: ctx.message.from.id },
							{ $set: { contractorStatus: true, contractorRegisterDate: Date.now() } }
						);
						ctx.reply("Вы зарегистрированы как Исполнитель! Ждите сообщений о заказах.");
						ctx.scene.enter("editCustomerStatus");
					} catch (error) {
						console.log(error);
						ctx.reply("Ошибка сохранения статуса Исполнителя.");
						ctx.scene.reenter();
					}
					break;
				case "НЕТ":
					try {
						await userModel.updateOne({ telegramId: ctx.message.from.id }, { $set: { contractorStatus: false } });
						ctx.reply("Вы отказались от регистрации как Исполнитель.");
						ctx.scene.enter("editCustomerStatus");
					} catch (error) {
						console.log(error);
						ctx.reply("Ошибка сохранения статуса Исполнителя.");
						ctx.scene.reenter();
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
		`,
				{
					parse_mode: "HTML",
				}
			)
		);
		return editContractorStatus;
	}

	GenEditCustomerStatus() {
		const editCustomerStatus = new Scene("editCustomerStatus");
		editCustomerStatus.enter(async (ctx) => {
			ctx.reply(
				`
<b>Укажите, хотите ли Вы зарегистрироваться как Заказчика?</b>
Заказчик получает доступ к базе Исполнителей на ознакомление с демали в судах разных регионов. Можно одновременно быть зарегистрированным и как Заказчик, и как Исполнитель.
`,
				userStatusButtons
			);
		});
		editCustomerStatus.on("text", async (ctx) => {
			const msg = ctx.message.text;
			switch (msg) {
				case "Регистрация":
					ctx.reply(
						"Вы уже в процессе регистрации. Читайте сообщения внимательно. Сейчас Вам нужно указать, хотите ли Вы зарегистрироваться как Заказчик."
					);
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
				case "/start":
					ctx.scene.enter("main");
					break;
				case "ДА":
					try {
						await userModel.updateOne(
							{ telegramId: ctx.message.from.id },
							{ $set: { customerStatus: true, customerRegisterDate: Date.now() } }
						);
						ctx.reply("Вы зарегистрированы как Заказчик! Можете приступать к поиску Исполнителя.");
						ctx.scene.enter("main");
					} catch (error) {
						console.log(error);
						ctx.reply("Ошибка сохранения статуса Заказчика.");
						ctx.scene.reenter();
					}
					break;
				case "НЕТ":
					try {
						await userModel.updateOne({ telegramId: ctx.message.from.id }, { $set: { customerStatus: false } });
						ctx.reply("Вы отказались от регистрации как Заказчик.");
						ctx.scene.enter("main");
					} catch (error) {
						console.log(error);
						ctx.reply("Ошибка сохранения статуса Заказчика.");
						ctx.scene.reenter();
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
		`,
				{
					parse_mode: "HTML",
				}
			)
		);
		return editCustomerStatus;
	}

	GenFindСontractorScene() {
		const findСontractor = new Scene("findСontractor");
		findСontractor.enter((ctx) => {
			ctx.reply("Это поиск исполнителя для ознакомления с судебным делом. Введите TelegramID того, кого ищете.");
		});
		findСontractor.on("text", async (ctx) => {
			switch (ctx.message.text) {
				case "Главное меню":
					ctx.scene.enter("main");
					break;
				default:
					const tgID = ctx.message.text;
					try {
						if (await db.isRegistered(tgID)) {
							const dbResult = await userModel.findOne({ telegramId: tgID });
							ctx.reply(dbResult.firstName);
						} else {
							ctx.reply("Запрос не ушел");
							ctx.scene.reenter();
						}
					} catch (error) {
						console.log(error);
						ctx.reply("Ошибка поиска");
						ctx.scene.reenter();
					}
			}
		});
		findСontractor.on("message", (ctx) => ctx.reply("Это явно не ID!"));
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
			ctx.reply(
				`
Вы перешли к редактированию своего профиля. Выберите с помощью кнопок под сообщением что именно Вы хотите изменить.
			`,
				confirmDeleteButtons
			);
		});
		main.action("editProfileName", (ctx) => {
			ctx.reply("вход в сцену редактирования имени");
			ctx.scene.enter("editName");
		});
		editProfile.on("message", (ctx) =>
			ctx.reply(
				`
Неверный формат сообщения. Используйте кнопки.
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
		checkCourt.enter(async (ctx) => {
			try {
				const courtObject = await searchCourt(ctx.message.from.id, "А20");
				let foundedCourt = `
Номер суда: ${courtObject.COURTNUMBER}
Название: ${courtObject.COURTNAME}
Телефон: ${courtObject.COURTPHONE}
Адрес: ${courtObject.COURTADDRESS}
Сайт: ${courtObject.COURTSITE}
				`;
				ctx.reply(foundedCourt);
			} catch (error) {
				console.log(error);
				ctx.reply("Ошибка в сцене поиска суда.");
			}
			// 			ctx.reply(
			// 				`
			// Ищем суд
			// `,
			// 				{
			// 					parse_mode: "HTML",
			// 				}
			// 			);
		});
		// 		checkCourt.on("text", async (ctx) => {
		// 			const msg = ctx.message.text;
		// 			switch (msg) {
		// 				case "Помощь":
		// 				case "/help":
		// 					ctx.reply(messages.helpMessage);
		// 					break;
		// 				case "Главное меню":
		// 				case "/start":
		// 					ctx.scene.enter("main");
		// 					break;
		// 				default:
		// 					try {
		// 						let foundedCourt = searchCourt(ctx.message.from.id, msg);
		// 						console.log(foundedCourt);
		// 						ctx.reply(foundedCourt);
		// 					} catch (error) {
		// 						console.log(error);
		// 						ctx.reply("Ошибка в сцене поиска суда.");
		// 					}
		// 					break;
		// 			}
		// 		});
		// 		checkCourt.on("message", (ctx) =>
		// 			ctx.reply(`
		// Введи суд по шаблону "А40".
		// 		`)
		// 		);
		return checkCourt;
	}
	GenEditNameScene() {
		const editName = new Scene("editName");
		editName.enter((ctx) => {
			ctx.reply(messages.editName, {
				parse_mode: "HTML",
			});
		});
		editName.on("text", async (ctx) => {
			const msg = ctx.message.text;
			switch (msg) {
				case "Регистрация":
					ctx.reply("Вы уже в процессе регистрации. Читайте сообщения внимательно. Сейчас Вам нужно ввести свое имя.");
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
				case "/start":
					ctx.scene.enter("main");
					break;
				default:
					ctx.scene.state.contactData = {};
					const firstName = ctx.message.text;
					if (await db.isRegistered(ctx.message.from.id)) {
						await ctx.reply("❗ Похоже такой пользователь у меня уже зарегистрирован. Посмотрите профиль.❗");
						ctx.scene.enter("main");
					} else {
						try {
							ctx.scene.state.contactData.telegramId = ctx.message.from.id;
							ctx.scene.state.contactData.firstName = firstName;
							db.saveUser(ctx.scene.state.contactData);
							ctx.scene.enter("editLastname", ctx.scene.state);
						} catch (error) {
							console.log(error);
							ctx.reply("Ошибка сохранения имени и ID.");
						}
						await ctx.scene.leave();
					}
					break;
			}
		});
		editName.on("message", (ctx) => ctx.reply("Нет. Имя. Текстом. Все просто."));
		return editName;
	}
}

module.exports = SceneGenerator;
