'use client';

import { useState, useEffect } from 'react';
import { bannerSlides } from '@/app/data/banner';

export default function Banner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % bannerSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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
          <div className="banner-dots">
            {bannerSlides.map((_, dotIdx) => (
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
