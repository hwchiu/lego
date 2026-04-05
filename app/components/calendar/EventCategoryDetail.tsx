'use client';

import type {
  AnyEvent,
  BondEvent,
  CommodityEvent,
  CountryEvent,
  CryptoEvent,
  CurrencyEvent,
  DividendGrowthEvent,
  DividendEvent,
  DetailLayout,
} from '@/app/data/eventCategories';
import { monthShortToFull } from '@/app/lib/calendarUtils';

// ─── Shared helpers ──────────────────────────────────────────────────────────

function formatDateLabel(dateLabel: string | undefined): string {
  if (!dateLabel) return '—';
  const parts = dateLabel.split(' ');
  const day = parts[1]?.padStart(2, '0') ?? '';
  const month = monthShortToFull(parts[0]);
  return `${day} ${month}`;
}

function ImpactBadge({ impact }: { impact: 'High' | 'Medium' | 'Low' }) {
  const cls =
    impact === 'High'
      ? 'ec-impact ec-impact--high'
      : impact === 'Medium'
        ? 'ec-impact ec-impact--medium'
        : 'ec-impact ec-impact--low';
  return <span className={cls}>{impact}</span>;
}

function ChangePill({ value }: { value: string }) {
  const isNeg = value.startsWith('-');
  return <span className={isNeg ? 'ec-change neg' : 'ec-change pos'}>{value}</span>;
}

function EventTypeBadge({ label }: { label: string }) {
  return <span className="ec-type-badge">{label}</span>;
}

function AffectedCompanies({ companies }: { companies: string[] }) {
  return (
    <div className="ec-affected">
      {companies.map((c) => (
        <span key={c} className="ec-affected-tag">
          {c}
        </span>
      ))}
    </div>
  );
}

// ─── Bonds — card layout ─────────────────────────────────────────────────────

function BondsCards({ events }: { events: BondEvent[] }) {
  return (
    <div className="ec-cards-grid">
      {events.map((e, i) => (
        <div key={i} className="ec-event-card">
          <div className="ec-card-top">
            <div className="ec-card-company">
              <span className="ec-card-symbol">{e.symbol}</span>
              <span className="ec-card-name">{e.company}</span>
            </div>
            <EventTypeBadge label={e.eventType} />
          </div>
          <p className="ec-card-desc">{e.description}</p>
          <div className="ec-card-metrics">
            {e.amount !== '—' && (
              <div className="ec-metric">
                <span className="ec-metric-label">Amount</span>
                <span className="ec-metric-value">{e.amount}</span>
              </div>
            )}
            {e.coupon !== '—' && (
              <div className="ec-metric">
                <span className="ec-metric-label">Coupon</span>
                <span className="ec-metric-value">{e.coupon}</span>
              </div>
            )}
            {e.maturity !== '—' && (
              <div className="ec-metric">
                <span className="ec-metric-label">Maturity</span>
                <span className="ec-metric-value">{e.maturity}</span>
              </div>
            )}
            <div className="ec-metric">
              <span className="ec-metric-label">Rating</span>
              <span className="ec-metric-value ec-rating">{e.rating}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Countries — card layout ─────────────────────────────────────────────────

function CountriesCards({ events }: { events: CountryEvent[] }) {
  return (
    <div className="ec-cards-grid">
      {events.map((e, i) => (
        <div key={i} className="ec-event-card">
          <div className="ec-card-top">
            <div className="ec-card-company">
              <span className="ec-flag">{e.flag}</span>
              <span className="ec-card-name">{e.country}</span>
            </div>
            <div className="ec-card-badges">
              <EventTypeBadge label={e.eventType} />
              <ImpactBadge impact={e.impact} />
            </div>
          </div>
          <p className="ec-card-title">{e.title}</p>
          <p className="ec-card-desc">{e.description}</p>
          <div className="ec-card-footer">
            <span className="ec-metric-label">Related Companies</span>
            <AffectedCompanies companies={e.affectedCompanies} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Commodities — table layout ───────────────────────────────────────────────

function CommoditiesTable({ events }: { events: CommodityEvent[] }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Commodity</th>
            <th>Unit</th>
            <th className="td-num-h">Price</th>
            <th className="td-num-h">Change</th>
            <th className="td-num-h">Chg %</th>
            <th className="td-num-h">Wk High</th>
            <th className="td-num-h">Wk Low</th>
            <th>Semiconductor Relevance</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={i}>
              <td className="td-symbol">{e.commodity}</td>
              <td className="td-company" style={{ fontSize: 11 }}>{e.unit}</td>
              <td className="td-num">{e.price}</td>
              <td className="td-num">
                <ChangePill value={e.change} />
              </td>
              <td className="td-num">
                <ChangePill value={e.changePct} />
              </td>
              <td className="td-num">{e.weekHigh}</td>
              <td className="td-num">{e.weekLow}</td>
              <td className="ec-relevance">{e.relevance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Cryptocurrency — table layout ───────────────────────────────────────────

function CryptoTable({ events }: { events: CryptoEvent[] }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th className="td-num-h">Price (USD)</th>
            <th className="td-num-h">Change</th>
            <th className="td-num-h">Chg %</th>
            <th className="td-num-h">Volume (24h)</th>
            <th className="td-num-h">Market Cap</th>
            <th>Semiconductor Relevance</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={i}>
              <td className="td-symbol">{e.cryptoSymbol}</td>
              <td className="td-company">{e.name}</td>
              <td className="td-num">${Number(e.price).toLocaleString()}</td>
              <td className="td-num">
                <ChangePill value={e.change} />
              </td>
              <td className="td-num">
                <ChangePill value={e.changePct} />
              </td>
              <td className="td-num">{e.volume}</td>
              <td className="td-num">{e.marketCap}</td>
              <td className="ec-relevance">{e.relevance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Currencies — table layout ───────────────────────────────────────────────

function CurrenciesTable({ events }: { events: CurrencyEvent[] }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Pair</th>
            <th className="td-num-h">Rate</th>
            <th className="td-num-h">Change</th>
            <th className="td-num-h">Chg %</th>
            <th>Affected Companies</th>
            <th>Commentary</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={i}>
              <td className="td-symbol">{e.pair}</td>
              <td className="td-num">{e.rate}</td>
              <td className="td-num">
                <ChangePill value={e.change} />
              </td>
              <td className="td-num">
                <ChangePill value={e.changePct} />
              </td>
              <td>
                <AffectedCompanies companies={e.affectedCompanies} />
              </td>
              <td className="ec-relevance">{e.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Dividend Growth (Aristocrats / Champions) — table layout ─────────────────

function DividendGrowthTable({ events }: { events: DividendGrowthEvent[] }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Company</th>
            <th>Ex-Date</th>
            <th>Pay-Date</th>
            <th className="td-num-h">Dividend</th>
            <th className="td-num-h">Annual</th>
            <th className="td-num-h">Yield</th>
            <th>Frequency</th>
            <th className="td-num-h">Consec. Years</th>
            <th className="td-num-h">Annual Growth</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={i}>
              <td className="td-symbol">{e.symbol}</td>
              <td className="td-company">{e.company}</td>
              <td>{e.exDate}</td>
              <td>{e.payDate}</td>
              <td className="td-num">{e.dividend}</td>
              <td className="td-num">{e.annualDividend}</td>
              <td className="td-num pos">{e.yield}</td>
              <td>{e.frequency}</td>
              <td className="td-num">{e.consecutiveYears}</td>
              <td className="td-num pos">{e.annualGrowth}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Basic Dividends — table layout ──────────────────────────────────────────

function DividendsTable({ events }: { events: DividendEvent[] }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Company</th>
            <th>Ex-Date</th>
            <th>Pay-Date</th>
            <th className="td-num-h">Dividend</th>
            <th className="td-num-h">Yield</th>
            <th>Frequency</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={i}>
              <td className="td-symbol">{e.symbol}</td>
              <td className="td-company">{e.company}</td>
              <td>{e.exDate}</td>
              <td>{e.payDate}</td>
              <td className="td-num">{e.dividend}</td>
              <td className="td-num pos">{e.yield}</td>
              <td>{e.frequency}</td>
              <td>
                <EventTypeBadge label={e.type} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main detail component ────────────────────────────────────────────────────

interface EventCategoryDetailProps {
  categoryId: string;
  categoryLabel: string;
  layout: DetailLayout;
  events: AnyEvent[];
  selectedDateLabel?: string;
  eventCount?: number;
}

export default function EventCategoryDetail({
  categoryId,
  categoryLabel,
  layout,
  events,
  selectedDateLabel,
  eventCount,
}: EventCategoryDetailProps) {
  const displayDate = formatDateLabel(selectedDateLabel);
  const count = eventCount ?? events.length;

  function renderContent() {
    if (events.length === 0) {
      return (
        <div className="ec-empty">
          <p className="ec-empty-text">No {categoryLabel} events on this date.</p>
        </div>
      );
    }

    if (layout === 'card') {
      if (categoryId === 'bonds') return <BondsCards events={events as BondEvent[]} />;
      if (categoryId === 'countries') return <CountriesCards events={events as CountryEvent[]} />;
    }

    // table layouts
    if (categoryId === 'commodities') return <CommoditiesTable events={events as CommodityEvent[]} />;
    if (categoryId === 'cryptocurrency') return <CryptoTable events={events as CryptoEvent[]} />;
    if (categoryId === 'currencies') return <CurrenciesTable events={events as CurrencyEvent[]} />;
    if (categoryId === 'dividendAristocrats' || categoryId === 'dividendChampions')
      return <DividendGrowthTable events={events as DividendGrowthEvent[]} />;
    if (categoryId === 'dividends') return <DividendsTable events={events as DividendEvent[]} />;

    return null;
  }

  return (
    <div className="detail-card">
      <div className="detail-header">
        <div className="detail-eyebrow">
          {displayDate}&nbsp;·&nbsp;{count} {count === 1 ? 'Event' : 'Events'}
        </div>
        <div className="detail-tabs">
          <button className="detail-tab active">{categoryLabel}</button>
        </div>
      </div>
      {renderContent()}
    </div>
  );
}
