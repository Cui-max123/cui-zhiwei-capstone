import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { site } from '../lib/site.js';

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [user]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`;

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand__mark" aria-hidden="true">
            CZ
          </span>
          <span className="brand__name">
            Cui Zhiwei<span className="brand__dot">.</span>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          <span className={`nav-toggle__bars ${open ? 'is-open' : ''}`} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </button>

        <nav id="primary-nav" className={`nav ${open ? 'is-open' : ''}`} aria-label="Primary">
          <div className="nav__links">
            {site.nav.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/api-docs" className={navLinkClass} onClick={() => setOpen(false)}>
              API
            </NavLink>
          </div>

          <div className="nav__auth">
            {user ? (
              <>
                <Link to="/admin" className="btn btn--small btn--ghost" onClick={() => setOpen(false)}>
                  {isAdmin ? 'Dashboard' : 'My writing'}
                </Link>
                <span className="user-chip" title={user.email}>
                  <span className="user-chip__avatar" aria-hidden="true">
                    {user.username.slice(0, 1).toUpperCase()}
                  </span>
                  {user.username}
                </span>
                <button type="button" className="btn btn--small btn--ghost" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-auth-link" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
                <Link to="/register" className="btn btn--small btn--primary" onClick={() => setOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
