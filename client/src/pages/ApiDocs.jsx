import { useState } from 'react';
import { api, getToken } from '../lib/api.js';
import { apiBase } from '../lib/site.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import Reveal from '../components/Reveal.jsx';

const endpoints = [
  { method: 'GET', path: '/api', auth: '—', note: 'Self-describing route map.' },
  { method: 'GET', path: '/api/health', auth: '—', note: 'Uptime and database status probe.' },
  { method: 'POST', path: '/api/users/register', auth: '—', note: '{username, email, password} → 201 + JWT.' },
  { method: 'POST', path: '/api/users/login', auth: '—', note: '{email, password} → 200 + JWT.' },
  { method: 'GET', path: '/api/users/me', auth: 'Bearer', note: 'Re-validates the token.' },
  { method: 'GET', path: '/api/projects', auth: '—', note: 'All projects. ?featured=true, ?category=, ?q=' },
  { method: 'GET', path: '/api/projects/:id', auth: '—', note: 'One project.' },
  { method: 'POST', path: '/api/projects', auth: 'Admin', note: 'Create a project. Owner from token.' },
  { method: 'PUT/PATCH', path: '/api/projects/:id', auth: 'Admin', note: 'Partial update.' },
  { method: 'DELETE', path: '/api/projects/:id', auth: 'Admin', note: 'Delete a project.' },
  { method: 'GET', path: '/api/skills', auth: '—', note: 'Skills. ?category=, ?minLevel=' },
  { method: 'GET', path: '/api/skills/:id', auth: '—', note: 'One skill.' },
  { method: 'POST', path: '/api/skills', auth: 'Admin', note: 'Add a skill.' },
  { method: 'PUT/PATCH', path: '/api/skills/:id', auth: 'Admin', note: 'Update a skill.' },
  { method: 'DELETE', path: '/api/skills/:id', auth: 'Admin', note: 'Delete a skill.' },
  { method: 'GET', path: '/api/blog', auth: '—', note: 'Published posts. ?tag=, ?q=, ?page=' },
  { method: 'GET', path: '/api/blog/manage', auth: 'Bearer', note: 'Own posts (all for admins).' },
  { method: 'GET', path: '/api/blog/:id', auth: '—', note: 'One post + comments + commentCount.' },
  { method: 'POST', path: '/api/blog', auth: 'Bearer', note: 'Create a post. Author from token.' },
  { method: 'PUT/PATCH', path: '/api/blog/:id', auth: 'Author', note: 'Update. Author or admin only.' },
  { method: 'DELETE', path: '/api/blog/:id', auth: 'Author', note: 'Delete post and its comments.' },
  { method: 'GET', path: '/api/blog/:postId/comments', auth: '—', note: 'Comments for a post.' },
  { method: 'POST', path: '/api/blog/:postId/comments', auth: 'Bearer', note: '{body} — author from token.' },
  { method: 'DELETE', path: '/api/blog/:postId/comments/:commentId', auth: 'Bearer', note: 'Comment author, post author or admin.' },
  { method: 'POST', path: '/api/contact', auth: '—', note: '{name, email, message} → 201.' },
  { method: 'GET', path: '/api/contact', auth: 'Admin', note: 'Contact inbox, newest first.' },
  { method: 'PATCH/PUT', path: '/api/contact/:id/read', auth: 'Admin', note: 'Mark a message read.' },
  { method: 'DELETE', path: '/api/contact/:id', auth: 'Admin', note: 'Delete a message.' },
  { method: 'GET', path: '/api/admin/stats', auth: 'Bearer', note: 'Dashboard counters.' },
  { method: 'GET', path: '/api/admin/activity', auth: 'Admin', note: 'Recent activity feed.' }
];

export default function ApiDocs() {
  useDocumentTitle('API reference');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);

  const runTest = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const health = await api.get('/health', { auth: false });
      const projects = await api.get('/projects', { auth: false });
      setResult({ health, projectCount: projects.count });
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="page page-apidocs">
      <div className="container">
        <Reveal className="page-head">
          <p className="eyebrow">
            <span className="eyebrow__num">07</span> API
          </p>
          <h1 className="page-title">REST API reference.</h1>
          <p className="page-lede">
            The portfolio is powered by an Express + MongoDB API. Everything below is reachable live.
          </p>
        </Reveal>

        <Reveal className="api-meta">
          <p>
            Base URL: <code className="inline-code">{apiBase}</code>
          </p>
          <p>
            Auth: <strong>Bearer</strong> = any signed-in account · <strong>Admin</strong> = role <code>admin</code> only ·
            <strong>Author</strong> = the post&apos;s author or an admin.
          </p>
        </Reveal>

        <Reveal className="api-playground">
          <div className="api-playground__head">
            <h2>Live check</h2>
            <button type="button" className="btn btn--primary btn--small" onClick={runTest} disabled={running}>
              {running ? 'Calling…' : 'Test the API'}
            </button>
          </div>
          {result && (
            <pre className="api-result">
              {JSON.stringify({ health: result.health, projectsReturned: result.projectCount }, null, 2)}
            </pre>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {!result && !error && (
            <p className="muted">
              Press the button to hit <code className="inline-code">/health</code> and <code className="inline-code">/projects</code> from your
              browser{suffix()} — the same cross-origin calls the site makes.
            </p>
          )}
        </Reveal>

        <Reveal className="endpoint-table-wrap">
          <table className="endpoint-table">
            <thead>
              <tr>
                <th scope="col">Method</th>
                <th scope="col">Path</th>
                <th scope="col">Auth</th>
                <th scope="col">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((endpoint) => (
                <tr key={`${endpoint.method} ${endpoint.path}`}>
                  <td>
                    <span className={`method method--${endpoint.method.split('/')[0].toLowerCase()}`}>{endpoint.method}</span>
                  </td>
                  <td>
                    <code className="inline-code">{endpoint.path}</code>
                  </td>
                  <td>{endpoint.auth}</td>
                  <td>{endpoint.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </div>
  );
}

function suffix() {
  return getToken() ? ' with your token' : '';
}
