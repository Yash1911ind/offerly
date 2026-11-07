import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import JobCard from '../components/JobCard.jsx';
import Loader from '../components/Loader.jsx';
import { isAccepting } from '../utils/format.js';

export default function Home() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState(null);

  useEffect(() => {
    get('/jobs').then(setJobs).catch(() => setJobs([]));
  }, []);

  const openJobs = jobs?.filter(isAccepting) ?? [];
  const companies = new Set(jobs?.map((j) => j.company)).size;

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">Placement Cell · 2026–27 season</p>
          <h1>Every placement drive, every application, one place.</h1>
          <p className="lead">
            Browse open roles, apply in a click and follow your application from <em>applied</em> to <em>selected</em>.
            The placement cell publishes jobs and updates statuses in real time.
          </p>
          <div className="hero-actions">
            <Link to="/jobs" className="btn btn-primary">Browse jobs</Link>
            {!user && <Link to="/register" className="btn btn-outline">Create student account</Link>}
            {user?.role === 'admin' && <Link to="/admin" className="btn btn-outline">Open dashboard</Link>}
            {user?.role === 'student' && <Link to="/my-applications" className="btn btn-outline">My applications</Link>}
          </div>
        </div>
        <div className="hero-stats">
          <div><strong>{jobs ? openJobs.length : '–'}</strong><span>open roles</span></div>
          <div><strong>{jobs ? companies : '–'}</strong><span>companies</span></div>
          <div><strong>{jobs ? jobs.reduce((s, j) => s + (j.applicationCount || 0), 0) : '–'}</strong><span>applications</span></div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Closing soon</h2>
          <Link to="/jobs">See all →</Link>
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
