import { NextResponse } from 'next/server';

const ITEMS = [
  { id: 'disqualified-vendors', year: '2025', date: '2025/06/09' },
  { id: 'pollution-sources',    year: '2025', date: '2025/06/09' },
  { id: 'labor-basic',          year: '2025', date: '2025/06/09' },
  { id: 'labor-gender',         year: '2025', date: '2025/06/09' },
  { id: 'labor-safety',         year: '2025', date: '2025/06/09' },
  { id: 'labor-min-wage',       year: '2025', date: '2025/06/09' },
];

export async function GET() {
  return NextResponse.json({ items: ITEMS });
}
