import { Link, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Logo from './components/Logo.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Jobs from './pages/Jobs.jsx';
import JobDetail from './pages/JobDetail.jsx';
import MyApplications from './pages/MyApplications.jsx';
import Profile from './pages/Profile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminApplications from './pages/AdminApplications.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          {/* Protected routes */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/my-applications" element={<ProtectedRoute role="student"><MyApplications /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/applications" element={<ProtectedRoute role="admin"><AdminApplications /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <Logo size={24} />
            <p className="muted small">From application to offer: the campus placement tracker.</p>
          </div>
          <nav className="footer-links small">
            <Link to="/jobs">Browse jobs</Link>
            <Link to="/register">Create account</Link>
            <Link to="/login">Log in</Link>
          </nav>
        </div>
        <div className="container footer-bottom small muted">© {new Date().getFullYear()} Offerly · MERN mini project, FSD-II Experiment 10</div>
      </footer>
    </>
  );
}
