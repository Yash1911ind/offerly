import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { del, get, post, put } from '../api/client.js';
import JobForm from '../components/JobForm.jsx';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import StatCard from '../components/StatCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDate, formatPay, isAccepting } from '../utils/format.js';

export default function AdminDashboard() {
  const [jobs, setJobs] = useState(null);
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(null); // job being edited, or null
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');

  const load = () => {
    get('/jobs').then(setJobs).catch((err) => { setError(err.message); setJobs([]); });
    get('/applications/stats').then(setStats).catch(() => {});
  };
  useEffect(load, []);

  const save = async (data) => {
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const updated = await put(`/jobs/${editing._id}`, data);
        setJobs((list) => list.map((j) => (j._id === updated._id ? { ...j, ...updated } : j)));
        setMessage(`Updated "${updated.title}".`);
      } else {
        const created = await post('/jobs', data);
        setJobs((list) => [{ ...created, applicationCount: 0 }, ...list]);
        setMessage(`Published "${created.title}" at ${created.company}.`);
      }
      setEditing(null);
      setShowForm(false);
      get('/applications/stats').then(setStats).catch(() => {});
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const remove = async (job) => {
    if (!window.confirm(`Delete "${job.title}" at ${job.company}? Its ${job.applicationCount} application(s) will also be removed.`)) return;
    try {
      const res = await del(`/jobs/${job._id}`);
      setJobs((list) => list.filter((j) => j._id !== job._id));
      setMessage(res.message);
      get('/applications/stats').then(setStats).catch(() => {});
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (job) => {
    setEditing(job);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!jobs) return <Loader />;
  const q = query.toLowerCase();
  const visible = jobs.filter((j) => `${j.company} ${j.title}`.toLowerCase().includes(q));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Placement dashboard</h1>
          <p className="muted">Publish jobs and keep track of applications.</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowForm(true); }}>+ New job</button>
        )}
      </div>

      {stats && (
        <div className="stats">
          <StatCard label="Open jobs" value={`${stats.openJobs}/${stats.totalJobs}`} />
          <StatCard label="Applications" value={stats.totalApplications} tone="info" />
          <StatCard label="In interview" value={stats.statusCounts.interview} tone="warn" />
          <StatCard label="Selected" value={stats.statusCounts.selected} tone="good" />
        </div>
      )}

      <Alert onClose={() => setError('')}>{error}</Alert>
      <Alert type="success" onClose={() => setMessage('')}>{message}</Alert>

      {showForm && (
        <section className="card">
          <h2 className="h3">{editing ? `Edit: ${editing.title}` : 'Publish a new job'}</h2>
          <JobForm
            initial={editing}
            submitting={saving}
            onSubmit={save}
            onCancel={() => { setEditing(null); setShowForm(false); }}
          />
        </section>
      )}

      <div className="section-head">
        <h2>All jobs ({jobs.length})</h2>
        <input className="search sm" type="search" placeholder="Filter jobs…" value={query}
          onChange={(e) => setQuery(e.target.value)} aria-label="Filter jobs" />
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No jobs yet">Publish your first job with the “New job” button.</EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Company / Role</th><th>Package</th><th>Deadline</th><th>Status</th><th>Applicants</th><th /></tr>
            </thead>
            <tbody>
              {visible.map((j) => (
                <tr key={j._id}>
                  <td data-label="Role">
                    <Link to={`/jobs/${j._id}`} className="strong">{j.company}</Link>
                    <div className="muted small">{j.title} · {j.type}</div>
                  </td>
                  <td data-label="Package">{formatPay(j)}</td>
                  <td data-label="Deadline">{formatDate(j.deadline)}</td>
                  <td data-label="Status">
                    <span className={`badge ${isAccepting(j) ? 'badge-selected' : 'badge-rejected'}`}>
                      {isAccepting(j) ? 'open' : j.status === 'closed' ? 'closed' : 'expired'}
                    </span>
                  </td>
                  <td data-label="Applicants">
                    <Link to={`/admin/applications?job=${j._id}`}>{j.applicationCount}</Link>
                  </td>
                  <td className="right nowrap">
                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(j)}>Edit</button>
                    <button className="btn btn-danger-outline btn-sm" onClick={() => remove(j)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
