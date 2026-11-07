import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { del, get, post } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';
import Alert from '../components/Alert.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { daysLeft, formatDate, formatPay, isAccepting } from '../utils/format.js';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [myApp, setMyApp] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ coverNote: '', resumeLink: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    get(`/jobs/${id}`).then(setJob).catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    if (user?.role !== 'student') return;
    get('/applications/me')
      .then((apps) => setMyApp(apps.find((a) => a.job?._id === id) || null))
      .catch(() => {});
  }, [id, user]);

  const apply = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const app = await post('/applications', { jobId: id, ...form });
      setMyApp(app);
      setJob((j) => ({ ...j, applicationCount: j.applicationCount + 1 }));
      setSuccess('Application submitted! Track it under My Applications.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const withdraw = async () => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      await del(`/applications/${myApp._id}`);
      setMyApp(null);
      setJob((j) => ({ ...j, applicationCount: j.applicationCount - 1 }));
      setSuccess('Application withdrawn.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (!job) return error ? <Alert>{error}</Alert> : <Loader />;

  const open = isAccepting(job);
  const left = daysLeft(job.deadline);

  // Conditional rendering of the apply panel depending on the visitor
  let panel;
  if (!user) {
    panel = (
      <p>
        <Link to="/login" state={{ from: `/jobs/${id}` }} className="btn btn-primary btn-block">Log in to apply</Link>
      </p>
    );
  } else if (user.role === 'admin') {
    panel = (
      <Link to={`/admin/applications?job=${id}`} className="btn btn-primary btn-block">
        View {job.applicationCount} applicant{job.applicationCount === 1 ? '' : 's'}
      </Link>
    );
  } else if (myApp) {
    panel = (
      <div className="applied-box">
        <div className="row-between">
          <span>Your application</span>
          <StatusBadge status={myApp.status} />
        </div>
        <p className="muted small">Applied on {formatDate(myApp.createdAt)}</p>
        {myApp.status === 'applied' && (
          <button className="btn btn-danger-outline btn-block" onClick={withdraw}>Withdraw application</button>
        )}
      </div>
    );
  } else if (!open) {
    panel = <p className="muted">This job is no longer accepting applications.</p>;
  } else {
    panel = (
      <form className="form" onSubmit={apply}>
        <label className="field">
          <span>Why are you a good fit? <small className="muted">(optional)</small></span>
          <textarea rows={4} maxLength={500} value={form.coverNote}
            onChange={(e) => setForm({ ...form, coverNote: e.target.value })} />
          <small className="muted right">{form.coverNote.length}/500</small>
        </label>
        <label className="field">
          <span>Resume link <small className="muted">(optional)</small></span>
          <input type="url" placeholder="https://drive.google.com/…" value={form.resumeLink}
            onChange={(e) => setForm({ ...form, resumeLink: e.target.value })} />
        </label>
        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Apply now'}
        </button>
      </form>
    );
  }

  return (
    <>
      <button className="link-back" onClick={() => navigate(-1)}>← Back</button>
      <div className="detail">
        <section className="card">
          <div className="job-card-top">
            <div className="company-avatar lg" aria-hidden="true">{job.company[0]}</div>
            <div>
              <h1 className="detail-title">{job.title}</h1>
              <div className="muted">{job.company} · {job.location}</div>
            </div>
          </div>
          <dl className="facts">
            <div><dt>Type</dt><dd>{job.type}</dd></div>
            <div><dt>{job.type === 'Internship' ? 'Stipend' : 'CTC'}</dt><dd>{formatPay(job)}</dd></div>
            <div><dt>Min. CGPA</dt><dd>{job.minCgpa > 0 ? job.minCgpa : 'No cutoff'}</dd></div>
            <div><dt>Branches</dt><dd>{job.eligibleBranches?.length ? job.eligibleBranches.join(', ') : 'All'}</dd></div>
            <div><dt>Deadline</dt><dd>{formatDate(job.deadline)}</dd></div>
            <div><dt>Applicants</dt><dd>{job.applicationCount}</dd></div>
          </dl>
          <h2 className="h3">About the role</h2>
          <p className="prose">{job.description}</p>
          {job.postedBy && <p className="muted small">Posted by {job.postedBy.name} on {formatDate(job.createdAt)}</p>}
        </section>

        <aside className="card apply-card">
          <h2 className="h3">{open ? (left === 0 ? 'Closes today' : `${left} day${left === 1 ? '' : 's'} left`) : 'Applications closed'}</h2>
          <Alert onClose={() => setError('')}>{error}</Alert>
          <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>
          {panel}
        </aside>
      </div>
    </>
  );
}
