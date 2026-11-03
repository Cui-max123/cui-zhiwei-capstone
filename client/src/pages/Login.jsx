import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Login() {
  useDocumentTitle('Sign in');
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  const from = location.state?.from || '/admin';

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page page-auth">
      <div className="container auth-grid">
        <div className="auth-panel">
          <p className="eyebrow">Welcome back</p>
          <h1 className="auth-title">Sign in to your account.</h1>
          <p className="auth-sub">Manage your writing and, if you are the author, the whole portfolio.</p>

          <form className="form" onSubmit={submit} noValidate>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn--primary btn--large" disabled={submitting || !email || !password}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            No account yet? <Link to="/register">Create one</Link>.
          </p>
        </div>

        <aside className="auth-side">
          <div className="demo-card">
            <p className="demo-card__label">Demo account</p>
            <dl className="demo-card__fields">
              <div>
                <dt>Email</dt>
                <dd>cui@cuizhiwei.dev</dd>
              </div>
              <div>
                <dt>Password</dt>
                <dd>CuiZhiwei2026!</dd>
              </div>
            </dl>
            <p className="demo-card__hint">
              The administrator account can manage projects, posts, skills and messages.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
