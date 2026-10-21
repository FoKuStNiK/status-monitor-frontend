# Status Monitor — Frontend

Это видимая часть сайта «Мониторинг состояний»: таблица ID, статусы, время обновления, фильтры и раскрывающиеся подробности.

**Frontend и backend — два разных репозитория с отдельными Dockerfile.** Для запуска в Docker Nginx не нужен: готовые файлы React обслуживает небольшой Node.js-сервер.

- [Frontend](https://github.com/FoKuStNiK/status-monitor-frontend) — этот репозиторий.
- [Backend](https://github.com/FoKuStNiK/status-monitor-backend) — Express, SQLite, API, WebSocket и общий `docker-compose.yml`.

## Как сайт устроен

1. React показывает интерфейс в браузере.
2. Браузер запрашивает `/api/statuses` у Node.js-сервера frontend.
3. Сервер frontend перенаправляет `/api` в backend, находящийся в Docker-сети по имени `backend`.
4. WebSocket-запрос `/ws` также передаётся в backend. Изменения приходят без перезагрузки страницы.
5. Backend сохраняет текущие состояния в SQLite.

**Простыми словами:** React отвечает за внешний вид, Node.js-сервер frontend — за выдачу готовых файлов и передачу запросов, backend — за данные.

## Как запустить оба контейнера (новичку)

### 1. Установите Docker

Понадобится Docker Desktop (Windows/macOS) либо Docker Engine + Compose (Linux). Проверьте:

```bash
docker --version
docker compose version
```

### 2. Скачайте оба репозитория

```bash
mkdir status-monitor
cd status-monitor
git clone https://github.com/FoKuStNiK/status-monitor-frontend.git
git clone https://github.com/FoKuStNiK/status-monitor-backend.git
```

Они должны лежать **рядом**:

```text
status-monitor/
├── status-monitor-frontend/
│   ├── Dockerfile
│   ├── docker/
│   └── src/
└── status-monitor-backend/
    ├── Dockerfile
    └── docker-compose.yml
```

### 3. Настройте backend

Перейдите в `status-monitor-backend`. Создайте файл `.env` из `.env.example`.

Git Bash / Linux:

```bash
cd status-monitor-backend
cp .env.example .env
```

PowerShell: `Copy-Item .env.example .env` (вместо `cp`).

Откройте файл `.env` и **замените `WEBHOOK_TOKEN=your-secret-token`** на свой секрет. Оставьте стандартный `DB_PATH=./server/data/statuses.db`, если не настраивали другой постоянный каталог.

### 4. Запустите сайт

Находясь в каталоге backend:

```bash
docker compose up -d --build
docker compose ps
```

Откройте **http://localhost** (или IP сервера, на котором работает Docker).

В новом терминале в папке backend можно отправить тестовые статусы:

```bash
docker compose exec backend npm run test:webhook
```

Тест отправляет 50 событий — строки появятся в таблице.

Чтобы остановить и удалить контейнеры (не трогая файлы SQLite на компьютере):

```bash
docker compose down
```

Полное объяснение команд и настройка сервера — в [README backend](https://github.com/FoKuStNiK/status-monitor-backend/blob/main/README.md).

## Где Dockerfile для frontend

Он находится **в корне этого репозитория**. Сборка проходит в два этапа:

- `FROM node:20-bookworm-slim AS build` — ставит зависимости и выполняет `npm run build`.
- Второй `FROM node:20-bookworm-slim` — создаёт контейнер для готового React-приложения и запускает `docker/server.js`.

Здесь **нет Nginx**. Файл `docker/server.js` использует Express, чтобы раздавать React, и `http-proxy`, чтобы передавать `/api` и `/ws` в backend.

Внутри Docker frontend слушает **порт 3000**. Compose публикует его на **порту 80** компьютера (`"80:3000"`). Backend не публикует порт 5000 наружу.

Образы можно собрать отдельно, но для полноценной работы они должны быть запущены в общей Docker-сети. Это автоматически делает Compose из репозитория backend.

## Запуск frontend без Docker (для разработки)

Установите [Node.js](https://nodejs.org/) версии **20+**.

В первом терминале запустите backend по его README, затем откройте второй терминал:

```bash
cd status-monitor-frontend
npm install
```

Создайте файл `.env` из `.env.example`:

- Git Bash / Linux: `cp .env.example .env`
- PowerShell: `Copy-Item .env.example .env`

Для локальной разработки должны быть заданы:

```dotenv
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000/ws
```

Затем запустите:

```bash
npm start
```

Откройте **http://localhost:3000**. Это сервер разработки React, а не Docker-контейнер. Остановить его можно клавишами **Ctrl+C**.

**Важно:** при сборке Docker файлы `.env` frontend намеренно не копируются. React использует относительные URL `/api/statuses` и `/ws`, которые обрабатывает Node.js-сервер frontend. Для запуска без Docker настройки из `.env.example` нужны.

## Что умеет интерфейс

- Показывает ID, статус и время обновления.
- Фильтрует таблицу по ID и статусу.
- Раскрывает подробности `details`; можно раскрыть несколько строк одновременно.
- Обновляет записи через WebSocket без перезагрузки.
- Повторно подключается, если связь с backend прервалась.
- Переключается между светлой и тёмной темами.

## Главные файлы

| Файл | Назначение |
| --- | --- |
| `Dockerfile` | Собрать React и создать отдельный контейнер frontend |
| `.dockerignore` | Не копировать лишние файлы при сборке |
| `docker/server.js` | Node.js-сервер статических файлов, HTTP API и WebSocket-прокси |
| `docker/package.json` | Зависимости сервера для production-контейнера |
| `src/App.jsx` | Главный компонент сайта |
| `src/components/StatusTable.jsx` | Таблица статусов |
| `src/api/statusApi.js` | Получение данных через API |
| `src/hooks/useWebSocket.js` | Подключение и восстановление WebSocket |
| `src/App.css` | Оформление страницы |

## Обновление с GitHub

Остановите локальные процессы разработки, если они работают. Обновите код **обоих** репозиториев:

```bash
# Из status-monitor-frontend
git pull origin main
cd ../status-monitor-backend
git pull origin main
docker compose up -d --build
```

Compose пересоберёт оба образа. Изменения React не требуют ручного копирования файлов в backend.

## Если не работает

| Проблема | Решение |
| --- | --- |
| Нет файлов frontend при Docker-сборке | Проверьте `../status-monitor-frontend` относительно каталога backend |
| Браузер открывает сайт, но не показывает статусы | Проверьте `docker compose logs backend` |
| Ошибка 502 на `/api` | Backend не запущен или ещё не готов |
| WebSocket пишет «нет соединения» | Проверьте оба контейнера: `docker compose ps` |
| Порт 80 занят | Измените `"80:3000"` на `"8080:3000"` и открывайте `http://localhost:8080` |
| Сайт пустой при первом запуске | Отправьте тестовые Webhook-сообщения |
| Docker не установлен | Для локальной разработки используйте `npm start` без Docker |

Для публикации в интернете необходим HTTPS. В текущем Compose настроен только HTTP; это стартовая конфигурация, а не полностью защищённый публичный сервер.
