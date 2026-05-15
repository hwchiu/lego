import { NextResponse } from 'next/server';

const ITEMS = [
  { name: '豐盛工程有限公司', id: '12345678', period: '2024/03/01–2026/02/28', reason: '偽造文書、詐欺', agency: '行政院公共工程委員會' },
  { name: '大成建設股份有限公司', id: '23456789', period: '2024/05/15–2025/05/14', reason: '圍標', agency: '採購機關' },
  { name: '信義科技股份有限公司', id: '34567890', period: '2023/11/01–2024/10/31', reason: '履約品質不符', agency: '行政院公共工程委員會' },
  { name: '華光電子工業股份有限公司', id: '45678901', period: '2024/01/20–2025/01/19', reason: '違反採購法', agency: '採購機關' },
  { name: '東方資訊股份有限公司', id: '56789012', period: '2024/07/01–2026/06/30', reason: '洗錢防制', agency: '法務部' },
  { name: '新興企業股份有限公司', id: '67890123', period: '2023/09/01–2024/08/31', reason: '偽造標單', agency: '行政院公共工程委員會' },
  { name: '明德科技股份有限公司', id: '78901234', period: '2024/04/10–2025/04/09', reason: '違反採購法', agency: '採購機關' },
  { name: '長隆機械有限公司', id: '89012345', period: '2024/08/01–2025/07/31', reason: '未依約交貨', agency: '採購機關' },
  { name: '興業貿易股份有限公司', id: '90123456', period: '2023/12/01–2024/11/30', reason: '圍標', agency: '行政院公共工程委員會' },
  { name: '金鑫企業有限公司', id: '01234567', period: '2024/06/01–2025/05/31', reason: '不實申報', agency: '採購機關' },
];

export async function GET() {
  return NextResponse.json({ items: ITEMS });
}
