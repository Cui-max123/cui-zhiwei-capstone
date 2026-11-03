import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · Cui Zhiwei` : 'Cui Zhiwei · Portfolio & Field Notes';
    return () => {
      document.title = previous;
    };
  }, [title]);
}
