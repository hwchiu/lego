'use client';

import { useState, useEffect } from 'react';
import { bannerSlides } from '@/app/data/banner';
import { useBanner } from '@/app/contexts/BannerContext';

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M4 4l8 8M12 4l-8 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Banner() {
  const [current, setCurrent] = useState(0);
  const { dismissed, dismissBanner } = useBanner();

  useEffect(() => {
    if (dismissed) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % bannerSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div className="banner-wrap">
      {bannerSlides.map((slide, idx) => (
        <div
          key={idx}
          className={`banner-slide ${idx === current ? 'active' : ''}`}
        >
          <span className="banner-label">{slide.label}</span>
          <span className="banner-text">
            {slide.prefix && <>{slide.prefix}</>}
            <a className="banner-link" href={slide.linkHref}>
              {slide.linkText}
            </a>
          </span>
          <button className="banner-close" onClick={dismissBanner} aria-label="關閉公告">
            <CloseIcon />
          </button>
        </div>
      ))}
    </div>
  );
}

