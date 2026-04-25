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

// ── NoFileModal ───────────────────────────────────────────────────────────────

interface NoFileModalProps {
  onClose: () => void;
}

function NoFileModal({ onClose }: NoFileModalProps) {
  return (
    <div className="wl-modal-overlay cp-ir-no-file-overlay" onClick={onClose}>
      <div
        className="wl-modal cp-ir-no-file-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cp-ir-no-file-title"
      >
        <div className="wl-modal-header">
          <div className="cp-ir-no-file-title-row">
            <span className="cp-ir-no-file-icon" aria-hidden="true">
              <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="7" cy="7" r="6" />
                <path d="M7 4.5v3M7 9.5v.5" />
              </svg>
            </span>
            <span id="cp-ir-no-file-title" className="wl-modal-title">No File Available</span>
          </div>
        </div>
        <div className="wl-modal-body cp-ir-no-file-body">
          <p className="cp-ir-no-file-message">
            There is currently no file available for download.
          </p>
          <div className="cp-ir-no-file-actions">
            <button className="wl-modal-done-btn" onClick={onClose}>OK</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── IRContent ─────────────────────────────────────────────────────────────────

interface IRContentProps {
  symbol: string;
  entries: IrMaterialEntry[];
  activeDocType: string;
  onNoFile: () => void;
}

function IRContent({ symbol, entries, activeDocType, onNoFile }: IRContentProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const filtered = entries
    .filter((e) => e.DOC_TYPE === activeDocType)
    .sort((a, b) => b.CREATE_DATE.localeCompare(a.CREATE_DATE));

  if (filtered.length === 0) {
    return (
      <div className="cp-ir-tab-content">
        <div className="cp-tab-placeholder">
          <span className="cp-tab-placeholder-text">No documents available</span>
        </div>
      </div>
    );
  }

  const handleDownload = async (docId: string) => {
    setDownloading(docId);
    try {
      const success = await downloadIrMaterialByDocId(docId);
      if (!success) onNoFile();
    } finally {
      setDownloading(null);
    }
  };

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
                      onClick={() => handleDownload(doc.DOC_ID)}
                      disabled={downloading === doc.DOC_ID}
                      title="Download"
                    >
                      <DownloadIcon />
                      <span>{downloading === doc.DOC_ID ? 'Loading…' : 'Download'}</span>
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
  const [showNoFileModal, setShowNoFileModal] = useState(false);

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
    <>
      {showNoFileModal && <NoFileModal onClose={() => setShowNoFileModal(false)} />}
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
          onNoFile={() => setShowNoFileModal(true)}
        />
      </div>
    </>
  );
}
