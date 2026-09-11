import { useEffect, useState } from 'react';

export default function IdFilter({ activeId, onApply }) {
  const [value, setValue] = useState(activeId || '');

  useEffect(() => {
    setValue(activeId || '');
  }, [activeId]);

  function submit(event) {
    event.preventDefault();
    const trimmed = value.trim();

    if (!trimmed) {
      onApply('');
      return;
    }

    const number = Number(trimmed);
    if (!Number.isInteger(number) || number <= 0) return;

    onApply(String(number));
  }

  return (
    <form className="filter-field" onSubmit={submit}>
      <label htmlFor="id-filter">ID</label>
      <div className="filter-field__row">
        <input
          id="id-filter"
          inputMode="numeric"
          value={value}
          onChange={event => setValue(event.target.value)}
          placeholder="Например, 15"
        />
        <button type="submit">Найти</button>
      </div>
    </form>
  );
}
