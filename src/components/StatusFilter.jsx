import { STATUSES, STATUS_LABELS } from '../constants/statuses';

export default function StatusFilter({ value, onChange }) {
  return (
    <div className="filter-field">
      <label htmlFor="status-filter">Статус</label>
      <select
        id="status-filter"
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        <option value="">Все</option>
        {STATUSES.map(status => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
    </div>
  );
}
