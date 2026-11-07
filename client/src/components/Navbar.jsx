import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from './Logo.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    close();
    navigate('/login');
  };

  // Links change depending on who is logged in (conditional rendering)
  const links = [{ to: '/jobs', label: 'Jobs' }];
  if (user?.role === 'student') links.push({ to: '/my-applications', label: 'My Applications' });
  if (user?.role === 'admin') {
    links.push({ to: '/admin', label: 'Dashboard' }, { to: '/admin/applications', label: 'Applications' });
  }

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={close} aria-label="Offerly home">
          <Logo size={30} />
        </Link>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end onClick={close}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className={`nav-right ${open ? 'open' : ''}`}>
          {user ? (
            <>
              <NavLink to="/profile" className="nav-user" onClick={close} title="My profile">
                <span className="avatar">{user.name[0].toUpperCase()}</span>
                <span className="nav-user-text">
                  <span className="nav-user-name">{user.name.split(' ')[0]}</span>
                  <span className="nav-user-role">{user.role === 'admin' ? 'Placement cell' : 'Student'}</span>
                </span>
              </NavLink>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" onClick={close}>Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>Join now</Link>
            </>
          )}
        </div>

        <button className="nav-toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
