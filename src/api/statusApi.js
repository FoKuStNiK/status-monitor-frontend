const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function getStatuses(filters = {}) {
  const params = new URLSearchParams();

  if (filters.id) params.set('id', filters.id);
  if (filters.status) params.set('status', filters.status);

  const query = params.toString();
  const url = `${API_URL}/api/statuses${query ? `?${query}` : ''}`;

  const response = await fetch(url);
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.message || 'Не удалось получить данные');
  }

  return body;
}
