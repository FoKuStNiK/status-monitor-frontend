# Status Monitor Frontend

React + Vite frontend.

## Запуск

```bash
npm install
cp .env.example .env
npm run dev
```

По умолчанию сайт откроется на `http://localhost:5173`.

## Логика

1. При первом открытии выполняется `GET /api/statuses`.
2. После завершения первого GET подключается WebSocket.
3. При выборе фильтра выполняется новый GET с query-параметрами.
4. WebSocket-события `status:updated` обновляют текущую выборку без дополнительного GET.
5. Если WebSocket оборвался, показывается красное предупреждение и выполняется reconnect.
6. После успешного reconnect выполняется GET с текущими активными фильтрами.
