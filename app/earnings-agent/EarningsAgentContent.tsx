'use client';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL ?? 'https://lego2.hwchiu.com/earnings-api';

// ---- Mirror of EarningsApiResponse from agent ----
interface MetricValue {
  value: number; unit: 'B' | '%' | 'days';
  qoq: number | null; yoy: number | null; confidence: number;
}
interface EarningsMetrics {
  revenue: MetricValue | null; grossMargin: MetricValue | null; doi: MetricValue | null;
}
interface TranscriptSummary {
  highlights: string[]; risks: string[]; outlook: string; keyQuotes: string[];
}
interface JobRecord {
  jobId: string; startTime: string; endTime: string;
  status: 'success' | 'partial' | 'failed' | 'skipped';
  metricsConfidence: number | null; metricsExtracted: boolean;
  error: string | null; note: string | null;
}
interface AgentData {
  status: 'WAITING' | 'LIVE' | 'DONE';
  eventDate: string; lastUpdated: string;
  metrics: EarningsMetrics | null;
  metricsConfidence: number | null; metricsUpdatedAt: string | null;
  transcriptStatus: 'pending' | 'available' | 'unavailable';
  transcript: string | null; transcriptSummary: TranscriptSummary | null;
  transcriptRawFetchedAt: string | null; transcriptSummaryUpdatedAt: string | null;
  jobHistory: JobRecord[];
}

// ---- i18n ----
const L = {
  title:              { zh: '財報監控',            en: 'Earnings Monitor' },
  loading:            { zh: '載入中…',              en: 'Loading…' },
  agentOffline:       { zh: 'Agent 離線',           en: 'Agent offline' },
  waiting:            { zh: '等待中',               en: 'WAITING' },
  live:               { zh: '直播中',               en: 'LIVE' },
  done:               { zh: '完成',                 en: 'DONE' },
  eventDate:          { zh: '財報日期',              en: 'Event Date' },
  lastUpdated:        { zh: '最後更新',              en: 'Last Updated' },
  countdown:          { zh: '距財報發布',            en: 'Time until earnings' },
  revenue:            { zh: '營收',                 en: 'Revenue' },
  grossMargin:        { zh: '毛利率',                en: 'Gross Margin' },
  doi:                { zh: '庫存天數',              en: 'Days of Inventory' },
  confidence:         { zh: '信心度',               en: 'confidence' },
  overallConf:        { zh: '整體信心度',            en: 'Overall Confidence' },
  awaitingFirst:      { zh: '等待第一次提取…',        en: 'Awaiting first extraction…' },
  transcriptTitle:    { zh: '法說會摘要',            en: 'Transcript Summary' },
  transcriptUnavail:  { zh: '無法取得法說會逐字稿',   en: 'Transcript unavailable' },
  generating:         { zh: '正在生成摘要…',          en: 'Generating summary…' },
  highlights:         { zh: '重點',                 en: 'Highlights' },
  risks:              { zh: '風險',                 en: 'Risks' },
  outlook:            { zh: '展望',                 en: 'Outlook' },
  keyQuotes:          { zh: '關鍵引述',              en: 'Key Quotes' },
  jobHistory:         { zh: '執行紀錄',              en: 'Job History' },
  jobId:              { zh: '任務 ID',               en: 'Job ID' },
  startTime:          { zh: '開始時間',              en: 'Start Time' },
  endTime:            { zh: '結束時間',              en: 'End Time' },
  duration:           { zh: '耗時',                 en: 'Duration' },
  statusLabel:        { zh: '狀態',                 en: 'Status' },
  noteLabel:          { zh: '備註',                 en: 'Note' },
  qoq:                { zh: 'QoQ',                 en: 'QoQ' },
  yoy:                { zh: 'YoY',                 en: 'YoY' },
  na:                 { zh: 'N/A',                 en: 'N/A' },
  archTitle:          { zh: '系統架構',              en: 'System Architecture' },
  archDesc:           { zh: '流程圖：Agent 如何從 Dell IR 抓取財報並透過 Claude AI 分析',
                        en: 'Flow: How the agent fetches Dell earnings and analyzes with Claude AI' },
} as const;

type Lang = 'zh' | 'en';
type LKey = keyof typeof L;
function t(key: LKey, lang: Lang): string { return L[key][lang]; }

function fmtDelta(val: number | null, suffix: string, lang: Lang): string {
  if (val === null) return t('na', lang);
  const sign = val >= 0 ? '▲' : '▼';
  return `${sign}${Math.abs(val)}${suffix}`;
}

function fmtDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return `${Math.round(ms / 1000)}s`;
}

function fmtLocale(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleString(lang === 'en' ? 'en-US' : 'zh-TW');
}

function fmtTime(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleTimeString(lang === 'en' ? 'en-US' : 'zh-TW');
}

// ---- Countdown hook ----
function useCountdown(target: string | null) {
  const [parts, setParts] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!target) return;
    const ts = new Date(target).getTime();
    const tick = () => {
      const diff = ts - Date.now();
      if (diff <= 0) { setVisible(false); return; }
      setVisible(true);
      setParts({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff % 86_400_000) / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [target]);

  return { parts, visible };
}

// ---- Architecture Diagram ----
function ArchitectureDiagram({ lang }: { lang: Lang }) {
  return (
    <section className="ea-section ea-arch-section">
      <h3 className="ea-section-title">{t('archTitle', lang)}</h3>
      <p className="ea-arch-desc">{t('archDesc', lang)}</p>
      <div className="ea-arch-diagram">
        <svg viewBox="0 0 860 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="ea-arch-svg">
          {/* ─── Boot / State Machine ─── */}
          <rect x="10" y="10" width="160" height="54" rx="8" fill="#1a2332" />
          <text x="90" y="34" textAnchor="middle" fill="#4fc3f7" fontSize="11" fontWeight="700">Boot Sequence</text>
          <text x="90" y="52" textAnchor="middle" fill="#9ca3af" fontSize="9">resolveEventDate → Claude / .env</text>

          <rect x="10" y="94" width="160" height="54" rx="8" fill="#1e293b" stroke="#4fc3f7" strokeWidth="1.5" />
          <text x="90" y="118" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="700">State Machine</text>
          <text x="90" y="134" textAnchor="middle" fill="#9ca3af" fontSize="9">WAITING → LIVE → DONE</text>

          {/* Arrow Boot → State */}
          <line x1="90" y1="64" x2="90" y2="94" stroke="#4fc3f7" strokeWidth="1.5" markerEnd="url(#arrow)" />

          {/* ─── Metrics Cron ─── */}
          <rect x="240" y="10" width="170" height="54" rx="8" fill="#0f2027" stroke="#ea580c" strokeWidth="1.5" />
          <text x="325" y="34" textAnchor="middle" fill="#fdba74" fontSize="11" fontWeight="700">metricsCron</text>
          <text x="325" y="52" textAnchor="middle" fill="#9ca3af" fontSize="9">setInterval 10 min</text>

          <rect x="240" y="94" width="170" height="54" rx="8" fill="#1e293b" stroke="#e5e7eb" strokeWidth="1" />
          <text x="325" y="118" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="700">Dell IR Fetcher</text>
          <text x="325" y="134" textAnchor="middle" fill="#9ca3af" fontSize="9">investors.delltechnologies.com</text>

          <rect x="240" y="178" width="170" height="54" rx="8" fill="#1e293b" stroke="#e5e7eb" strokeWidth="1" />
          <text x="325" y="202" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="700">Claude Parser</text>
          <text x="325" y="218" textAnchor="middle" fill="#9ca3af" fontSize="9">Revenue / Margin / DOI + Confidence</text>

          {/* Arrows Metrics */}
          <line x1="325" y1="64" x2="325" y2="94" stroke="#ea580c" strokeWidth="1.5" markerEnd="url(#arrow2)" />
          <line x1="325" y1="148" x2="325" y2="178" stroke="#ea580c" strokeWidth="1.5" markerEnd="url(#arrow2)" />

          {/* ─── Transcript Cron ─── */}
          <rect x="480" y="10" width="170" height="54" rx="8" fill="#0f2027" stroke="#16a34a" strokeWidth="1.5" />
          <text x="565" y="34" textAnchor="middle" fill="#86efac" fontSize="11" fontWeight="700">transcriptCron</text>
          <text x="565" y="52" textAnchor="middle" fill="#9ca3af" fontSize="9">setInterval 10 min</text>

          <rect x="480" y="94" width="170" height="54" rx="8" fill="#1e293b" stroke="#e5e7eb" strokeWidth="1" />
          <text x="565" y="118" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="700">Transcript Fetcher</text>
          <text x="565" y="134" textAnchor="middle" fill="#9ca3af" fontSize="9">Dell IR / SeekingAlpha</text>

          <rect x="480" y="178" width="170" height="54" rx="8" fill="#1e293b" stroke="#e5e7eb" strokeWidth="1" />
          <text x="565" y="202" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="700">Claude Summarizer</text>
          <text x="565" y="218" textAnchor="middle" fill="#9ca3af" fontSize="9">Highlights / Risks / Outlook / Quotes</text>

          <line x1="565" y1="64" x2="565" y2="94" stroke="#16a34a" strokeWidth="1.5" markerEnd="url(#arrow3)" />
          <line x1="565" y1="148" x2="565" y2="178" stroke="#16a34a" strokeWidth="1.5" markerEnd="url(#arrow3)" />

          {/* ─── DataStore ─── */}
          <rect x="240" y="282" width="410" height="54" rx="8" fill="#1e293b" stroke="#4fc3f7" strokeWidth="1.5" />
          <text x="445" y="306" textAnchor="middle" fill="#4fc3f7" fontSize="11" fontWeight="700">DataStore</text>
          <text x="445" y="322" textAnchor="middle" fill="#9ca3af" fontSize="9">In-memory state · state.json persistence · jobHistory</text>

          {/* Arrows down to DataStore */}
          <line x1="325" y1="232" x2="325" y2="282" stroke="#e5e7eb" strokeWidth="1" markerEnd="url(#arrow4)" />
          <line x1="565" y1="232" x2="565" y2="282" stroke="#e5e7eb" strokeWidth="1" markerEnd="url(#arrow4)" />

          {/* State Machine → crons (horizontal arrows) */}
          <line x1="170" y1="121" x2="240" y2="37" stroke="#4fc3f7" strokeWidth="1" strokeDasharray="5,3" markerEnd="url(#arrow)" />
          <line x1="170" y1="121" x2="480" y2="37" stroke="#4fc3f7" strokeWidth="1" strokeDasharray="5,3" markerEnd="url(#arrow)" />

          {/* ─── Express API ─── */}
          <rect x="10" y="282" width="160" height="54" rx="8" fill="#1e293b" stroke="#e5e7eb" strokeWidth="1" />
          <text x="90" y="306" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="700">Express API</text>
          <text x="90" y="322" textAnchor="middle" fill="#9ca3af" fontSize="9">GET /api/earnings · /api/health</text>

          {/* DataStore → Express */}
          <line x1="240" y1="309" x2="170" y2="309" stroke="#e5e7eb" strokeWidth="1" markerEnd="url(#arrow4)" />

          {/* ─── Lego Website ─── */}
          <rect x="10" y="390" width="160" height="54" rx="8" fill="#1a2332" stroke="#4fc3f7" strokeWidth="1.5" />
          <text x="90" y="414" textAnchor="middle" fill="#4fc3f7" fontSize="11" fontWeight="700">Lego Website</text>
          <text x="90" y="430" textAnchor="middle" fill="#9ca3af" fontSize="9">/earnings-agent/ · Next.js 14</text>

          {/* Express → Lego */}
          <line x1="90" y1="336" x2="90" y2="390" stroke="#4fc3f7" strokeWidth="1.5" markerEnd="url(#arrow)" />

          {/* Stabilization note */}
          <rect x="690" y="180" width="160" height="80" rx="8" fill="#0f172a" stroke="#dc2626" strokeWidth="1" />
          <text x="770" y="202" textAnchor="middle" fill="#f87171" fontSize="10" fontWeight="700">Stabilization</text>
          <text x="770" y="218" textAnchor="middle" fill="#9ca3af" fontSize="9">2 consecutive ticks</text>
          <text x="770" y="232" textAnchor="middle" fill="#9ca3af" fontSize="9">with identical values</text>
          <text x="770" y="248" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="700">→ DONE state</text>
          <line x1="410" y1="205" x2="690" y2="220" stroke="#dc2626" strokeWidth="1" strokeDasharray="4,3" />

          {/* Scoring note */}
          <rect x="690" y="282" width="160" height="54" rx="8" fill="#0f172a" stroke="#ea580c" strokeWidth="1" />
          <text x="770" y="306" textAnchor="middle" fill="#fdba74" fontSize="10" fontWeight="700">Confidence Scoring</text>
          <text x="770" y="322" textAnchor="middle" fill="#9ca3af" fontSize="9">Per metric + overall 0–100</text>
          <line x1="650" y1="309" x2="690" y2="309" stroke="#ea580c" strokeWidth="1" strokeDasharray="4,3" />

          {/* Arrow defs */}
          <defs>
            <marker id="arrow"  markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#4fc3f7" />
            </marker>
            <marker id="arrow2" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#ea580c" />
            </marker>
            <marker id="arrow3" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#16a34a" />
            </marker>
            <marker id="arrow4" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="#9ca3af" />
            </marker>
          </defs>
        </svg>
      </div>
    </section>
  );
}

// ---- Main component ----
export default function EarningsAgentContent() {
  const { lang } = useLanguage();
  const [data, setData]       = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'highlights' | 'risks' | 'outlook' | 'keyQuotes'>('highlights');
  const oneShotFired = useRef(false);

  const { parts: cd, visible: showCd } = useCountdown(data?.eventDate ?? null);

  async function fetchData() {
    try {
      const res = await fetch(`${AGENT_URL}/api/earnings`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  // Initial fetch + 10-minute poll
  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 600_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One-shot refetch exactly at eventDate
  useEffect(() => {
    if (!data?.eventDate || oneShotFired.current) return;
    const ms = new Date(data.eventDate).getTime() - Date.now();
    if (ms <= 0) return;
    oneShotFired.current = true;
    const id = setTimeout(fetchData, ms);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.eventDate]);

  if (loading) {
    return (
      <>
        <TopNav />
        <Banner />
        <div className="app-body">
          <Sidebar />
          <main className="main-content">
            <div className="page-pad"><div className="ea-loading">{t('loading', lang)}</div></div>
          </main>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <TopNav />
        <Banner />
        <div className="app-body">
          <Sidebar />
          <main className="main-content">
            <div className="page-pad">
              <div className="ea-error-banner">
                {t('agentOffline', lang)}{error ? `: ${error}` : ''}
              </div>
              <ArchitectureDiagram lang={lang} />
            </div>
          </main>
        </div>
      </>
    );
  }

  const statusLabel = data.status === 'LIVE' ? t('live', lang)
    : data.status === 'DONE' ? t('done', lang) : t('waiting', lang);
  const statusMod = data.status === 'LIVE' ? '--live' : data.status === 'DONE' ? '--done' : '--waiting';

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad">

      {/* ── Status bar ── */}
      <div className="ea-status-bar">
        <div className="ea-status-left">
          <span className={`ea-badge ea-badge${statusMod}`}>{statusLabel}</span>
          <span className="ea-meta">{t('eventDate', lang)}: {fmtLocale(data.eventDate, lang)}</span>
        </div>
        <div className="ea-status-right">
          <span className="ea-meta">{t('lastUpdated', lang)}: {fmtLocale(data.lastUpdated, lang)}</span>
        </div>
      </div>

      {/* ── Countdown ── */}
      {data.status === 'WAITING' && showCd && (
        <div className="ea-countdown">
          <span className="ea-meta">{t('countdown', lang)}</span>
          <span className="ea-countdown-value">
            {cd.d}d {cd.h}h {cd.m}m {cd.s}s
          </span>
        </div>
      )}

      {/* ── Metrics section ── */}
      {data.status !== 'WAITING' && (
        <section className="ea-section">
          {data.metricsConfidence !== null && (
            <div className="ea-overall-conf">
              {t('overallConf', lang)}:&nbsp;
              <span className={`ea-conf-badge ${data.metricsConfidence >= 50 ? 'ea-conf-badge--ok' : 'ea-conf-badge--warn'}`}>
                {data.metricsConfidence}%
              </span>
            </div>
          )}
          {!data.metrics ? (
            <div className="ea-placeholder">{t('awaitingFirst', lang)}</div>
          ) : (
            <div className="ea-metrics-grid">
              {(
                [
                  ['revenue',     t('revenue', lang),     '$', 'B',    '%',  '%'  ],
                  ['grossMargin', t('grossMargin', lang),  '',  '%',    'pp', 'pp' ],
                  ['doi',         t('doi', lang),          '',  ' days','d',  'd'  ],
                ] as const
              ).map(([key, label, prefix, unit, qUnit, yUnit]) => {
                const m = data.metrics![key as 'revenue' | 'grossMargin' | 'doi'];
                return (
                  <div key={key} className="ea-metric-card">
                    <div className="ea-metric-label">{label}</div>
                    {m ? (
                      <>
                        <div className="ea-metric-value">{prefix}{m.value}{unit}</div>
                        <div className="ea-metric-deltas">
                          <span>{t('qoq', lang)}: {fmtDelta(m.qoq, qUnit, lang)}</span>
                          <span>{t('yoy', lang)}: {fmtDelta(m.yoy, yUnit, lang)}</span>
                        </div>
                        <div className="ea-metric-conf">{m.confidence}% {t('confidence', lang)}</div>
                      </>
                    ) : (
                      <div className="ea-metric-na">—</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── Transcript summary section ── */}
      {data.transcriptStatus !== 'pending' && (
        <section className="ea-section">
          <h3 className="ea-section-title">{t('transcriptTitle', lang)}</h3>
          {data.transcriptStatus === 'unavailable' && (
            <div className="ea-placeholder">{t('transcriptUnavail', lang)}</div>
          )}
          {data.transcriptStatus === 'available' && !data.transcriptSummary && (
            <div className="ea-placeholder ea-placeholder--italic">{t('generating', lang)}</div>
          )}
          {data.transcriptStatus === 'available' && data.transcriptSummary && (
            <>
              <div className="ea-tabs">
                {(['highlights', 'risks', 'outlook', 'keyQuotes'] as const).map(tab => (
                  <button
                    key={tab}
                    className={`ea-tab${activeTab === tab ? ' ea-tab--active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {t(tab, lang)}
                  </button>
                ))}
              </div>
              <div className="ea-tab-content">
                {activeTab === 'outlook' ? (
                  <p className="ea-outlook">{data.transcriptSummary.outlook}</p>
                ) : (
                  <ul className="ea-list">
                    {data.transcriptSummary[activeTab].map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {/* ── Job history section ── */}
      {data.jobHistory.length > 0 && (
        <section className="ea-section">
          <h3 className="ea-section-title">{t('jobHistory', lang)} ({data.jobHistory.length})</h3>
          <div className="ea-table-wrap">
            <table className="ea-table">
              <thead>
                <tr>
                  <th>{t('jobId', lang)}</th>
                  <th>{t('startTime', lang)}</th>
                  <th>{t('endTime', lang)}</th>
                  <th>{t('duration', lang)}</th>
                  <th>{t('statusLabel', lang)}</th>
                  <th>{t('overallConf', lang)}</th>
                  <th>{t('noteLabel', lang)}</th>
                </tr>
              </thead>
              <tbody>
                {data.jobHistory.map(job => (
                  <tr key={job.jobId}>
                    <td>{job.jobId}</td>
                    <td>{fmtTime(job.startTime, lang)}</td>
                    <td>{fmtTime(job.endTime, lang)}</td>
                    <td>{fmtDuration(job.startTime, job.endTime)}</td>
                    <td>
                      <span className={`ea-job-badge ea-job-badge--${job.status}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{job.metricsConfidence !== null ? `${job.metricsConfidence}%` : '—'}</td>
                    <td className="ea-note">{job.error ?? job.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Architecture diagram ── */}
      <ArchitectureDiagram lang={lang} />

    </div>
        </main>
      </div>
    </>
  );
}
