# Self-hosted Networking management solution

Представьте, что вы - глава департамента в крупной IT компании в доковидной России. Дважды в месяц вы посещаете конференции, регулярно проводите собеседования и переманиваете опытных специалистов из других компаний. Ваш профиль на Linkedin насчитывает более 1000 связей, а за лентой в ФБ не успеваете уже и следить.

Я отработал 1.5 года журналистом в журнале "Системный Администратор" и знаю эту боль не по наслышке. Но что если у вас появится единое решение для отслеживания всей активности с вашими рабочими контактами? Вот об этом-то и мой проект. Теперь-то вы не забудете где встречались с Владиславом Козулей и кого из знакомых позвать на новую позицию.

Хотите просто запомнить человека? Создайте контакт и деактивируйте его.
Хотите поддерживать связь? Создайте активный контакт и он окажется в пуле предложений для общения.
Хотите запомнить детали знакомого? Запишите всё в описание контакта.
Отмечайте инициированные вами, успешные и оффлайн контакты. Запоминайте, где встретились в описаниях коммуникации.

## User Stories

- User can create contacts
- User can modify contacts. When user updates contact's name all links to communications are persisted.
- User can deactivate contacts. The system will no longer suggest it to the user.
- System suggests a contact to communicate with daily. That's a NetworkingCommunication. It's default status is Sent.
- User can move the NetworkingCommunication to Initiated status and then to Done status when the recipient has responded.
- When User changes the NetworkingCommunication status with a bot - bot chooses the most recent communication to update. TODO: but not older than 30 days. I don't want to spoil the retroactive stats.
- On Friday system suggests an extended list of contacts for weekends without creating NetworkingCommunication to not spoil the stats.