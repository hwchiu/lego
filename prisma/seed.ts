/**
 * Seed script — populates the SQLite database from the original static TypeScript data.
 * Run with: npx prisma db seed
 */
import { PrismaClient } from '@prisma/client';
import { weekDays, aprilMonthData, epsData, revenueData } from '../app/data/earnings';
import { newsItems } from '../app/data/news';
import { bannerSlides } from '../app/data/banner';

const prisma = new PrismaClient();

async function main() {
  // Clear all tables first so the seed is idempotent
  await prisma.newsTag.deleteMany();
  await prisma.newsItem.deleteMany();
  await prisma.earningsDay.deleteMany();
  await prisma.epsRow.deleteMany();
  await prisma.revenueRow.deleteMany();
  await prisma.bannerSlide.deleteMany();

  // Earnings calendar days (week view + full month view combined)
  const allDays = [...weekDays, ...aprilMonthData];
  for (const day of allDays) {
    await prisma.earningsDay.upsert({
      where: { dateLabel: day.dateLabel },
      update: {
        dayLabel: day.dayLabel,
        isToday: day.isToday ?? false,
        isOutOfMonth: day.isOutOfMonth ?? false,
        companyCount: day.companyCount ?? null,
        companies: day.companies ? JSON.stringify(day.companies) : null,
      },
      create: {
        dayLabel: day.dayLabel,
        dateLabel: day.dateLabel,
        isToday: day.isToday ?? false,
        isOutOfMonth: day.isOutOfMonth ?? false,
        companyCount: day.companyCount ?? null,
        companies: day.companies ? JSON.stringify(day.companies) : null,
      },
    });
  }

  // EPS rows
  for (const row of epsData) {
    await prisma.epsRow.create({
      data: {
        symbol: row.symbol,
        company: row.company,
        report: row.report,
        mktCap: row.mktCap,
        epsNormalized: row.epsNormalized,
        epsYoY: row.epsYoY,
        epsYoYPositive: row.epsYoYPositive,
        epsGaap: row.epsGaap,
        epsActual: row.epsActual ?? null,
        epsBeatMiss: row.epsBeatMiss ?? null,
        lastQGaap: row.lastQGaap,
        lastQBeatMiss: row.lastQBeatMiss ?? null,
        beatsL2Y: row.beatsL2Y,
        missedL2Y: row.missedL2Y,
      },
    });
  }

  // Revenue rows
  for (const row of revenueData) {
    await prisma.revenueRow.create({
      data: {
        symbol: row.symbol,
        company: row.company,
        report: row.report,
        mktCap: row.mktCap,
        revConsensus: row.revConsensus,
        revYoY: row.revYoY,
        revYoYPositive: row.revYoYPositive,
        revHighEst: row.revHighEst,
        revActual: row.revActual ?? null,
        revBeatMiss: row.revBeatMiss ?? null,
        lastQActual: row.lastQActual,
        lastQBeatMiss: row.lastQBeatMiss ?? null,
      },
    });
  }

  // News items + tags
  for (const item of newsItems) {
    await prisma.newsItem.create({
      data: {
        id: item.id,
        source: item.source,
        title: item.title,
        category: item.category,
        publishedAt: item.publishedAt,
        url: item.url,
        tags: {
          create: item.tags.map((tag) => ({
            symbol: tag.symbol,
            name: tag.name,
            change: tag.change,
          })),
        },
      },
    });
  }

  // Banner slides
  for (let i = 0; i < bannerSlides.length; i++) {
    const slide = bannerSlides[i];
    await prisma.bannerSlide.create({
      data: {
        label: slide.label,
        labelVariant: slide.labelVariant,
        prefix: slide.prefix ?? null,
        linkText: slide.linkText,
        linkHref: slide.linkHref,
        sortOrder: i,
      },
    });
  }

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
