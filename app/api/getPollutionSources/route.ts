import { NextResponse } from 'next/server';

const ITEMS = [
  { name: '南亞塑膠工業股份有限公司', city: '桃園市', date: '2024/10/15', reason: '廢水超標排放', fine: '200,000', law: '水污染防治法' },
  { name: '台灣化學纖維股份有限公司', city: '彰化縣', date: '2024/09/20', reason: '空氣污染物超量', fine: '300,000', law: '空氣污染防制法' },
  { name: '長春石油化學股份有限公司', city: '雲林縣', date: '2024/08/11', reason: '有毒物質洩漏', fine: '500,000', law: '毒性化學物質管理法' },
  { name: '中鋼股份有限公司', city: '高雄市', date: '2024/11/03', reason: '煙塵超標', fine: '150,000', law: '空氣污染防制法' },
  { name: '永豐餘造紙股份有限公司', city: '苗栗縣', date: '2024/07/22', reason: '廢水處理不當', fine: '120,000', law: '水污染防治法' },
  { name: '台灣化成工業股份有限公司', city: '台南市', date: '2024/12/05', reason: '廢棄物非法棄置', fine: '400,000', law: '廢棄物清理法' },
  { name: '大同股份有限公司', city: '台北市', date: '2024/06/18', reason: '噪音超標', fine: '80,000', law: '噪音管制法' },
  { name: '義聯鋼鐵股份有限公司', city: '高雄市', date: '2024/05/29', reason: '廢氣排放超標', fine: '250,000', law: '空氣污染防制法' },
  { name: '東元電機股份有限公司', city: '桃園市', date: '2024/03/14', reason: '廢水未達標', fine: '100,000', law: '水污染防治法' },
  { name: '宏碁股份有限公司', city: '新北市', date: '2024/04/08', reason: '有害事業廢棄物違規', fine: '180,000', law: '廢棄物清理法' },
];

export async function GET() {
  return NextResponse.json({ items: ITEMS });
}
