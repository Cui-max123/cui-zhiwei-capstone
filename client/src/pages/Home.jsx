import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { site } from '../lib/site.js';
import { asset } from '../lib/assets.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import Reveal from '../components/Reveal.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import PostCard from '../components/PostCard.jsx';
import SkillDots from '../components/SkillDots.jsx';
import { ErrorState, ProjectSkeleton, Skeleton } from '../components/Feedback.jsx';

export default function Home() {
  useDocumentTitle(null);
  const [featured, setFeatured] = useState({ data: [], loading: true, error: null });
  const [posts, setPosts] = useState({ data: [], loading: true, error: null });
  const [skills, setSkills] = useState({ data: [], loading: true, error: null });

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      api.get('/projects?featured=true'),
      api.get('/blog?limit=3'),
      api.get('/skills')
    ]).then(([projectsRes, postsRes, skillsRes]) => {
      if (!active) return;
      if (projectsRes.status === 'fulfilled') setFeatured({ data: projectsRes.value.data, loading: false, error: null });
      else setFeatured((s) => ({ ...s, loading: false, error: projectsRes.reason }));

      if (postsRes.status === 'fulfilled') setPosts({ data: postsRes.value.data, loading: false, error: null });
      else setPosts((s) => ({ ...s, loading: false, error: postsRes.reason }));

      if (skillsRes.status === 'fulfilled') setSkills({ data: skillsRes.value.data, loading: false, error: null });
      else setSkills((s) => ({ ...s, loading: false, error: skillsRes.reason }));
    });

    return () => {
      active = false;
    };
  }, []);

  const featuredProjects = featured.data.slice(0, 3);
  const groupedSkills = skills.data.reduce((acc, skill) => {
    (acc[skill.category] ||= []).push(skill);
    return acc;
  }, {});

  return (
    <div className="page-home">
      <section className="hero">
        <div className="container hero__inner">
          <Reveal className="hero__copy">
            <p className="eyebrow">
              <span className="eyebrow__num">01</span> Portfolio &amp; Field Notes
            </p>
            <h1 className="hero__title">
              I build <em>calm, useful</em> software for messy real life.
            </h1>
            <p className="hero__lede">{site.intro}</p>
            <div className="hero__actions">
              <Link to="/projects" className="btn btn--primary btn--large">
                See the work
              </Link>
              <Link to="/contact" className="btn btn--ghost btn--large">
                Get in touch
              </Link>
            </div>
            <p className="hero__availability">
              <span className="hero__dot" aria-hidden="true" />
              {site.availability}
            </p>
          </Reveal>

          <Reveal delay={120} className="hero__aside">
            <div className="portrait-card">
              <img src={asset('/portrait.svg')} alt="Abstract portrait card for Cui Zhiwei" />
              <div className="portrait-card__caption">
                <span>{site.nameZh}</span>
                <span>{site.location} · 2026</span>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="container">
          <Reveal className="stat-strip">
            {site.stats.map((stat) => (
              <div key={stat.label} className="stat">
                <span className="stat__value">{stat.value}</span>
                <span className="stat__label">{stat.label}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <p className="eyebrow">
                <span className="eyebrow__num">02</span> Selected work
              </p>
              <h2 className="section-title">A few things I&apos;ve shipped.</h2>
            </div>
            <Link to="/projects" className="btn btn--ghost">
              All projects →
            </Link>
          </Reveal>

          {featured.loading ? (
            <div className="project-grid">
              <ProjectSkeleton />
              <ProjectSkeleton />
              <ProjectSkeleton />
            </div>
          ) : featured.error ? (
            <ErrorState message="Could not load featured projects." onRetry={() => window.location.reload()} />
          ) : (
            <Reveal className="project-grid">
              {featuredProjects.map((project, index) => (
                <ProjectCard key={project._id} project={project} index={index} />
              ))}
            </Reveal>
          )}
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <p className="eyebrow">
                <span className="eyebrow__num">03</span> Toolbox
              </p>
              <h2 className="section-title">The tools I reach for.</h2>
            </div>
          </Reveal>

          {skills.loading ? (
            <Skeleton lines={4} />
          ) : skills.error ? (
            <ErrorState message="Could not load skills." />
          ) : (
            <Reveal className="skills-grid">
              {Object.entries(groupedSkills).map(([category, items]) => (
                <div key={category} className="skill-group">
                  <h3 className="skill-group__title">{category}</h3>
                  <ul className="skill-group__list">
                    {items.map((skill) => (
                      <li key={skill._id} className="skill-item">
                        <span className="skill-item__name">{skill.name}</span>
                        <SkillDots level={skill.level} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Reveal>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <p className="eyebrow">
                <span className="eyebrow__num">04</span> Field notes
              </p>
              <h2 className="section-title">Writing about what I learn.</h2>
            </div>
            <Link to="/blog" className="btn btn--ghost">
              All notes →
            </Link>
          </Reveal>

          {posts.loading ? (
            <div className="post-list">
              <Skeleton lines={4} />
              <Skeleton lines={4} />
            </div>
          ) : posts.error ? (
            <ErrorState message="Could not load recent posts." />
          ) : (
            <Reveal className="post-list">
              {posts.data.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </Reveal>
          )}
        </div>
      </section>

      <section className="section section--tint">
        <div className="container about">
          <Reveal className="about__left">
            <p className="eyebrow">
              <span className="eyebrow__num">05</span> About me
            </p>
            <h2 className="section-title">Evidence over adjectives.</h2>
          </Reveal>
          <Reveal delay={100} className="about__right">
            <p>
              I&apos;m a computer science student who got tired of guessing and started building. Most of what I know about
              data modelling, authentication and interface design came from finishing small projects and paying attention
              to where they went wrong.
            </p>
            <p>
              Right now I&apos;m focused on the whole journey — from a clean REST API and a sensible MongoDB schema, to a
              front end that feels obvious to use. When I&apos;m not coding, I&apos;m logging books, cleaning messy CSVs,
              or writing it all down.
            </p>
            <Link to="/contact" className="text-link">
              Let&apos;s work together →
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
