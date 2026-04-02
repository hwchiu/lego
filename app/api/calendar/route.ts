import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const days = await prisma.earningsDay.findMany({ orderBy: { id: 'asc' } });
  // Parse the JSON-encoded companies array for each day
  const parsed = days.map((d) => {
    let companies: string[] | undefined;
    if (d.companies) {
      try {
        companies = JSON.parse(d.companies) as string[];
      } catch {
        companies = undefined;
      }
    }
    return { ...d, companies };
  });
  return NextResponse.json(parsed);
}
