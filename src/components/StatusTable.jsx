import { Fragment, useState } from 'react';
import { STATUS_LABELS } from '../constants/statuses';

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
}

function formatDetails(text) {
  if (!text) return '';

  return text
    .replace(/\s*Container (\d+):/g, '\nContainer $1:')
    .replace(/\s*Response body/g, '\nResponse body')
    .replace(/\s*Response CRC/g, '\nResponse CRC')
    .trim();
}

export default function StatusTable({ rows, loading }) {
  const [expandedId, setExpandedId] = useState(null);

  function toggleRow(id) {
    setExpandedId(currentId =>
      currentId === id ? null : id
    );
  }

  if (loading) {
    return (
      <div className="table-state">
        Загрузка данных...
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="table-state">
        По текущим фильтрам данных нет.
      </div>
    );
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
          {rows.map(row => {
            const isExpanded =
              expandedId === row.id;

            return (
              <Fragment key={row.id}>
                <tr
                  className="status-row"
                  onClick={() => toggleRow(row.id)}
                >
                  <td className="id-cell">
                    <span className="row-arrow">
                      {isExpanded ? '▼' : '▶'}
                    </span>

                    {row.id}
                  </td>

                  <td>
                    <span
                      className={
                        `status-badge ` +
                        `status-badge--${row.status.replaceAll(' ', '-')}`
                      }
                    >
                      {STATUS_LABELS[row.status] || row.status}
                    </span>
                  </td>

                  <td>
                    {formatTimestamp(row.timestamp)}
                  </td>
                </tr>

                {isExpanded && (
                  <tr className="details-row">
                    <td colSpan="3">
                      {row.details ? (
                        <pre className="details-text">
                          {formatDetails(row.details)}
                        </pre>
                      ) : (
                        <div className="details-empty">
                          Данных пока нет
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
