import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Markdown from './Markdown.jsx';

describe('Markdown', () => {
  it('renders a heading and paragraph from markdown', () => {
    render(<Markdown>{'# Hello world\n\nA paragraph of text.'}</Markdown>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hello world');
    expect(screen.getByText('A paragraph of text.')).toBeInTheDocument();
  });

  it('renders an unordered list', () => {
    render(<Markdown>{'- one\n- two'}</Markdown>);
    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
  });

  it('renders a fenced code block with language class', () => {
    const { container } = render(<Markdown>{'```js\nconst x = 1;\n```'}</Markdown>);
    expect(container.querySelector('code')).toBeInTheDocument();
  });
});
