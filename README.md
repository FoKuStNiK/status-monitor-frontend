# Status Monitor Frontend

Frontend для системы мониторинга состояний.

Стек:

- React 18
- Create React App (`react-scripts`)

## Запуск с Docker Compose (ветка `docker`)

Отдельный Nginx и Dockerfile frontend больше не нужны.
Сборку React выполняет **Dockerfile из соседнего репозитория backend**;
затем Express раздаёт готовые файлы frontend, API и WebSocket через один порт.

Папки `status-monitor-frontend` и `status-monitor-backend` должны находиться рядом.
Для запуска перейдите в каталог `status-monitor-backend`, создайте `.env`
на основе `.env.example` и замените `WEBHOOK_TOKEN` на секретный токен.

**Сборка и запуск через Docker Compose:**

```bash
docker compose up -d --build
```

Для отдельной сборки без запуска используйте `docker compose build`.

**Сборка напрямую через Dockerfile:** из общей папки
`status-monitor` (на уровень выше обоих репозиториев) выполните:

```bash
docker build -f status-monitor-backend/Dockerfile -t status-monitor:latest .
```

Последняя точка — контекст сборки, включающий frontend и backend.
Команда `docker build` создаёт образ, но не запускает контейнер.

Перед пересборкой после изменений на GitHub обновите **обе** локальные ветки
`docker` (команды `git fetch origin`, `git switch docker`, `git pull`
в каждом репозитории). Если локальной ветки ещё нет, используйте
`git switch --track origin/docker`.

После запуска сайт доступен на `http://localhost`.
Подробная инструкция — в README backend.

## Локальный запуск без Docker

```bash
git clone https://github.com/FoKuStNiK/status-monitor-frontend.git
cd status-monitor-frontend
npm install
cp .env.example .env
npm start
```

React development server откроется на `http://localhost:3000`.
Для работы API и WebSocket необходимо отдельно запустить backend на порту 5000.

## Переменные окружения для локальной разработки

Пример `.env`:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000/ws
```

При сборке через Docker переменные не задаются, поэтому React использует
относительные адреса `/api/statuses` и `/ws` на том же хосте.

## Логика работы

1. При первом открытии выполняется GET-запрос к backend.
2. После первого запроса подключается WebSocket.
3. Фильтры по ID и статусу выполняют новые GET-запросы.
4. Обновления через WebSocket изменяют таблицу без перезагрузки страницы.
5. При обрыве соединения выполняется автоматическое переподключение.
6. После восстановления WebSocket данные повторно загружаются с текущими фильтрами.
7. Строку таблицы можно раскрыть и посмотреть `details`.
8. Доступна светлая и тёмная тема.
