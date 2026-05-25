import { NextResponse } from 'next/server';

interface DailyQuoteTemplateItem {
  security_code: string;
  suspension_of_buy_after_sale_day_trading: string;
  volume: string;
  day_trading_value_of_buys: string;
  trading_value_of_sells: string;
}

const ITEMS_TEMPLATE: DailyQuoteTemplateItem[] = [
  {
    security_code: '2330',
    suspension_of_buy_after_sale_day_trading: 'N',
    volume: '6,430,000',
    day_trading_value_of_buys: '6,250,110,000',
    trading_value_of_sells: '6,198,930,000',
  },
  {
    security_code: '2317',
    suspension_of_buy_after_sale_day_trading: 'N',
    volume: '5,567,000',
    day_trading_value_of_buys: '659,581,000',
    trading_value_of_sells: '650,440,000',
  },
  {
    security_code: '2454',
    suspension_of_buy_after_sale_day_trading: 'Y',
    volume: '2,010,000',
    day_trading_value_of_buys: '1,830,220,000',
    trading_value_of_sells: '1,812,740,000',
  },
  {
    security_code: '2881',
    suspension_of_buy_after_sale_day_trading: 'N',
    volume: '3,763,000',
    day_trading_value_of_buys: '319,882,000',
    trading_value_of_sells: '318,211,000',
  },
  {
    security_code: '2882',
    suspension_of_buy_after_sale_day_trading: 'N',
    volume: '4,232,000',
    day_trading_value_of_buys: '410,401,000',
    trading_value_of_sells: '408,702,000',
  },
  {
    security_code: '2891',
    suspension_of_buy_after_sale_day_trading: 'N',
    volume: '2,458,000',
    day_trading_value_of_buys: '270,552,000',
    trading_value_of_sells: '269,399,000',
  },
];

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getTodayIsoDate(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return toIsoDate(now);
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date')?.trim();
  const tradingDate = dateParam && isIsoDate(dateParam) ? dateParam : getTodayIsoDate();

  const items = ITEMS_TEMPLATE.map((item) => ({
    trading_date: tradingDate,
    security_code: item.security_code,
    suspension_of_buy_after_sale_day_trading: item.suspension_of_buy_after_sale_day_trading,
    volume: item.volume,
    day_trading_value_of_buys: item.day_trading_value_of_buys,
    trading_value_of_sells: item.trading_value_of_sells,
  }));

  return NextResponse.json({ items });
}
