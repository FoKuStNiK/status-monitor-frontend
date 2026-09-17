import { useCallback, useEffect, useRef, useState } from 'react';
import { getStatuses } from './api/statusApi';
import ActiveFilters from './components/ActiveFilters';
import ConnectionStatus from './components/ConnectionStatus';
import IdFilter from './components/IdFilter';
import StatusFilter from './components/StatusFilter';
import StatusTable from './components/StatusTable';
import { useWebSocket } from './hooks/useWebSocket';
import './App.css';

export default function App() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ id: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialRequestFinished, setInitialRequestFinished] = useState(false);
  const filtersRef = useRef(filters);
  const requestNumberRef = useRef(0);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const loadData = useCallback(async currentFilters => {
    const requestNumber = ++requestNumberRef.current;
    setLoading(true);
    setError('');

    try {
      const data = await getStatuses(currentFilters);
      if (requestNumber !== requestNumberRef.current) return;
      setRows(data);
    } catch (err) {
      if (requestNumber !== requestNumberRef.current) return;
      setError(err.message || 'Не удалось загрузить данные');
    } finally {
      if (requestNumber === requestNumberRef.current) {
        setLoading(false);
        setInitialRequestFinished(true);
      }
    }
  }, []);

  useEffect(() => {
    loadData({ id: '', status: '' });
  }, [loadData]);

  const handleStatusUpdate = useCallback(record => {
    const current = filtersRef.current;
    const idMatches = !current.id || Number(current.id) === record.id;
    const statusMatches = !current.status || current.status === record.status;

    setRows(previous => {
      const withoutRecord = previous.filter(item => item.id !== record.id);

      if (!idMatches || !statusMatches) {
        return withoutRecord;
      }

      return [...withoutRecord, record].sort((a, b) => a.id - b.id);
    });
  }, []);

  const handleReconnect = useCallback(() => {
    loadData(filtersRef.current);
  }, [loadData]);

  const connectionStatus = useWebSocket({
    enabled: initialRequestFinished,
    onStatusUpdate: handleStatusUpdate,
    onReconnect: handleReconnect
  });

  function applyFilters(nextFilters) {
    setFilters(nextFilters);
    loadData(nextFilters);
  }

  function applyId(id) {
    applyFilters({ ...filtersRef.current, id });
  }

  function applyStatus(status) {
    applyFilters({ ...filtersRef.current, status });
  }

  function clearId() {
    applyFilters({ ...filtersRef.current, id: '' });
  }

  function clearStatus() {
    applyFilters({ ...filtersRef.current, status: '' });
  }

  function clearAll() {
    applyFilters({ id: '', status: '' });
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <h1>Мониторинг состояний</h1>
        <ConnectionStatus status={connectionStatus} />
      </header>

      {connectionStatus === 'reconnecting' && (
        <div className="connection-warning" role="alert">
          <strong>Соединение с сервером потеряно.</strong>
          <span> Данные могут быть неактуальны. Выполняется повторное подключение...</span>
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">{error}</div>
      )}

      <div className="table-heading">
        <h2>Текущие состояния</h2>
        <span>{rows.length} записей</span>
      </div>

      <section className="filters-card">
        <div className="filters-grid">
          <IdFilter activeId={filters.id} onApply={applyId} />
          <StatusFilter value={filters.status} onChange={applyStatus} />
        </div>

        <ActiveFilters
          filters={filters}
          onClearId={clearId}
          onClearStatus={clearStatus}
          onClearAll={clearAll}
        />
      </section>

      <StatusTable rows={rows} loading={loading} />
    </main>
  );
}
