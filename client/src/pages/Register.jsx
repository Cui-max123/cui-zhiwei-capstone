import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Register() {
  useDocumentTitle('Create account');
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setServerError('');
    setErrors({});

    const nextErrors = {};
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(form.username)) {
      nextErrors.username = '3–30 letters, numbers or underscores.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (form.password.length < 6) nextErrors.password = 'At least 6 characters.';
    if (form.password !== form.confirm) nextErrors.confirm = 'Passwords do not match.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/admin', { replace: true });
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      else setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page page-auth">
      <div className="container auth-grid">
        <div className="auth-panel">
          <p className="eyebrow">Join</p>
          <h1 className="auth-title">Create an account.</h1>
          <p className="auth-sub">
            Registration lets you comment on field notes and write your own. Portfolio management stays with the author.
          </p>

          <form className="form" onSubmit={submit} noValidate>
            {serverError && (
              <p className="form-error" role="alert">
                {serverError}
              </p>
            )}
            <div className="field">
              <label htmlFor="reg-username">Username</label>
              <input
                id="reg-username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={update('username')}
                aria-invalid={Boolean(errors.username)}
                aria-describedby={errors.username ? 'username-error' : undefined}
              />
              {errors.username && (
                <p id="username-error" className="field-error">
                  {errors.username}
                </p>
              )}
            </div>
            <div className="field">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={update('email')}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="field-error">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="form-row">
              <div className="field">
                <label htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={update('password')}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                {errors.password && (
                  <p id="password-error" className="field-error">
                    {errors.password}
                  </p>
                )}
              </div>
              <div className="field">
                <label htmlFor="reg-confirm">Confirm</label>
                <input
                  id="reg-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={update('confirm')}
                  aria-invalid={Boolean(errors.confirm)}
                  aria-describedby={errors.confirm ? 'confirm-error' : undefined}
                />
                {errors.confirm && (
                  <p id="confirm-error" className="field-error">
                    {errors.confirm}
                  </p>
                )}
              </div>
            </div>
            <button type="submit" className="btn btn--primary btn--large" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already registered? <Link to="/login">Sign in</Link>.
          </p>
        </div>

        <aside className="auth-side">
          <div className="auth-side__quote">
            <blockquote>“A portfolio that only shows successes reads like a brochure.”</blockquote>
            <p>— from the field notes</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
