import { Link } from 'react-router-dom';
import { site } from '../lib/site.js';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-cta">
          <p className="eyebrow">What&apos;s next</p>
          <h2 className="footer-cta__title">
            Got a project, a question,
            <br />
            or a dataset that needs taming?
          </h2>
          <Link to="/contact" className="btn btn--primary btn--large">
            Start a conversation
          </Link>
        </div>

        <div className="footer-grid">
          <div className="footer-brand">
            <span className="brand__mark brand__mark--footer" aria-hidden="true">
              CZ
            </span>
            <p className="footer-brand__text">
              {site.role}. I build calm, useful software and write about how it works.
            </p>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Explore</h3>
            <ul className="footer-links">
              <li>
                <Link to="/projects">Work</Link>
              </li>
              <li>
                <Link to="/blog">Field notes</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <Link to="/api-docs">API reference</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-heading">Elsewhere</h3>
            <ul className="footer-links">
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
              <li>
                <a href={site.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </li>
              <li>
                <a href={site.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {year} {site.name} · Student ID {site.studentId}
          </p>
          <p className="footer-bottom__meta">Built with React, Express &amp; MongoDB · {site.location}</p>
        </div>
      </div>
    </footer>
  );
}
