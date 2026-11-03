export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="spinner-block" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function Skeleton({ lines = 3, className = '' }) {
  return (
    <div className={`skeleton ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <span key={index} className="skeleton__line" style={{ width: `${100 - index * 12}%` }} />
      ))}
    </div>
  );
}

export function ProjectSkeleton() {
  return (
    <div className="project-card project-card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--cover" />
      <div className="project-card__body">
        <Skeleton lines={3} />
      </div>
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <span className="state__icon" aria-hidden="true">
        ⚠
      </span>
      <h3>{title}</h3>
      <p>{message || 'The request could not be completed. Please try again.'}</p>
      {onRetry && (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="state state--empty">
      <span className="state__icon" aria-hidden="true">
        ◌
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}
