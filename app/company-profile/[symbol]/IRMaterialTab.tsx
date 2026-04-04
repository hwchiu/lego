'use client';

// ── IR Material Tab — AAPL ───────────────────────────────────────────────────
// Content sourced from https://investor.apple.com/investor-relations/default.aspx
// Sections: Investor Updates | Newsroom | Financial Data

interface IRMaterialTabProps {
  symbol: string;
}

// ── Investor Updates data ────────────────────────────────────────────────────

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
};

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={CATEGORY_CLASSES[category] ?? 'cp-ir-category-badge'}>{category}</span>
  );
}

// ── IRMaterialTab ─────────────────────────────────────────────────────────────

export default function IRMaterialTab({ symbol }: IRMaterialTabProps) {
  // Only AAPL has full content; others show a placeholder
  if (symbol !== 'AAPL') {
    return (
      <div className="cp-tab-placeholder">
        <span className="cp-tab-placeholder-text">IR Material for {symbol} — Content coming soon</span>
      </div>
    );
  }

  return (
    <div className="cp-tab-content-box cp-ir-material">
      {/* ── Section 1: Investor Updates ── */}
      <div className="cp-data-card cp-ir-section-card">
        <div className="cp-card-title cp-ir-section-title">
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="cp-ir-title-icon"
          >
            <rect x="2" y="3" width="12" height="10" rx="2" />
            <path d="M5 8h6M5 11h4" />
          </svg>
          Investor Updates
        </div>
        <div className="cp-card-divider" />
        <div className="cp-ir-updates-list">
          {AAPL_INVESTOR_UPDATES.map((u) => (
            <div key={u.period} className="cp-ir-update-item">
              <div className="cp-ir-update-header">
                <span className="cp-ir-update-period">{u.period}</span>
                <span className="cp-ir-update-date">{u.date}</span>
              </div>
              <div className="cp-ir-update-metrics">
                <div className="cp-ir-update-metric">
                  <span className="cp-ir-update-metric-label">Revenue</span>
                  <span className="cp-ir-update-metric-value">{u.revenue}</span>
                </div>
                <div className="cp-ir-update-metric">
                  <span className="cp-ir-update-metric-label">EPS (Diluted)</span>
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
      </div>

      {/* ── Section 2: Newsroom ── */}
      <div className="cp-data-card cp-ir-section-card">
        <div className="cp-card-title cp-ir-section-title">
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="cp-ir-title-icon"
          >
            <path d="M2 3h12v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3z" />
            <path d="M5 6h6M5 9h4" />
          </svg>
          Newsroom
        </div>
        <div className="cp-card-divider" />
        <div className="cp-ir-newsroom-list">
          {AAPL_NEWSROOM.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cp-ir-news-item"
            >
              <div className="cp-ir-news-item-left">
                <CategoryBadge category={item.category} />
                <span className="cp-ir-news-date">{item.date}</span>
              </div>
              <div className="cp-ir-news-title">{item.title}</div>
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
                className="cp-ir-news-arrow"
              >
                <path d="M2 6h8M6 2l4 4-4 4" />
              </svg>
            </a>
          ))}
        </div>
        <a
          href="https://investor.apple.com/investor-relations/default.aspx"
          target="_blank"
          rel="noopener noreferrer"
          className="cp-ir-view-all"
        >
          View all on investor.apple.com →
        </a>
      </div>

      {/* ── Section 3: Financial Data ── */}
      <div className="cp-data-card cp-ir-section-card">
        <div className="cp-card-title cp-ir-section-title">
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="cp-ir-title-icon"
          >
            <path d="M4 2h6l3 3v9H3V2z" />
            <path d="M9 2v4h4" />
            <path d="M6 9h4M6 12h2" />
          </svg>
          Financial Data
        </div>
        <div className="cp-card-divider" />
        <div className="cp-ir-financial-data">
          {AAPL_FINANCIAL_DATA.map((group) => (
            <div key={group.category} className="cp-ir-doc-group">
              <div className="cp-ir-doc-group-title">{group.category}</div>
              <div className="cp-ir-doc-list">
                {group.docs.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="cp-ir-doc-item"
                  >
                    <div className="cp-ir-doc-item-left">
                      <DocTypeBadge type={doc.type} />
                      <span className="cp-ir-doc-label">{doc.label}</span>
                    </div>
                    <div className="cp-ir-doc-item-right">
                      <span className="cp-ir-doc-filed">Filed: {doc.filed}</span>
                      <span className="cp-ir-doc-download">
                        <DownloadIcon />
                        Download
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="cp-ir-disclaimer">
          Source: Apple Inc. Investor Relations (investor.apple.com). All documents are publicly
          available SEC filings and earnings materials.
        </p>
      </div>
    </div>
  );
}
