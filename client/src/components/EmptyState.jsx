export default function EmptyState({ title, children }) {
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden="true">∅</div>
      <h3>{title}</h3>
      {children && <div className="muted">{children}</div>}
    </div>
  );
}
