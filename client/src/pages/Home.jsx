import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import JobCard from '../components/JobCard.jsx';
import Loader from '../components/Loader.jsx';
import CompanyAvatar from '../components/CompanyAvatar.jsx';
import { isAccepting } from '../utils/format.js';

const STEPS = [
  { title: 'Discover', text: 'Browse roles published by the placement cell and filter by type or company.' },
  { title: 'Apply', text: 'Check eligibility instantly and apply with a short note and your resume link.' },
  { title: 'Track', text: 'Follow each application from applied to shortlisted to interview.' },
  { title: 'Get the offer', text: 'See the final result the moment the placement cell updates it.' },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    get('/jobs').then(setJobs).catch(() => setJobs([]));
  }, []);

  const openJobs = jobs?.filter(isAccepting) ?? [];
  const companies = [...new Set(jobs?.map((j) => j.company) ?? [])];
  const totalApps = jobs?.reduce((s, j) => s + (j.applicationCount || 0), 0) ?? 0;

  const search = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/jobs?search=${encodeURIComponent(query.trim())}` : '/jobs');
  };

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Placement season 2026–27</span>
          <h1>Turn every application into an <span className="accent">offer</span>.</h1>
          <p className="lead">
            Offerly brings campus placements into one place. Students discover roles and track every application.
            The placement cell publishes jobs and updates results in real time.
          </p>
          <form className="hero-search" onSubmit={search} role="search">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search company, role or city" aria-label="Search jobs" />
            <button className="btn btn-primary">Search jobs</button>
          </form>
          <div className="hero-actions">
            {!user && <Link to="/register">New here? <strong>Create a student account →</strong></Link>}
            {user?.role === 'admin' && <Link to="/admin"><strong>Go to the placement dashboard →</strong></Link>}
            {user?.role === 'student' && <Link to="/my-applications"><strong>View my applications →</strong></Link>}
          </div>
        </div>

        <div className="hero-panel card">
          <div className="hero-panel-head">
            <span className="small strong">How Offerly works</span>
          </div>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="step-num">{i + 1}</span>
                <div>
                  <div className="strong">{s.title}</div>
                  <div className="muted small">{s.text}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="metrics">
        <div><strong>{jobs ? openJobs.length : '–'}</strong><span>Open roles</span></div>
        <div><strong>{jobs ? companies.length : '–'}</strong><span>Recruiting companies</span></div>
        <div><strong>{jobs ? totalApps : '–'}</strong><span>Applications submitted</span></div>
      </section>

      {companies.length > 0 && (
        <section className="companies">
          <span className="muted small">Companies hiring on Offerly</span>
          <div className="company-row">
            {companies.map((c) => (
              <Link key={c} to={`/jobs?search=${encodeURIComponent(c)}&status=`} className="company-chip">
                <CompanyAvatar name={c} size={24} />
                {c}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="section-head">
          <div>
            <h2>Closing soon</h2>
            <p className="muted small">Apply before these deadlines pass.</p>
          </div>
          <Link to="/jobs" className="btn btn-outline btn-sm">View all jobs</Link>
        </div>
        {!jobs ? (
          <Loader />
        ) : openJobs.length === 0 ? (
          <p className="muted">No open roles right now.</p>
        ) : (
          <div className="grid-cards">
            {[...openJobs]
              .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
              .slice(0, 3)
              .map((job) => <JobCard key={job._id} job={job} />)}
          </div>
        )}
      </section>
    </>
  );
}
