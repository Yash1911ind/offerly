import { LogoMark } from './Logo.jsx';

// Two-column layout for the login / register pages: brand panel + form card
export default function AuthLayout({ children, wide }) {
  return (
    <div className={`auth-layout ${wide ? 'wide' : ''}`}>
      <aside className="auth-brand">
        <LogoMark size={44} />
        <h2>From application to offer.</h2>
        <ul>
          <li>Every campus drive in one place</li>
          <li>Instant eligibility checks</li>
          <li>Live status on every application</li>
        </ul>
      </aside>
      <div className="card auth-card">{children}</div>
    </div>
  );
}
