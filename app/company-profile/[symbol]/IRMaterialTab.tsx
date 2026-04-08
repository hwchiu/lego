'use client';

import { useState } from 'react';
import { extractJson } from '@/app/lib/parseContent';
import tcIrMd from '@/content/tc-ir-material.md';

// ── IR Material Tab — AAPL / TC ─────────────────────────────────────────────
// AAPL content sourced from https://investor.apple.com/investor-relations/default.aspx
// TC content sourced from https://investor.tsmc.com
// Sections: Investor Updates | Newsroom | Financial Data

interface IRMaterialTabProps {
  symbol: string;
}

type IRSubTab = 'investor-updates' | 'newsroom' | 'financial-data';

const IR_TABS: { key: IRSubTab; label: string }[] = [
  { key: 'investor-updates', label: 'Investor Updates' },
  { key: 'newsroom', label: 'Newsroom' },
  { key: 'financial-data', label: 'Financial Data' },
];

// ── Shared interfaces ─────────────────────────────────────────────────────────

interface InvestorUpdate {
  period: string;
  date: string;
  revenue: string;
  eps: string;
  dividend: string;
  highlight: string;
}

const AAPL_INVESTOR_UPDATES: InvestorUpdate[] = [
  {
    period: 'Q4 FY2024',
    date: 'Oct 31, 2024',
    revenue: '$94.9B',
    eps: '$1.64',
    dividend: '$0.25 / share',
    highlight: 'Revenue up 6% YoY; record services revenue of $25.0B',
  },
  {
    period: 'Q3 FY2024',
    date: 'Aug 1, 2024',
    revenue: '$85.8B',
    eps: '$1.40',
    dividend: '$0.25 / share',
    highlight: 'Services revenue grew 14% YoY to $24.2B; record for June quarter',
  },
  {
    period: 'Q2 FY2024',
    date: 'May 2, 2024',
    revenue: '$90.8B',
    eps: '$1.53',
    dividend: '$0.25 / share',
    highlight: '$110B share repurchase program announced; 7% revenue growth',
  },
  {
    period: 'Q1 FY2024',
    date: 'Feb 1, 2024',
    revenue: '$119.6B',
    eps: '$2.18',
    dividend: '$0.24 / share',
    highlight: 'All-time revenue record for December quarter; 2% YoY growth',
  },
  {
    period: 'Q4 FY2023',
    date: 'Nov 2, 2023',
    revenue: '$89.5B',
    eps: '$1.46',
    dividend: '$0.24 / share',
    highlight: 'Services reached new all-time revenue record at $22.3B',
  },
];

// ── Newsroom data ────────────────────────────────────────────────────────────

interface NewsroomItem {
  date: string;
  title: string;
  url: string;
  category: string;
}

const AAPL_NEWSROOM: NewsroomItem[] = [
  {
    date: 'Oct 31, 2024',
    title: 'Apple reports fourth quarter results',
    url: 'https://www.apple.com/newsroom/2024/10/apple-reports-fourth-quarter-results/',
    category: 'Earnings',
  },
  {
    date: 'Sep 9, 2024',
    title: 'Apple introduces iPhone 16, iPhone 16 Plus, iPhone 16 Pro, and iPhone 16 Pro Max',
    url: 'https://www.apple.com/newsroom/2024/09/apple-introduces-iphone-16-iphone-16-plus-iphone-16-pro-and-iphone-16-pro-max/',
    category: 'Product',
  },
  {
    date: 'Aug 1, 2024',
    title: 'Apple reports third-quarter results',
    url: 'https://www.apple.com/newsroom/2024/08/apple-reports-third-quarter-results/',
    category: 'Earnings',
  },
  {
    date: 'May 2, 2024',
    title: 'Apple reports second-quarter results',
    url: 'https://www.apple.com/newsroom/2024/05/apple-reports-second-quarter-results/',
    category: 'Earnings',
  },
  {
    date: 'May 2, 2024',
    title: 'Apple announces $110 billion share repurchase program',
    url: 'https://www.apple.com/newsroom/2024/05/apple-announces-110-billion-share-repurchase-program/',
    category: 'Corporate',
  },
  {
    date: 'Feb 1, 2024',
    title: 'Apple reports first-quarter results',
    url: 'https://www.apple.com/newsroom/2024/02/apple-reports-first-quarter-results/',
    category: 'Earnings',
  },
  {
    date: 'Nov 2, 2023',
    title: 'Apple reports fourth quarter results',
    url: 'https://www.apple.com/newsroom/2023/11/apple-reports-fourth-quarter-results/',
    category: 'Earnings',
  },
  {
    date: 'Aug 3, 2023',
    title: 'Apple reports third-quarter results',
    url: 'https://www.apple.com/newsroom/2023/08/apple-reports-third-quarter-results/',
    category: 'Earnings',
  },
];

// ── Financial Data — downloadable documents ──────────────────────────────────

interface FinancialDoc {
  label: string;
  period: string;
  filed: string;
  url: string;
  type: 'PDF' | 'XLSX' | 'HTML';
}

interface FinancialDocGroup {
  category: string;
  docs: FinancialDoc[];
}

const AAPL_FINANCIAL_DATA: FinancialDocGroup[] = [
  {
    category: 'Annual Reports (10-K)',
    docs: [
      {
        label: 'FY2024 Annual Report',
        period: 'Sep 28, 2024',
        filed: 'Nov 1, 2024',
        url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2024/q4/filing/10-Q4-2024-As-Filed.pdf',
        type: 'PDF',
      },
      {
        label: 'FY2023 Annual Report',
        period: 'Sep 30, 2023',
        filed: 'Nov 3, 2023',
        url: 'https://s2.q4cdn.com/470004039/files/doc_financials/2023/ar/_10-K-2023-As-Filed.pdf',
        type: 'PDF',
      },
      {
        label: 'FY2022 Annual Report',
        period: 'Sep 24, 2022',
        filed: 'Oct 28, 2022',
        url: 'https://s2.q4cdn.com/470004039/files/doc_financials/2022/ar/10-K-FY2022-As-Filed.pdf',
        type: 'PDF',
      },
      {
        label: 'FY2021 Annual Report',
        period: 'Sep 25, 2021',
        filed: 'Oct 29, 2021',
        url: 'https://s2.q4cdn.com/470004039/files/doc_financials/2021/ar/_10-K-2021-As-Filed.pdf',
        type: 'PDF',
      },
    ],
  },
  {
    category: 'Quarterly Reports (10-Q)',
    docs: [
      {
        label: 'Q3 FY2024 (Jun 29, 2024)',
        period: 'Jun 29, 2024',
        filed: 'Aug 2, 2024',
        url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2024/q3/filing/10-Q3-2024-As-Filed.pdf',
        type: 'PDF',
      },
      {
        label: 'Q2 FY2024 (Mar 30, 2024)',
        period: 'Mar 30, 2024',
        filed: 'May 3, 2024',
        url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2024/q2/filing/10-Q2-2024-As-Filed.pdf',
        type: 'PDF',
      },
      {
        label: 'Q1 FY2024 (Dec 30, 2023)',
        period: 'Dec 30, 2023',
        filed: 'Feb 2, 2024',
        url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2024/q1/filing/10-Q1-2024-As-Filed.pdf',
        type: 'PDF',
      },
      {
        label: 'Q3 FY2023 (Jul 1, 2023)',
        period: 'Jul 1, 2023',
        filed: 'Aug 4, 2023',
        url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2023/q3/filing/10-Q3-2023-As-Filed.pdf',
        type: 'PDF',
      },
      {
        label: 'Q2 FY2023 (Apr 1, 2023)',
        period: 'Apr 1, 2023',
        filed: 'May 5, 2023',
        url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2023/q2/filing/10-Q2-2023-As-Filed.pdf',
        type: 'PDF',
      },
      {
        label: 'Q1 FY2023 (Dec 31, 2022)',
        period: 'Dec 31, 2022',
        filed: 'Feb 3, 2023',
        url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2023/q1/filing/10-Q1-2023-As-Filed.pdf',
        type: 'PDF',
      },
      {
        label: 'Q3 FY2022 (Jun 25, 2022)',
        period: 'Jun 25, 2022',
        filed: 'Jul 29, 2022',
        url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2022/q3/filing/10-Q3-2022-As-Filed.pdf',
        type: 'PDF',
      },
      {
        label: 'Q2 FY2022 (Mar 26, 2022)',
        period: 'Mar 26, 2022',
        filed: 'Apr 29, 2022',
        url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2022/q2/filing/10-Q2-2022-As-Filed.pdf',
        type: 'PDF',
      },
      {
        label: 'Q1 FY2022 (Dec 25, 2021)',
        period: 'Dec 25, 2021',
        filed: 'Jan 28, 2022',
        url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2022/q1/filing/10-Q1-2022-As-Filed.pdf',
        type: 'PDF',
      },
    ],
  },
  {
    category: 'Earnings Press Releases',
    docs: [
      {
        label: 'Q4 FY2024 Earnings Release',
        period: 'Oct 31, 2024',
        filed: 'Oct 31, 2024',
        url: 'https://www.apple.com/newsroom/pdfs/fy2024-q4/FY24_Q4_Consolidated_Financial_Statements.pdf',
        type: 'PDF',
      },
      {
        label: 'Q3 FY2024 Earnings Release',
        period: 'Aug 1, 2024',
        filed: 'Aug 1, 2024',
        url: 'https://www.apple.com/newsroom/pdfs/fy2024-q3/FY24_Q3_Consolidated_Financial_Statements.pdf',
        type: 'PDF',
      },
      {
        label: 'Q2 FY2024 Earnings Release',
        period: 'May 2, 2024',
        filed: 'May 2, 2024',
        url: 'https://www.apple.com/newsroom/pdfs/fy2024-q2/FY24_Q2_Consolidated_Financial_Statements.pdf',
        type: 'PDF',
      },
      {
        label: 'Q1 FY2024 Earnings Release',
        period: 'Feb 1, 2024',
        filed: 'Feb 1, 2024',
        url: 'https://www.apple.com/newsroom/pdfs/fy2024-q1/FY24_Q1_Consolidated_Financial_Statements.pdf',
        type: 'PDF',
      },
      {
        label: 'Q4 FY2023 Earnings Release',
        period: 'Nov 2, 2023',
        filed: 'Nov 2, 2023',
        url: 'https://www.apple.com/newsroom/pdfs/fy2023-q4/FY23_Q4_Consolidated_Financial_Statements.pdf',
        type: 'PDF',
      },
      {
        label: 'Q3 FY2023 Earnings Release',
        period: 'Aug 3, 2023',
        filed: 'Aug 3, 2023',
        url: 'https://www.apple.com/newsroom/pdfs/fy2023-q3/FY23_Q3_Consolidated_Financial_Statements.pdf',
        type: 'PDF',
      },
    ],
  },
  {
    category: 'Supplemental Revenue Data',
    docs: [
      {
        label: 'Q4 FY2024 Supplemental Data',
        period: 'Oct 31, 2024',
        filed: 'Oct 31, 2024',
        url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2024/q4/fy2024-q4-data-summary.xlsx',
        type: 'XLSX',
      },
      {
        label: 'Q3 FY2024 Supplemental Data',
        period: 'Aug 1, 2024',
        filed: 'Aug 1, 2024',
        url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2024/q3/fy2024-q3-data-summary.xlsx',
        type: 'XLSX',
      },
      {
        label: 'Q2 FY2024 Supplemental Data',
        period: 'May 2, 2024',
        filed: 'May 2, 2024',
        url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2024/q2/fy2024-q2-data-summary.xlsx',
        type: 'XLSX',
      },
      {
        label: 'Q1 FY2024 Supplemental Data',
        period: 'Feb 1, 2024',
        filed: 'Feb 1, 2024',
        url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2024/q1/fy2024-q1-data-summary.xlsx',
        type: 'XLSX',
      },
      {
        label: 'Q4 FY2023 Supplemental Data',
        period: 'Nov 2, 2023',
        filed: 'Nov 2, 2023',
        url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2023/q4/fy2023-q4-data-summary.xlsx',
        type: 'XLSX',
      },
    ],
  },
];

// ── Type badge ────────────────────────────────────────────────────────────────

const DOC_TYPE_CLASSES: Record<'PDF' | 'XLSX' | 'HTML', string> = {
  PDF: 'cp-ir-doc-badge cp-ir-doc-badge--pdf',
  XLSX: 'cp-ir-doc-badge cp-ir-doc-badge--xlsx',
  HTML: 'cp-ir-doc-badge cp-ir-doc-badge--html',
};

function DocTypeBadge({ type }: { type: 'PDF' | 'XLSX' | 'HTML' }) {
  return <span className={DOC_TYPE_CLASSES[type]}>{type}</span>;
}

// ── Download icon ─────────────────────────────────────────────────────────────

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 14 14"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 2v7M4 7l3 3 3-3" />
      <path d="M2 11h10" />
    </svg>
  );
}

// ── Category icon ─────────────────────────────────────────────────────────────

const CATEGORY_CLASSES: Record<string, string> = {
  Earnings: 'cp-ir-category-badge cp-ir-category-badge--earnings',
  Product: 'cp-ir-category-badge cp-ir-category-badge--product',
  Corporate: 'cp-ir-category-badge cp-ir-category-badge--corporate',
  Technology: 'cp-ir-category-badge cp-ir-category-badge--product',
};

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={CATEGORY_CLASSES[category] ?? 'cp-ir-category-badge'}>{category}</span>
  );
}

// ── TC data loader ───────────────────────────────────────────────────────────

interface TcIrData {
  investorUpdates: InvestorUpdate[];
  newsroom: NewsroomItem[];
  financialData: FinancialDocGroup[];
}

let _tcIrData: TcIrData | null = null;
function getTcIrData(): TcIrData {
  if (!_tcIrData) {
    _tcIrData = extractJson<TcIrData>(tcIrMd as string);
  }
  return _tcIrData;
}

// ── Generic IR content renderer ───────────────────────────────────────────────

interface IRContentProps {
  investorUpdates: InvestorUpdate[];
  newsroom: NewsroomItem[];
  financialData: FinancialDocGroup[];
  activeTab: IRSubTab;
  viewAllUrl: string;
  viewAllLabel: string;
  disclaimerText: string;
}

function IRContent({
  investorUpdates,
  newsroom,
  financialData,
  activeTab,
  viewAllUrl,
  viewAllLabel,
  disclaimerText,
}: IRContentProps) {
  return (
    <div className="cp-ir-tab-content">
      {/* ── Investor Updates ── */}
      {activeTab === 'investor-updates' && (
        <div className="cp-ir-card-grid">
          {investorUpdates.map((u) => (
            <div key={u.period} className="cp-data-card cp-ir-card">
              <div className="cp-ir-card-header">
                <span className="cp-ir-update-period">{u.period}</span>
                <span className="cp-ir-update-date">{u.date}</span>
              </div>
              <div className="cp-card-divider" />
              <div className="cp-ir-update-metrics">
                <div className="cp-ir-update-metric">
                  <span className="cp-ir-update-metric-label">Revenue</span>
                  <span className="cp-ir-update-metric-value">{u.revenue}</span>
                </div>
                <div className="cp-ir-update-metric">
                  <span className="cp-ir-update-metric-label">EPS</span>
                  <span className="cp-ir-update-metric-value">{u.eps}</span>
                </div>
                <div className="cp-ir-update-metric">
                  <span className="cp-ir-update-metric-label">Dividend</span>
                  <span className="cp-ir-update-metric-value">{u.dividend}</span>
                </div>
              </div>
              <div className="cp-ir-update-highlight">{u.highlight}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Newsroom ── */}
      {activeTab === 'newsroom' && (
        <>
          <div className="cp-ir-card-grid">
            {newsroom.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cp-data-card cp-ir-card cp-ir-news-card"
              >
                <div className="cp-ir-news-card-top">
                  <CategoryBadge category={item.category} />
                  <span className="cp-ir-news-date">{item.date}</span>
                </div>
                <div className="cp-ir-news-card-title">{item.title}</div>
                <div className="cp-ir-news-card-footer">
                  <svg
                    viewBox="0 0 12 12"
                    width="11"
                    height="11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2 6h8M6 2l4 4-4 4" />
                  </svg>
                  <span>Open in new tab</span>
                </div>
              </a>
            ))}
          </div>
          <a
            href={viewAllUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cp-ir-view-all"
          >
            {viewAllLabel}
          </a>
        </>
      )}

      {/* ── Financial Data ── */}
      {activeTab === 'financial-data' && (
        <>
          {financialData.map((group) => (
            <div key={group.category} className="cp-ir-fin-group">
              <div className="cp-ir-doc-group-title">{group.category}</div>
              <div className="cp-ir-fin-table-wrap">
                <table className="cp-ir-fin-table">
                  <thead>
                    <tr>
                      <th className="cp-ir-fin-th">Document</th>
                      <th className="cp-ir-fin-th cp-ir-fin-th--date">Period</th>
                      <th className="cp-ir-fin-th cp-ir-fin-th--date">Filed</th>
                      <th className="cp-ir-fin-th cp-ir-fin-th--type">Type</th>
                      <th className="cp-ir-fin-th cp-ir-fin-th--action">Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.docs.map((doc, idx) => (
                      <tr key={idx} className="cp-ir-fin-tr">
                        <td className="cp-ir-fin-td cp-ir-fin-td--label">{doc.label}</td>
                        <td className="cp-ir-fin-td cp-ir-fin-td--date">{doc.period}</td>
                        <td className="cp-ir-fin-td cp-ir-fin-td--date">{doc.filed}</td>
                        <td className="cp-ir-fin-td cp-ir-fin-td--type">
                          <DocTypeBadge type={doc.type} />
                        </td>
                        <td className="cp-ir-fin-td cp-ir-fin-td--action">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={doc.type !== 'HTML'}
                            className="cp-ir-fin-download-btn"
                            title={doc.type === 'HTML' ? 'Open' : 'Download'}
                          >
                            <DownloadIcon />
                            <span>{doc.type === 'HTML' ? 'Open' : 'Download'}</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <p className="cp-ir-disclaimer">{disclaimerText}</p>
        </>
      )}
    </div>
  );
}

// ── IRMaterialTab ─────────────────────────────────────────────────────────────

export default function IRMaterialTab({ symbol }: IRMaterialTabProps) {
  const [activeTab, setActiveTab] = useState<IRSubTab>('investor-updates');

  // Resolve data and config based on symbol
  let investorUpdates: InvestorUpdate[];
  let newsroom: NewsroomItem[];
  let financialData: FinancialDocGroup[];
  let viewAllUrl: string;
  let viewAllLabel: string;
  let disclaimerText: string;

  if (symbol === 'AAPL') {
    investorUpdates = AAPL_INVESTOR_UPDATES;
    newsroom = AAPL_NEWSROOM;
    financialData = AAPL_FINANCIAL_DATA;
    viewAllUrl = 'https://investor.apple.com/investor-relations/default.aspx';
    viewAllLabel = 'View all on investor.apple.com →';
    disclaimerText =
      'Source: Apple Inc. Investor Relations (investor.apple.com). All documents are publicly available SEC filings and earnings materials.';
  } else if (symbol === 'TC' || symbol === 'TSM') {
    const tcData = getTcIrData();
    investorUpdates = tcData.investorUpdates;
    newsroom = tcData.newsroom;
    financialData = tcData.financialData;
    viewAllUrl = 'https://investor.tsmc.com/en';
    viewAllLabel = 'View all on T Company Investor Relations →';
    disclaimerText =
      'Source: T Company Investor Relations (investor.tsmc.com). SEC filings available via EDGAR. All documents are publicly available.';
  } else {
    return (
      <div className="cp-tab-placeholder">
        <span className="cp-tab-placeholder-text">
          IR Material for {symbol} — Content coming soon
        </span>
      </div>
    );
  }

  return (
    <div className="cp-tab-content-box cp-ir-material cp-ir-layout">
      {/* ── Left vertical sub-tab menu ── */}
      <div className="cp-ir-left-menu">
        {IR_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`cp-ir-left-tab${activeTab === tab.key ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <IRContent
        investorUpdates={investorUpdates}
        newsroom={newsroom}
        financialData={financialData}
        activeTab={activeTab}
        viewAllUrl={viewAllUrl}
        viewAllLabel={viewAllLabel}
        disclaimerText={disclaimerText}
      />
    </div>
  );
}
