import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
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
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">PT</span> PlaceTrack
        </Link>
        <button className="nav-toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          ☰
        </button>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink to="/profile" className="nav-user" onClick={() => setOpen(false)}>
                {user.name.split(' ')[0]}
                <span className={`role-pill ${user.role}`}>{user.role}</span>
              </NavLink>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>Log in</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
