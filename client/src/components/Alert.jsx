export default function Alert({ type = 'error', children, onClose }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span>{children}</span>
      {onClose && (
        <button className="alert-close" aria-label="Dismiss" onClick={onClose}>×</button>
      )}
    </div>
  );
}
