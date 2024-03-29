// Сообщения, направляемые в сцене изменения статуса Заказчика в зависимости от того регистрируется он или редактирует профиль.

module.exports.editUserCustomerStatus = (state) => {
	let obj = {
		sceneEnterMessage: undefined,
		registerationUserMessage: undefined,
	};

	if (state.action == "register") {
		obj.sceneEnterMessage = `
<b>Укажите, планируете ли Вы выступить в качестве Заказчика?</b>
Заказчик получает доступ к базе Исполнителей на ознакомление с демали в судах разных регионов. Можно одновременно быть зарегистрированным и как Заказчик, и как Исполнитель.
`;
		obj.registerationUserMessage =
			"Вы уже в процессе регистрации. Читайте сообщения внимательно. Сейчас Вам нужно указать хотите ли Вы выступать в качестве Заказчика.";
	} else {
		obj.sceneEnterMessage = `
Вы в процессе изменения стутуса Заказчика.
<b>Укажите, планируете ли Вы выступить в качестве Заказчика?</b>
Заказчик получает доступ к базе Исполнителей на ознакомление с демали в судах разных регионов.
`;
		obj.registerationUserMessage =
			"Вы уже зарегистированы. Сейчас Вам нужно указать хотите ли Вы выступать в качестве Заказчика с помощью кнопок ДА или НЕТ внизу.";
	}
	return obj;
};
