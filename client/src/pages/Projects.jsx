import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { categoryLabel } from '../lib/format.js';
import Reveal from '../components/Reveal.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import { ErrorState, EmptyState, ProjectSkeleton } from '../components/Feedback.jsx';

export default function Projects() {
  useDocumentTitle('Work');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api
      .get('/projects')
      .then((res) => {
        if (active) setProjects(res.data);
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
  }, []);

  const categories = useMemo(() => ['All', ...new Set(projects.map((project) => project.category))], [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesCategory = category === 'All' || project.category === category;
      const matchesQuery =
        !q ||
        [project.title, project.summary, project.description, ...(project.techStack || [])]
          .join(' ')
          .toLowerCase()
          .includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [projects, category, query]);

  return (
    <div className="page page-projects">
      <div className="container">
        <Reveal className="page-head">
          <p className="eyebrow">
            <span className="eyebrow__num">02</span> Work
          </p>
          <h1 className="page-title">Things I&apos;ve built and the thinking behind them.</h1>
          <p className="page-lede">
            Each project is a real attempt at a real problem. Click one for the problem, the build, and the hard part.
          </p>
        </Reveal>

        <Reveal className="toolbar">
          <div className="chips" role="tablist" aria-label="Filter by category">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={category === item}
                className={`chip ${category === item ? 'is-on' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="search">
            <span className="visually-hidden">Search projects</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects…"
            />
          </label>
        </Reveal>

        {loading ? (
          <div className="project-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProjectSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message="Could not load projects." onRetry={() => window.location.reload()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No projects match"
            message="Try a different category or clear the search."
            action={
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setCategory('All');
                  setQuery('');
                }}
              >
                Reset filters
              </button>
            }
          />
        ) : (
          <div className="project-grid">
            {filtered.map((project, index) => (
              <Reveal key={project._id} delay={index * 40}>
                <ProjectCard project={project} index={index} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
