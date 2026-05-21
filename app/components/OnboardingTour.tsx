'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';

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

function FinIdxTourIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1" y="8" width="2.5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
      <rect x="5.75" y="5" width="2.5" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
      <rect x="10.5" y="2" width="2.5" height="11" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M2.25 7.5 L7 4 L12.75 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SubscribeBellIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1.5a4 4 0 0 0-4 4v2.5L2 9.5h10l-1-1.5V5.5a4 4 0 0 0-4-4Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5.5 9.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
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

function Step12Preview() {
  return (
    <div className="tour-preview-stack">
      <div className="tour-preview-stack-item">
        <Step1Preview />
      </div>
      <div className="tour-preview-stack-item">
        <Step2Preview />
      </div>
    </div>
  );
}

// ── Tour step definitions ─────────────────────────────────────────────────────

interface SecondCallout {
  selector: string;
  title: string;
  description: string;
  calloutSide: 'bottom' | 'left' | 'right' | 'center';
  icon: React.ReactNode;
  preview: React.ReactNode;
  accentColor: string;
}

interface TourStep {
  id: number;
  targetSelector: string | null;
  title: string;
  subtitle: string;
  description: string;
  calloutSide: 'bottom' | 'left' | 'right' | 'center';
  icon: React.ReactNode;
  preview: React.ReactNode;
  accentColor: string;
  /** When present, renders a second simultaneous spotlight + info-only callout */
  secondCallout?: SecondCallout;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    targetSelector: '.topnav-search-wrap',
    title: 'Financial Index Tour',
    subtitle: 'NEW FEATURE',
    description:
      '<ol>' +
      '<li>Type a company name (e.g., Apple) in the search bar.</li>' +
      '<li>Click the "Financial Index" icon to view Revenue with QoQ/YoY and Gross Margin.</li>' +
      '<li>Inside the Financial Index panel, click <strong>More Information</strong>.</li>' +
      '<li>You will jump to Company Profile <strong>FIN. Statement</strong> with full quarterly/annual reports.</li>' +
      '</ol>',
    calloutSide: 'bottom',
    icon: <FinIdxTourIcon />,
    preview: <Step12Preview />,
    accentColor: '#4fc3f7',
  },
  {
    id: 2,
    targetSelector: '.wl-action-btn--subscribe-tour',
    title: 'Subscribe',
    subtitle: 'NEW FEATURE',
    description:
      'Click <strong>Subscribe</strong> to follow your favourite companies\' events in the watchlist. ' +
      'Choose which companies and event types you want to track.',
    calloutSide: 'left',
    icon: <SubscribeBellIcon />,
    preview: <Step3Preview />,
    accentColor: '#8b5cf6',
    secondCallout: {
        selector: '[data-tour-target="notifications-wrap"]',
      title: 'Notifications',
      description:
        'Open <strong>Notifications</strong> from the top-right, then click <strong>⚙ Settings</strong> to customise your notification channels. ' +
        'Receive email alerts or book events directly into your Outlook calendar.',
      calloutSide: 'bottom',
      icon: <BellSettingsIcon />,
      preview: <Step4Preview />,
      accentColor: '#f59e0b',
    },
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
  const { lang } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [calloutPos, setCalloutPos] = useState<React.CSSProperties>({});
  const [arrowClass, setArrowClass] = useState('');
  // Second spotlight + callout (for dual-highlight steps)
  const [spotlightRect2, setSpotlightRect2] = useState<SpotlightRect | null>(null);
  const [calloutPos2, setCalloutPos2] = useState<React.CSSProperties>({});
  const [arrowClass2, setArrowClass2] = useState('');
  const [entering, setEntering] = useState(false);
  // Viewport size for SVG dual-overlay (needs explicit pixel dimensions)
  const [vp, setVp] = useState({ w: 0, h: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setVp({ w: window.innerWidth, h: window.innerHeight });
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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
  const computeCalloutPos = (
    rect: DOMRect,
    side: 'bottom' | 'left' | 'right' | 'center',
  ): { pos: React.CSSProperties; arrow: string } => {
    if (side === 'bottom') {
      const left = Math.max(
        VIEWPORT_EDGE_MARGIN,
        Math.min(rect.left - SPOTLIGHT_PADDING, window.innerWidth - CALLOUT_WIDTH - VIEWPORT_EDGE_MARGIN),
      );
      return {
        pos: { top: rect.bottom + SPOTLIGHT_PADDING + CALLOUT_MARGIN, left, width: CALLOUT_WIDTH },
        arrow: 'tour-callout--arrow-top',
      };
    }
    if (side === 'left') {
      const right = window.innerWidth - rect.left + SPOTLIGHT_PADDING + CALLOUT_MARGIN;
      const top = Math.max(
        VIEWPORT_EDGE_MARGIN,
        Math.min(rect.top - CALLOUT_VERTICAL_OFFSET, window.innerHeight - CALLOUT_MAX_HEIGHT),
      );
      return {
        pos: { top, right, width: CALLOUT_WIDTH },
        arrow: 'tour-callout--arrow-right',
      };
    }
    return {
      pos: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: CALLOUT_WIDTH },
      arrow: '',
    };
  };

  const updatePosition = useCallback(() => {
    if (!currentStep?.targetSelector) {
      setSpotlightRect(null);
      setSpotlightRect2(null);
      setCalloutPos({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      setArrowClass('');
      return;
    }

    const el = document.querySelector(currentStep.targetSelector) as HTMLElement | null;
    if (!el) {
      setSpotlightRect(null);
      setSpotlightRect2(null);
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

    const { pos, arrow } = computeCalloutPos(rect, currentStep.calloutSide);
    setCalloutPos(pos);
    setArrowClass(arrow);

    // Second target (dual-highlight steps)
    if (currentStep.secondCallout) {
      const el2 = document.querySelector(currentStep.secondCallout.selector) as HTMLElement | null;
      if (el2) {
        const rect2 = el2.getBoundingClientRect();
        setSpotlightRect2({
          top: rect2.top - SPOTLIGHT_PADDING,
          left: rect2.left - SPOTLIGHT_PADDING,
          width: rect2.width + SPOTLIGHT_PADDING * 2,
          height: rect2.height + SPOTLIGHT_PADDING * 2,
        });
        const { pos: pos2, arrow: arrow2 } = computeCalloutPos(rect2, currentStep.secondCallout.calloutSide);
        setCalloutPos2(pos2);
        setArrowClass2(arrow2);
      } else {
        setSpotlightRect2(null);
      }
    } else {
      setSpotlightRect2(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const handleStepChange = (nextStep: number) => {
    // Skip if step index is invalid or already on this step.
    if (nextStep < 0 || nextStep >= totalSteps || nextStep === step) return;
    const nextStepDef = TOUR_STEPS[nextStep];
    if (nextStepDef?.id === 2 && typeof window !== 'undefined') {
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
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      handleStepChange(step + 1);
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

  const isDual = !!(currentStep.secondCallout && spotlightRect2);

  return (
    <div className="tour-root" role="dialog" aria-modal="true" aria-label="New features tour">
      {/* ── Overlay ───────────────────────────────────────────────────────── */}
      {isDual ? (
        /* SVG overlay: cuts out both spotlight targets simultaneously.
           Explicit width/height attributes (not just CSS) are required so that
           the SVG internal coordinate system matches viewport pixels. */
        <svg
          className="tour-dual-overlay"
          aria-hidden="true"
          width={vp.w || window.innerWidth}
          height={vp.h || window.innerHeight}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9901,
            pointerEvents: 'none',
          }}
        >
          <defs>
            <mask id="tour-dual-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {spotlightRect && (
                <rect
                  x={spotlightRect.left}
                  y={spotlightRect.top}
                  width={spotlightRect.width}
                  height={spotlightRect.height}
                  rx="8"
                  fill="black"
                />
              )}
              {spotlightRect2 && (
                <rect
                  x={spotlightRect2.left}
                  y={spotlightRect2.top}
                  width={spotlightRect2.width}
                  height={spotlightRect2.height}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          {/* Dark overlay */}
          <rect x="0" y="0" width="100%" height="100%" fill="rgba(14,22,36,0.78)" mask="url(#tour-dual-mask)" />
          {/* Accent ring – Subscribe */}
          {spotlightRect && (
            <rect
              x={spotlightRect.left}
              y={spotlightRect.top}
              width={spotlightRect.width}
              height={spotlightRect.height}
              rx="8"
              fill="none"
              stroke={currentStep.accentColor}
              strokeWidth="2.5"
            />
          )}
          {/* Accent ring – Notifications */}
          {spotlightRect2 && (
            <rect
              x={spotlightRect2.left}
              y={spotlightRect2.top}
              width={spotlightRect2.width}
              height={spotlightRect2.height}
              rx="8"
              fill="none"
              stroke={currentStep.secondCallout!.accentColor}
              strokeWidth="2.5"
            />
          )}
        </svg>
      ) : (
        <>
          {/* Single-target: use existing box-shadow spotlight or plain overlay */}
          {!spotlightRect && <div className="tour-overlay" />}
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
        </>
      )}

      {/* ── Primary callout (Subscribe / step 1) ─────────────────────────── */}
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

        {/* Footer: progress dots + action buttons */}
        <div className="tour-callout-footer">
          <div className="tour-dots">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`tour-dot${i === step ? ' tour-dot--active' : ''}`}
                style={i === step ? { background: currentStep.accentColor } : {}}
                aria-label={lang === 'zh' ? `前往第 ${i + 1} 步` : `Go to step ${i + 1}`}
                title={lang === 'zh' ? `第 ${i + 1} 步` : `Step ${i + 1}`}
                onClick={() => handleStepChange(i)}
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

      {/* ── Secondary info-only callout (Notifications) — no action buttons ─ */}
      {isDual && currentStep.secondCallout && (
        <div
          className={`tour-callout tour-callout--info-only${arrowClass2 ? ` ${arrowClass2}` : ''}${entering ? ' tour-callout--enter' : ''}`}
          style={{ ...calloutPos2, '--tour-accent': currentStep.secondCallout.accentColor } as React.CSSProperties}
          role="document"
          aria-label={currentStep.secondCallout.title}
        >
          <div className="tour-callout-accent-bar" style={{ background: currentStep.secondCallout.accentColor }} />
          <div className="tour-callout-header">
            <div className="tour-callout-icon" style={{ color: currentStep.secondCallout.accentColor }}>
              {currentStep.secondCallout.icon}
            </div>
            <div className="tour-callout-header-text">
              <span className="tour-callout-subtitle" style={{ color: currentStep.secondCallout.accentColor }}>
                {currentStep.subtitle}
              </span>
              <h3 className="tour-callout-title">{currentStep.secondCallout.title}</h3>
            </div>
          </div>
          <div
            className="tour-callout-desc"
            dangerouslySetInnerHTML={{ __html: currentStep.secondCallout.description }}
          />
          <div className="tour-callout-preview">
            {currentStep.secondCallout.preview}
          </div>
        </div>
      )}
    </div>
  );
}
