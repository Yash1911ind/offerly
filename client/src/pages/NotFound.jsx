import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden="true">404</div>
      <h3>Page not found</h3>
      <p className="muted">The page you are looking for does not exist.</p>
      <Link to="/" className="btn btn-primary">Go home</Link>
    </div>
  );
}
