import { useState } from 'react';
import Segmented from '../components/ui/Segmented.jsx';
import Switch from '../components/ui/Switch.jsx';
import { useSettings } from '../hooks/useSettings.js';
import { useHistory } from '../hooks/useHistory.js';
import { useReadingProgress } from '../hooks/useReadingProgress.js';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { SHORTCUTS } from '../data/shortcuts.js';

export default function Settings() {
  useDocumentTitle('Settings');
  const { settings, updateSettings, resetAll } = useSettings();
  const { clearHistory } = useHistory();
  const { resetProgress } = useReadingProgress();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="page-top container container--narrow">
      <header className="page-head">
        <h1 className="page-head__title">Settings</h1>
        <p className="page-head__sub">Everything is saved in this browser, nowhere else.</p>
      </header>

      <section className="settings-group" aria-labelledby="s-profile">
        <h2 id="s-profile">Profile</h2>
        <label className="field">
          <span className="field__label">Display name</span>
          <input
            type="text"
            value={settings.readerName}
            maxLength={24}
            onChange={(e) => updateSettings({ readerName: e.target.value })}
          />
        </label>
      </section>

      <section className="settings-group" aria-labelledby="s-look">
        <h2 id="s-look">Appearance</h2>
        <div className="field">
          <span className="field__label">Theme</span>
          <Segmented label="Theme" value={settings.theme} onChange={(v) => updateSettings({ theme: v })}
            options={[{ id: 'ink', label: 'Ink' }, { id: 'graphite', label: 'Graphite' }]} />
        </div>
        <div className="field">
          <span className="field__label">Accent colour</span>
          <Segmented label="Accent colour" value={settings.accent} onChange={(v) => updateSettings({ accent: v })}
            options={[{ id: 'carmine', label: 'Carmine' }, { id: 'amber', label: 'Amber' }]} />
        </div>
        <div className="field">
          <span className="field__label">Animations</span>
          <Segmented label="Animations" value={settings.reduceMotion} onChange={(v) => updateSettings({ reduceMotion: v })}
            options={[{ id: 'system', label: 'Follow system' }, { id: 'on', label: 'Reduced' }, { id: 'off', label: 'Full' }]} />
        </div>
        <Switch
          label="Rotate the homepage hero automatically"
          hint="Pauses on hover and whenever animations are reduced."
          checked={settings.heroAutoplay}
          onChange={(v) => updateSettings({ heroAutoplay: v })}
        />
      </section>

      <section className="settings-group" aria-labelledby="s-read">
        <h2 id="s-read">Reading</h2>
        <div className="field">
          <span className="field__label">Default mode</span>
          <Segmented label="Default reading mode" value={settings.readingMode} onChange={(v) => updateSettings({ readingMode: v })}
            options={[{ id: 'vertical', label: 'Vertical scroll' }, { id: 'paged', label: 'Page by page' }]} />
        </div>
        <div className="field">
          <span className="field__label">Reader width</span>
          <Segmented label="Reader width" value={settings.readerWidth} onChange={(v) => updateSettings({ readerWidth: v })}
            options={[{ id: 'narrow', label: 'Narrow' }, { id: 'medium', label: 'Medium' }, { id: 'wide', label: 'Wide' }]} />
        </div>
        <div className="field">
          <span className="field__label">Page fit (page by page)</span>
          <Segmented label="Page fit" value={settings.readerFit} onChange={(v) => updateSettings({ readerFit: v })}
            options={[{ id: 'height', label: 'Fit screen' }, { id: 'width', label: 'Fit width' }]} />
        </div>
        <table className="shortcuts">
          <caption>Keyboard shortcuts</caption>
          <tbody>
            {SHORTCUTS.map(([k, d]) => (
              <tr key={k}><th scope="row"><kbd>{k}</kbd></th><td>{d}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="settings-group" aria-labelledby="s-data">
        <h2 id="s-data">Local data</h2>
        <div className="settings-actions">
          <button type="button" className="btn btn--ghost" onClick={() => { clearHistory(); toast('History cleared'); }}>Clear history</button>
          <button type="button" className="btn btn--ghost" onClick={() => { resetProgress(); toast('Reading progress reset'); }}>Reset reading progress</button>
          {!confirm ? (
            <button type="button" className="btn btn--danger" onClick={() => setConfirm(true)}>Reset everything</button>
          ) : (
            <span className="settings-confirm" role="alert">
              This removes your library, progress, history and settings.
              <button type="button" className="btn btn--danger btn--sm" onClick={() => { resetAll(); setConfirm(false); toast('Everything was reset'); }}>Yes, reset</button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirm(false)}>Cancel</button>
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
