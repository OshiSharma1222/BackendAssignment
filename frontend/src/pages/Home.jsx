import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="container home-wrap">
      <section className="hero-card">
        <div className="hero-card__glow hero-card__glow--one" aria-hidden="true" />
        <div className="hero-card__glow hero-card__glow--two" aria-hidden="true" />
        <div className="hero-card__grain" aria-hidden="true" />

        <div className="hero-card__inner">
          <span className="hero-badge">
            <span className="hero-badge__dot" />
            Secure REST API · v1
          </span>

          <h1 className="hero-title">Task Manager</h1>
          <p className="hero-sub">
            A beautifully crafted demo app powered by a secure REST API —
            JWT authentication, role‑based access control, request validation,
            and clean API versioning.
          </p>

          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">Go to dashboard</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">Get started</Link>
                <Link to="/login" className="btn btn-ghost">Log in</Link>
              </>
            )}
            <a
              className="btn btn-ghost"
              href="http://localhost:5000/docs"
              target="_blank"
              rel="noreferrer"
            >
              API Docs
            </a>
          </div>

          <ul className="hero-features">
            <li>
              <span className="hero-features__icon">I</span>
              <div>
                <strong>JWT Auth</strong>
                <small>Stateless sessions</small>
              </div>
            </li>
            <li>
              <span className="hero-features__icon">II</span>
              <div>
                <strong>RBAC</strong>
                <small>User &amp; Admin roles</small>
              </div>
            </li>
            <li>
              <span className="hero-features__icon">III</span>
              <div>
                <strong>Validated</strong>
                <small>Schema&#8209;checked inputs</small>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
