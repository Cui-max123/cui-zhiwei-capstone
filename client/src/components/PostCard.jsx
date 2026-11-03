import { Link } from 'react-router-dom';
import { formatDate } from '../lib/format.js';
import { asset } from '../lib/assets.js';

export default function PostCard({ post }) {
  return (
    <Link to={`/blog/${post._id}`} className="post-card" aria-label={`${post.title} — read the post`}>
      {post.coverImage && (
        <div className="post-card__cover">
          <img src={asset(post.coverImage)} alt="" loading="lazy" />
        </div>
      )}
      <div className="post-card__body">
        <p className="post-card__meta">
          <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readTime} min read</span>
        </p>
        <h3 className="post-card__title">{post.title}</h3>
        <p className="post-card__excerpt">{post.excerpt}</p>
        <div className="post-card__foot">
          {post.tags?.length > 0 && (
            <ul className="tag-list" aria-label="Tags">
              {post.tags.slice(0, 3).map((tag) => (
                <li key={tag} className="tag">
                  {tag}
                </li>
              ))}
            </ul>
          )}
          <span className="post-card__arrow" aria-hidden="true">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
