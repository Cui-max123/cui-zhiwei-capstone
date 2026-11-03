import { useState } from 'react';
import { api } from '../lib/api.js';
import { site } from '../lib/site.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import Reveal from '../components/Reveal.jsx';

const initial = { name: '', email: '', message: '', website: '' };

export default function Contact() {
  useDocumentTitle('Contact');
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setServerError('');
    setErrors({});

    // Honeypot: a real person never fills the hidden field.
    if (form.website) {
      setSent(true);
      return;
    }

    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (form.message.trim().length < 10) nextErrors.message = 'A message of at least 10 characters helps me reply well.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/contact', {
        name: form.name,
        email: form.email,
        message: form.message
      });
      setSent(true);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page page-contact">
      <div className="container">
        <Reveal className="page-head">
          <p className="eyebrow">
            <span className="eyebrow__num">06</span> Contact
          </p>
          <h1 className="page-title">Say hello.</h1>
          <p className="page-lede">A project, a question, or a dataset that needs taming — I read every message.</p>
        </Reveal>

        <div className="contact-grid">
          <Reveal className="contact-form-card">
            {sent ? (
              <div className="contact-success" role="status">
                <span className="contact-success__icon" aria-hidden="true">
                  ✓
                </span>
                <h2>Message sent.</h2>
                <p>Thanks for reaching out. I usually reply within two days.</p>
                <button type="button" className="btn btn--ghost" onClick={() => setSent(false)}>
                  Send another
                </button>
              </div>
            ) : (
              <form className="form" onSubmit={submit} noValidate>
                {serverError && (
                  <p className="form-error" role="alert">
                    {serverError}
                  </p>
                )}
                <div className="form-row">
                  <div className="field">
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      type="text"
                      value={form.name}
                      onChange={update('name')}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="field-error">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={update('email')}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="field-error">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    rows={6}
                    value={form.message}
                    onChange={update('message')}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                  />
                  {errors.message && (
                    <p id="message-error" className="field-error">
                      {errors.message}
                    </p>
                  )}
                </div>
                <div className="honeypot" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input id="website" type="text" value={form.website} onChange={update('website')} tabIndex={-1} autoComplete="off" />
                </div>
                <button type="submit" className="btn btn--primary btn--large" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </Reveal>

          <Reveal delay={100} className="contact-aside">
            <h2 className="contact-aside__title">Elsewhere</h2>
            <ul className="contact-links">
              <li>
                <a href={`mailto:${site.email}`}>
                  <span className="contact-links__label">Email</span>
                  <span>{site.email}</span>
                </a>
              </li>
              <li>
                <a href={site.github} target="_blank" rel="noreferrer">
                  <span className="contact-links__label">GitHub</span>
                  <span>github.com</span>
                </a>
              </li>
              <li>
                <a href={site.linkedin} target="_blank" rel="noreferrer">
                  <span className="contact-links__label">LinkedIn</span>
                  <span>linkedin.com</span>
                </a>
              </li>
            </ul>
            <p className="contact-aside__note">
              {site.location} · Usually replies within two days · {site.availability.toLowerCase()}.
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
