import { STATUS_LABELS } from '../constants/statuses';

export default function ActiveFilters({ filters, onClearId, onClearStatus, onClearAll }) {
  const count = Number(Boolean(filters.id)) + Number(Boolean(filters.status));
  if (!count) return null;

  return (
    <div className="active-filters">
      <span className="active-filters__title">Активные фильтры:</span>

      {filters.id && (
        <button className="filter-chip" onClick={onClearId} title="Убрать фильтр по ID">
          ID: {filters.id} <span aria-hidden="true">×</span>
        </button>
      )}

      {filters.status && (
        <button className="filter-chip" onClick={onClearStatus} title="Убрать фильтр по статусу">
          {STATUS_LABELS[filters.status]} <span aria-hidden="true">×</span>
        </button>
      )}

      {count > 1 && (
        <button className="clear-all" onClick={onClearAll}>
          Сбросить все
        </button>
      )}
    </div>
  );
}
