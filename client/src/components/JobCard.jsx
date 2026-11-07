import { Link } from 'react-router-dom';
import { daysLeft, formatPay, isAccepting } from '../utils/format.js';

// Reusable card used on the Home and Jobs pages
export default function JobCard({ job, applied }) {
  const open = isAccepting(job);
  const left = daysLeft(job.deadline);

  return (
    <article className="card job-card">
      <div className="job-card-top">
        <div className="company-avatar" aria-hidden="true">{job.company[0]}</div>
        <div>
          <h3 className="job-title">{job.title}</h3>
          <div className="muted">{job.company} · {job.location}</div>
        </div>
      </div>

      <div className="chips">
        <span className="chip">{job.type}</span>
        <span className="chip chip-accent">{formatPay(job)}</span>
        {job.minCgpa > 0 && <span className="chip">CGPA ≥ {job.minCgpa}</span>}
        {job.eligibleBranches?.length > 0 && <span className="chip">{job.eligibleBranches.join(' / ')}</span>}
      </div>

      <div className="job-card-foot">
        <span className={open ? (left <= 3 ? 'deadline urgent' : 'deadline') : 'deadline closed'}>
          {open ? (left === 0 ? 'Closes today' : `${left} day${left === 1 ? '' : 's'} left`) : 'Closed'}
        </span>
        <span className="muted small">{job.applicationCount ?? 0} applicant{job.applicationCount === 1 ? '' : 's'}</span>
      </div>

      <div className="job-card-actions">
        {applied && <span className="badge badge-applied">Applied</span>}
        <Link to={`/jobs/${job._id}`} className="btn btn-outline btn-sm">View details</Link>
      </div>
    </article>
  );
}
