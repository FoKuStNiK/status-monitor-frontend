# Status Monitor — Frontend

Frontend системы мониторинга состояний: React 18, таблица статусов, фильтры по ID и статусу, подробности событий и обновления через WebSocket.

- **Frontend (этот репозиторий):** [status-monitor-frontend](https://github.com/FoKuStNiK/status-monitor-frontend).
- **Backend (отдельный репозиторий):** [status-monitor-backend](https://github.com/FoKuStNiK/status-monitor-backend).

## Как устроен проект

Раньше каждую часть запускали через `npm start` в отдельном терминале. Docker запускает **те же два процесса в двух независимых контейнерах**:

| Приложение | Команда | Адрес при локальном запуске |
| --- | --- | --- |
| Frontend | `npm start` → `react-scripts start` | http://localhost:3000 |
| Backend | `npm start` → Express | http://localhost:5000 |

React загружается браузером с порта 3000, затем **браузер напрямую** запрашивает API и WebSocket backend на порту 5000. Отдельного `docker/server.js`, Nginx и прокси здесь нет. Контейнерам не нужно находиться в соседних папках: каждый собирается из своего репозитория.

> Внимание: `react-scripts start` — сервер **разработки**. Конфигурация подходит для обучения и тестирования, но для постоянной публичной эксплуатации нужна production-сборка, HTTPS и настройка безопасного доступа к API.

## Первый запуск через Docker на своём компьютере

### 1. Установите Docker

Потребуется Docker Desktop (Windows/macOS) либо Docker Engine + Compose (Linux).

Проверьте в терминале:

~~~bash
docker --version
docker compose version
~~~

### 2. Скачайте frontend

~~~bash
git clone https://github.com/FoKuStNiK/status-monitor-frontend.git
cd status-monitor-frontend
~~~

Если проект уже скачан, достаточно `git pull origin main` (при условии, что у вас нет несохранённых конфликтующих локальных изменений).

### 3. Создайте настройки .env

В Git Bash / Linux:

~~~bash
cp .env.example .env
~~~

В PowerShell:

~~~powershell
Copy-Item .env.example .env
~~~

Для локального запуска файл должен содержать:

~~~dotenv
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000/ws
~~~

`localhost` здесь означает **компьютер, на котором открыт браузер**. При разработке на том же компьютере, где работает Docker, менять адреса не нужно.

Compose передаёт переменные из `.env` в процесс `react-scripts start` через `env_file`. Сам файл `.env` не копируется в Docker-образ (`.dockerignore` исключает его).

### 4. Соберите и запустите контейнер

~~~bash
docker compose up -d --build
docker compose ps
~~~

- `--build` собирает образ из текущего Dockerfile.
- `up` создаёт и запускает контейнер.
- `-d` запускает его в фоне.

Откройте http://localhost:3000. **Это запускает только frontend.** Для отображения статусов нужно отдельно запустить backend по его [инструкции](https://github.com/FoKuStNiK/status-monitor-backend/blob/main/README.md).

### 5. Проверьте связь

Когда backend запущен, откройте:

- http://localhost:5000/api/health — ожидается `{"ok":true}`.
- http://localhost:3000 — таблица мониторинга.

Чтобы заполнить таблицу тестовыми данными, из папки **backend** выполните `docker compose exec backend npm run test:webhook`.

## Что записано в Dockerfile и Compose

`Dockerfile` устанавливает Node.js 20, зависимости через `npm install`, копирует исходники React и выполняет `CMD ["npm", "start"]`. Это ровно тот процесс, который раньше запускался в терминале.

`docker-compose.yml`:

~~~yaml
services:
  web:
    build: .
    env_file: .env
    ports:
      - "3000:3000"
~~~

Порт слева — на компьютере, справа — внутри контейнера. `env_file` передаёт переменные React в запускаемый процесс.

## Управление и обновление

В папке frontend:

~~~bash
docker compose ps
docker compose logs -f
docker compose down
~~~

- `ps` — состояние контейнера.
- `logs -f` — сообщения сервера; Ctrl+C прекращает только просмотр.
- `down` — остановить и удалить контейнер.

Обновление кода и перезапуск:

~~~bash
git pull origin main
docker compose up -d --build
~~~

Backend при этом не изменяется.

## Запуск без Docker

Установите Node.js 20+ и npm, создайте `.env` как выше, затем:

~~~bash
npm install
npm start
~~~

Откройте http://localhost:3000. Backend запускается отдельно.

## Если приложение переезжает на VPS

При открытии сайта на **другом компьютере** `localhost:5000` будет указывать на компьютер пользователя, а не на VPS. Поэтому перед запуском на сервере измените адреса в frontend `.env` на доступный браузеру IP или домен VPS.

Пример **только для учебного тестирования** (адрес `203.0.113.10` условный):

~~~dotenv
REACT_APP_API_URL=http://203.0.113.10:5000
REACT_APP_WS_URL=ws://203.0.113.10:5000/ws
~~~

В backend `.env` потребуется разрешить адрес сайта: `FRONTEND_ORIGIN=http://203.0.113.10:3000`. Сетевые правила VPS должны позволять браузеру подключаться к портам 3000 и 5000. Эта схема использует незашифрованные HTTP/WS и **не предназначена для открытой production-эксплуатации**: нужно отдельно настроить HTTPS/WSS и ограничение доступа к API.

При изменении `.env` перезапустите контейнер командой `docker compose up -d --force-recreate`: сервер React считывает переменные при запуске.

## Частые проблемы

| Симптом | Причина / проверка |
| --- | --- |
| Compose не находит `.env` | Создайте файл из `.env.example`. |
| Сайт открылся, но статусов нет | Проверьте `REACT_APP_API_URL` и запущен ли backend. |
| Ошибка CORS в консоли браузера | Проверьте `FRONTEND_ORIGIN` в backend. |
| WebSocket не подключается | Проверьте `REACT_APP_WS_URL` и порт 5000. |
| Порт 3000 занят | Остановите старый процесс или измените левую часть `3000:3000`. |

## Основные файлы

- `src/App.jsx` — интерфейс и состояние таблицы.
- `src/api/statusApi.js` — HTTP-запросы к backend.
- `src/hooks/useWebSocket.js` — WebSocket и переподключение.
- `Dockerfile` — образ frontend.
- `docker-compose.yml` — запуск frontend.
- `.env.example` — образец переменных окружения.
