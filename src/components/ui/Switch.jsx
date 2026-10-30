export default function Switch({ checked, onChange, label, hint }) {
  return (
    <label className="switch">
      <span className="switch__text">
        <span className="switch__label">{label}</span>
        {hint && <span className="switch__hint">{hint}</span>}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch__track" aria-hidden="true"><span className="switch__thumb" /></span>
    </label>
  );
}
