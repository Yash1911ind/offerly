import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';
import { BRANCHES } from '../utils/format.js';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user.name,
    rollNo: user.rollNo || '',
    branch: user.branch || '',
    cgpa: user.cgpa ?? '',
    password: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (form.password && form.password.length < 6) return setError('New password must be at least 6 characters');
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await updateProfile(payload);
      setForm((f) => ({ ...f, password: '' }));
      setMessage('Profile updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card wide">
        <h1>My profile</h1>
        <p className="muted">{user.email} · <span className={`role-pill ${user.role}`}>{user.role}</span></p>
        <Alert onClose={() => setError('')}>{error}</Alert>
        <Alert type="success" onClose={() => setMessage('')}>{message}</Alert>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Full name</span>
            <input name="name" value={form.name} onChange={set} required minLength={2} />
          </label>
          {user.role === 'student' && (
            <div className="grid-3">
              <label className="field">
                <span>Roll number</span>
                <input name="rollNo" value={form.rollNo} onChange={set} />
              </label>
              <label className="field">
                <span>Branch</span>
                <select name="branch" value={form.branch} onChange={set}>
                  <option value="">Select…</option>
                  {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </label>
              <label className="field">
                <span>CGPA</span>
                <input name="cgpa" type="number" min={0} max={10} step="0.01" value={form.cgpa} onChange={set} />
              </label>
            </div>
          )}
          <label className="field">
            <span>New password <small className="muted">(leave blank to keep current)</small></span>
            <input name="password" type="password" autoComplete="new-password" value={form.password} onChange={set} />
          </label>
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </form>
      </div>
    </div>
  );
}
