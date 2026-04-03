'use client';

import Image from 'next/image';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';

// ── Static data ────────────────────────────────────────────────────────────────

const SOCIAL_LINKS = [
  { label: 'Medium Blog', href: 'https://medium.com/@hwchiu', icon: 'M' },
  { label: 'GitHub', href: 'https://github.com/hwchiu', icon: 'GH' },
  { label: 'Instagram', href: 'https://www.instagram.com/hwchiu/', icon: 'IG' },
  { label: 'iThome 鐵人賽', href: 'https://ithelp.ithome.com.tw/', icon: 'IT' },
];

interface TalkItem {
  year: string;
  event: string;
  topic: string;
  rating?: string;
  review?: string;
  upcoming?: boolean;
}

const PAST_TALKS: TalkItem[] = [
  {
    year: '2024',
    event: 'KCD Taiwan (Kubernetes Community Days)',
    topic: 'Observability at Scale — Grafana LGTM Stack in Production',
    rating: '⭐⭐⭐⭐⭐',
    review: '深入淺出，實務案例豐富，聽眾反應熱烈',
  },
  {
    year: '2024',
    event: 'DevOpsDays Taipei',
    topic: 'GitOps + ArgoCD 實戰導入心得',
    rating: '⭐⭐⭐⭐⭐',
    review: '矽谷牛的分享一貫保持高水準，結合實際踩坑經驗非常有參考價值',
  },
  {
    year: '2023',
    event: 'COSCUP 開源人年會',
    topic: 'Cilium eBPF CNI Deep Dive',
    rating: '⭐⭐⭐⭐⭐',
    review: '對 eBPF 與 Kubernetes 網路的深入解析，少見的深度技術分享',
  },
  {
    year: '2023',
    event: 'Cloud Native Taiwan User Group',
    topic: 'Kubernetes Security Best Practices',
    rating: '⭐⭐⭐⭐',
    review: '實用的安全建議搭配案例，對 DevSecOps 推廣很有幫助',
  },
  {
    year: '2023',
    event: 'Grafana & Friends Taipei Meetup',
    topic: 'Building Unified Observability with Grafana Cloud',
    rating: '⭐⭐⭐⭐⭐',
    review: 'Grafana 社群好評，詳細講解 Metrics / Logs / Traces 三位一體的觀測架構',
  },
  {
    year: '2022',
    event: 'iThome 鐵人賽 — 30 天系列文',
    topic: 'Kubernetes × DevOps — 從零到生產環境',
    rating: '⭐⭐⭐⭐⭐',
    review: '超過 30 篇深度技術文章，鐵人賽冠軍級作品，讀者回饋極佳',
  },
];

const UPCOMING_TALKS: TalkItem[] = [
  {
    year: '2025 Q2',
    event: 'GrafanaCON 2025',
    topic: 'From Prometheus to Mimir: Scaling Metrics at Enterprise',
    upcoming: true,
  },
  {
    year: '2025 Q2',
    event: 'KCD Taiwan 2025',
    topic: 'Grafana Alloy — The Next-Generation Telemetry Collector',
    upcoming: true,
  },
  {
    year: '2025 Q3',
    event: 'DevOpsDays Taipei 2025',
    topic: 'Platform Engineering with Grafana IRM',
    upcoming: true,
  },
];

const GALLERY_PHOTOS = [
  { src: '/lego/images/yep.jpg', alt: '矽谷牛 — 技術分享' },
  { src: '/lego/images/yep.jpg', alt: '矽谷牛 — 大會演講' },
  { src: '/lego/images/yep.jpg', alt: '矽谷牛 — 社群活動' },
  { src: '/lego/images/yep.jpg', alt: '矽谷牛 — Grafana Meetup' },
  { src: '/lego/images/yep.jpg', alt: '矽谷牛 — KCD Taiwan' },
  { src: '/lego/images/yep.jpg', alt: '矽谷牛 — 工作日常' },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function SocialBadge({ label, href, icon }: { label: string; href: string; icon: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="about-social-badge">
      <span className="about-social-icon">{icon}</span>
      <span>{label}</span>
    </a>
  );
}

function TalkCard({ talk }: { talk: TalkItem }) {
  return (
    <div className={`about-talk-card${talk.upcoming ? ' about-talk-card--upcoming' : ''}`}>
      <div className="about-talk-header">
        <span className="about-talk-year">{talk.year}</span>
        {talk.upcoming && <span className="about-talk-badge-upcoming">即將到來</span>}
      </div>
      <div className="about-talk-event">{talk.event}</div>
      <div className="about-talk-topic">{talk.topic}</div>
      {talk.rating && <div className="about-talk-rating">{talk.rating}</div>}
      {talk.review && <div className="about-talk-review">「{talk.review}」</div>}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad">
            <div className="section-eyebrow">About</div>

            {/* ── Hero ── */}
            <div className="about-hero">
              <div className="about-hero-photo-wrap">
                <Image
                  src="/lego/images/yep.jpg"
                  alt="矽谷牛 邱宏瑋"
                  width={300}
                  height={300}
                  className="about-hero-photo"
                  priority
                />
              </div>
              <div className="about-hero-info">
                <h1 className="about-hero-name">矽谷牛</h1>
                <p className="about-hero-alias">邱宏瑋 · Hung-Wei Chiu</p>
                <p className="about-hero-tagline">
                  DevOps 佈道師 · Kubernetes Expert · Grafana Ambassador
                </p>
                <p className="about-hero-bio">
                  專注於雲端原生（Cloud Native）、可觀測性（Observability）與 GitOps
                  技術領域，長期在台灣開源社群分享實務經驗。
                  曾獲 iThome 鐵人賽多次殊榮，活躍於 COSCUP、DevOpsDays、KCD Taiwan 等各大技術論壇，
                  是台灣最具影響力的 Grafana 技術佈道師之一。
                </p>
                <div className="about-social-row">
                  {SOCIAL_LINKS.map((s) => (
                    <SocialBadge key={s.label} {...s} />
                  ))}
                </div>
              </div>
            </div>

            {/* ── Stats row ── */}
            <div className="about-stats-row">
              {[
                { value: '50+', label: '場技術演講' },
                { value: '200+', label: '篇技術文章' },
                { value: '10K+', label: 'Medium 追蹤者' },
                { value: '5', label: 'iThome 鐵人賽獎項' },
              ].map((s) => (
                <div key={s.label} className="about-stat-card">
                  <div className="about-stat-value">{s.value}</div>
                  <div className="about-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── IG Photo Gallery ── */}
            <div className="about-section-heading">
              <span className="about-section-eyebrow">Instagram Gallery</span>
              <h2 className="about-section-title">精選照片</h2>
            </div>
            <div className="about-gallery-grid">
              {GALLERY_PHOTOS.map((p, i) => (
                <div key={i} className="about-gallery-item">
                  <Image src={p.src} alt={p.alt} width={400} height={400} className="about-gallery-img" />
                  <div className="about-gallery-overlay">
                    <span className="about-gallery-label">{p.alt}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Past Talks ── */}
            <div className="about-section-heading" style={{ marginTop: '2.5rem' }}>
              <span className="about-section-eyebrow">Conference History</span>
              <h2 className="about-section-title">歷年論壇演講紀錄</h2>
            </div>
            <div className="about-talks-grid">
              {PAST_TALKS.map((t, i) => (
                <TalkCard key={i} talk={t} />
              ))}
            </div>

            {/* ── Upcoming ── */}
            <div className="about-section-heading" style={{ marginTop: '2.5rem' }}>
              <span className="about-section-eyebrow">Upcoming Events</span>
              <h2 className="about-section-title">即將到來的演講</h2>
            </div>
            <div className="about-talks-grid">
              {UPCOMING_TALKS.map((t, i) => (
                <TalkCard key={i} talk={t} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
