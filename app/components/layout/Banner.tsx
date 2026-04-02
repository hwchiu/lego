'use client';

import { useState, useEffect } from 'react';

interface BannerSlide {
  label: string;
  labelVariant: string;
  prefix?: string | null;
  linkText: string;
  linkHref: string;
}

interface BannerProps {
  slides: BannerSlide[];
}

export default function Banner({ slides }: BannerProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="banner-wrap">
      {slides.map((slide, idx) => (
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
          <div className="banner-dots">
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                className={`banner-dot ${dotIdx === current ? 'active' : ''}`}
                onClick={() => setCurrent(dotIdx)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
