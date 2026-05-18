'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────

const COOKIE_NAME = 'mic-onboarding-v1';
const COOKIE_EXPIRY_DAYS = 365;
const MS_PER_DAY = 864e5;
const TOUR_INITIAL_DELAY_MS = 700;
const ANIMATION_DURATION_MS = 400;
const TOUR_STEP_STORAGE_KEY = 'mic-onboarding-step';
const TOUR_ACTIVE_STORAGE_KEY = 'mic-onboarding-active';
const FAVORITES_ROUTE_PATH = '/lego/watchlist/favorites/';
const SPOTLIGHT_PADDING = 8;
const CALLOUT_WIDTH = 360;
const CALLOUT_MARGIN = 18;
const VIEWPORT_EDGE_MARGIN = 12;
const CALLOUT_VERTICAL_OFFSET = 30;
const CALLOUT_MAX_HEIGHT = 380;

// ── Cookie helpers ────────────────────────────────────────────────────────────

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * MS_PER_DAY).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

// ── Step icons ────────────────────────────────────────────────────────────────

function SearchBarIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect x="2" y="11" width="32" height="14" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="18" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14.5 20.5L17 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="20" y="14.5" width="1.5" height="7" rx="0.75" fill="currentColor" opacity="0.5" />
      <rect x="23" y="15.5" width="1.5" height="5" rx="0.75" fill="currentColor" opacity="0.6" />
      <rect x="26" y="13.5" width="1.5" height="9" rx="0.75" fill="currentColor" opacity="0.8" />
      <path d="M20.75 17 L23.75 15.5 L27.5 13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </svg>
  );
}

function StatementIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect x="5" y="4" width="22" height="28" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 11h12M10 15h12M10 19h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="27" cy="27" r="5.5" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.4" />
      <path d="M24.5 27h5M27 24.5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BellSettingsIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <path
        d="M18 6a9 9 0 0 1 9 9v5.6l2.2 3.4H6.8L9 20.6V15A9 9 0 0 1 18 6Z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
      />
      <path d="M14.4 28a3.6 3.6 0 0 0 7.2 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="27" cy="10" r="4.5" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="27" cy="10" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M27 5.5v1.2M27 13.3v1.2M22.5 10h1.2M29.3 10h1.2M23.8 7.3l0.85 0.85M29.35 12.85l0.85 0.85M29.35 7.3l-0.85 0.85M23.8 12.85l-0.85 0.85"
        stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"
      />
    </svg>
  );
}

// ── Mini mock-up components (visual previews inside callout) ──────────────────

function Step1Preview() {
  return (
    <div className="tour-preview tour-preview--search">
      <div className="tour-preview-bar">
        <div className="tour-preview-search-input">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <circle cx="4.5" cy="4.5" r="3" stroke="currentColor" strokeWidth="1.3" />
            <path d="M7 7L9 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span>AAPL</span>
        </div>
      </div>
      <div className="tour-preview-result">
        <div className="tour-preview-result-row">
          <span className="tour-preview-badge">AAPL</span>
          <span className="tour-preview-name">Apple Inc.</span>
          <span className="tour-preview-finidx-btn">
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="1" y="8" width="2.5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
              <rect x="5.75" y="5" width="2.5" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
              <rect x="10.5" y="2" width="2.5" height="11" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
              <path d="M2.25 7.5 L7 4 L12.75 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

function Step2Preview() {
  return (
    <div className="tour-preview tour-preview--more-info">
      <div className="tour-preview-cards-row">
        <div className="tour-preview-fin-card">
          <div className="tour-preview-fin-card-label">Revenue</div>
          <div className="tour-preview-fin-card-value tour-preview-fin-card-value--pos">124,300</div>
        </div>
        <div className="tour-preview-fin-card">
          <div className="tour-preview-fin-card-label">Net Income</div>
          <div className="tour-preview-fin-card-value tour-preview-fin-card-value--pos">33,916</div>
        </div>
        <div className="tour-preview-fin-card">
          <div className="tour-preview-fin-card-label">Gross Margin</div>
          <div className="tour-preview-fin-card-value tour-preview-fin-card-value--pos">46.58%</div>
        </div>
      </div>
      <div className="tour-preview-more-btn">
        More Information
        <svg width="10" height="10" viewBox="0 0 11 11" fill="none" aria-hidden="true">
          <path d="M2.5 5.5h6M6 3l2.5 2.5L6 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function Step3Preview() {
  return (
    <div className="tour-preview tour-preview--subscribe">
      <div className="tour-preview-subscribe-header">
        <span>Subscribe</span>
      </div>
      <div className="tour-preview-subscribe-layout">
        <div className="tour-preview-subscribe-panel">
          <div className="tour-preview-subscribe-panel-title">Companies</div>
          <div className="tour-preview-subscribe-item tour-preview-subscribe-item--active">All Companies</div>
          <div className="tour-preview-subscribe-item">AAPL</div>
          <div className="tour-preview-subscribe-item">NVDA</div>
          <div className="tour-preview-subscribe-item">TSM</div>
        </div>
        <div className="tour-preview-subscribe-panel">
          <div className="tour-preview-subscribe-panel-title">Event Types</div>
          <div className="tour-preview-subscribe-check">
            <span className="tour-preview-subscribe-check-box tour-preview-subscribe-check-box--on" />
            <span>Earnings Call</span>
          </div>
          <div className="tour-preview-subscribe-check">
            <span className="tour-preview-subscribe-check-box tour-preview-subscribe-check-box--on" />
            <span>Revenue Update</span>
          </div>
          <div className="tour-preview-subscribe-check">
            <span className="tour-preview-subscribe-check-box" />
            <span>Investor Day</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step4Preview() {
  return (
    <div className="tour-preview tour-preview--notif">
      <div className="tour-preview-notif-header">
        <span>Notifications</span>
        <span className="tour-preview-settings-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Settings
        </span>
      </div>
      <div className="tour-preview-toggle-row">
        <span>Email Notifications</span>
        <span className="tour-preview-toggle tour-preview-toggle--on" />
      </div>
      <div className="tour-preview-toggle-row">
        <span>Event Booking in Outlook</span>
        <span className="tour-preview-toggle tour-preview-toggle--on" />
      </div>
    </div>
  );
}

// ── Tour step definitions ─────────────────────────────────────────────────────

interface TourStep {
  id: number;
  targetSelector: string | null;
  title: string;
  subtitle: string;
  description: string;
  calloutSide: 'bottom' | 'left' | 'center';
  icon: React.ReactNode;
  preview: React.ReactNode;
  accentColor: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    targetSelector: '.topnav-search-wrap',
    title: 'Financial Index Search',
    subtitle: 'NEW FEATURE',
    description: '<ol>' +
      '<li>Type a company name (e.g., Apple) in the search bar.</li>' +
      '<li>Click the "Financial Index" icon to instantly view: Revenue with QoQ and YoY and Gross Margin.</li>' +
      '<li>Click "more information" for additional financial indices.</li>' +
      '</ol>',
    calloutSide: 'bottom',
    icon: <SearchBarIcon />,
    preview: <Step1Preview />,
    accentColor: '#4fc3f7',
  },
  {
    id: 2,
    targetSelector: '.topnav-search-wrap',
    title: 'Navigate to Financial Statements',
    subtitle: 'NEW FEATURE',
    description:
      'Inside the Financial Index panel, click <strong>More Information</strong> to jump ' +
      'directly to the Company Profile\'s <strong>FIN. Statement</strong> tab. ' +
      'Access full quarterly and annual financial reports — income statement, balance sheet, and cash flow.',
    calloutSide: 'bottom',
    icon: <StatementIcon />,
    preview: <Step2Preview />,
    accentColor: '#34d399',
  },
  {
    id: 3,
    targetSelector: '.wl-action-btn--subscribe-tour',
    title: 'Subscribe',
    subtitle: 'NEW FEATURE',
    description: '<p>Click the subscribe button to follow your favorite companies\' events in watchlist. Then, click the notification to customize your notification preferences for upcoming events. You can choose to:</p>' +
      '<ol>' +
      '<li>Receive email notifications.</li>' +
      '<li>Book an event directly into your Outlook calendar.</li>' +
      '</ol>',
    calloutSide: 'left',
    icon: <BellSettingsIcon />,
    preview: <Step3Preview />,
    accentColor: '#8b5cf6',
  },
  {
    id: 4,
    targetSelector: '.topnav-notif-panel-wrap',
    title: 'Notification Settings',
    subtitle: 'NEW FEATURE',
    description:
      'Click the <strong>bell icon</strong> to open the Notifications panel. ' +
      'Then tap <strong>⚙ Settings</strong> in the panel header to customize your notification channels ' +
      '— Email, Event Booking in Outlook, and more — tailored to your workflow.',
    calloutSide: 'left',
    icon: <BellSettingsIcon />,
    preview: <Step4Preview />,
    accentColor: '#f59e0b',
  },
];

// ── Spotlight rect ────────────────────────────────────────────────────────────

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [calloutPos, setCalloutPos] = useState<React.CSSProperties>({});
  const [arrowClass, setArrowClass] = useState('');
  const [entering, setEntering] = useState(false);
  const rafRef = useRef<number | null>(null);

  // ── Check cookie on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const done = getCookie(COOKIE_NAME);
    if (done || typeof window === 'undefined') return;

    const persistedActive = sessionStorage.getItem(TOUR_ACTIVE_STORAGE_KEY) === '1';
    const persistedStepRaw = sessionStorage.getItem(TOUR_STEP_STORAGE_KEY);
    const persistedStep = Number(persistedStepRaw);
    if (
      persistedActive &&
      Number.isFinite(persistedStep) &&
      persistedStep >= 0 &&
      persistedStep < TOUR_STEPS.length
    ) {
      setStep(persistedStep);
      setEntering(true);
      setVisible(true);
      return;
    }

    const t = setTimeout(() => {
      setEntering(true);
      setVisible(true);
    }, TOUR_INITIAL_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // Remove entering class after animation
  useEffect(() => {
    if (!entering) return;
    const t = setTimeout(() => setEntering(false), ANIMATION_DURATION_MS);
    return () => clearTimeout(t);
  }, [entering, step]);

  const currentStep = TOUR_STEPS[step];
  const totalSteps = TOUR_STEPS.length;

  // ── Position spotlight + callout ──────────────────────────────────────────
  const updatePosition = useCallback(() => {
    if (!currentStep?.targetSelector) {
      setSpotlightRect(null);
      setCalloutPos({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      setArrowClass('');
      return;
    }

    const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
    if (!el) {
      setSpotlightRect(null);
      setCalloutPos({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: CALLOUT_WIDTH });
      setArrowClass('');
      return;
    }

    const rect = el.getBoundingClientRect();

    setSpotlightRect({
      top: rect.top - SPOTLIGHT_PADDING,
      left: rect.left - SPOTLIGHT_PADDING,
      width: rect.width + SPOTLIGHT_PADDING * 2,
      height: rect.height + SPOTLIGHT_PADDING * 2,
    });

    if (currentStep.calloutSide === 'bottom') {
      // Position callout below the target, left-aligned to target
      const left = Math.max(
        VIEWPORT_EDGE_MARGIN,
        Math.min(rect.left - SPOTLIGHT_PADDING, window.innerWidth - CALLOUT_WIDTH - VIEWPORT_EDGE_MARGIN),
      );
      setCalloutPos({
        top: rect.bottom + SPOTLIGHT_PADDING + CALLOUT_MARGIN,
        left,
        width: CALLOUT_WIDTH,
      });
      setArrowClass('tour-callout--arrow-top');
    } else if (currentStep.calloutSide === 'left') {
      // Position callout to the left of the target
      const right = window.innerWidth - rect.left + SPOTLIGHT_PADDING + CALLOUT_MARGIN;
      const top = Math.max(
        VIEWPORT_EDGE_MARGIN,
        Math.min(rect.top - CALLOUT_VERTICAL_OFFSET, window.innerHeight - CALLOUT_MAX_HEIGHT),
      );
      setCalloutPos({
        top,
        right,
        width: CALLOUT_WIDTH,
      });
      setArrowClass('tour-callout--arrow-right');
    } else {
      setCalloutPos({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: CALLOUT_WIDTH });
      setArrowClass('');
    }
  }, [currentStep]);

  useEffect(() => {
    if (!visible) return;
    updatePosition();

    const handleResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePosition);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, updatePosition]);

  useEffect(() => {
    if (!visible || typeof window === 'undefined') return;
    sessionStorage.setItem(TOUR_ACTIVE_STORAGE_KEY, '1');
    sessionStorage.setItem(TOUR_STEP_STORAGE_KEY, String(step));
  }, [step, visible]);

  // ── Trigger step enter animation on step change ───────────────────────────
  useEffect(() => {
    if (!visible) return;
    setEntering(true);
  }, [step, visible]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (step < totalSteps - 1) {
      const nextStep = step + 1;
      const nextStepDef = TOUR_STEPS[nextStep];
      if (nextStepDef?.id === 3 && typeof window !== 'undefined') {
        const pathname = window.location.pathname.endsWith('/')
          ? window.location.pathname
          : `${window.location.pathname}/`;
        if (pathname !== FAVORITES_ROUTE_PATH) {
          sessionStorage.setItem(TOUR_ACTIVE_STORAGE_KEY, '1');
          sessionStorage.setItem(TOUR_STEP_STORAGE_KEY, String(nextStep));
          window.location.href = FAVORITES_ROUTE_PATH;
          return;
        }
      }
      setStep(nextStep);
    } else {
      handleDone();
    }
  };

  const handleDone = () => {
    setCookie(COOKIE_NAME, 'done', COOKIE_EXPIRY_DAYS);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(TOUR_ACTIVE_STORAGE_KEY);
      sessionStorage.removeItem(TOUR_STEP_STORAGE_KEY);
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="tour-root" role="dialog" aria-modal="true" aria-label="New features tour">
      {/* Dark overlay — shown when no spotlight; spotlight's box-shadow handles overlay when spotlight is active */}
      {!spotlightRect && <div className="tour-overlay" />}

      {/* Spotlight cutout with box-shadow overlay */}
      {spotlightRect && (
        <div
          className="tour-spotlight"
          style={{
            top: spotlightRect.top,
            left: spotlightRect.left,
            width: spotlightRect.width,
            height: spotlightRect.height,
            '--tour-accent': currentStep.accentColor,
          } as React.CSSProperties}
        />
      )}

      {/* Callout panel */}
      <div
        className={`tour-callout${arrowClass ? ` ${arrowClass}` : ''}${entering ? ' tour-callout--enter' : ''}`}
        style={{ ...calloutPos, '--tour-accent': currentStep.accentColor } as React.CSSProperties}
        role="document"
      >
        {/* Top accent bar */}
        <div className="tour-callout-accent-bar" style={{ background: currentStep.accentColor }} />

        {/* Header */}
        <div className="tour-callout-header">
          <div className="tour-callout-icon" style={{ color: currentStep.accentColor }}>
            {currentStep.icon}
          </div>
          <div className="tour-callout-header-text">
            <span className="tour-callout-subtitle" style={{ color: currentStep.accentColor }}>
              {currentStep.subtitle}
            </span>
            <h3 className="tour-callout-title">{currentStep.title}</h3>
          </div>
          <button
            className="tour-callout-close"
            onClick={handleDone}
            aria-label="Close tour"
            title="Skip tour"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <div
          className="tour-callout-desc"
          dangerouslySetInnerHTML={{ __html: currentStep.description }}
        />

        {/* Mini preview mockup */}
        <div className="tour-callout-preview">
          {currentStep.preview}
        </div>

        {/* Step progress dots */}
        <div className="tour-callout-footer">
          <div className="tour-dots">
            {TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                className={`tour-dot${i === step ? ' tour-dot--active' : ''}`}
                style={i === step ? { background: currentStep.accentColor } : {}}
                aria-label={`Step ${i + 1}`}
              />
            ))}
          </div>

          <div className="tour-callout-actions">
            <button className="tour-btn tour-btn--skip" onClick={handleDone}>
              Skip
            </button>
            <button
              className="tour-btn tour-btn--next"
              onClick={handleNext}
              style={{ background: currentStep.accentColor }}
            >
              {step < totalSteps - 1 ? (
                <>
                  Next
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 6h7M7 3.5L9.5 6 7 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              ) : (
                'Got It!'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
