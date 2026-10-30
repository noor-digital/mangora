import { Link } from 'react-router-dom';

export default function EmptyState({ icon: Icon, title, text, actionLabel, actionTo, onAction }) {
  return (
    <div className="empty">
      <div className="empty__mark" aria-hidden="true">{Icon && <Icon size={22} strokeWidth={1.5} />}</div>
      <h3 className="empty__title">{title}</h3>
      <p className="empty__text">{text}</p>
      {actionTo && <Link className="btn btn--ghost" to={actionTo}>{actionLabel}</Link>}
      {onAction && (
        <button type="button" className="btn btn--ghost" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  );
}
