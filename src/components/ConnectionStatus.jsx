const LABELS = {
  idle: 'WebSocket не запущен',
  connecting: 'Подключение WebSocket...',
  connected: 'WebSocket подключён',
  reconnecting: 'Соединение потеряно. Переподключение...'
};

export default function ConnectionStatus({ status }) {
  return (
    <div className={`connection connection--${status}`}>
      <span className="connection__dot" />
      <span>{LABELS[status] || status}</span>
    </div>
  );
}
