'use client';

import Image from 'next/image';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';

// ── Feature sections data ──────────────────────────────────────────────────────

const FEATURES = [
  {
    eyebrow: 'Company Intelligence',
    title: '公司深度分析',
    desc: '整合 S&P 500 上市公司的財務數據、產業分類、同業比較與 AI 摘要，讓投資人一鍵掌握企業全貌，快速評估投資價值。',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    imgAlt: '財務分析儀表板',
    reverse: false,
  },
  {
    eyebrow: 'Supply Chain Maps',
    title: '供應鏈關係圖譜',
    desc: '以互動式視覺化圖譜呈現 TSMC 等龍頭企業的多層供應商網絡，支援 Tier 1 / Tier 2 關係追蹤、地緣風險標記與即時供應鏈新聞整合。',
    img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    imgAlt: '供應鏈網絡圖',
    reverse: true,
  },
  {
    eyebrow: 'Market News & Events',
    title: '市場資訊整合',
    desc: '涵蓋全球財經新聞、法說會行事曆與產業動態，透過智慧篩選與標籤系統，幫助分析師精準捕捉市場關鍵訊號。',
    img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
    imgAlt: '市場新聞儀表板',
    reverse: false,
  },
  {
    eyebrow: 'Watchlist & Portfolio',
    title: '自訂監控清單',
    desc: '建立個人化觀察名單，追蹤重點持股的即時動態、財報發布時程與社群輿情，打造屬於自己的智慧投資雷達。',
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    imgAlt: '投資組合監控',
    reverse: true,
  },
];

const STATS = [
  { value: '500+', label: '上市公司數據' },
  { value: '3層', label: '供應鏈層級覆蓋' },
  { value: '即時', label: '市場新聞整合' },
  { value: 'AI', label: '智慧分析摘要' },
];

const PILLARS = [
  {
    icon: '🔍',
    title: '深度研究',
    desc: '結合公開財務數據與 AI 分析引擎，提供超越傳統資料庫的企業洞察深度。',
  },
  {
    icon: '🌐',
    title: '供應鏈可視化',
    desc: '獨家多層供應商圖譜，讓隱藏的產業鏈關係一目了然，提前發現風險與機會。',
  },
  {
    icon: '⚡',
    title: '即時情報',
    desc: '整合全球財經媒體與事件行事曆，確保分析師永遠掌握最新市場動態。',
  },
  {
    icon: '🎯',
    title: '精準篩選',
    desc: '多維度篩選與自訂監控清單，讓每位使用者打造最符合自身需求的情報流。',
  },
];

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="about-site-wrap">

            {/* ── Hero Banner ── */}
            <div className="about-site-hero">
              <div className="about-site-hero-overlay" />
              <div className="about-site-hero-content">
                <div className="about-site-eyebrow">tMIC · Market Intelligence Center</div>
                <h1 className="about-site-hero-title">下一代半導體<br />產業情報平台</h1>
                <p className="about-site-hero-sub">
                  整合公司財務分析、供應鏈圖譜、市場新聞與 AI 洞察，
                  為半導體與科技產業分析師打造的一站式智慧研究工具。
                </p>
                <div className="about-site-hero-cta-row">
                  <a href="/company-profile" className="about-site-btn about-site-btn--primary">開始探索</a>
                  <a href="/supply-chain-maps" className="about-site-btn about-site-btn--ghost">查看供應鏈圖譜</a>
                </div>
              </div>
            </div>

            {/* ── Stats strip ── */}
            <div className="about-site-stats-strip">
              {STATS.map((s) => (
                <div key={s.label} className="about-site-stat-item">
                  <span className="about-site-stat-value">{s.value}</span>
                  <span className="about-site-stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* ── Feature sections ── */}
            <div className="about-site-features">
              {FEATURES.map((f) => (
                <div key={f.eyebrow} className={`about-site-feature${f.reverse ? ' about-site-feature--rev' : ''}`}>
                  <div className="about-site-feature-img-wrap">
                    <Image
                      src={f.img}
                      alt={f.imgAlt}
                      width={800}
                      height={560}
                      className="about-site-feature-img"
                      unoptimized
                    />
                  </div>
                  <div className="about-site-feature-body">
                    <span className="about-site-feature-eyebrow">{f.eyebrow}</span>
                    <h2 className="about-site-feature-title">{f.title}</h2>
                    <p className="about-site-feature-desc">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Value pillars ── */}
            <div className="about-site-pillars-section">
              <div className="about-site-section-head">
                <span className="about-site-feature-eyebrow">核心價值</span>
                <h2 className="about-site-section-title">為什麼選擇 tMIC？</h2>
              </div>
              <div className="about-site-pillars-grid">
                {PILLARS.map((p) => (
                  <div key={p.title} className="about-site-pillar-card">
                    <div className="about-site-pillar-icon">{p.icon}</div>
                    <div className="about-site-pillar-title">{p.title}</div>
                    <div className="about-site-pillar-desc">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CTA footer ── */}
            <div className="about-site-cta-section">
              <h2 className="about-site-cta-title">立即開始您的產業研究之旅</h2>
              <p className="about-site-cta-sub">探索超過 500 家上市公司的深度數據與供應鏈洞察</p>
              <a href="/company-profile" className="about-site-btn about-site-btn--primary">前往公司分析</a>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}

/* ── Original About page (preserved for reference) ────────────────────────────
import Image from 'next/image';

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
  { year: '2024', event: 'KCD Taiwan (Kubernetes Community Days)', topic: 'Observability at Scale — Grafana LGTM Stack in Production', rating: '⭐⭐⭐⭐⭐', review: '深入淺出，實務案例豐富，聽眾反應熱烈' },
  { year: '2024', event: 'DevOpsDays Taipei', topic: 'GitOps + ArgoCD 實戰導入心得', rating: '⭐⭐⭐⭐⭐', review: '矽谷牛的分享一貫保持高水準，結合實際踩坑經驗非常有參考價值' },
  { year: '2023', event: 'COSCUP 開源人年會', topic: 'Cilium eBPF CNI Deep Dive', rating: '⭐⭐⭐⭐⭐', review: '對 eBPF 與 Kubernetes 網路的深入解析，少見的深度技術分享' },
  { year: '2023', event: 'Cloud Native Taiwan User Group', topic: 'Kubernetes Security Best Practices', rating: '⭐⭐⭐⭐', review: '實用的安全建議搭配案例，對 DevSecOps 推廣很有幫助' },
  { year: '2023', event: 'Grafana & Friends Taipei Meetup', topic: 'Building Unified Observability with Grafana Cloud', rating: '⭐⭐⭐⭐⭐', review: 'Grafana 社群好評，詳細講解 Metrics / Logs / Traces 三位一體的觀測架構' },
  { year: '2022', event: 'iThome 鐵人賽 — 30 天系列文', topic: 'Kubernetes × DevOps — 從零到生產環境', rating: '⭐⭐⭐⭐⭐', review: '超過 30 篇深度技術文章，鐵人賽冠軍級作品，讀者回饋極佳' },
];

const UPCOMING_TALKS: TalkItem[] = [
  { year: '2025 Q2', event: 'GrafanaCON 2025', topic: 'From Prometheus to Mimir: Scaling Metrics at Enterprise', upcoming: true },
  { year: '2025 Q2', event: 'KCD Taiwan 2025', topic: 'Grafana Alloy — The Next-Generation Telemetry Collector', upcoming: true },
  { year: '2025 Q3', event: 'DevOpsDays Taipei 2025', topic: 'Platform Engineering with Grafana IRM', upcoming: true },
];

const GALLERY_PHOTOS = [
  { src: '/lego/images/hwchiu.jpg', alt: '矽谷牛 — 個人頭像' },
  { src: '/lego/images/hwchiu_avatar2.jpg', alt: '矽谷牛 — 社群活動' },
  { src: '/lego/images/hwchiu_blog_avatar.jpg', alt: '矽谷牛 — 講師形象照' },
  { src: '/lego/images/yep.jpg', alt: '矽谷牛 — 生活日常' },
  { src: 'https://github.com/user-attachments/assets/414f949e-3fdf-4ee5-9197-eb1f4be10bfb', alt: '矽谷牛 — LinkedIn 形象照' },
  { src: 'https://github.com/user-attachments/assets/f46651f5-481c-440b-a4de-4948aa90e804', alt: '矽谷牛 — 大會演講' },
];

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

export default function AboutPageOriginal() {
  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad">
            <div className="section-eyebrow">About</div>
            <div className="about-hero">
              <div className="about-hero-photo-wrap">
                <Image src="/lego/images/hwchiu.jpg" alt="矽谷牛 邱宏瑋" width={300} height={300} className="about-hero-photo" priority />
              </div>
              <div className="about-hero-info">
                <h1 className="about-hero-name">矽谷牛</h1>
                <p className="about-hero-alias">邱宏瑋 · Hung-Wei Chiu</p>
                <p className="about-hero-tagline">DevOps 佈道師 · Kubernetes Expert · Grafana Ambassador</p>
                <p className="about-hero-bio">專注於雲端原生（Cloud Native）、可觀測性（Observability）與 GitOps 技術領域，長期在台灣開源社群分享實務經驗。曾獲 iThome 鐵人賽多次殊榮，活躍於 COSCUP、DevOpsDays、KCD Taiwan 等各大技術論壇，是台灣最具影響力的 Grafana 技術佈道師之一。</p>
                <div className="about-social-row">{SOCIAL_LINKS.map((s) => (<SocialBadge key={s.label} {...s} />))}</div>
              </div>
            </div>
            <div className="about-stats-row">
              {[{ value: '50+', label: '場技術演講' }, { value: '200+', label: '篇技術文章' }, { value: '10K+', label: 'Medium 追蹤者' }, { value: '5', label: 'iThome 鐵人賽獎項' }].map((s) => (
                <div key={s.label} className="about-stat-card"><div className="about-stat-value">{s.value}</div><div className="about-stat-label">{s.label}</div></div>
              ))}
            </div>
            <div className="about-section-heading"><span className="about-section-eyebrow">Instagram Gallery</span><h2 className="about-section-title">精選照片</h2></div>
            <div className="about-gallery-grid">{GALLERY_PHOTOS.map((p, i) => (<div key={i} className="about-gallery-item"><Image src={p.src} alt={p.alt} width={400} height={400} className="about-gallery-img" /><div className="about-gallery-overlay"><span className="about-gallery-label">{p.alt}</span></div></div>))}</div>
            <div className="about-section-heading" style={{ marginTop: '2.5rem' }}><span className="about-section-eyebrow">Featured Video</span><h2 className="about-section-title">精選影片</h2></div>
            <div className="about-video-wrap"><iframe src="https://www.youtube.com/embed/57Tl5Lg_wpM" title="邱宏瑋 Hung-Wei Chiu｜面對大規模 Kubernetes 叢集：挑戰與機遇並存" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
            <div className="about-section-heading" style={{ marginTop: '2.5rem' }}><span className="about-section-eyebrow">Conference History</span><h2 className="about-section-title">歷年論壇演講紀錄</h2></div>
            <div className="about-talks-grid">{PAST_TALKS.map((t, i) => (<TalkCard key={i} talk={t} />))}</div>
            <div className="about-section-heading" style={{ marginTop: '2.5rem' }}><span className="about-section-eyebrow">Upcoming Events</span><h2 className="about-section-title">即將到來的演講</h2></div>
            <div className="about-talks-grid">{UPCOMING_TALKS.map((t, i) => (<TalkCard key={i} talk={t} />))}</div>
          </div>
        </main>
      </div>
    </>
  );
}
── End of original About page ─────────────────────────────────────────────── */
