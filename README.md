Загальні відомості:
«Veritas» — веб-додаток для створення, проведення та аналізу тестів в освітньому процесі. Система складається з клієнтської частини (frontend) та серверної частини (backend) з базою даних MySQL.
Адреси додатку:
Основна адреса: https://veritas-2025.web.app
Альтернативна адреса: https://veritas-2025.firebaseapp.com
API: https://veritas-t6l0.onrender.com
Інструкція з локального запуску:
Необхідне програмне забезпечення містить Node.js версії 18 або вище, Git та редактор коду 
Код проєкту розміщено у приватному репозиторії GitHub: 
https://github.com/nairobi-kl/veritas_full
      Код бекенду розміщено за посиланням:
https://github.com/nairobi-kl/veritas
•	Після отримання доступу виконайте:
git clone https://github.com/nairobi-kl/veritas_full
cd veritas-education
•	Для запуску клієнтської частини (frontend) виконайте:
npm install
npm run dev
•	Для запуску серверної частини (backend) виконайте:
cd backend
npm install
•	Створіть файл backend/.env та запустіть сервер:
npm start
	Розгортання оновлень:
      Оновлення клієнтської частини відбувається із використанням команд:
npm run build
firebase login
firebase deploy --only hosting
      Для оновлення серверної частини достатньо зробити новий коміт та push у репозиторій. 

