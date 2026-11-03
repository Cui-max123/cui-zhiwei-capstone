import { Link } from 'react-router-dom';
import { categoryLabel, statusLabel } from '../lib/format.js';
import { asset } from '../lib/assets.js';

export default function ProjectCard({ project, index = 0 }) {
  return (
    <Link to={`/projects/${project._id}`} className="project-card" aria-label={`${project.title} — view case study`}>
      <div className="project-card__cover">
        {project.imageUrl ? (
          <img src={asset(project.imageUrl)} alt="" loading="lazy" />
        ) : (
          <div className="project-card__cover-fallback">{project.title.slice(0, 1)}</div>
        )}
        <span className={`status-badge status-badge--${project.status}`}>{statusLabel(project.status)}</span>
      </div>
      <div className="project-card__body">
        <p className="project-card__index">0{index + 1}</p>
        <div className="project-card__head">
          <h3>{project.title}</h3>
          <span className="project-card__arrow" aria-hidden="true">
            ↗
          </span>
        </div>
        <p className="project-card__category">{categoryLabel(project.category)}</p>
        <p className="project-card__summary">{project.summary}</p>
        {project.techStack?.length > 0 && (
          <ul className="tag-list" aria-label="Tech stack">
            {project.techStack.slice(0, 4).map((tech) => (
              <li key={tech} className="tag">
                {tech}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
