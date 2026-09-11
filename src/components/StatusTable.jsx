import { STATUS_LABELS } from '../constants/statuses';

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
}

export default function StatusTable({ rows, loading }) {
  if (loading) {
    return <div className="table-state">Загрузка данных...</div>;
  }

  if (!rows.length) {
    return <div className="table-state">По текущим фильтрам данных нет.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Статус</th>
            <th>Время</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td className="id-cell">{row.id}</td>
              <td>
                <span className={`status-badge status-badge--${row.status.replaceAll(' ', '-')}`}>
                  {STATUS_LABELS[row.status] || row.status}
                </span>
              </td>
              <td>{formatTimestamp(row.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
