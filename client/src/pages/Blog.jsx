import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import Reveal from '../components/Reveal.jsx';
import PostCard from '../components/PostCard.jsx';
import Pagination from '../components/Pagination.jsx';
import { ErrorState, EmptyState, Skeleton } from '../components/Feedback.jsx';

export default function Blog() {
  useDocumentTitle('Field Notes');
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draftQuery, setDraftQuery] = useState(searchParams.get('q') || '');

  const page = Number(searchParams.get('page') || 1);
  const tag = searchParams.get('tag') || '';
  const query = searchParams.get('q') || '';

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (draftQuery.trim()) params.set('q', draftQuery.trim());
      else params.delete('q');
      params.delete('page');
      setSearchParams(params, { replace: true });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draftQuery, searchParams, setSearchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), limit: '9' });
    if (tag) params.set('tag', tag);
    if (query) params.set('q', query);

    api
      .get(`/blog?${params.toString()}`)
      .then((res) => {
        if (active) {
          setData(res.data);
          setMeta(res.meta);
        }
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
  }, [page, tag, query]);

  const tags = useMemo(() => {
    const set = new Set();
    data.forEach((post) => post.tags?.forEach((item) => set.add(item)));
    return [...set];
  }, [data]);

  const setTag = (nextTag) => {
    const params = new URLSearchParams(searchParams);
    if (nextTag && nextTag !== tag) params.set('tag', nextTag);
    else params.delete('tag');
    params.delete('page');
    setSearchParams(params);
  };

  return (
    <div className="page page-blog">
      <div className="container">
        <Reveal className="page-head">
          <p className="eyebrow">
            <span className="eyebrow__num">04</span> Field notes
          </p>
          <h1 className="page-title">Notes from the workbench.</h1>
          <p className="page-lede">Short essays on data modelling, authentication, product thinking and process.</p>
        </Reveal>

        <Reveal className="toolbar toolbar--blog">
          <div className="chips">
            <button type="button" className={`chip ${!tag ? 'is-on' : ''}`} onClick={() => setTag('')}>
              All
            </button>
            {tags.map((item) => (
              <button key={item} type="button" className={`chip ${tag === item ? 'is-on' : ''}`} onClick={() => setTag(item)}>
                {item}
              </button>
            ))}
          </div>
          <label className="search">
            <span className="visually-hidden">Search posts</span>
            <input
              type="search"
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="Search notes…"
            />
          </label>
        </Reveal>

        {loading ? (
          <div className="post-list">
            <Skeleton lines={5} />
            <Skeleton lines={5} />
            <Skeleton lines={5} />
          </div>
        ) : error ? (
          <ErrorState message="Could not load posts." onRetry={() => window.location.reload()} />
        ) : data.length === 0 ? (
          <EmptyState title="No notes found" message="Try clearing the tag or search." />
        ) : (
          <>
            <div className="post-list">
              {data.map((post, index) => (
                <Reveal key={post._id} delay={index * 40}>
                  <PostCard post={post} />
                </Reveal>
              ))}
            </div>
            <Pagination
              meta={meta}
              onChange={(nextPage) => {
                const params = new URLSearchParams(searchParams);
                params.set('page', String(nextPage));
                setSearchParams(params);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
