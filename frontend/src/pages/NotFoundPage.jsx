import { Link } from 'react-router-dom';
import { Film, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="page" style={{ minHeight: 'calc(100vh - var(--nav-height))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="page-content" style={{ width: '100%', maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
        <div
          className="empty-state"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '48px 32px',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(229, 169, 60, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '1px solid rgba(229, 169, 60, 0.25)',
            }}
          >
            <Film size={32} color="var(--accent)" strokeWidth={1.5} aria-hidden="true" />
          </div>

          <div className="badge badge-accent" style={{ marginBottom: 14 }}>
            404 Scene Missing
          </div>

          <h1 className="font-heading" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 12, color: 'var(--text-primary)' }}>
            Reel Not Found
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: 28 }}>
            The sequence you are looking for does not exist in our cinema archives or has been shifted to another reel.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/discover" className="btn btn-primary">
              <Home size={15} aria-hidden="true" />
              Return to Discover
            </Link>
            <button
              className="btn btn-ghost"
              onClick={() => window.history.back()}
              aria-label="Go back to previous page"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
