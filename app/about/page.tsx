'use client';

import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';

// ── Feature sections data ──────────────────────────────────────────────────────

const FEATURES = [
  {
    eyebrow: 'Company Intelligence',
    title: { zh: '公司深度分析', en: 'In-depth Company Analysis' },
    desc: {
      zh: '整合 S&P 500 上市公司的財務數據、產業分類、同業比較與 AI 摘要，讓投資人一鍵掌握企業全貌，快速評估投資價值。',
      en: 'Integrates financial data, industry classification, peer comparison, and AI summaries for S&P 500 companies, enabling investors to quickly grasp the full picture and evaluate investment value.',
    },
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    imgAlt: { zh: '財務分析儀表板', en: 'Financial Analysis Dashboard' },
    reverse: false,
  },
  {
    eyebrow: 'Supply Chain Maps',
    title: { zh: '供應鏈關係圖譜', en: 'Supply Chain Network Maps' },
    desc: {
      zh: '以互動式視覺化圖譜呈現 T Company 等龍頭企業的多層供應商網絡，支援 Tier 1 / Tier 2 關係追蹤、地緣風險標記與即時供應鏈新聞整合。',
      en: 'Visualizes multi-tier supplier networks of leading companies like T Company with interactive maps, supporting Tier 1/Tier 2 tracking, geopolitical risk markers, and real-time supply chain news.',
    },
    img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
    imgAlt: { zh: '供應鏈網絡圖', en: 'Supply Chain Network Graph' },
    reverse: true,
  },
  {
    eyebrow: 'Market News & Events',
    title: { zh: '市場資訊整合', en: 'Market Intelligence Hub' },
    desc: {
      zh: '涵蓋全球財經新聞、法說會行事曆與產業動態，透過智慧篩選與標籤系統，幫助分析師精準捕捉市場關鍵訊號。',
      en: 'Covers global financial news, earnings calendars, and industry updates. Smart filtering and tagging help analysts pinpoint critical market signals.',
    },
    img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
    imgAlt: { zh: '市場新聞儀表板', en: 'Market News Dashboard' },
    reverse: false,
  },
  {
    eyebrow: 'Watchlist & Portfolio',
    title: { zh: '自訂監控清單', en: 'Custom Watchlists' },
    desc: {
      zh: '建立個人化觀察名單，追蹤重點持股的即時動態、財報發布時程與社群輿情，打造屬於自己的智慧投資雷達。',
      en: 'Build personalized watchlists to track real-time movements, earnings schedules, and sentiment for your key holdings — your own intelligent investment radar.',
    },
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    imgAlt: { zh: '投資組合監控', en: 'Portfolio Monitoring' },
    reverse: true,
  },
];

const STATS = [
  { value: '500+', label: { zh: '上市公司數據', en: 'Listed Companies' } },
  { value: '3', label: { zh: '供應鏈層級覆蓋', en: 'Supply Chain Tiers' } },
  { value: 'Live', label: { zh: '市場新聞整合', en: 'Market News' } },
  { value: 'AI', label: { zh: '智慧分析摘要', en: 'AI-Powered Insights' } },
];

const PILLARS = [
  {
    icon: '🔍',
    title: { zh: '深度研究', en: 'Deep Research' },
    desc: {
      zh: '結合公開財務數據與 AI 分析引擎，提供超越傳統資料庫的企業洞察深度。',
      en: 'Combining public financial data with AI analytics to deliver company insights that go beyond traditional databases.',
    },
  },
  {
    icon: '🌐',
    title: { zh: '供應鏈可視化', en: 'Supply Chain Visibility' },
    desc: {
      zh: '獨家多層供應商圖譜，讓隱藏的產業鏈關係一目了然，提前發現風險與機會。',
      en: 'Exclusive multi-tier supplier maps that make hidden supply chain relationships visible, helping you identify risks and opportunities early.',
    },
  },
  {
    icon: '⚡',
    title: { zh: '即時情報', en: 'Real-time Intelligence' },
    desc: {
      zh: '整合全球財經媒體與事件行事曆，確保分析師永遠掌握最新市場動態。',
      en: 'Integrates global financial media and event calendars so analysts always stay on top of the latest market developments.',
    },
  },
  {
    icon: '🎯',
    title: { zh: '精準篩選', en: 'Precision Filtering' },
    desc: {
      zh: '多維度篩選與自訂監控清單，讓每位使用者打造最符合自身需求的情報流。',
      en: 'Multi-dimensional filtering and customizable watchlists let every user build an intelligence feed tailored to their needs.',
    },
  },
];

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const { lang } = useLanguage();
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
                <h1 className="about-site-hero-title">
                  {lang === 'zh' ? <>下一代半導體<br />產業情報平台</> : <>Next-Gen Semiconductor<br />Intelligence Platform</>}
                </h1>
                <p className="about-site-hero-sub">
                  {lang === 'zh'
                    ? '整合公司財務分析、供應鏈圖譜、市場新聞與 AI 洞察，為半導體與科技產業分析師打造的一站式智慧研究工具。'
                    : 'An all-in-one intelligent research tool for semiconductor and tech industry analysts — integrating company financials, supply chain maps, market news, and AI insights.'}
                </p>
                <div className="about-site-hero-cta-row">
                  <Link href="/company-profile" className="about-site-btn about-site-btn--primary">
                    {lang === 'zh' ? '開始探索' : 'Start Exploring'}
                  </Link>
                  <Link href="/supply-chain-maps" className="about-site-btn about-site-btn--ghost">
                    {lang === 'zh' ? '查看供應鏈圖譜' : 'View Supply Chain Maps'}
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Stats strip ── */}
            <div className="about-site-stats-strip">
              {STATS.map((s) => (
                <div key={s.label.en} className="about-site-stat-item">
                  <span className="about-site-stat-value">{s.value}</span>
                  <span className="about-site-stat-label">{s.label[lang]}</span>
                </div>
              ))}
            </div>

            {/* ── Feature sections ── */}
            <div className="about-site-features">
              {FEATURES.map((f) => (
                <div key={f.eyebrow} className={`about-site-feature${f.reverse ? ' about-site-feature--rev' : ''}`}>
                  <div className="about-site-feature-img-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.img}
                      alt={f.imgAlt[lang]}
                      className="about-site-feature-img"
                    />
                  </div>
                  <div className="about-site-feature-body">
                    <span className="about-site-feature-eyebrow">{f.eyebrow}</span>
                    <h2 className="about-site-feature-title">{f.title[lang]}</h2>
                    <p className="about-site-feature-desc">{f.desc[lang]}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Value pillars ── */}
            <div className="about-site-pillars-section">
              <div className="about-site-section-head">
                <span className="about-site-feature-eyebrow">{lang === 'zh' ? '核心價值' : 'Core Values'}</span>
                <h2 className="about-site-section-title">{lang === 'zh' ? '為什麼選擇 tMIC？' : 'Why tMIC?'}</h2>
              </div>
              <div className="about-site-pillars-grid">
                {PILLARS.map((p) => (
                  <div key={p.title.en} className="about-site-pillar-card">
                    <div className="about-site-pillar-icon">{p.icon}</div>
                    <div className="about-site-pillar-title">{p.title[lang]}</div>
                    <div className="about-site-pillar-desc">{p.desc[lang]}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CTA footer ── */}
            <div className="about-site-cta-section">
              <h2 className="about-site-cta-title">
                {lang === 'zh' ? '立即開始您的產業研究之旅' : 'Start Your Industry Research Journey'}
              </h2>
              <p className="about-site-cta-sub">
                {lang === 'zh'
                  ? '探索超過 500 家上市公司的深度數據與供應鏈洞察'
                  : 'Explore in-depth data and supply chain insights for 500+ listed companies'}
              </p>
              <Link href="/company-profile" className="about-site-btn about-site-btn--primary">
                {lang === 'zh' ? '前往公司分析' : 'Go to Company Analysis'}
              </Link>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
