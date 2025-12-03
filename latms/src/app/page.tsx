import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* Navigation */}
      <nav className="navbar">
        <div className="container nav-content">
          <div className="nav-logo">
            <span className="text-gradient">Al Obaidani</span> LATMS
          </div>
          <div className="nav-links">
            <Link href="/login" className="nav-link">Employee Login</Link>
            <Link href="/admin" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
              Admin Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <h1 className="hero-title">
            Streamline Your <br />
            <span className="text-gradient">Leave & Travel</span> Workflow
          </h1>
          <p className="hero-subtitle">
            The centralized platform for Al Obaidani Stores. Experience seamless leave management
            and instant air ticket issuance in one unified system.
          </p>
          <div className="hero-actions">
            <Link href="/login" className="btn btn-accent">
              Employee Login
            </Link>
            <Link href="/admin" className="btn btn-outline">
              Admin Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
              A simple, transparent process from request to boarding.
            </p>
          </div>

          <div className="grid-3">
            {/* Card 1 */}
            <div className="card">
              <div className="feature-icon">📅</div>
              <h3>1. Apply for Leave</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Select your dates and request air tickets in a single, unified form.
                System automatically calculates your balance.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card">
              <div className="feature-icon">✅</div>
              <h3>2. Smart Approval</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Automated routing through Manager, HR, and Ops. Real-time notifications
                keep you updated at every step.
              </p>
            </div>

            {/* Card 3 */}
            <div className="card">
              <div className="feature-icon">✈️</div>
              <h3>3. Ticket Issuance</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Once approved, receive your e-ticket directly. Seamless integration
                with travel agents for quick booking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>© 2025 Al Obaidani Stores. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
