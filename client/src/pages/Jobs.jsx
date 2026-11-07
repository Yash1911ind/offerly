import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { get } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import JobCard from '../components/JobCard.jsx';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Jobs() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const type = params.get('type') || '';
  const status = params.get('status') ?? 'open';

  const [jobs, setJobs] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Debounce the search box into the URL (?search=) so results are shareable
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params);
      if (search.trim()) next.set('search', search.trim());
      else next.delete('search');
      if (next.toString() !== params.toString()) setParams(next, { replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch jobs whenever the filters change
  useEffect(() => {
    setLoading(true);
    get('/jobs', { search: params.get('search'), type, status })
      .then((data) => { setJobs(data); setError(''); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  // Students see which jobs they have already applied to
  useEffect(() => {
    if (user?.role !== 'student') { setAppliedIds(new Set()); return; }
    get('/applications/me')
      .then((apps) => setAppliedIds(new Set(apps.map((a) => a.job?._id))))
      .catch(() => {});
  }, [user]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Job opportunities</h1>
          <p className="muted">Search by company, role or location.</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="search"
          type="search"
          placeholder="Search e.g. Microsoft, engineer, Pune…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search jobs"
        />
        <select value={type} onChange={(e) => setFilter('type', e.target.value)} aria-label="Job type">
          <option value="">All types</option>
          <option>Full-time</option>
          <option>Internship</option>
        </select>
        <select value={status} onChange={(e) => setFilter('status', e.target.value)} aria-label="Status">
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="">All</option>
        </select>
      </div>

      <Alert>{error}</Alert>
      {loading ? (
        <Loader />
      ) : jobs.length === 0 ? (
        <EmptyState title="No jobs match your filters">Try a different search term or show all statuses.</EmptyState>
      ) : (
        <>
          <p className="muted small">{jobs.length} job{jobs.length === 1 ? '' : 's'} found</p>
          <div className="grid-cards">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} applied={appliedIds.has(job._id)} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
