import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { get, put } from '../api/client.js';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDate, STATUSES } from '../utils/format.js';

export default function AdminApplications() {
  const [params, setParams] = useSearchParams();
  const jobFilter = params.get('job') || '';
  const statusFilter = params.get('status') || '';

  const [apps, setApps] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    get('/jobs').then(setJobs).catch(() => {});
  }, []);

  useEffect(() => {
    setApps(null);
    get('/applications', { job: jobFilter, status: statusFilter })
      .then(setApps)
      .catch((err) => { setError(err.message); setApps([]); });
  }, [jobFilter, statusFilter]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  // PUT the new status and update just that row in state
  const updateStatus = async (app, status) => {
    setSavingId(app._id);
    setError('');
    try {
      const updated = await put(`/applications/${app._id}`, { status });
      setApps((list) => list.map((a) => (a._id === updated._id ? updated : a)));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const updateRemark = async (app) => {
    const adminRemark = window.prompt(`Remark for ${app.student?.name}:`, app.adminRemark || '');
    if (adminRemark === null) return;
    try {
      const updated = await put(`/applications/${app._id}`, { adminRemark });
      setApps((list) => list.map((a) => (a._id === updated._id ? updated : a)));
    } catch (err) {
      setError(err.message);
    }
  };

  const q = search.toLowerCase();
  const visible = (apps || []).filter((a) =>
    `${a.student?.name} ${a.student?.email} ${a.student?.rollNo} ${a.job?.company}`.toLowerCase().includes(q)
  );
  const selectedJob = jobs.find((j) => j._id === jobFilter);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Applications</h1>
          <p className="muted">
            {selectedJob ? <>Applicants for <strong>{selectedJob.title}</strong> at {selectedJob.company}</> : 'All student applications'}
          </p>
        </div>
      </div>

      <div className="toolbar">
        <input className="search" type="search" placeholder="Search student name, email, roll no…"
          value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search applicants" />
        <select value={jobFilter} onChange={(e) => setFilter('job', e.target.value)} aria-label="Filter by job">
          <option value="">All jobs</option>
          {jobs.map((j) => <option key={j._id} value={j._id}>{j.company} · {j.title}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setFilter('status', e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <Alert onClose={() => setError('')}>{error}</Alert>

      {!apps ? (
        <Loader />
      ) : visible.length === 0 ? (
        <EmptyState title="No applications found" />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Student</th><th>Branch / CGPA</th><th>Job</th><th>Applied</th><th>Status</th><th>Update</th></tr>
            </thead>
            <tbody>
              {visible.map((a) => (
                <tr key={a._id}>
                  <td data-label="Student">
                    <div className="strong">{a.student?.name ?? 'Deleted user'}</div>
                    <div className="muted small">{a.student?.rollNo} · {a.student?.email}</div>
                    {a.coverNote && <div className="note small" title={a.coverNote}>“{a.coverNote}”</div>}
                    {a.resumeLink && <a className="small" href={a.resumeLink} target="_blank" rel="noreferrer">Resume ↗</a>}
                  </td>
                  <td data-label="Branch / CGPA">{a.student?.branch || '–'} · {a.student?.cgpa ?? '–'}</td>
                  <td data-label="Job">
                    {a.job ? <Link to={`/jobs/${a.job._id}`}>{a.job.company}</Link> : '–'}
                    <div className="muted small">{a.job?.title}</div>
                  </td>
                  <td data-label="Applied">{formatDate(a.createdAt)}</td>
                  <td data-label="Status">
                    <StatusBadge status={a.status} />
                    {a.adminRemark && <div className="remark small">{a.adminRemark}</div>}
                  </td>
                  <td data-label="Update" className="nowrap">
                    <select value={a.status} disabled={savingId === a._id}
                      onChange={(e) => updateStatus(a, e.target.value)} aria-label="Change status">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="btn btn-ghost btn-sm" onClick={() => updateRemark(a)}>Remark</button>
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
