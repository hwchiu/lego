'use client';

import { useState, useEffect, useMemo } from 'react';
import { bannerSlides } from '@/app/data/banner';
import { newsItems } from '@/app/data/news';
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

  // Build slides: Tip slides from static data + 6 latest news as Breaking News slides
  const slides = useMemo(() => {
    const tipSlides = bannerSlides.filter((s) => s.labelVariant === 'tip');
    const latestNews = [...newsItems]
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, 6);
    const newsSlides = latestNews.map((item) => ({
      label: 'Breaking News',
      labelVariant: 'breaking' as const,
      prefix: undefined as string | undefined,
      linkText: item.title,
      linkHref: item.url,
    }));
    return [...newsSlides, ...tipSlides];
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [dismissed, slides.length]);

  if (dismissed) return null;

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
          <button className="banner-close" onClick={dismissBanner} aria-label="關閉公告">
            <CloseIcon />
          </button>
        </div>
      ))}
    </div>
  );
}

