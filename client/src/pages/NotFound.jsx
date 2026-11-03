import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFound() {
  useDocumentTitle('Not found');
  return (
    <div className="page page-notfound">
      <div className="container notfound">
        <p className="notfound__code">404</p>
        <h1 className="notfound__title">This page wandered off.</h1>
        <p className="notfound__text">The link may be broken, or the page may have moved. Let&apos;s get you back.</p>
        <Link to="/" className="btn btn--primary btn--large">
          Back home
        </Link>
      </div>
    </div>
  );
}
