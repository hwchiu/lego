import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const slides = await prisma.bannerSlide.findMany({
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(slides);
}
