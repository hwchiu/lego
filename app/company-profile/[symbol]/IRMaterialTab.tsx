'use client';

import { useState, useEffect } from 'react';
import { getIrMaterialByCoCd, downloadIrMaterialByDocId, type IrMaterialEntry } from '@/app/lib/getIrMaterialByCoCd';

// ── IR Material Tab ──────────────────────────────────────────────────────────
// Data fetched via getIrMaterialByCoCd() following Pattern A (async API +
// static data). Sub-tabs are derived from distinct DOC_TYPE values.

interface IRMaterialTabProps {
  symbol: string;
}

// ── PDF type badge ────────────────────────────────────────────────────────────

function PdfBadge() {
  return <span className="cp-ir-doc-badge cp-ir-doc-badge--pdf">PDF</span>;
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

// ── IRContent ─────────────────────────────────────────────────────────────────

interface IRContentProps {
  symbol: string;
  entries: IrMaterialEntry[];
  activeDocType: string;
}

function IRContent({ symbol, entries, activeDocType }: IRContentProps) {
  const filtered = entries.filter((e) => e.DOC_TYPE === activeDocType);

  if (filtered.length === 0) {
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
        <div className="cp-ir-doc-group-title">{activeDocType.toUpperCase()}</div>
        <div className="cp-ir-fin-table-wrap">
          <table className="cp-ir-fin-table">
            <thead>
              <tr>
                <th className="cp-ir-fin-th">Document</th>
                <th className="cp-ir-fin-th cp-ir-fin-th--date">Create Date</th>
                <th className="cp-ir-fin-th cp-ir-fin-th--type">Type</th>
                <th className="cp-ir-fin-th cp-ir-fin-th--action">Download</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.DOC_ID} className="cp-ir-fin-tr">
                  <td className="cp-ir-fin-td cp-ir-fin-td--label">
                    {symbol} {doc.DOC_TYPE}
                  </td>
                  <td className="cp-ir-fin-td cp-ir-fin-td--date">{doc.CREATE_DATE}</td>
                  <td className="cp-ir-fin-td cp-ir-fin-td--type">
                    <PdfBadge />
                  </td>
                  <td className="cp-ir-fin-td cp-ir-fin-td--action">
                    <button
                      className="cp-ir-fin-download-btn"
                      onClick={() => downloadIrMaterialByDocId(doc.DOC_ID)}
                      title="Download"
                    >
                      <DownloadIcon />
                      <span>Download</span>
                    </button>
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
  const [entries, setEntries] = useState<IrMaterialEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDocType, setActiveDocType] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getIrMaterialByCoCd(symbol).then((result) => {
      if (!cancelled) {
        setEntries(result);
        if (result.length > 0) {
          // Default to the first distinct DOC_TYPE (data is sorted newest-first)
          const firstType = result[0].DOC_TYPE;
          setActiveDocType(firstType);
        }
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [symbol]);

  if (loading) {
    return (
      <div className="cp-tab-placeholder">
        <span className="cp-tab-placeholder-text">Loading…</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="cp-tab-placeholder">
        <span className="cp-tab-placeholder-text">
          IR Material for {symbol} — Content coming soon
        </span>
      </div>
    );
  }

  // Build ordered list of distinct DOC_TYPE values preserving insertion order
  const docTypes = [...new Set(entries.map((e) => e.DOC_TYPE))];

  return (
    <div className="cp-tab-content-box cp-ir-material cp-ir-layout">
      {/* ── Left vertical sub-tab menu ── */}
      <div className="cp-ir-left-menu">
        {docTypes.map((docType) => (
          <button
            key={docType}
            className={`cp-ir-left-tab${activeDocType === docType ? ' active' : ''}`}
            onClick={() => setActiveDocType(docType)}
          >
            {docType.toUpperCase()}
          </button>
        ))}
      </div>

      <IRContent
        symbol={symbol}
        entries={entries}
        activeDocType={activeDocType}
      />
    </div>
  );
}
