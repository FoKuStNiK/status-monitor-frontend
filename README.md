# Status Monitor Frontend

Frontend для системы мониторинга состояний.

Стек:

- React 18
- Create React App (`react-scripts`)

## Установка и запуск

```bash
git clone https://github.com/FoKuStNiK/status-monitor-frontend.git
cd status-monitor-frontend

npm install
cp .env.example .env
npm start
```

Сайт открывается на:

```text
http://localhost:3000
```

## Переменные окружения

Пример `.env`:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000/ws
```

## Логика работы

1. При первом открытии выполняется GET-запрос к backend.
2. После первого запроса подключается WebSocket.
3. Фильтры по ID и статусу выполняют новые GET-запросы.
4. Обновления через WebSocket изменяют таблицу без перезагрузки страницы.
5. При обрыве соединения выполняется автоматическое переподключение.
6. После восстановления WebSocket данные повторно загружаются с текущими фильтрами.
7. Строку таблицы можно раскрыть и посмотреть `details`.
8. Доступна светлая и тёмная тема.