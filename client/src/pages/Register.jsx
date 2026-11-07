import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';
import { BRANCHES } from '../utils/format.js';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '', rollNo: '', branch: 'CSE', cgpa: '', adminCode: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'At least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    if (!isAdmin && form.cgpa !== '' && (Number(form.cgpa) < 0 || Number(form.cgpa) > 10)) e.cgpa = 'CGPA must be 0 – 10';
    if (isAdmin && !form.adminCode) e.adminCode = 'Admin code is required';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setSubmitting(true);
    const { confirm, adminCode, rollNo, branch, cgpa, ...base } = form;
    const payload = isAdmin ? { ...base, adminCode } : { ...base, rollNo, branch, cgpa };
    try {
      const u = await register(payload);
      navigate(u.role === 'admin' ? '/admin' : '/jobs', { replace: true });
    } catch (err) {
      setError(err.message);
      if (err.errors) setFieldErrors(err.errors);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, props = {}) => (
    <label className="field">
      <span>{label}</span>
      <input name={name} value={form[name]} onChange={set} {...props} />
      {fieldErrors[name] && <small className="field-error">{fieldErrors[name]}</small>}
    </label>
  );

  return (
    <div className="auth-wrap">
      <div className="card auth-card wide">
        <h1>Create your account</h1>
        <div className="segmented" role="tablist">
          <button type="button" className={!isAdmin ? 'active' : ''} onClick={() => setIsAdmin(false)}>Student</button>
          <button type="button" className={isAdmin ? 'active' : ''} onClick={() => setIsAdmin(true)}>Placement cell</button>
        </div>
        <Alert onClose={() => setError('')}>{error}</Alert>
        <form className="form" onSubmit={handleSubmit} noValidate>
          {field('name', 'Full name', { autoComplete: 'name' })}
          {field('email', 'Email', { type: 'email', autoComplete: 'email' })}
          <div className="grid-2">
            {field('password', 'Password', { type: 'password', autoComplete: 'new-password' })}
            {field('confirm', 'Confirm password', { type: 'password', autoComplete: 'new-password' })}
          </div>

          {isAdmin ? (
            field('adminCode', 'Admin code (from the placement cell)', { type: 'password' })
          ) : (
            <div className="grid-3">
              {field('rollNo', 'Roll number', { placeholder: '24BCS1001' })}
              <label className="field">
                <span>Branch</span>
                <select name="branch" value={form.branch} onChange={set}>
                  {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </label>
              {field('cgpa', 'CGPA', { type: 'number', min: 0, max: 10, step: '0.01' })}
            </div>
          )}

          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="muted small center">Already registered? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
