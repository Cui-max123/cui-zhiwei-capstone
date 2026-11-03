export default function Pagination({ meta, onChange }) {
  if (!meta || meta.pages <= 1) return null;

  const { page, pages } = meta;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" className="btn btn--ghost btn--small" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Newer
      </button>
      <span className="pagination__label">
        Page {page} of {pages}
      </span>
      <button type="button" className="btn btn--ghost btn--small" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Older →
      </button>
    </nav>
  );
}
