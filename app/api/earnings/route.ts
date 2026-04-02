import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [epsRows, revenueRows] = await Promise.all([
    prisma.epsRow.findMany({ orderBy: { id: 'asc' } }),
    prisma.revenueRow.findMany({ orderBy: { id: 'asc' } }),
  ]);
  return NextResponse.json({ epsRows, revenueRows });
}
