'use client';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';

const BASE_URL = 'https://lego2.hwchiu.com';

// ---- Company Registry ----
const COMPANIES = [
  { id: 'dell'     as const, ticker: 'DELL', name: 'Dell Technologies', quarter: 'Q1 FY2027', apiPath: `${BASE_URL}/earnings-api/dell`     },
  { id: 'broadcom' as const, ticker: 'AVGO', name: 'Broadcom Inc.',      quarter: 'Q2 FY2026', apiPath: `${BASE_URL}/earnings-api/broadcom` },
];

type CompanyId = 'dell' | 'broadcom';

// ---- Type mirrors ----
interface MetricValue {
  value: number; unit: 'B' | '%' | 'days';
  qoq: number | null; yoy: number | null; confidence: number;
}
interface EarningsMetrics {
  revenue: MetricValue | null; grossMargin: MetricValue | null; doi: MetricValue | null;
}
interface TranscriptSummary {
  highlights: string[]; risks: string[]; outlook: string; keyQuotes: string[];
  summaryConfidence?: number;
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
  metricsConfidence: number | null;
  metricsCreatedAt: string | null;
  metricsUpdatedAt: string | null;
  transcriptStatus: 'pending' | 'available' | 'unavailable';
  transcript: string | null;
  transcriptSummary: TranscriptSummary | null;
  transcriptRawFetchedAt: string | null;
  transcriptSummaryCreatedAt: string | null;
  transcriptSummaryUpdatedAt: string | null;
  jobHistory: JobRecord[];
}

// ---- i18n ----
const L = {
  loading:            { zh: '載入中…',                en: 'Loading…' },
  agentOffline:       { zh: 'Agent 離線',             en: 'Agent offline' },
  waiting:            { zh: '等待中',                 en: 'WAITING' },
  live:               { zh: '直播中',                 en: 'LIVE' },
  done:               { zh: '完成',                   en: 'DONE' },
  companies:          { zh: '公司',                   en: 'Companies' },
  eventDate:          { zh: '財報日期',                en: 'Event Date' },
  lastUpdated:        { zh: '最後更新',                en: 'Last Updated' },
  metricsCreated:     { zh: '指標首次建立',             en: 'Metrics created' },
  metricsAt:          { zh: '指標最後更新',             en: 'Metrics updated' },
  summaryCreated:     { zh: '摘要首次建立',             en: 'Summary created' },
  transcriptAt:       { zh: '摘要最後更新',             en: 'Summary updated' },
  fetchedAt:          { zh: '逐字稿取得時間',           en: 'Transcript fetched' },
  countdown:          { zh: '距財報發布',              en: 'Time until earnings' },
  revenue:            { zh: '營收',                   en: 'Revenue' },
  grossMargin:        { zh: '毛利率',                  en: 'Gross Margin' },
  doi:                { zh: '庫存天數',                en: 'Days of Inventory' },
  confidence:         { zh: '信心度',                 en: 'confidence' },
  overallConf:        { zh: '整體信心度',               en: 'Overall Confidence' },
  awaitingFirst:      { zh: '等待第一次提取…',           en: 'Awaiting first extraction…' },
  transcriptTitle:    { zh: '法說會摘要',               en: 'Transcript Summary' },
  transcriptUnavail:  { zh: '無法取得法說會逐字稿',       en: 'Transcript unavailable' },
  generating:         { zh: '正在生成摘要…',             en: 'Generating summary…' },
  summaryConf:        { zh: '摘要信心度',               en: 'Summary confidence' },
  highlights:         { zh: '重點',                   en: 'Highlights' },
  risks:              { zh: '風險',                   en: 'Risks' },
  outlook:            { zh: '展望',                   en: 'Outlook' },
  keyQuotes:          { zh: '關鍵引述',                en: 'Key Quotes' },
  jobHistory:         { zh: '執行紀錄',                en: 'Job History' },
  jobId:              { zh: '任務 ID',                 en: 'Job ID' },
  startTime:          { zh: '開始時間',                en: 'Start Time' },
  duration:           { zh: '耗時',                   en: 'Duration' },
  statusLabel:        { zh: '狀態',                   en: 'Status' },
  noteLabel:          { zh: '備註',                   en: 'Note' },
  qoq:                { zh: 'QoQ',                   en: 'QoQ' },
  yoy:                { zh: 'YoY',                   en: 'YoY' },
  na:                 { zh: 'N/A',                   en: 'N/A' },
} as const;

type LKey = keyof typeof L;
function t(key: LKey, lang: 'zh' | 'en'): string { return L[key][lang]; }

// ---- Helpers ----
function fmtLocale(iso: string | null, lang: 'zh' | 'en'): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString(lang === 'en' ? 'en-US' : 'zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });
}

function fmtTime(iso: string, lang: 'zh' | 'en'): string {
  const d = new Date(iso);
  return d.toLocaleString(lang === 'en' ? 'en-US' : 'zh-TW', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function fmtDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 0) return '—';
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

function fmtDelta(val: number | null, unit: string, lang: 'zh' | 'en'): string {
  if (val === null) return t('na', lang);
  const sign = val > 0 ? '+' : '';
  return `${sign}${val}${unit}`;
}

function useCd(eventDate: string | null) {
  const [cd, setCd] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!eventDate) return;
    const target = new Date(eventDate).getTime();
    function update() {
      const diff = target - Date.now();
      if (diff <= 0) { setShow(false); return; }
      setShow(true);
      const s = Math.floor(diff / 1000);
      setCd({ d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 });
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [eventDate]);
  return { cd, show };
}

// ---- Detail Panel ----
interface DetailPanelProps {
  company: typeof COMPANIES[number];
  data: AgentData | null;
  loading: boolean;
  error: string | null;
  lang: 'zh' | 'en';
}

function DetailPanel({ company, data, loading, error, lang }: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'highlights' | 'risks' | 'outlook' | 'keyQuotes'>('highlights');
  const { cd, show: showCd } = useCd(data?.status === 'WAITING' ? (data.eventDate ?? null) : null);

  if (loading) {
    return <div className="ea-detail-placeholder">{t('loading', lang)}</div>;
  }
  if (error || !data) {
    return (
      <div className="ea-error-banner">
        {t('agentOffline', lang)}{error ? `: ${error}` : ''}
      </div>
    );
  }

  const statusLabel = data.status === 'LIVE' ? t('live', lang)
    : data.status === 'DONE' ? t('done', lang) : t('waiting', lang);
  const statusMod = data.status === 'LIVE' ? '--live' : data.status === 'DONE' ? '--done' : '--waiting';

  return (
    <div className="ea-detail">
      <div className="ea-detail-header">
        <div className="ea-detail-title">
          <span className="ea-detail-ticker">{company.ticker}</span>
          <span className="ea-detail-name">{company.name}</span>
          <span className="ea-detail-quarter">{company.quarter}</span>
        </div>
        <div className="ea-status-bar">
          <span className={`ea-badge ea-badge${statusMod}`}>{statusLabel}</span>
          <span className="ea-meta">{t('eventDate', lang)}: {fmtLocale(data.eventDate, lang)}</span>
          <span className="ea-meta">{t('lastUpdated', lang)}: {fmtLocale(data.lastUpdated, lang)}</span>
        </div>
      </div>

      {data.status === 'WAITING' && showCd && (
        <div className="ea-countdown">
          <span className="ea-meta">{t('countdown', lang)}</span>
          <span className="ea-countdown-value">{cd.d}d {cd.h}h {cd.m}m {cd.s}s</span>
        </div>
      )}

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
              {([
                ['revenue',     t('revenue', lang),     '$', 'B',    '%',  '%'  ],
                ['grossMargin', t('grossMargin', lang),  '',  '%',    'pp', 'pp' ],
                ['doi',         t('doi', lang),          '',  ' days','d',  'd'  ],
              ] as const).map(([key, label, prefix, unit, qUnit, yUnit]) => {
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
                    ) : <div className="ea-metric-na">—</div>}
                  </div>
                );
              })}
            </div>
          )}
          <div className="ea-data-ts-group">
            {data.metricsCreatedAt && (
              <div className="ea-data-ts">🕐 {t('metricsCreated', lang)}: {fmtLocale(data.metricsCreatedAt, lang)}</div>
            )}
            {data.metricsUpdatedAt && (
              <div className="ea-data-ts">🔄 {t('metricsAt', lang)}: {fmtLocale(data.metricsUpdatedAt, lang)}</div>
            )}
          </div>
        </section>
      )}

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
              {typeof data.transcriptSummary.summaryConfidence === 'number' && (
                <div className="ea-overall-conf ea-overall-conf--transcript">
                  {t('summaryConf', lang)}:&nbsp;
                  <span className={`ea-conf-badge ${data.transcriptSummary.summaryConfidence >= 70 ? 'ea-conf-badge--ok' : 'ea-conf-badge--warn'}`}>
                    {data.transcriptSummary.summaryConfidence}%
                  </span>
                </div>
              )}
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
          <div className="ea-data-ts-group">
            {data.transcriptRawFetchedAt && (
              <div className="ea-data-ts">🕐 {t('fetchedAt', lang)}: {fmtLocale(data.transcriptRawFetchedAt, lang)}</div>
            )}
            {data.transcriptSummaryCreatedAt && (
              <div className="ea-data-ts">✨ {t('summaryCreated', lang)}: {fmtLocale(data.transcriptSummaryCreatedAt, lang)}</div>
            )}
            {data.transcriptSummaryUpdatedAt && (
              <div className="ea-data-ts">🔄 {t('transcriptAt', lang)}: {fmtLocale(data.transcriptSummaryUpdatedAt, lang)}</div>
            )}
          </div>
        </section>
      )}

      {data.jobHistory.length > 0 && (
        <section className="ea-section">
          <h3 className="ea-section-title">{t('jobHistory', lang)} ({data.jobHistory.length})</h3>
          <div className="ea-table-wrap">
            <table className="ea-table">
              <thead>
                <tr>
                  <th>{t('jobId', lang)}</th>
                  <th>{t('startTime', lang)}</th>
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
                    <td>{fmtDuration(job.startTime, job.endTime)}</td>
                    <td>
                      <span className={`ea-job-badge ea-job-badge--${job.status}`}>{job.status}</span>
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
    </div>
  );
}

// ---- Main component ----
export default function EarningsAgentContent() {
  const { lang } = useLanguage();
  const [selected, setSelected] = useState<CompanyId>('dell');
  const [companyData, setCompanyData] = useState<Record<CompanyId, AgentData | null>>({ dell: null, broadcom: null });
  const [companyLoading, setCompanyLoading] = useState<Record<CompanyId, boolean>>({ dell: true, broadcom: true });
  const [companyError, setCompanyError] = useState<Record<CompanyId, string | null>>({ dell: null, broadcom: null });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchAll() {
    await Promise.all(
      COMPANIES.map(async (co) => {
        try {
          const res = await fetch(`${co.apiPath}/api/earnings`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json: AgentData = await res.json();
          setCompanyData(prev => ({ ...prev, [co.id]: json }));
          setCompanyError(prev => ({ ...prev, [co.id]: null }));
        } catch (e) {
          setCompanyError(prev => ({ ...prev, [co.id]: String(e) }));
        } finally {
          setCompanyLoading(prev => ({ ...prev, [co.id]: false }));
        }
      })
    );
  }

  useEffect(() => {
    fetchAll();
    pollRef.current = setInterval(fetchAll, 30_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCompany = COMPANIES.find(c => c.id === selected)!;

  function statusMod(data: AgentData | null) {
    if (!data) return '--waiting';
    return data.status === 'LIVE' ? '--live' : data.status === 'DONE' ? '--done' : '--waiting';
  }
  function statusDot(data: AgentData | null) {
    if (!data) return '○';
    return data.status === 'LIVE' ? '●' : data.status === 'DONE' ? '✓' : '○';
  }

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad">
            <div className="ea-multi-layout">

              <div className="ea-company-list">
                <div className="ea-company-list-title">{t('companies', lang)}</div>
                {COMPANIES.map(co => {
                  const data = companyData[co.id];
                  const mod = statusMod(data);
                  const dot = statusDot(data);
                  const isActive = selected === co.id;
                  return (
                    <button
                      key={co.id}
                      className={`ea-company-item${isActive ? ' ea-company-item--active' : ''}`}
                      onClick={() => setSelected(co.id)}
                    >
                      <span className={`ea-company-dot ea-company-dot${mod}`}>{dot}</span>
                      <div className="ea-company-info">
                        <span className="ea-company-ticker">{co.ticker}</span>
                        <span className="ea-company-name">{co.name}</span>
                        <span className="ea-company-quarter">{co.quarter}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="ea-detail-panel">
                <DetailPanel
                  company={selectedCompany}
                  data={companyData[selected]}
                  loading={companyLoading[selected]}
                  error={companyError[selected]}
                  lang={lang}
                />
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}
