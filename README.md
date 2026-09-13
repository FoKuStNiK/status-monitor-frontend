# Status Monitor Frontend

React 18 + Create React App (`react-scripts`).

## Запуск

```bash
npm install
npm start
```

Сайт открывается на `http://localhost:3000`.

Локальный `.env` для обычного запуска не обязателен. Если потребуется изменить адрес backend или WebSocket, можно создать `.env` по шаблону `.env.example`.

## Логика

1. При первом открытии выполняется `GET /api/statuses`.
2. После завершения первого GET подключается WebSocket.
3. При выборе фильтра выполняется новый GET с query-параметрами.
4. WebSocket-события `status:updated` обновляют текущую выборку без дополнительного GET.
5. Если WebSocket оборвался, показывается красное предупреждение и выполняется reconnect.
6. После успешного reconnect выполняется GET с текущими активными фильтрами.
