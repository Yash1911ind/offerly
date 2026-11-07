import { useEffect, useState } from 'react';
import { BRANCHES, toDateInput } from '../utils/format.js';

const EMPTY = {
  company: '', title: '', description: '', location: '', type: 'Full-time',
  ctc: '', minCgpa: 0, eligibleBranches: [], deadline: '', status: 'open',
};

// Controlled form (useState) used for both creating and editing a job
export default function JobForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial, deadline: toDateInput(initial.deadline) } : EMPTY);
    setErrors({});
  }, [initial]);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleBranch = (b) =>
    setForm({
      ...form,
      eligibleBranches: form.eligibleBranches.includes(b)
        ? form.eligibleBranches.filter((x) => x !== b)
        : [...form.eligibleBranches, b],
    });

  const validate = () => {
    const e = {};
    if (!form.company.trim()) e.company = 'Company is required';
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (form.ctc === '' || Number(form.ctc) < 0) e.ctc = 'Enter a valid amount';
    if (Number(form.minCgpa) < 0 || Number(form.minCgpa) > 10) e.minCgpa = 'Must be 0 – 10';
    if (!form.deadline) e.deadline = 'Deadline is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSubmit({ ...form, ctc: Number(form.ctc), minCgpa: Number(form.minCgpa) });
      if (!initial) setForm(EMPTY);
    } catch (err) {
      if (err.errors) setErrors(err.errors);
    }
  };

  const field = (name, label, props = {}) => (
    <label className="field">
      <span>{label}</span>
      <input name={name} value={form[name]} onChange={set} {...props} />
      {errors[name] && <small className="field-error">{errors[name]}</small>}
    </label>
  );

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="grid-2">
        {field('company', 'Company', { placeholder: 'e.g. Infosys' })}
        {field('title', 'Role', { placeholder: 'e.g. Systems Engineer' })}
      </div>
      <div className="grid-3">
        <label className="field">
          <span>Type</span>
          <select name="type" value={form.type} onChange={set}>
            <option>Full-time</option>
            <option>Internship</option>
          </select>
        </label>
        {field('ctc', form.type === 'Internship' ? 'Stipend (₹k / month)' : 'CTC (LPA)', { type: 'number', min: 0, step: '0.1' })}
        {field('location', 'Location', { placeholder: 'e.g. Bengaluru' })}
      </div>
      <div className="grid-3">
        {field('minCgpa', 'Minimum CGPA', { type: 'number', min: 0, max: 10, step: '0.1' })}
        {field('deadline', 'Deadline', { type: 'date' })}
        <label className="field">
          <span>Status</span>
          <select name="status" value={form.status} onChange={set}>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </label>
      </div>
      <fieldset className="field">
        <span>Eligible branches <small className="muted">(none selected = all)</small></span>
        <div className="checks">
          {BRANCHES.map((b) => (
            <label key={b} className={`check ${form.eligibleBranches.includes(b) ? 'on' : ''}`}>
              <input type="checkbox" checked={form.eligibleBranches.includes(b)} onChange={() => toggleBranch(b)} />
              {b}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="field">
        <span>Description</span>
        <textarea name="description" rows={4} value={form.description} onChange={set} />
        {errors.description && <small className="field-error">{errors.description}</small>}
      </label>
      <div className="form-actions">
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>}
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : initial ? 'Update job' : 'Publish job'}
        </button>
      </div>
    </form>
  );
}
