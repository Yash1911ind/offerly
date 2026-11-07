import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { del, get } from '../api/client.js';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatCard from '../components/StatCard.jsx';
import { formatDate, formatPay, STATUSES } from '../utils/format.js';

export default function MyApplications() {
  const [apps, setApps] = useState(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    get('/applications/me').then(setApps).catch((err) => { setError(err.message); setApps([]); });
  }, []);

  const counts = useMemo(() => {
    const c = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    apps?.forEach((a) => { c[a.status] += 1; });
    return c;
  }, [apps]);

  const withdraw = async (app) => {
    if (!window.confirm(`Withdraw your application to ${app.job?.company}?`)) return;
    try {
      await del(`/applications/${app._id}`);
      setApps((list) => list.filter((a) => a._id !== app._id)); // update UI without refetching
      setMessage('Application withdrawn.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!apps) return <Loader />;
  const visible = filter ? apps.filter((a) => a.status === filter) : apps;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My applications</h1>
          <p className="muted">Track every application's status.</p>
        </div>
        <Link to="/jobs" className="btn btn-primary">Find more jobs</Link>
      </div>

      <div className="stats">
        <StatCard label="Total" value={apps.length} />
        <StatCard label="Shortlisted" value={counts.shortlisted} tone="info" />
        <StatCard label="Interview" value={counts.interview} tone="warn" />
        <StatCard label="Selected" value={counts.selected} tone="good" />
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setMessage('')}>{message}</Alert>

      {apps.length === 0 ? (
        <EmptyState title="You haven't applied anywhere yet">
          <Link to="/jobs">Browse open jobs</Link> to get started.
        </EmptyState>
      ) : (
        <>
          <div className="pills">
            <button className={!filter ? 'active' : ''} onClick={() => setFilter('')}>All ({apps.length})</button>
            {STATUSES.map((s) => (
              <button key={s} className={filter === s ? 'active' : ''} onClick={() => setFilter(s)}>
                {s} ({counts[s]})
              </button>
            ))}
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Company / Role</th><th>Package</th><th>Applied</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {visible.map((a) => (
                  <tr key={a._id}>
                    <td data-label="Role">
                      {a.job ? (
                        <Link to={`/jobs/${a.job._id}`} className="strong">{a.job.company}</Link>
                      ) : <span className="muted">Deleted job</span>}
                      <div className="muted small">{a.job?.title}</div>
                      {a.adminRemark && <div className="remark small">Remark: {a.adminRemark}</div>}
                    </td>
                    <td data-label="Package">{a.job ? formatPay(a.job) : '–'}</td>
                    <td data-label="Applied">{formatDate(a.createdAt)}</td>
                    <td data-label="Status"><StatusBadge status={a.status} /></td>
                    <td className="right">
                      {a.status === 'applied' && (
                        <button className="btn btn-danger-outline btn-sm" onClick={() => withdraw(a)}>Withdraw</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
