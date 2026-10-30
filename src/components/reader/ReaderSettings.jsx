import { X } from 'lucide-react';
import Segmented from '../ui/Segmented.jsx';
import { SHORTCUTS } from '../../data/shortcuts.js';

export default function ReaderSettings({ settings, onChange, onClose }) {
  return (
    <div className="reader__panel" role="dialog" aria-label="Reader settings">
      <div className="reader__panel-head">
        <h2>Reader settings</h2>
        <button type="button" className="icon-btn icon-btn--sm" onClick={onClose} aria-label="Close settings">
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="field">
        <span className="field__label">Reading mode</span>
        <Segmented size="sm" label="Reading mode" value={settings.readingMode} onChange={(v) => onChange({ readingMode: v })}
          options={[{ id: 'vertical', label: 'Vertical' }, { id: 'paged', label: 'Page by page' }]} />
      </div>
      <div className="field">
        <span className="field__label">Page width</span>
        <Segmented size="sm" label="Page width" value={settings.readerWidth} onChange={(v) => onChange({ readerWidth: v })}
          options={[{ id: 'narrow', label: 'Narrow' }, { id: 'medium', label: 'Medium' }, { id: 'wide', label: 'Wide' }]} />
      </div>
      <div className="field">
        <span className="field__label">Fit (page by page)</span>
        <Segmented size="sm" label="Page fit" value={settings.readerFit} onChange={(v) => onChange({ readerFit: v })}
          options={[{ id: 'height', label: 'Screen' }, { id: 'width', label: 'Width' }]} />
      </div>
      <ul className="reader__keys">
        {SHORTCUTS.map(([k, d]) => (
          <li key={k}><kbd>{k}</kbd><span>{d}</span></li>
        ))}
      </ul>
    </div>
  );
}
