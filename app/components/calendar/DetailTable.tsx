'use client';

import { useState, useCallback } from 'react';
import { EpsRow, RevenueRow, BeatMiss } from '@/app/data/earnings';
import { monthShortToFull } from '@/app/lib/calendarUtils';

/**
 * Matches optional sign characters in money strings:
 *   \u2212 = Unicode minus sign (−), \u002D = ASCII hyphen-minus (-)
 */
const MONEY_SIGN_RE = /^([\u2212\u002D]?)\$([0-9,]+(?:\.[0-9]*)?)([BT]?)$/;

/**
 * Convert a formatted USD money string to NTD.
 * Handles formats: "$2.45", "−$0.06", "$82.4B", "$1.2T", null/dash.
 * Returns the NTD string, '—' for null/empty, or the original if parsing fails.
 */
function convertToNtd(value: string | null, rate: number): string {
  if (!value || value === '—') return '—';
  const match = value.match(MONEY_SIGN_RE);
  if (!match) return value;
  const sign = match[1] === '\u2212' ? '−' : match[1];
  const num = parseFloat(match[2].replace(/,/g, ''));
  const suffix = match[3];
  const converted = num * rate;
  // Format: no suffix → 2 decimals; with suffix → 1 decimal with thousands separator
  const formatted = suffix
    ? converted.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${sign}NT$${formatted}${suffix}`;
}

function BeatMissTag({ value }: { value: BeatMiss }) {
  if (!value) return <span className="td-na">—</span>;
  return <span className={value === 'Beat' ? 'beat' : 'miss'}>{value}</span>;
}

interface EpsTableProps {
  data: EpsRow[];
  currency: 'USD' | 'NTD';
  rate: number;
}

function EpsTable({ data, currency, rate }: EpsTableProps) {
  const cv = useCallback(
    (v: string | null): string => (currency === 'NTD' ? convertToNtd(v, rate) : (v ?? '—')),
    [currency, rate],
  );

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th rowSpan={2}>Symbol</th>
            <th rowSpan={2}>Company</th>
            <th rowSpan={2}>Report</th>
            <th rowSpan={2}>Mkt Cap</th>
            <th colSpan={3} className="th-group">
              Current Quarter EPS Estimates
            </th>
            <th rowSpan={2}>Actual</th>
            <th rowSpan={2}>Beat / Miss</th>
            <th colSpan={2} className="th-group">
              Last Quarter EPS
            </th>
            <th colSpan={2} className="th-group">
              # Beats &amp; Missed (L2Y)
            </th>
          </tr>
          <tr className="sub-head">
            <th className="sub-group-inner">Normalized</th>
            <th>YoY Growth</th>
            <th>GAAP</th>
            <th className="sub-group-inner">GAAP</th>
            <th>Beat / Miss</th>
            <th className="sub-group-inner">Beats</th>
            <th>Missed</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.symbol}>
              <td className="td-symbol">{row.symbol}</td>
              <td className="td-company">{row.company}</td>
              <td>
                <span className="td-report">{row.report}</span>
              </td>
              <td className="td-mktcap">{cv(row.mktCap)}</td>
              <td className="td-num">{cv(row.epsNormalized)}</td>
              <td className={`td-num ${row.epsYoYPositive ? 'pos' : 'neg'}`}>
                {row.epsYoY}
              </td>
              <td className="td-num">{cv(row.epsGaap)}</td>
              <td className={`td-num ${row.epsActual ? '' : 'td-na'}`}>
                {cv(row.epsActual)}
              </td>
              <td className="td-num">
                <BeatMissTag value={row.epsBeatMiss} />
              </td>
              <td className="td-num">{cv(row.lastQGaap)}</td>
              <td className="td-num">
                <BeatMissTag value={row.lastQBeatMiss} />
              </td>
              <td className="td-num td-beats-num">{row.beatsL2Y}</td>
              <td className="td-num td-miss-num">{row.missedL2Y}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface RevenueTableProps {
  data: RevenueRow[];
  currency: 'USD' | 'NTD';
  rate: number;
}

function RevenueTable({ data, currency, rate }: RevenueTableProps) {
  const cv = useCallback(
    (v: string | null): string => (currency === 'NTD' ? convertToNtd(v, rate) : (v ?? '—')),
    [currency, rate],
  );

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th rowSpan={2}>Symbol</th>
            <th rowSpan={2}>Company</th>
            <th rowSpan={2}>Report</th>
            <th rowSpan={2}>Mkt Cap</th>
            <th colSpan={3} className="th-group">
              Current Quarter Revenue Estimates
            </th>
            <th rowSpan={2}>Actual</th>
            <th rowSpan={2}>Beat / Miss</th>
            <th colSpan={2} className="th-group">
              Last Quarter Revenue
            </th>
          </tr>
          <tr className="sub-head">
            <th className="sub-group-inner">Consensus</th>
            <th>YoY Growth</th>
            <th>High Est.</th>
            <th className="sub-group-inner">Actual</th>
            <th>Beat / Miss</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.symbol}>
              <td className="td-symbol">{row.symbol}</td>
              <td className="td-company">{row.company}</td>
              <td>
                <span className="td-report">{row.report}</span>
              </td>
              <td className="td-mktcap">{cv(row.mktCap)}</td>
              <td className="td-num">{cv(row.revConsensus)}</td>
              <td className={`td-num ${row.revYoYPositive ? 'pos' : 'neg'}`}>
                {row.revYoY}
              </td>
              <td className="td-num">{cv(row.revHighEst)}</td>
              <td className={`td-num ${row.revActual ? '' : 'td-na'}`}>
                {cv(row.revActual)}
              </td>
              <td className="td-num">
                <BeatMissTag value={row.revBeatMiss} />
              </td>
              <td className="td-num">{cv(row.lastQActual)}</td>
              <td className="td-num">
                <BeatMissTag value={row.lastQBeatMiss} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DetailTable({
  epsData,
  revenueData,
  selectedDateLabel,
  companyCount,
  currency = 'USD',
  usdToTwdRate = 32.7,
}: {
  epsData: EpsRow[];
  revenueData: RevenueRow[];
  selectedDateLabel?: string;
  companyCount?: number;
  currency?: 'USD' | 'NTD';
  usdToTwdRate?: number;
}) {
  const [activeTab, setActiveTab] = useState<'eps' | 'revenue'>('eps');

  // Format the date label for display, e.g. "Apr 5" → "05 April"
  const displayDate = selectedDateLabel
    ? (() => {
        const parts = selectedDateLabel.split(' ');
        const day = parts[1]?.padStart(2, '0') ?? '';
        const month = monthShortToFull(parts[0]);
        return `${day} ${month}`;
      })()
    : '—';

  const count = companyCount ?? epsData.length;

  return (
    <div className="detail-card">
      <div className="detail-header">
        <div className="detail-eyebrow">
          {displayDate} &nbsp;·&nbsp; {count} {count === 1 ? 'Company' : 'Companies'}
        </div>
        <div className="detail-tabs">
          <button
            className={`detail-tab ${activeTab === 'eps' ? 'active' : ''}`}
            onClick={() => setActiveTab('eps')}
          >
            EPS
          </button>
          <button
            className={`detail-tab ${activeTab === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveTab('revenue')}
          >
            Revenue
          </button>
          <button className="detail-tab locked" disabled>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <rect x="2" y="5.5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4 5.5V4C4 2.9 4.9 2 6 2s2 .9 2 2v1.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            Analysts Revisions &amp; Ratings
          </button>
        </div>
      </div>
      {activeTab === 'eps' ? (
        <EpsTable data={epsData} currency={currency} rate={usdToTwdRate} />
      ) : (
        <RevenueTable data={revenueData} currency={currency} rate={usdToTwdRate} />
      )}
    </div>
  );
}
