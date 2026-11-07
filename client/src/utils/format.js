export const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatPay = (job) =>
  job.type === 'Internship' ? `₹${job.ctc}k / month` : `₹${job.ctc} LPA`;

export const daysLeft = (deadline) => {
  const end = new Date(deadline);
  end.setHours(23, 59, 59, 999);
  return Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24)) - 1;
};

export const isAccepting = (job) => job.status === 'open' && daysLeft(job.deadline) >= 0;

// yyyy-mm-dd for <input type="date">
export const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export const BRANCHES = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'Other'];
export const STATUSES = ['applied', 'shortlisted', 'interview', 'selected', 'rejected'];
