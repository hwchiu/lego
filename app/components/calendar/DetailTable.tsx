'use client';

import { useState } from 'react';
import { EpsRow, RevenueRow, BeatMiss } from '@/app/data/earnings';

function BeatMissTag({ value }: { value: BeatMiss }) {
  if (!value) return <span className="td-na">—</span>;
  return <span className={value === 'Beat' ? 'beat' : 'miss'}>{value}</span>;
}

function EpsTable({ data }: { data: EpsRow[] }) {
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
              <td className="td-mktcap">{row.mktCap}</td>
              <td className="td-num">{row.epsNormalized}</td>
              <td className={`td-num ${row.epsYoYPositive ? 'pos' : 'neg'}`}>
                {row.epsYoY}
              </td>
              <td className="td-num">{row.epsGaap}</td>
              <td className={`td-num ${row.epsActual ? '' : 'td-na'}`}>
                {row.epsActual ?? '—'}
              </td>
              <td className="td-num">
                <BeatMissTag value={row.epsBeatMiss} />
              </td>
              <td className="td-num">{row.lastQGaap}</td>
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

function RevenueTable({ data }: { data: RevenueRow[] }) {
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
              <td className="td-mktcap">{row.mktCap}</td>
              <td className="td-num">{row.revConsensus}</td>
              <td className={`td-num ${row.revYoYPositive ? 'pos' : 'neg'}`}>
                {row.revYoY}
              </td>
              <td className="td-num">{row.revHighEst}</td>
              <td className={`td-num ${row.revActual ? '' : 'td-na'}`}>
                {row.revActual ?? '—'}
              </td>
              <td className="td-num">
                <BeatMissTag value={row.revBeatMiss} />
              </td>
              <td className="td-num">{row.lastQActual}</td>
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
}: {
  epsData: EpsRow[];
  revenueData: RevenueRow[];
}) {
  const [activeTab, setActiveTab] = useState<'eps' | 'revenue'>('eps');

  return (
    <div className="detail-card">
      <div className="detail-header">
        <div className="detail-eyebrow">
          01 April, 2026 &nbsp;·&nbsp; 19 Companies
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
        <EpsTable data={epsData} />
      ) : (
        <RevenueTable data={revenueData} />
      )}
    </div>
  );
}
