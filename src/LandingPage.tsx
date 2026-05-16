import { useState } from 'react';
import './LandingPage.css';

/**
 * LandingPage — PRD §3.0
 * Full-page hero: headline, preview mockup, CTA, trust badges, footer.
 * "How it works" modal with step overview.
 */

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="landing">
      {/* Decorative background orbs */}
      <div className="landing__orb landing__orb--1" aria-hidden="true" />
      <div className="landing__orb landing__orb--2" aria-hidden="true" />
      <div className="landing__orb landing__orb--3" aria-hidden="true" />
      <div className="landing__grid" aria-hidden="true" />

      {/* ---- Hero Section ---- */}
      <main className="hero" id="hero">
        {/* App Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '2.5rem', fontWeight: 800 }}>
          <span style={{ color: '#10B981' }}>₹</span>
          <span style={{ color: '#1F2937' }}>Lekha</span>
          <span style={{ color: '#6B7280', fontSize: '2rem', fontWeight: 600 }}>/ लेखा</span>
        </div>

        {/* FY Badge */}
        <div className="hero__badge">
          <span className="hero__badge-dot" aria-hidden="true" />
          Updated for FY 2026-27
        </div>

        {/* Headline */}
        <h1 className="hero__headline">
          Want to know which tax regime{' '}
          <span className="hero__headline-accent">saves you more?</span>
        </h1>

        {/* Subheadline */}
        <p className="hero__subheadline">
          Answer 8 simple questions. Get a side-by-side comparison.
          No finance degree needed.
        </p>

        {/* Preview Mockup Card */}
        <div className="hero__mockup" aria-label="Sample tax result preview">
          <div className="mockup-card">
            <div className="mockup-card__header">
              <span className="mockup-card__title">Tax Comparison</span>
              <span className="mockup-card__label">✓ Recommended</span>
            </div>

            <div className="mockup-card__result">
              {/* Old Regime */}
              <div className="mockup-card__regime">
                <div className="mockup-card__regime-label">Old Regime</div>
                <div className="mockup-card__bar-container">
                  <div
                    className="mockup-card__bar mockup-card__bar--old"
                    style={{ '--bar-width': '72%' } as React.CSSProperties}
                  />
                </div>
                <div className="mockup-card__amount">Rs. 78,400</div>
              </div>

              <span className="mockup-card__vs">VS</span>

              {/* New Regime */}
              <div className="mockup-card__regime">
                <div className="mockup-card__regime-label">New Regime</div>
                <div className="mockup-card__bar-container">
                  <div
                    className="mockup-card__bar mockup-card__bar--new"
                    style={{ '--bar-width': '48%' } as React.CSSProperties}
                  />
                </div>
                <div className="mockup-card__amount">Rs. 60,000</div>
              </div>
            </div>

            <div className="mockup-card__savings">
              <div className="mockup-card__savings-icon" aria-hidden="true">↓</div>
              <div className="mockup-card__savings-text">
                You save{' '}
                <span className="mockup-card__savings-amount">Rs. 18,400</span>{' '}
                by picking the New Regime
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="hero__cta">
          <button
            type="button"
            id="start-calculation-btn"
            className="cta-button cta-button--pulse"
            onClick={onStart}
          >
            Start Calculation
            <span className="cta-button__arrow" aria-hidden="true">→</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="hero__trust">
          <span className="trust-badge">
            <span className="trust-badge__icon" aria-hidden="true">🔒</span>
            No data leaves your browser
          </span>
          <span className="trust-badge">
            <span className="trust-badge__icon" aria-hidden="true">✦</span>
            100% Free
          </span>
          <span className="trust-badge">
            <span className="trust-badge__icon" aria-hidden="true">📅</span>
            For FY 2026-27 only
          </span>
        </div>
      </main>

      {/* ---- Footer ---- */}
      <footer className="landing__footer">
        <p>
          Your data never leaves this browser. All calculations happen
          locally.&nbsp;&nbsp;·&nbsp;&nbsp;
          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault();
              setShowModal(true);
            }}
          >
            How it works
          </a>
        </p>
      </footer>

      {/* ---- "How it works" Modal ---- */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="How TaxRegime works"
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">How it works</h2>
              <button
                className="modal__close"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <ol className="modal__steps">
              <li className="modal__step">
                <span className="modal__step-number">1</span>
                <div className="modal__step-content">
                  <h3>Enter your monthly salary</h3>
                  <p>
                    Your in-hand (take-home) amount — the number you see in your
                    bank every month.
                  </p>
                </div>
              </li>
              <li className="modal__step">
                <span className="modal__step-number">2</span>
                <div className="modal__step-content">
                  <h3>Answer a few questions</h3>
                  <p>
                    Rent, investments, health insurance, loans — one
                    plain-English question at a time. Skip what doesn't apply.
                  </p>
                </div>
              </li>
              <li className="modal__step">
                <span className="modal__step-number">3</span>
                <div className="modal__step-content">
                  <h3>See your recommendation</h3>
                  <p>
                    A clear side-by-side comparison showing exactly which regime
                    saves you more — and by how much.
                  </p>
                </div>
              </li>
              <li className="modal__step">
                <span className="modal__step-number">4</span>
                <div className="modal__step-content">
                  <h3>Explore "What If" scenarios</h3>
                  <p>
                    Adjust sliders to see how extra investments, salary changes,
                    or NPS could shift your optimal regime.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
