import { useId } from 'react';

/** Accessible single-choice control (radio group styled as a segmented bar). */
export default function Segmented({ label, value, options, onChange, size = 'md' }) {
  const name = useId();
  return (
    <div className={`segmented segmented--${size}`} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <label key={o.id} className={`segmented__item ${value === o.id ? 'is-on' : ''}`}>
          <input
            type="radio"
            name={name}
            value={o.id}
            checked={value === o.id}
            onChange={() => onChange(o.id)}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}
