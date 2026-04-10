'use client';

import { useState } from 'react';
import { resolveSymbolAlias } from '@/app/data/sp500';
import { extractJson } from '@/app/lib/parseContent';
import tcIrMd from '@/content/tc-ir-material.md';

// ── IR Material Tab — AAPL / TC ─────────────────────────────────────────────
// AAPL content sourced from https://investor.apple.com/investor-relations/default.aspx
// TC content sourced from https://investor.tsmc.com
// Sections: Annual Reports (10-K) | Quarterly Reports (10-Q) | Earnings Press Releases

interface IRMaterialTabProps {
  symbol: string;
}

type IRSubTab = 'annual-reports' | 'quarterly-reports' | 'earnings-press-releases';

const IR_TABS: { key: IRSubTab; label: string }[] = [
  { key: 'annual-reports', label: 'Annual Reports (10-K)' },
  { key: 'quarterly-reports', label: 'Quarterly Reports (10-Q)' },
  { key: 'earnings-press-releases', label: 'Earnings Press Releases' },
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

// ── TC data loader ───────────────────────────────────────────────────────────

interface TcIrData {
  financialData: FinancialDocGroup[];
}

let _tcIrData: TcIrData | null = null;
function getTcIrData(): TcIrData {
  if (!_tcIrData) {
    _tcIrData = extractJson<TcIrData>(tcIrMd as string);
  }
  return _tcIrData;
}

// ── Tab index map ─────────────────────────────────────────────────────────────

const TAB_INDEX: Record<IRSubTab, number> = {
  'annual-reports': 0,
  'quarterly-reports': 1,
  'earnings-press-releases': 2,
};

// ── IRContent ─────────────────────────────────────────────────────────────────

interface IRContentProps {
  financialData: FinancialDocGroup[];
  activeTab: IRSubTab;
}

function IRContent({ financialData, activeTab }: IRContentProps) {
  const filtered = financialData.filter((g) => g.category !== 'Supplemental Revenue Data');
  const group = filtered[TAB_INDEX[activeTab]];

  if (!group) {
    return (
      <div className="cp-ir-tab-content">
        <div className="cp-tab-placeholder">
          <span className="cp-tab-placeholder-text">No documents available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-ir-tab-content">
      <div className="cp-ir-fin-group">
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
    </div>
  );
}

// ── IRMaterialTab ─────────────────────────────────────────────────────────────

export default function IRMaterialTab({ symbol }: IRMaterialTabProps) {
  const [activeTab, setActiveTab] = useState<IRSubTab>('annual-reports');

  const resolvedSymbol = resolveSymbolAlias(symbol);
  let financialData: FinancialDocGroup[];

  if (resolvedSymbol === 'AAPL') {
    financialData = AAPL_FINANCIAL_DATA;
  } else if (resolvedSymbol === 'TC') {
    const tcData = getTcIrData();
    financialData = tcData.financialData;
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
        financialData={financialData}
        activeTab={activeTab}
      />
    </div>
  );
}
