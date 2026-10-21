# Status Monitor Frontend

Это сайт «Мониторинг состояний»: таблица ID, статусов, времени обновления и подробностей. Он написан на React.

**У frontend собственные `Dockerfile` и `docker-compose.yml`.** Он собирается и запускается независимо от backend. Никаких соседних каталогов с серверным кодом не требуется. **Nginx не используется.**

[Backend — отдельный репозиторий](https://github.com/FoKuStNiK/status-monitor-backend). Он принимает Webhook, хранит SQLite и отправляет обновления по WebSocket.

## 1. Как работает сайт

- Во время сборки Docker запускает `npm run build` и создаёт готовые файлы React.
- В контейнере запускается маленький сервер Node.js из `docker/server.js`, который отдаёт HTML, JS и CSS браузеру.
- Запросы браузера по `/api/...` и WebSocket `/ws` сервер frontend перенаправляет в backend.
- Если backend выключен, страница frontend всё ещё откроется, но актуальные статусы загружены не будут.
- Два контейнера могут работать в одной Docker-сети, хотя их исходные проекты лежат в разных папках.

## 2. Что установить

Нужен Docker Desktop (Windows/macOS) или Docker Engine с Compose (Linux). Проверка:

```bash
docker --version
docker compose version
```

## 3. Запуск только frontend

### Шаг 1. Скачать репозиторий

```bash
git clone https://github.com/FoKuStNiK/status-monitor-frontend.git
cd status-monitor-frontend
```

**Скачивать исходники backend для сборки frontend не нужно.**

### Шаг 2. Создать общую Docker-сеть (один раз)

```bash
docker network create status-monitor-net
```

Если сеть уже существует, второй раз создавать её не требуется. Это сеть **одного Docker-хоста**, к которой можно присоединить backend из другого Compose-проекта.

### Шаг 3. Собрать и запустить frontend

Из папки `status-monitor-frontend`:

```bash
docker compose up -d --build
docker compose ps
```

Эта команда запускает **только frontend**, не пересобирая и не запуская backend.

Откройте http://localhost на компьютере с Docker.

В `docker-compose.yml`:
- `build: .` — файлы для сборки берутся **только из текущего репозитория**;
- `ports: "80:3000"` — порт 80 компьютера передаётся на порт 3000 контейнера;
- `BACKEND_URL` — адрес API, по умолчанию `http://backend:5000`;
- `status-monitor-net` — общая Docker-сеть для обмена с backend.

Если порт 80 уже занят, измените `"80:3000"` на `"8080:3000"` в Compose и открывайте http://localhost:8080.

## 4. Подключить отдельно работающий backend

На **том же Docker-хосте** скачайте [backend](https://github.com/FoKuStNiK/status-monitor-backend) в любую папку и следуйте его README: создайте `.env`, затем в каталоге backend выполните:

```bash
docker compose up -d --build
```

Backend не нуждается в папке frontend, а frontend не нуждается в папке backend. Оба сервиса используют заранее созданную общую сеть, поэтому frontend находит backend по имени `backend`.

**Порядок не важен:** каждый проект запускается самостоятельно. Для появления актуальных состояний backend должен работать.

Если frontend и backend находятся **на разных серверах**, Docker-сеть их автоматически не объединяет. Нужно отдельно обеспечить сетевую доступность API и задать переменную `BACKEND_URL` с безопасным адресом backend.

## 5. Как остановить и обновить только frontend

В каталоге frontend:

| Команда | Что делает |
| --- | --- |
| `docker compose ps` | Состояние frontend |
| `docker compose logs -f` | Показывает логи; выйти из просмотра — Ctrl+C |
| `docker compose down` | Останавливает и удаляет контейнер frontend |
| `docker compose up -d --build` | Собирает и запускает frontend |

Для обновления выполните:

```bash
git pull origin main
docker compose up -d --build
```

Это **не обновляет backend**.

## 6. Локальная разработка без Docker

Нужен Node.js 20+ и npm. Backend должен быть отдельно запущен на http://localhost:5000.

В папке frontend:

```bash
npm install
```

Создайте файл `.env` на основе `.env.example`:
- Git Bash / Linux: `cp .env.example .env`;
- PowerShell: `Copy-Item .env.example .env`.

Проверьте настройки:

```dotenv
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000/ws
```

Затем:

```bash
npm start
```

Откройте http://localhost:3000. Это React-сервер разработки, а не Docker-контейнер. Остановка — Ctrl+C.

Для Docker-сборки локальный файл `.env` frontend исключён, поэтому браузер использует относительные пути `/api` и `/ws`, которые обслуживает Node.js-прокси.

## 7. Что умеет сайт

- Показывает ID, статус и время обновления.
- Фильтрует записи по ID и статусу.
- Показывает `details` при раскрытии строки.
- Обновляет статусы в реальном времени через WebSocket.
- Переподключается после разрыва соединения.
- Поддерживает светлую и тёмную темы.

## 8. Основные файлы

| Файл | Назначение |
| --- | --- |
| `Dockerfile` | Собирает образ frontend без backend |
| `docker-compose.yml` | Запускает только контейнер frontend |
| `docker/server.js` | Раздаёт React, передаёт API и WebSocket на backend |
| `docker/package.json` | Зависимости небольшого Node.js-сервера |
| `.dockerignore` | Исключает ненужные файлы из сборки |
| `src/App.jsx` | Основная страница React |
| `src/components/StatusTable.jsx` | Таблица состояний |
| `src/api/statusApi.js` | HTTP-запросы |
| `src/hooks/useWebSocket.js` | WebSocket и переподключение |

## 9. Частые ошибки

| Проблема | Решение |
| --- | --- |
| `network status-monitor-net not found` | Один раз создайте сеть: `docker network create status-monitor-net` |
| Порт 80 занят | Поменяйте публикацию порта на `"8080:3000"` |
| Сайт открывается, но API возвращает 502 | Backend ещё не запущен или не доступен по `BACKEND_URL` |
| WebSocket не подключается | Проверьте работу backend и общую сеть |
| Изменения в React не появились | Выполните `docker compose up -d --build` |

Для эксплуатации в интернете следует настроить HTTPS, корректный адрес backend и защиту передаваемых данных.
