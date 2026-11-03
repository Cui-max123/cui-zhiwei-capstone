import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { formatDate, formatDateTime, statusLabel, categoryLabel } from '../lib/format.js';
import Modal, { ConfirmDialog } from '../components/Modal.jsx';
import { ErrorState, EmptyState, Spinner } from '../components/Feedback.jsx';
import Markdown from '../components/Markdown.jsx';

const CATEGORIES = ['Full-stack', 'Frontend', 'Backend', 'Data', 'Tooling', 'Design'];
const STATUSES = ['shipped', 'in-progress', 'concept'];
const SKILL_CATEGORIES = ['Frontend', 'Backend', 'Database', 'Tooling', 'Design', 'Data'];

const emptyProject = {
  title: '',
  summary: '',
  description: '',
  problem: '',
  solution: '',
  outcome: '',
  category: 'Full-stack',
  status: 'shipped',
  year: String(new Date().getFullYear()),
  role: 'Solo — design & build',
  timeline: '',
  techStack: '',
  highlight1Label: '',
  highlight1Value: '',
  highlight2Label: '',
  highlight2Value: '',
  highlight3Label: '',
  highlight3Value: '',
  imageUrl: '',
  repoUrl: '',
  liveUrl: '',
  featured: false,
  order: 0
};

const emptyPost = {
  title: '',
  excerpt: '',
  content: '',
  tags: '',
  coverImage: '',
  published: true,
  featured: false
};

const emptySkill = { name: '', category: 'Frontend', level: 3, order: 0 };

function toProjectPayload(form) {
  const highlights = [
    { label: form.highlight1Label, value: form.highlight1Value },
    { label: form.highlight2Label, value: form.highlight2Value },
    { label: form.highlight3Label, value: form.highlight3Value }
  ]
    .filter((item) => item.label && item.value)
    .map((item) => ({ label: item.label.trim(), value: item.value.trim() }));

  return {
    title: form.title,
    summary: form.summary,
    description: form.description,
    problem: form.problem,
    solution: form.solution,
    outcome: form.outcome,
    category: form.category,
    status: form.status,
    year: form.year,
    role: form.role,
    timeline: form.timeline,
    techStack: form.techStack.split(',').map((item) => item.trim()).filter(Boolean),
    highlights,
    imageUrl: form.imageUrl,
    repoUrl: form.repoUrl,
    liveUrl: form.liveUrl,
    featured: form.featured,
    order: Number(form.order) || 0
  };
}

function toPostPayload(form) {
  return {
    title: form.title,
    excerpt: form.excerpt,
    content: form.content,
    tags: form.tags.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean),
    coverImage: form.coverImage,
    published: form.published,
    featured: form.featured
  };
}

export default function Admin() {
  useDocumentTitle('Dashboard');
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const [skills, setSkills] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const jobs = [
      api.get('/admin/stats'),
      api.get('/projects'),
      api.get('/blog/manage'),
      api.get('/skills')
    ];
    if (isAdmin) {
      jobs.push(api.get('/contact'));
      jobs.push(api.get('/admin/activity'));
    }
    const results = await Promise.allSettled(jobs);
    if (results[0].status === 'fulfilled') setStats(results[0].value.data);
    if (results[1].status === 'fulfilled') setProjects(results[1].value.data);
    if (results[2].status === 'fulfilled') setPosts(results[2].value.data);
    if (results[3].status === 'fulfilled') setSkills(results[3].value.data);
    if (isAdmin) {
      if (results[4].status === 'fulfilled') setMessages(results[4].value.data);
      if (results[5].status === 'fulfilled') setActivity(results[5].value.data);
    }
    if (results.some((result) => result.status === 'rejected')) {
      setError(results.find((result) => result.status === 'rejected')?.reason);
    }
  }, [isAdmin]);

  useEffect(() => {
    let active = true;
    load()
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load]);

  const setTab = (next) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', next);
    setSearchParams(params);
  };

  const openCreate = (type) => {
    if (type === 'project') setModal({ type: 'project', editing: null, data: emptyProject });
    if (type === 'post') setModal({ type: 'post', editing: null, data: emptyPost });
    if (type === 'skill') setModal({ type: 'skill', editing: null, data: emptySkill });
  };

  const openEdit = (type, item) => {
    if (type === 'project') {
      setModal({
        type: 'project',
        editing: item._id,
        data: {
          ...emptyProject,
          ...item,
          techStack: (item.techStack || []).join(', '),
          highlight1Label: item.highlights?.[0]?.label || '',
          highlight1Value: item.highlights?.[0]?.value || '',
          highlight2Label: item.highlights?.[1]?.label || '',
          highlight2Value: item.highlights?.[1]?.value || '',
          highlight3Label: item.highlights?.[2]?.label || '',
          highlight3Value: item.highlights?.[2]?.value || ''
        }
      });
    }
    if (type === 'post') {
      setModal({ type: 'post', editing: item._id, data: { ...emptyPost, ...item, tags: (item.tags || []).join(', ') } });
    }
    if (type === 'skill') setModal({ type: 'skill', editing: item._id, data: { ...emptySkill, ...item } });
  };

  const saveProject = async (form) => {
    setBusy(true);
    try {
      if (modal.editing) {
        await api.patch(`/projects/${modal.editing}`, toProjectPayload(form));
        toast('Project updated.');
      } else {
        await api.post('/projects', toProjectPayload(form));
        toast('Project created.');
      }
      setModal(null);
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const savePost = async (form) => {
    setBusy(true);
    try {
      if (modal.editing) {
        await api.patch(`/blog/${modal.editing}`, toPostPayload(form));
        toast(form.published ? 'Post updated.' : 'Draft updated.');
      } else {
        await api.post('/blog', toPostPayload(form));
        toast(form.published ? 'Post published.' : 'Draft saved.');
      }
      setModal(null);
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const saveSkill = async (form) => {
    setBusy(true);
    try {
      if (modal.editing) {
        await api.patch(`/skills/${modal.editing}`, {
          name: form.name,
          category: form.category,
          level: Number(form.level),
          order: Number(form.order) || 0
        });
        toast('Skill updated.');
      } else {
        await api.post('/skills', {
          name: form.name,
          category: form.category,
          level: Number(form.level),
          order: Number(form.order) || 0
        });
        toast('Skill added.');
      }
      setModal(null);
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    setBusy(true);
    try {
      if (confirm.type === 'project') await api.del(`/projects/${confirm.item._id}`);
      if (confirm.type === 'post') await api.del(`/blog/${confirm.item._id}`);
      if (confirm.type === 'skill') await api.del(`/skills/${confirm.item._id}`);
      if (confirm.type === 'message') await api.del(`/contact/${confirm.item._id}`);
      toast('Deleted.', 'info');
      setConfirm(null);
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const toggleRead = async (message) => {
    try {
      await api.patch(`/contact/${message._id}/read`, { read: !message.read });
      await load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  if (loading) return <Spinner label="Loading dashboard…" />;
  if (error && !stats) {
    return (
      <div className="container page">
        <ErrorState title="Could not load the dashboard" message={error.message} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Projects', adminOnly: true },
    { id: 'posts', label: 'Posts' },
    ...(isAdmin ? [{ id: 'messages', label: 'Messages' }, { id: 'skills', label: 'Skills' }] : [])
  ];

  return (
    <div className="page page-admin">
      <div className="container">
        <header className="admin-head">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1 className="page-title">
              Welcome back, <em>{user.username}</em>.
            </h1>
          </div>
          <span className="role-badge">{isAdmin ? 'Administrator' : 'Author'}</span>
        </header>

        {stats && (
          <div className="stat-cards">
            <StatCard label="Projects" value={stats.projects} />
            <StatCard label={isAdmin ? 'Posts' : 'Your posts'} value={stats.posts} />
            <StatCard label={isAdmin ? 'Comments' : 'Your comments'} value={stats.comments} />
            {isAdmin && <StatCard label="Unread messages" value={stats.unreadMessages} />}
            <StatCard label="Skills" value={stats.skills} />
          </div>
        )}

        <nav className="admin-tabs" aria-label="Dashboard sections">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-tab ${tab === item.id ? 'is-active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {tab === 'overview' && (
          <section className="admin-section">
            {isAdmin ? (
              <div className="admin-grid">
                <div className="admin-card">
                  <h2>Recent activity</h2>
                  {activity.length === 0 ? (
                    <p className="muted">No activity yet.</p>
                  ) : (
                    <ul className="activity-list">
                      {activity.map((item, index) => (
                        <li key={index} className="activity-item">
                          <span className="activity-item__label">{item.label}</span>
                          <span className="activity-item__text">{item.text}</span>
                          <time className="activity-item__time">{formatDateTime(item.at)}</time>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="admin-card">
                  <h2>Quick actions</h2>
                  <div className="quick-actions">
                    <button type="button" className="btn btn--ghost" onClick={() => openCreate('post')}>
                      New post
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={() => openCreate('project')}>
                      New project
                    </button>
                    <button type="button" className="btn btn--ghost" onClick={() => openCreate('skill')}>
                      New skill
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="You can write here"
                message="As an author you can draft and publish field notes. Portfolio projects are managed by the site owner."
                action={
                  <button type="button" className="btn btn--primary" onClick={() => openCreate('post')}>
                    Write a new post
                  </button>
                }
              />
            )}
          </section>
        )}

        {tab === 'projects' &&
          (isAdmin ? (
            <section className="admin-section">
              <div className="admin-section__head">
                <h2>Projects</h2>
                <button type="button" className="btn btn--primary" onClick={() => openCreate('project')}>
                  New project
                </button>
              </div>
              {projects.length === 0 ? (
                <EmptyState title="No projects yet" message="Create your first project to fill the portfolio." />
              ) : (
                <ul className="admin-list">
                  {projects.map((project) => (
                    <li key={project._id} className="admin-row">
                      <div className="admin-row__main">
                        <span className="admin-row__title">{project.title}</span>
                        <span className="admin-row__sub">
                          {categoryLabel(project.category)} · {statusLabel(project.status)} · {project.year}
                        </span>
                      </div>
                      <div className="admin-row__actions">
                        <button type="button" className="btn btn--ghost btn--small" onClick={() => openEdit('project', project)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger btn--small"
                          onClick={() => setConfirm({ type: 'project', item: project })}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : (
            <EmptyState
              title="Projects are the author's"
              message="Only the portfolio administrator can manage projects. You can still write posts."
            />
          ))}

        {tab === 'posts' && (
          <section className="admin-section">
            <div className="admin-section__head">
              <h2>Posts</h2>
              <button type="button" className="btn btn--primary" onClick={() => openCreate('post')}>
                New post
              </button>
            </div>
            {posts.length === 0 ? (
              <EmptyState title="No posts yet" message="Write your first field note." />
            ) : (
              <ul className="admin-list">
                {posts.map((post) => (
                  <li key={post._id} className="admin-row">
                    <div className="admin-row__main">
                      <span className="admin-row__title">
                        {post.title}{' '}
                        {!post.published && <span className="draft-pill">Draft</span>}
                      </span>
                      <span className="admin-row__sub">
                        {formatDate(post.createdAt)} · {post.readTime} min · {post.commentCount} comments
                      </span>
                    </div>
                    <div className="admin-row__actions">
                      <button type="button" className="btn btn--ghost btn--small" onClick={() => openEdit('post', post)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger btn--small"
                        onClick={() => setConfirm({ type: 'post', item: post })}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === 'messages' && isAdmin && (
          <section className="admin-section">
            <h2>Messages</h2>
            {messages.length === 0 ? (
              <EmptyState title="Inbox empty" message="Messages from the contact form will appear here." />
            ) : (
              <ul className="admin-list">
                {messages.map((message) => (
                  <li key={message._id} className={`admin-row admin-row--message ${message.read ? '' : 'is-unread'}`}>
                    <div className="admin-row__main">
                      <span className="admin-row__title">
                        {message.name} <a href={`mailto:${message.email}`}>{message.email}</a>
                      </span>
                      <span className="admin-row__sub">{message.message}</span>
                    </div>
                    <div className="admin-row__actions">
                      <button type="button" className="btn btn--ghost btn--small" onClick={() => toggleRead(message)}>
                        {message.read ? 'Unread' : 'Mark read'}
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger btn--small"
                        onClick={() => setConfirm({ type: 'message', item: message })}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === 'skills' && isAdmin && (
          <section className="admin-section">
            <div className="admin-section__head">
              <h2>Skills</h2>
              <button type="button" className="btn btn--primary" onClick={() => openCreate('skill')}>
                New skill
              </button>
            </div>
            {skills.length === 0 ? (
              <EmptyState title="No skills yet" message="Add the tools in your toolbox." />
            ) : (
              <ul className="admin-list">
                {skills.map((skill) => (
                  <li key={skill._id} className="admin-row">
                    <div className="admin-row__main">
                      <span className="admin-row__title">{skill.name}</span>
                      <span className="admin-row__sub">
                        {skill.category} · level {skill.level}
                      </span>
                    </div>
                    <div className="admin-row__actions">
                      <button type="button" className="btn btn--ghost btn--small" onClick={() => openEdit('skill', skill)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--danger btn--small"
                        onClick={() => setConfirm({ type: 'skill', item: skill })}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      {modal?.type === 'project' && (
        <ProjectFormModal
          initial={modal.data}
          editing={Boolean(modal.editing)}
          busy={busy}
          onClose={() => setModal(null)}
          onSubmit={saveProject}
        />
      )}
      {modal?.type === 'post' && (
        <PostFormModal
          initial={modal.data}
          editing={Boolean(modal.editing)}
          busy={busy}
          onClose={() => setModal(null)}
          onSubmit={savePost}
        />
      )}
      {modal?.type === 'skill' && (
        <SkillFormModal
          initial={modal.data}
          editing={Boolean(modal.editing)}
          busy={busy}
          onClose={() => setModal(null)}
          onSubmit={saveSkill}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={`Delete ${confirm.item.title || confirm.item.name || 'this item'}?`}
          message={
            confirm.type === 'message'
              ? 'This permanently removes the message. This cannot be undone.'
              : 'This permanently deletes it. This cannot be undone.'
          }
          confirmLabel="Delete"
          onCancel={() => setConfirm(null)}
          onConfirm={doDelete}
          busy={busy}
        />
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}

function ProjectFormModal({ initial, editing, busy, onClose, onSubmit }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const set = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.title.trim() || form.title.trim().length < 3) nextErrors.title = 'Title (3+ characters).';
    if (!form.description.trim() || form.description.trim().length < 10) nextErrors.description = 'Description (10+ characters).';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    onSubmit(form);
  };

  return (
    <Modal title={editing ? 'Edit project' : 'New project'} onClose={onClose} wide>
      <form className="form" onSubmit={submit}>
        <div className="form-grid">
          <div className="form-grid__item form-grid__item--full">
            <Field label="Title" error={errors.title}>
              <input type="text" value={form.title} onChange={set('title')} />
            </Field>
          </div>

          <Field label="Category">
            <select value={form.category} onChange={set('category')}>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={set('status')}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusLabel(status)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Year">
            <input type="text" value={form.year} onChange={set('year')} />
          </Field>
          <Field label="Role">
            <input type="text" value={form.role} onChange={set('role')} />
          </Field>
          <Field label="Timeline">
            <input type="text" value={form.timeline} onChange={set('timeline')} />
          </Field>
          <Field label="Tech stack (comma-separated)">
            <input type="text" value={form.techStack} onChange={set('techStack')} />
          </Field>

          {['summary', 'description', 'problem', 'solution', 'outcome'].map((fieldName) => (
            <div key={fieldName} className={`form-grid__item ${fieldName === 'summary' ? '' : 'form-grid__item--full'}`}>
              <Field
                label={
                  { summary: 'Summary', description: 'Description', problem: 'Problem', solution: 'The build', outcome: 'The result' }[
                    fieldName
                  ]
                }
                error={errors[fieldName]}
              >
                <textarea rows={fieldName === 'summary' ? 2 : 4} value={form[fieldName]} onChange={set(fieldName)} />
              </Field>
            </div>
          ))}

          {[1, 2, 3].map((n) => (
            <div key={n} className="form-grid__item">
              <Field label={`Highlight ${n} (label + value)`}>
                <div className="field-pair">
                  <input type="text" value={form[`highlight${n}Label`]} onChange={set(`highlight${n}Label`)} placeholder="Label" />
                  <input type="text" value={form[`highlight${n}Value`]} onChange={set(`highlight${n}Value`)} placeholder="Value" />
                </div>
              </Field>
            </div>
          ))}

          <Field label="Cover image (path or https URL)">
            <input type="text" value={form.imageUrl} onChange={set('imageUrl')} placeholder="/covers/example.svg" />
          </Field>
          <Field label="Repository URL">
            <input type="text" value={form.repoUrl} onChange={set('repoUrl')} placeholder="https://github.com/…" />
          </Field>
          <Field label="Live URL">
            <input type="text" value={form.liveUrl} onChange={set('liveUrl')} placeholder="https://…" />
          </Field>

          <label className="checkbox">
            <input type="checkbox" checked={form.featured} onChange={set('featured')} />
            Featured on the homepage
          </label>
        </div>

        <footer className="modal__footer modal__footer--inline">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Create project'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}

function PostFormModal({ initial, editing, busy, onClose, onSubmit }) {
  const [form, setForm] = useState(initial);
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.title.trim() || form.title.trim().length < 3) nextErrors.title = 'Title (3+ characters).';
    if (!form.content.trim() || form.content.trim().length < 20) nextErrors.content = 'Content (20+ characters).';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    onSubmit(form);
  };

  return (
    <Modal title={editing ? 'Edit post' : 'New post'} onClose={onClose} wide>
      <form className="form" onSubmit={submit}>
        <div className="form-grid">
          <div className="form-grid__item form-grid__item--full">
            <Field label="Title" error={errors.title}>
              <input type="text" value={form.title} onChange={set('title')} />
            </Field>
          </div>
          <div className="form-grid__item form-grid__item--full">
            <Field label="Excerpt (optional)">
              <input type="text" value={form.excerpt} onChange={set('excerpt')} />
            </Field>
          </div>
          <Field label="Tags (comma-separated)">
            <input type="text" value={form.tags} onChange={set('tags')} />
          </Field>
          <Field label="Cover image (optional)">
            <input type="text" value={form.coverImage} onChange={set('coverImage')} placeholder="/covers/post-….svg" />
          </Field>
          <div className="form-grid__item form-grid__item--full">
            <div className="editor-head">
              <label htmlFor="post-content">Content (Markdown)</label>
              <button type="button" className="btn btn--ghost btn--small" onClick={() => setPreview((value) => !value)}>
                {preview ? 'Edit' : 'Preview'}
              </button>
            </div>
            {preview ? (
              <div className="markdown markdown-preview">
                <PostPreview content={form.content} />
              </div>
            ) : (
              <textarea
                id="post-content"
                rows={14}
                value={form.content}
                onChange={set('content')}
                className="mono-input"
                aria-invalid={Boolean(errors.content)}
              />
            )}
            {errors.content && <p className="field-error">{errors.content}</p>}
          </div>

          <label className="checkbox">
            <input type="checkbox" checked={form.published} onChange={set('published')} />
            Published
          </label>
          <label className="checkbox">
            <input type="checkbox" checked={form.featured} onChange={set('featured')} />
            Featured
          </label>
        </div>

        <footer className="modal__footer modal__footer--inline">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Publish post'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}

function SkillFormModal({ initial, editing, busy, onClose, onSubmit }) {
  const [form, setForm] = useState(initial);
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  return (
    <Modal title={editing ? 'Edit skill' : 'New skill'} onClose={onClose}>
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(form);
        }}
      >
        <Field label="Name">
          <input type="text" value={form.name} onChange={set('name')} required />
        </Field>
        <Field label="Category">
          <select value={form.category} onChange={set('category')}>
            {SKILL_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`Level: ${form.level}`}>
          <input type="range" min="1" max="5" step="1" value={form.level} onChange={set('level')} />
        </Field>
        <Field label="Order">
          <input type="number" min="0" value={form.order} onChange={set('order')} />
        </Field>
        <footer className="modal__footer modal__footer--inline">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Add skill'}
          </button>
        </footer>
      </form>
    </Modal>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="field">
      <label>
        <span className="field__label">{label}</span>
        {children}
      </label>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function PostPreview({ content }) {
  return content ? <Markdown>{content}</Markdown> : <p className="muted">Nothing to preview yet.</p>;
}
