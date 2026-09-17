export default function IdFilter({ activeId, onApply }) {
  function handleChange(event) {
    const nextValue = event.target.value.replace(/\D/g, '');
    onApply(nextValue);
  }

  return (
    <div className="filter-field">
      <label htmlFor="id-filter">ID</label>
      <input
        id="id-filter"
        inputMode="numeric"
        value={activeId || ''}
        onChange={handleChange}
        placeholder="Введите ID"
      />
    </div>
  );
}
