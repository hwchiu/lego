import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import MarketTabs from '@/app/components/calendar/MarketTabs';
import EarningsCalendarSection from '@/app/components/calendar/EarningsCalendarSection';
import DetailTable from '@/app/components/calendar/DetailTable';
import { prisma } from '@/app/lib/prisma';
import type { EpsRow, RevenueRow, WeekDay } from '@/app/data/earnings';

// Force dynamic rendering so that every request reads live data from the database
export const dynamic = 'force-dynamic';

export default async function EventCalendarPage() {
  const [bannerSlides, earningsDays, epsRows, revenueRows] = await Promise.all([
    prisma.bannerSlide.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.earningsDay.findMany({ orderBy: { id: 'asc' } }),
    prisma.epsRow.findMany({ orderBy: { id: 'asc' } }),
    prisma.revenueRow.findMany({ orderBy: { id: 'asc' } }),
  ]);

  // Parse the JSON-encoded companies field back to string[]
  const parsedDays = earningsDays.map((d) => {
    let companies: string[] | undefined;
    if (d.companies) {
      try {
        companies = JSON.parse(d.companies) as string[];
      } catch {
        companies = undefined;
      }
    }
    return {
      dayLabel: d.dayLabel,
      dateLabel: d.dateLabel,
      isToday: d.isToday,
      isOutOfMonth: d.isOutOfMonth,
      companyCount: d.companyCount ?? undefined,
      companies,
    };
  }) satisfies WeekDay[];

  // Split into week view (7 days, dateLabels like "Mar 29" to "Apr 4") vs month data
  const weekDays = parsedDays.slice(0, 7);
  const monthData = parsedDays.slice(7);

  const epsData = epsRows.map((r) => ({
    symbol: r.symbol,
    company: r.company,
    report: r.report as EpsRow['report'],
    mktCap: r.mktCap,
    epsNormalized: r.epsNormalized,
    epsYoY: r.epsYoY,
    epsYoYPositive: r.epsYoYPositive,
    epsGaap: r.epsGaap,
    epsActual: r.epsActual,
    epsBeatMiss: r.epsBeatMiss as EpsRow['epsBeatMiss'],
    lastQGaap: r.lastQGaap,
    lastQBeatMiss: r.lastQBeatMiss as EpsRow['lastQBeatMiss'],
    beatsL2Y: r.beatsL2Y,
    missedL2Y: r.missedL2Y,
  })) satisfies EpsRow[];

  const revenueData = revenueRows.map((r) => ({
    symbol: r.symbol,
    company: r.company,
    report: r.report as RevenueRow['report'],
    mktCap: r.mktCap,
    revConsensus: r.revConsensus,
    revYoY: r.revYoY,
    revYoYPositive: r.revYoYPositive,
    revHighEst: r.revHighEst,
    revActual: r.revActual,
    revBeatMiss: r.revBeatMiss as RevenueRow['revBeatMiss'],
    lastQActual: r.lastQActual,
    lastQBeatMiss: r.lastQBeatMiss as RevenueRow['lastQBeatMiss'],
  })) satisfies RevenueRow[];

  return (
    <>
      <TopNav />
      <Banner slides={bannerSlides} />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad">
            <div className="section-eyebrow">Event Category</div>
            <MarketTabs />
            <EarningsCalendarSection weekDays={weekDays} monthData={monthData} />
            <DetailTable epsData={epsData} revenueData={revenueData} />
          </div>
        </main>
      </div>
    </>
  );
}
