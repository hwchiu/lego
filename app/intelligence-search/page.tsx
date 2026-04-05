'use client';

import Link from 'next/link';
import Image from 'next/image';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';

// ── Capability icons (14×14 viewBox, flat minimal style) ──────────────────────

function AiIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width="40" height="40" aria-hidden="true">
      <rect x="8" y="12" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 20h12M14 24h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M20 10.5V12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SemanticIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width="40" height="40" aria-hidden="true">
      <circle cx="20" cy="20" r="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="14" r="3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="31" cy="14" r="3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="9" cy="28" r="3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="31" cy="28" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 15.5L15.5 18M24.5 18L28 15.5M12 26.5L15.5 23M24.5 23L28 26.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CrossRefIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width="40" height="40" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="22" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="6" y="22" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="22" y="22" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M18 12H22M12 18V22M28 18V22M18 28H22"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width="40" height="40" aria-hidden="true">
      <path
        d="M6 30L14 20L20 25L28 13L34 17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 10H34V16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SummaryIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width="40" height="40" aria-hidden="true">
      <rect x="8" y="8" width="24" height="26" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M13 15h14M13 20h14M13 25h10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="30" cy="30" r="5" fill="var(--c-bg)" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M27.5 30h5M30 27.5v5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" width="40" height="40" aria-hidden="true">
      <path
        d="M20 8C14.477 8 10 12.477 10 18V26L7 29H33L30 26V18C30 12.477 25.523 8 20 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M17 29C17 30.657 18.343 32 20 32C21.657 32 23 30.657 23 29"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M20 13V19M20 21V23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────────

const CAPABILITIES = [
  {
    icon: <AiIcon />,
    color: '#6366f1',
    eyebrow: 'Natural Language Query',
    title: { zh: '自然語言查詢', en: 'Ask in Plain English' },
    desc: {
      zh: '用日常語言直接提問，例如「TSMC 最近的供應鏈風險有哪些？」，AI 自動解析意圖並從海量資料中精準回答。',
      en: 'Ask questions in plain language — e.g., "What are the recent supply chain risks for TSMC?" — and the AI parses your intent to deliver precise answers from massive datasets.',
    },
  },
  {
    icon: <SemanticIcon />,
    color: '#0ea5e9',
    eyebrow: 'Semantic Search',
    title: { zh: '語義搜索引擎', en: 'Semantic Search Engine' },
    desc: {
      zh: '超越關鍵字比對，以語義向量技術理解問題的深層含義，找出真正相關的文章、報告與數據，即使措辭完全不同。',
      en: 'Goes beyond keyword matching. Semantic vector technology understands the deeper meaning of your query to surface truly relevant articles, reports, and data — even when the wording differs.',
    },
  },
  {
    icon: <CrossRefIcon />,
    color: '#10b981',
    eyebrow: 'Cross-Source Synthesis',
    title: { zh: '跨來源整合分析', en: 'Cross-Source Synthesis' },
    desc: {
      zh: '自動整合新聞、法說會記錄、財務數據與供應鏈地圖，在單一回答中呈現多維度的完整企業洞察。',
      en: 'Automatically synthesizes news, earnings call transcripts, financial data, and supply chain maps to deliver a multi-dimensional, complete company insight in a single answer.',
    },
  },
  {
    icon: <TrendIcon />,
    color: '#f59e0b',
    eyebrow: 'Trend Detection',
    title: { zh: '趨勢偵測與預警', en: 'Trend Detection & Signals' },
    desc: {
      zh: '持續監測多家公司與產業的數據變化，主動識別異常訊號與新興趨勢，讓分析師搶先掌握市場動向。',
      en: 'Continuously monitors data shifts across companies and industries, proactively identifying anomalies and emerging trends so analysts can get ahead of market moves.',
    },
  },
  {
    icon: <SummaryIcon />,
    color: '#8b5cf6',
    eyebrow: 'AI-Generated Summaries',
    title: { zh: 'AI 自動摘要', en: 'AI-Generated Summaries' },
    desc: {
      zh: '搜尋結果不只是列出連結，而是由 GPT 驅動的摘要引擎，自動生成結構化重點摘要，節省大量閱讀時間。',
      en: 'Search results go beyond links — a GPT-powered summary engine automatically generates structured key takeaways, saving hours of reading time.',
    },
  },
  {
    icon: <AlertIcon />,
    color: '#ef4444',
    eyebrow: 'Smart Alerts',
    title: { zh: '智慧提醒訂閱', en: 'Smart Alerts & Subscriptions' },
    desc: {
      zh: '設定關鍵字、公司或主題訂閱，當相關新訊號出現時即時通知，打造個人化的智慧情報流。',
      en: 'Subscribe to keywords, companies, or topics and receive instant notifications when new signals emerge — building a personalized, intelligent information feed.',
    },
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: { zh: '輸入您的問題', en: 'Enter Your Query' },
    desc: {
      zh: '用自然語言提問，不需要記憶特定關鍵字格式',
      en: 'Ask in plain language — no special keyword formats required',
    },
  },
  {
    step: '02',
    title: { zh: 'AI 理解語義', en: 'AI Understands Intent' },
    desc: {
      zh: 'GPT 模型解析意圖，向量引擎找出語義最相近的資料',
      en: 'GPT interprets your intent; vector engine retrieves semantically closest data',
    },
  },
  {
    step: '03',
    title: { zh: '跨資料庫整合', en: 'Cross-Database Synthesis' },
    desc: {
      zh: '自動整合新聞、財務報表、供應鏈與研究報告',
      en: 'Automatically consolidates news, financials, supply chain, and research reports',
    },
  },
  {
    step: '04',
    title: { zh: '呈現智慧洞察', en: 'Deliver Smart Insights' },
    desc: {
      zh: '生成結構化摘要答案，附帶原始資料引用與信心指標',
      en: 'Generates a structured summary with source citations and confidence indicators',
    },
  },
];

// ── Page ───────────────────────────────────────────────────────────────────────

export default function IntelligenceSearchPage() {
  const { lang } = useLanguage();
  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="is-page-wrap">

            {/* ── Hero ── */}
            <div className="is-hero">
              <div className="is-hero-overlay" />
              <div className="is-hero-content">
                <div className="is-hero-badge-row">
                  <span className="is-hero-coming-badge">
                    <svg viewBox="0 0 14 14" fill="none" width="11" height="11" aria-hidden="true">
                      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
                      <path d="M7 4.5V7.5L9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {lang === 'zh' ? '即將推出' : 'Coming Soon'}
                  </span>
                  <span className="is-hero-ai-badge">Powered by GPT</span>
                </div>
                <h1 className="is-hero-title">
                  Intelligence<br />Search
                </h1>
                <p className="is-hero-sub">
                  {lang === 'zh'
                    ? '結合 OpenAI 大型語言模型，打造半導體產業的 AI 搜尋入口——用自然語言提問，即時整合公司財務、供應鏈、新聞與研究報告，一次獲得深度智慧洞察。'
                    : 'Powered by OpenAI large language models — the AI search gateway for the semiconductor industry. Ask in plain language and instantly synthesize company financials, supply chains, news, and research reports into deep, actionable insights.'}
                </p>

                {/* Mock search bar */}
                <div className="is-mock-search">
                  <svg viewBox="0 0 20 20" fill="none" width="18" height="18" aria-hidden="true" className="is-mock-search-icon">
                    <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <span className="is-mock-search-placeholder">
                    {lang === 'zh' ? 'TSMC 近期的供應鏈風險有哪些？' : "What are TSMC's recent supply chain risks?"}
                  </span>
                  <span className="is-mock-search-cursor" aria-hidden="true" />
                </div>
              </div>
              <div className="is-hero-img-wrap">
                <Image
                  src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=900&q=80"
                  alt={lang === 'zh' ? 'AI 搜尋技術視覺化' : 'AI Search Technology Visualization'}
                  width={900}
                  height={560}
                  className="is-hero-img"
                  unoptimized
                  priority
                />
              </div>
            </div>

            {/* ── Capabilities grid ── */}
            <div className="is-section">
              <div className="is-section-head">
                <span className="section-eyebrow">Core Capabilities</span>
                <h2 className="is-section-title">
                  {lang === 'zh' ? 'AI 搜尋能做什麼？' : 'What Can AI Search Do?'}
                </h2>
                <p className="is-section-sub">
                  {lang === 'zh'
                    ? '六大核心能力，重新定義產業情報搜尋的深度與效率'
                    : 'Six core capabilities that redefine the depth and efficiency of industry intelligence search'}
                </p>
              </div>
              <div className="is-capabilities-grid">
                {CAPABILITIES.map((cap) => (
                  <div key={cap.eyebrow} className="is-cap-card">
                    <div className="is-cap-card-icon" style={{ color: cap.color }}>
                      {cap.icon}
                    </div>
                    <div className="is-cap-card-eyebrow" style={{ color: cap.color }}>
                      {cap.eyebrow}
                    </div>
                    <div className="is-cap-card-title">{cap.title[lang]}</div>
                    <div className="is-cap-card-desc">{cap.desc[lang]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── How it works ── */}
            <div className="is-howitworks-section">
              <div className="is-howitworks-inner">
                <div className="is-section-head is-section-head--light">
                  <span className="is-eyebrow-light">How It Works</span>
                  <h2 className="is-section-title is-section-title--light">
                    {lang === 'zh' ? '四步驟獲取智慧洞察' : 'Four Steps to Smart Insights'}
                  </h2>
                </div>
                <div className="is-steps-row">
                  {HOW_IT_WORKS.map((step, idx) => (
                    <div key={step.step} className="is-step">
                      <div className="is-step-num">{step.step}</div>
                      <div className="is-step-title">{step.title[lang]}</div>
                      <div className="is-step-desc">{step.desc[lang]}</div>
                      {idx < HOW_IT_WORKS.length - 1 && (
                        <div className="is-step-arrow" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Preview image section ── */}
            <div className="is-preview-section">
              <div className="is-section-head">
                <span className="section-eyebrow">Interface Preview</span>
                <h2 className="is-section-title">
                  {lang === 'zh' ? '直觀的搜尋介面設計' : 'Intuitive Search Interface'}
                </h2>
                <p className="is-section-sub">
                  {lang === 'zh'
                    ? '簡潔、快速、專業——為分析師設計的 AI 搜尋體驗'
                    : 'Clean, fast, and professional — an AI search experience built for analysts'}
                </p>
              </div>
              <div className="is-preview-img-wrap">
                <Image
                  src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80"
                  alt={lang === 'zh' ? 'AI 搜尋介面預覽' : 'AI Search Interface Preview'}
                  width={1200}
                  height={600}
                  className="is-preview-img"
                  unoptimized
                />
                <div className="is-preview-overlay">
                  <span className="is-preview-badge">
                    {lang === 'zh' ? '設計中' : 'In Design'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── CTA / Coming soon banner ── */}
            <div className="is-cta-section">
              <div className="is-cta-inner">
                <div className="is-cta-icon" aria-hidden="true">
                  <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.4" />
                    <circle cx="21" cy="21" r="9" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M27.5 27.5L36 36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M18 21h6M21 18v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 className="is-cta-title">
                  {lang === 'zh' ? '智慧搜尋，即將到來' : 'Intelligence Search, Coming Soon'}
                </h2>
                <p className="is-cta-sub">
                  {lang === 'zh'
                    ? '我們正在積極整合 OpenAI 技術，打造專屬半導體產業的 AI 搜尋引擎。敬請期待正式上線。'
                    : "We're actively integrating OpenAI technology to build an AI search engine purpose-built for the semiconductor industry. Stay tuned for the official launch."}
                </p>
                <div className="is-cta-btn-row">
                  <Link href="/data-explore" className="is-cta-btn is-cta-btn--primary">
                    {lang === 'zh' ? '先探索 Data Explore' : 'Explore Data Now'}
                  </Link>
                  <Link href="/about" className="is-cta-btn is-cta-btn--ghost">
                    {lang === 'zh' ? '了解 tMIC 平台' : 'Learn About tMIC'}
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
