# Telegram-бот 🤖 Ознакомление с делом 🤖

Этот бот поможет организовать ознакомление с материалами судебного дела в арбитражном суде любого региона России.<br>
Все, что нужно сделать — это зарегистрироваться. Это займет не более 2 минут.<br>
После Вы сможете найти себе представителя в другом регионе или станете таким для кого-то.<br>

## Описание

В юридической практике распространены случаи, когда Вашим оппонентом в суде является организация из другого региона. В такой ситуации, чтобы подготовиться к заседанию стороне дела приходится искать представителя на месте, который сможет сходить в суд и ознакомиться с материалами, которые уже есть в деле.<br><br>
Чаще всего эта процедура достаточно простая и представляет из себя просто фотографирование документов. Подобную услугу, как правило, оказывают юридические фирмы по достаточно высокой стоимости.<br><br>
Этот бот был создан, потому что я сам неоднократно сталкивался с этой проблемой.<br><br>
Не только организации, но и частные лица могут оказать подобную услугу за более уместную цену. Бот позволяет таким людям найти себе заказы, а второй стороне подыскать исполнителя по адекватной цене.<br><br>

## Этот бот

### Позволяет зарегистрировать аккаунт пользователя.

<p align="center">
<img src="https://github.com/toooldforjs/CourtBot/blob/master/demo-img/1.jpg">
</p>

### Имеет полноценный профиль пользователя с именем, аватаром, описанием, статусами исполнителя/заказчика в системе.

<p align="center">
<img src="https://github.com/toooldforjs/CourtBot/blob/master/demo-img/2.jpg">
  <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
<img src="https://github.com/toooldforjs/CourtBot/blob/master/demo-img/3.jpg">
</p>

### Имеет собственную базу арбитражных судов РФ и поддерживает текстовый поиск суда по наименованию и адресу.

<p align="center">
<img src="https://github.com/toooldforjs/CourtBot/blob/master/demo-img/4.jpg">
</p>

### Позволяет просматривать доступных в выбранном регионе (суде) исполнителей.

<p align="center">
<img src="https://github.com/toooldforjs/CourtBot/blob/master/demo-img/5.jpg">
</p>

### Поддерживает начисление рейтинга исполнителя как за процент заполненности профиля, так и за количество обращений к исполнителю ранее.

### Позволяет отправить выбранному исполнителю уведомление от бота и предложить ему связаться в личной переписке для обсуждения деталей.

## Технологии

- [telegraf.js 3.39.0](https://github.com/telegraf/telegraf/tree/v3)
- [winston](https://github.com/winstonjs/winston)
- [moment](https://github.com/moment/moment)
- [MongoDB](https://www.mongodb.com/)
- ты знаешь где это все посмотреть…

## На будущее

Хотелось бы:

- Начать понимать, что и зачем я делаю.
- Изучить JavaScript.
- Придумать и внедрить более продуманную систему начисления рейтинга.
- Придумать систему сбора обратной связи о состоявшихся ознакомлениях.
- Написать инструкции о том, как проходит процедура ознакомления в суде и что нужно чтобы она состоялась.
- Найти человека, который отрефакторит все это.

## Контакты

Связаться со мной можно по почте <toooldforjs@gmail.com> или в [Telegram](https://t.me/Anton_Kondrashov)

## Release notes

### ver. 0.4

- Добавлена обработка случаев, когда у исполнителя нет фамилии. Теперь если фамилия отсутствует, в сообщениях пишется только имя.
- Добавлена проверка, что в сцене поиска исполнителя в базе ищутся только те, у кого имеется действительный статус исполнителя.
- Из результатов поиска исполнителя исключается сам запрашивающий пользователь и админ бота.
- С клавиатуры бота убраны лишние кнопки, нужные ранее для тестирования.
- Добавлен рейтинг исполнителя (начисление рейтинга при регистрации, редактировании, получении предложений работы, отображение рейтинга в профиле, вывод в результатах поиска по исполнителям).
- Исправлена функция очистки поискового запроса от лишних слов/знаков.
- Добавлен постраничный вывод списка найденных в регионе исполнителей.
- Добавлено логирование ошибок в файлы с помощью Winston.
- Упоминания в сообщениях с юзернеймов заменены на идентификаторы, чтобы ссылки на пользователей работали даже у тех, у кого имя пользователя в профиле Telegram не заполнено.

## ver. 0.5

- Исправлен баг, переводящий в сцену смены фамилии по команде /help.
- Скорректировано текстовое приветствие.

## ver. 0.5.1

- Добавлены демо-картинки для README.md

## ver. 0.5.2

- Добавлен README.md

## ver. 0.6

- Добавлено ответное сообщение в случае если исполнители в регионе не найдены
- Скорректировано сообщение по команде /help
