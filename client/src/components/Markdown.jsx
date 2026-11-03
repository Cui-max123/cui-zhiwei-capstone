import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Markdown({ children }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
          h2: ({ node, ...props }) => <h2 {...props} />,
          code: ({ className, children, ...props }) => {
            const isBlock = className?.includes('language-') || String(children).includes('\n');
            if (isBlock) return <code className={className} {...props}>{children}</code>;
            return <code className="inline-code" {...props}>{children}</code>;
          }
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
