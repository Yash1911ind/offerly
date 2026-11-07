import { Link } from 'react-router-dom';
import CompanyAvatar from './CompanyAvatar.jsx';
import { daysLeft, formatPay, isAccepting } from '../utils/format.js';

// Reusable card used on the Home and Jobs pages
export default function JobCard({ job, applied }) {
  const open = isAccepting(job);
  const left = daysLeft(job.deadline);

  return (
    <Link to={`/jobs/${job._id}`} className="card job-card">
      <div className="job-card-top">
        <CompanyAvatar name={job.company} />
        <div className="job-card-heading">
          <h3 className="job-title">{job.title}</h3>
          <div className="muted small">{job.company} · {job.location}</div>
        </div>
        {applied && <span className="badge badge-applied">Applied</span>}
      </div>

      <div className="job-pay">{formatPay(job)}</div>

      <div className="chips">
        <span className="chip">{job.type}</span>
        {job.minCgpa > 0 && <span className="chip">CGPA ≥ {job.minCgpa}</span>}
        <span className="chip">{job.eligibleBranches?.length ? job.eligibleBranches.join(' · ') : 'All branches'}</span>
      </div>

      <div className="job-card-foot">
        <span className={open ? (left <= 3 ? 'deadline urgent' : 'deadline') : 'deadline closed'}>
          <span className="dot" />
          {open ? (left === 0 ? 'Closes today' : `${left} day${left === 1 ? '' : 's'} left`) : 'Closed'}
        </span>
        <span className="muted small">{job.applicationCount ?? 0} applicant{job.applicationCount === 1 ? '' : 's'}</span>
      </div>
    </Link>
  );
}
