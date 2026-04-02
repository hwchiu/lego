import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await prisma.newsItem.findMany({
    orderBy: { publishedAt: 'desc' },
    include: { tags: true },
  });
  return NextResponse.json(items);
}
