import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatLongDate, formatDateTime } from '../lib/format.js';
import Reveal from '../components/Reveal.jsx';
import Markdown from '../components/Markdown.jsx';
import { ErrorState, Spinner } from '../components/Feedback.jsx';

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useDocumentTitle(post?.title);

  const load = () =>
    api
      .get(`/blog/${id}`)
      .then((res) => setPost(res.data))
      .catch(setError)
      .finally(() => setLoading(false));

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api
      .get(`/blog/${id}`)
      .then((res) => {
        if (active) setPost(res.data);
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

  const submitComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/blog/${id}/comments`, { body: comment });
      setComment('');
      toast('Comment posted.');
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await api.del(`/blog/${id}/comments/${commentId}`);
      toast('Comment removed.', 'info');
      await load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  if (loading) return <Spinner label="Loading post…" />;
  if (error || !post) {
    return (
      <div className="container page">
        <ErrorState title="Post not found" message="This note may have been removed or unpublished." />
        <Link to="/blog" className="btn btn--ghost">
          ← Back to field notes
        </Link>
      </div>
    );
  }

  const comments = post.comments || [];

  return (
    <article className="page page-post-detail">
      <div className="container container--narrow">
        <Reveal className="post-head">
          <Link to="/blog" className="crumbs-link">
            ← Field notes
          </Link>
          <h1 className="post-title">{post.title}</h1>
          <p className="post-lead">{post.excerpt}</p>
          <div className="post-byline">
            <span className="post-byline__avatar" aria-hidden="true">
              {post.author?.username?.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p className="post-byline__author">{post.author?.username}</p>
              <p className="post-byline__meta">
                <time dateTime={post.createdAt}>{formatLongDate(post.createdAt)}</time> · {post.readTime} min read
              </p>
            </div>
          </div>
          {post.tags?.length > 0 && (
            <ul className="tag-list" aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag} className="tag">
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        <Reveal className="post-content">
          <Markdown>{post.content}</Markdown>
        </Reveal>

        <Reveal className="post-divider" aria-hidden="true">
          <span>· · ·</span>
        </Reveal>

        <section className="comments">
          <h2 className="comments__title">
            Discussion <span className="comments__count">{post.commentCount}</span>
          </h2>

          {user ? (
            <form className="comment-form" onSubmit={submitComment}>
              <label htmlFor="comment-body" className="visually-hidden">
                Add a comment
              </label>
              <textarea
                id="comment-body"
                rows={3}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Add to the conversation…"
                maxLength={1000}
              />
              <button type="submit" className="btn btn--primary" disabled={submitting || !comment.trim()}>
                {submitting ? 'Posting…' : 'Post comment'}
              </button>
            </form>
          ) : (
            <p className="comments__signin">
              <Link to="/login">Sign in</Link> to join the discussion.
            </p>
          )}

          {comments.length === 0 ? (
            <p className="muted">No comments yet. Be the first to add one.</p>
          ) : (
            <ul className="comment-list">
              {comments.map((item) => (
                <li key={item._id} className="comment">
                  <div className="comment__head">
                    <span className="comment__avatar" aria-hidden="true">
                      {item.author?.username?.slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <span className="comment__author">{item.author?.username}</span>
                      <time className="comment__time" dateTime={item.createdAt}>
                        {formatDateTime(item.createdAt)}
                      </time>
                    </div>
                  </div>
                  <p className="comment__body">{item.body}</p>
                  {user && (user.role === 'admin' || user._id === item.author?._id || user._id === post.author?._id) && (
                    <button type="button" className="comment__delete" onClick={() => deleteComment(item._id)}>
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </article>
  );
}
