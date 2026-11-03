import { describe, it, expect } from 'vitest';
import { formatDate, statusLabel, categoryLabel, splitParagraphs } from './format.js';

describe('formatDate', () => {
  it('formats an ISO date into a readable string', () => {
    expect(formatDate('2026-10-28T00:00:00.000Z')).toMatch(/Oct 28, 2026/);
  });

  it('returns the input unchanged when invalid', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });

  it('returns empty string for missing value', () => {
    expect(formatDate(null)).toBe('');
  });
});

describe('statusLabel', () => {
  it('maps known statuses to display labels', () => {
    expect(statusLabel('shipped')).toBe('Shipped');
    expect(statusLabel('in-progress')).toBe('In progress');
    expect(statusLabel('concept')).toBe('Concept');
  });

  it('falls back to the raw value', () => {
    expect(statusLabel('mystery')).toBe('mystery');
  });
});

describe('categoryLabel', () => {
  it('returns the category unchanged', () => {
    expect(categoryLabel('Full-stack')).toBe('Full-stack');
  });
});

describe('splitParagraphs', () => {
  it('splits on blank lines and trims', () => {
    expect(splitParagraphs('One\n\nTwo\n\n\nThree')).toEqual(['One', 'Two', 'Three']);
  });

  it('returns empty array for empty input', () => {
    expect(splitParagraphs('')).toEqual([]);
  });
});
