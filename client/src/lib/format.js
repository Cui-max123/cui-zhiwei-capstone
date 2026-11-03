const dateFormat = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

const longFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return dateFormat.format(date);
}

export function formatLongDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return longFormat.format(date);
}

export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${dateFormat.format(date)} · ${date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
}

export function statusLabel(status) {
  const labels = { shipped: 'Shipped', 'in-progress': 'In progress', concept: 'Concept' };
  return labels[status] || status;
}

export function categoryLabel(category) {
  return category || 'Uncategorized';
}

export function splitParagraphs(text) {
  if (!text) return [];
  return String(text)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}
