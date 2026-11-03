import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { categoryLabel, statusLabel, splitParagraphs } from '../lib/format.js';
import { asset } from '../lib/assets.js';
import Reveal from '../components/Reveal.jsx';
import { ErrorState, Spinner } from '../components/Feedback.jsx';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useDocumentTitle(project?.title);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api
      .get(`/projects/${id}`)
      .then((res) => {
        if (active) setProject(res.data);
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <Spinner label="Loading project…" />;
  if (error) {
    return (
      <div className="container page">
        <ErrorState title="Project not found" message="This project may have been removed." />
        <Link to="/projects" className="btn btn--ghost">
          ← Back to work
        </Link>
      </div>
    );
  }

  const paragraphs = (text) => splitParagraphs(text).map((block, index) => <p key={index}>{block}</p>);

  return (
    <article className="page page-project-detail">
      <div className="container">
        <Reveal className="page-head page-head--project">
          <Link to="/projects" className="crumbs-link">
            ← All projects
          </Link>
          <div className="project-head-row">
            <div>
              <p className="eyebrow">{categoryLabel(project.category)}</p>
              <h1 className="page-title">{project.title}</h1>
              <p className="page-lede">{project.summary}</p>
            </div>
            <span className={`status-badge status-badge--${project.status}`}>{statusLabel(project.status)}</span>
          </div>
        </Reveal>

        <Reveal className="project-cover">
          {project.imageUrl ? (
            <img src={asset(project.imageUrl)} alt={`${project.title} cover`} />
          ) : (
            <div className="project-cover__fallback">{project.title.slice(0, 1)}</div>
          )}
        </Reveal>

        <Reveal className="project-meta">
          {[
            { label: 'Year', value: project.year },
            { label: 'Role', value: project.role },
            { label: 'Timeline', value: project.timeline || '—' }
          ].map((item) => (
            <div key={item.label} className="project-meta__item">
              <span className="project-meta__label">{item.label}</span>
              <span className="project-meta__value">{item.value}</span>
            </div>
          ))}
        </Reveal>

        <div className="project-body">
          {project.description && (
            <Reveal className="project-section">
              <h2>Overview</h2>
              {paragraphs(project.description)}
            </Reveal>
          )}
          {project.problem && (
            <Reveal className="project-section">
              <h2>The problem</h2>
              {paragraphs(project.problem)}
            </Reveal>
          )}
          {project.solution && (
            <Reveal className="project-section">
              <h2>The build</h2>
              {paragraphs(project.solution)}
            </Reveal>
          )}
          {project.outcome && (
            <Reveal className="project-section">
              <h2>The result</h2>
              {paragraphs(project.outcome)}
            </Reveal>
          )}
        </div>

        <Reveal className="project-sidebar">
          <div className="project-sidebar__block">
            <h3>Stack</h3>
            {project.techStack?.length > 0 ? (
              <ul className="tag-list">
                {project.techStack.map((tech) => (
                  <li key={tech} className="tag">
                    {tech}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">—</p>
            )}
          </div>

          {project.highlights?.length > 0 && (
            <div className="project-sidebar__block">
              <h3>Highlights</h3>
              <dl className="highlight-list">
                {project.highlights.map((highlight, index) => (
                  <div key={index} className="highlight-item">
                    <dt>{highlight.label}</dt>
                    <dd>{highlight.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {(project.repoUrl || project.liveUrl) && (
            <div className="project-sidebar__block project-sidebar__actions">
              {project.liveUrl && (
                <a href={project.liveUrl} className="btn btn--primary" target="_blank" rel="noreferrer">
                  Live site ↗
                </a>
              )}
              {project.repoUrl && (
                <a href={project.repoUrl} className="btn btn--ghost" target="_blank" rel="noreferrer">
                  Source code ↗
                </a>
              )}
            </div>
          )}
        </Reveal>

        <Reveal className="project-next">
          <Link to="/projects" className="btn btn--ghost">
            ← Back to all projects
          </Link>
        </Reveal>
      </div>
    </article>
  );
}
