import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import MarketNewsClient from '@/app/components/news/MarketNewsClient';
import { prisma } from '@/app/lib/prisma';

// Force dynamic rendering so that every request reads live data from the database
export const dynamic = 'force-dynamic';

export default async function MarketNewsPage() {
  const [bannerSlides, newsItems] = await Promise.all([
    prisma.bannerSlide.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.newsItem.findMany({
      orderBy: { publishedAt: 'desc' },
      include: { tags: true },
    }),
  ]);

  return (
    <>
      <TopNav />
      <Banner slides={bannerSlides} />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad">
            <div className="section-eyebrow">Market News</div>
            <h1 className="news-page-title">Top Market News</h1>
            <MarketNewsClient newsItems={newsItems} />
          </div>
        </main>
      </div>
    </>
  );
}
