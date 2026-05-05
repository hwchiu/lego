# Common Formatting 方法規劃

> 本文件盤點 (1) Company Profile 各 tab、(2) Watchlist、(3) Event Calendar 三大區塊的數值與日期渲染邏輯，並規劃統一的 `formatters.ts` 工具函式庫。

---

## 一、現況盤點 — 渲染邏輯清查

### 1. Company Profile

#### 1-1. FundingTab.tsx
| 資料欄位 | 現況格式化方式 | 備註 |
|---|---|---|
| `money_raised_usd` / `fund_amount_usd` (in M) | 自訂 `formatUsdValueM()`：`≥1000M → $X.XB`，`<1000M → $X,XXXM` | 每個 tab 各自重寫 |
| `publ_dt` (日期字串) | 擷取前 10 碼 `YYYY-MM-DD` | inline 實作 |

```typescript
// FundingTab.tsx — 局部定義，無法跨 tab 共用
function formatUsdValueM(valueM: number): string {
  return valueM >= 1000
    ? `$${(valueM / 1000).toFixed(1)}B`
    : `$${valueM.toLocaleString()}M`;
}
```

#### 1-2. InvestmentTab.tsx
| 資料欄位 | 現況格式化方式 | 備註 |
|---|---|---|
| `valueM` (investment) | `≥1000 → $X.XXB`；`<1000 → $X,XXXM` | 與 FundingTab 邏輯相近但 toFixed 位數不同 (2 vs 1) |
| `date` | 原始字串直接輸出 | 無 format |

#### 1-3. AcquisitionTab.tsx
| 資料欄位 | 現況格式化方式 | 備註 |
|---|---|---|
| `valueM` | 同 InvestmentTab 邏輯 (toFixed 2) | chart tooltip 另有 toFixed 1 |

```typescript
// AcquisitionTab.tsx — chart tooltip (inline)
`${tooltip.valueM >= 1000
  ? `${(tooltip.valueM / 1000).toFixed(1)}B`
  : tooltip.valueM.toLocaleString()}M`
```

#### 1-4. InvestmentNivoCharts.tsx
| 格式化函式 | 用途 |
|---|---|
| `formatChartLabel(valueM)` | 圖表 axis label：`≥1000→$X.XB`，`≥1→$X,XXXM`，`<1→$X.XXM` |
| Inline axis `format` callback | `Number(v).toFixed(0)%`（百分比）、`$X.Xk`（千）、`$X.XB`（十億） |
| Tooltip inline | `$X.XB` / `$X,XXXM` — 重複邏輯 |

```typescript
// InvestmentNivoCharts.tsx — formatChartLabel (唯一較完整的現有實作)
function formatChartLabel(valueM: number): string {
  if (valueM >= 1000) return `$${(valueM / 1000).toFixed(1)}B`;
  if (valueM >= 1) return `$${Math.round(valueM).toLocaleString()}M`;
  return `$${valueM.toFixed(2)}M`;
}
```

#### 1-5. CompanyMATab.tsx
| 資料欄位 | 現況格式化方式 | 備註 |
|---|---|---|
| Y-axis label | `≥1000 → $X.XB`，`>0 → $XM`，else `$0` | inline |
| Tooltip | `≥1000 → $X.XXB`，else `$X,XXXM` | toFixed 2，其他地方為 1 |
| Table `valueM` | `≥1000 → $X.XXB`，else `$X,XXXM` | 同 tooltip |
| Heat map `deals` | `.toLocaleString()` | |

#### 1-6. CompanyProfileContent.tsx
| 資料欄位 | 現況格式化方式 | 備註 |
|---|---|---|
| `revenue` (number) | `.toLocaleString()` | 無單位前綴 |
| `revenueQoQ` (%) | `${v >= 0 ? '+' : ''}${v}%` | inline 符號 |
| `grossMargin` (%) | `${v}%` | 無符號 |
| Breakdown `pct` | `${v}%`、`width: ${Math.min(100,v)}%` | |

#### 1-7. FinancialStatementTab.tsx
| 資料欄位 | 現況格式化方式 | 備註 |
|---|---|---|
| 所有欄位值 | 呼叫 `app/lib/getFinancialStatementByCoCd.ts` 中的 `formatSegmentValue()` / `formatDocAmtStr()` | **已有統一呼叫** |

---

### 2. Watchlist

#### WatchlistContent.tsx / WatchlistArchiveContent.tsx
| Column | 現況格式化方式 | 型別 |
|---|---|---|
| `price` | `.toFixed(2)` | number |
| `change` | `${v >= 0 ? '+' : ''}${v.toFixed(2)}` | number |
| `changePct` | `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` | number |
| `cost` | `.toFixed(2)` | number |
| `marketValue` | `.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` | number (computed) |
| `unrealizedPL` | `${v >= 0 ? '+' : ''}${v.toFixed(2)}` | number (computed) |
| `unrealizedPct` | `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%` | number (computed) |
| `todayGain` | `${v >= 0 ? '+' : ''}${v.toFixed(2)}` | number |
| `todayGainPct` | `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` | number |

> ⚠️ **重複模式**：`sign + toFixed(2)` 與 `sign + toFixed(2) + %` 在同一檔案重複出現 9 次以上。

---

### 3. Event Calendar

#### DetailTable.tsx
| 資料欄位 | 現況格式化方式 | 備註 |
|---|---|---|
| 貨幣金額 (string) | `convertToNtd()` — regex 解析 `$X.XB/T`，換算後重新組字串 | 複雜，含 regex |
| 日期 label | `parts[1].padStart(2,'0') + monthShortToFull(parts[0])` | inline，與其他地方重複 |

```typescript
// DetailTable.tsx — convertToNtd()
const MONEY_SIGN_RE = /^([\u2212\u002D]?)\$([0-9,]+(?:\.[0-9]*)?)([BT]?)$/;
function convertToNtd(value: string | null, rate: number): string { ... }
```

#### CorpEventCategoryDetail.tsx
| 資料欄位 | 現況格式化方式 | 備註 |
|---|---|---|
| `dateLabel` | `formatDateLabel()` — inline 定義 | 與 DetailTable 相同邏輯，重複 |
| `eventDatetime` | `formatEventDatetime()` — UTC string → `YYYY-MM-DD HH:MM` | inline |

#### EventCategoryDetail.tsx
| 資料欄位 | 現況格式化方式 | 備註 |
|---|---|---|
| Crypto price | `$${Number(e.price).toLocaleString()}` | inline |
| `dateLabel` | `formatDateLabel()` — inline 定義 | 與上述相同，再重複一次 |

---

### 現有工具函式 (app/lib/)

| 函式 | 檔案 | 狀態 |
|---|---|---|
| `getDateLabel()` | `calendarUtils.ts` | ✅ 已匯出，部分使用 |
| `getIsoDateLabel()` | `calendarUtils.ts` | ✅ 已匯出 |
| `isoDateToDisplayLabel()` | `calendarUtils.ts` | ✅ 已匯出 |
| `monthShortToFull()` | `calendarUtils.ts` | ✅ 已匯出 |
| `formatSegmentValue()` | `getFinancialStatementByCoCd.ts` | ✅ 已匯出，FinancialStatementTab 使用 |
| `formatDocAmtStr()` | `getFinancialStatementByCoCd.ts` | ✅ 已匯出 |

---

## 二、問題彙整

| # | 問題 | 影響範圍 |
|---|---|---|
| P1 | USD 金額格式化 (`$X.XB` / `$X,XXXM`) 在 5+ 個地方各自實作，且 `toFixed` 位數不一致 (1 vs 2) | FundingTab, InvestmentTab, AcquisitionTab, CompanyMATab, InvestmentNivoCharts |
| P2 | 有號數值格式 (`+X.XX` / `-X.XX`) 在 Watchlist 重複出現 9 次 | WatchlistContent, WatchlistArchiveContent |
| P3 | `formatDateLabel()` 在 3 個 Calendar 相關元件各自定義 | DetailTable, CorpEventCategoryDetail, EventCategoryDetail |
| P4 | 百分比格式 (`+X%` / `X%`) 在多處 inline 實作 | CompanyProfileContent, InvestmentNivoCharts, Watchlist |
| P5 | `formatEventDatetime()` (UTC→本地時間) 僅 CorpEventCategoryDetail 使用，無法共用 | CorpEventCategoryDetail |

---

## 三、Common Formatting 方法規劃

### 目標新增檔案：`app/lib/formatters.ts`

> 放在 `app/lib/` 與現有的 `calendarUtils.ts`、`getFinancialStatementByCoCd.ts` 同層，純函式，無 React 依賴。

---

### 函式清單與簽名

#### 3-1. 金額格式化 (USD，以百萬為單位)

```typescript
/**
 * 格式化以百萬美元為單位的數值
 * @param valueM  數值（單位 M）
 * @param decimals B 級別的小數位數，預設 1
 * @returns "$1.5B" | "$450M" | "$0.50M"
 */
export function formatUsdM(valueM: number, decimals = 1): string
```

| 輸入 (M) | decimals=1 | decimals=2 |
|---|---|---|
| 2500 | `$2.5B` | `$2.50B` |
| 450 | `$450M` | `$450M` |
| 0.5 | `$0.5M` | `$0.50M` |

**取代來源：**
- `FundingTab.formatUsdValueM()` (toFixed 1)
- `InvestmentTab` inline (toFixed 2) → 呼叫 `formatUsdM(v, 2)`
- `AcquisitionTab` inline → 呼叫 `formatUsdM(v, 2)`
- `CompanyMATab` inline → 呼叫 `formatUsdM(v, 1)` / `formatUsdM(v, 2)`
- `InvestmentNivoCharts.formatChartLabel()` → 呼叫 `formatUsdM`

---

#### 3-2. 有號數值 / 百分比格式化 (Watchlist)

```typescript
/**
 * 格式化有符號數值（漲跌幅用）
 * @param value  數值
 * @param decimals 小數位，預設 2
 * @returns "+1.23" | "-0.45"
 */
export function formatSigned(value: number, decimals = 2): string

/**
 * 格式化有符號百分比
 * @returns "+1.23%" | "-0.45%"
 */
export function formatSignedPct(value: number, decimals = 2): string

/**
 * 格式化一般百分比（無符號）
 * @returns "45.3%"
 */
export function formatPct(value: number, decimals = 1): string
```

**取代來源：**
- `WatchlistContent` 所有 `${v >= 0 ? '+' : ''}${v.toFixed(2)}` 欄位
- `WatchlistArchiveContent` 同上
- `CompanyProfileContent` `revenueQoQ`、成長率欄位

---

#### 3-3. 股價格式化

```typescript
/**
 * 格式化股票價格（固定 2 位小數）
 * @returns "123.45"
 */
export function formatPrice(value: number): string
```

**取代來源：**
- `WatchlistContent` `price: h.price.toFixed(2)`
- `WatchlistContent` `cost: h.cost.toFixed(2)`

---

#### 3-4. 大數值格式化（含千分位）

```typescript
/**
 * 格式化大數值（千分位分隔）
 * @param value 數值
 * @param fractionDigits 最少小數位，預設 0
 * @returns "1,234,567" | "1,234.50"
 */
export function formatNumber(value: number, fractionDigits = 0): string
```

**取代來源：**
- `WatchlistContent` `marketValue` toLocaleString 呼叫
- `EventCategoryDetail` crypto price toLocaleString
- `CompanyProfileContent` `revenue.toLocaleString()`

---

#### 3-5. 日期格式化

```typescript
/**
 * 將 "Apr 5" 格式的 dateLabel 轉換為 "05 April"
 * @param dateLabel  來自 calendarUtils.getDateLabel() 的短格式
 * @returns "05 April" | "—"
 */
export function formatDateLabelFull(dateLabel: string | undefined): string

/**
 * 將 UTC datetime string 轉換為本地時間顯示格式
 * @param utcDatetime "2026-04-07 00:00:00.0"
 * @returns "2026-04-07 14:30" | "—"
 */
export function formatEventDatetime(utcDatetime: string): string

/**
 * 格式化 YYYY-MM-DD 字串（從完整 datetime 擷取）
 * @param dateStr  任意含 YYYY-MM-DD 的字串
 * @returns "2026-04-07" | "—"
 */
export function formatIsoDate(dateStr: string | undefined): string
```

**取代來源：**
- `DetailTable.tsx` inline date formatting
- `CorpEventCategoryDetail.tsx` `formatDateLabel()` 和 `formatEventDatetime()`
- `EventCategoryDetail.tsx` `formatDateLabel()`
- `FundingTab.tsx` inline `formatDate()`

---

### 呼叫方式規劃（各頁面）

#### Company Profile Tabs
```typescript
// 之前 (FundingTab / InvestmentTab / AcquisitionTab / CompanyMATab)
valueM >= 1000 ? `$${(valueM / 1000).toFixed(1)}B` : `$${valueM.toLocaleString()}M`

// 之後
import { formatUsdM } from '@/app/lib/formatters';
formatUsdM(valueM)          // "$1.5B" or "$450M"
formatUsdM(valueM, 2)       // "$1.50B" (用於 table/tooltip 需要 2 位小數的地方)
```

#### Watchlist
```typescript
// 之前
`${h.changePct >= 0 ? '+' : ''}${h.changePct.toFixed(2)}%`

// 之後
import { formatPrice, formatSigned, formatSignedPct, formatNumber } from '@/app/lib/formatters';
price:       { getValue: h => formatPrice(h.price) },
change:      { getValue: h => formatSigned(h.change), ... },
changePct:   { getValue: h => formatSignedPct(h.changePct), ... },
marketValue: { getValue: h => formatNumber(h.price * h.shares, 2) },
```

#### Event Calendar
```typescript
// 之前 (3 個元件各自 inline)
const parts = dateLabel.split(' ');
const day = parts[1]?.padStart(2, '0') ?? '';
return `${day} ${monthShortToFull(parts[0])}`;

// 之後
import { formatDateLabelFull, formatEventDatetime } from '@/app/lib/formatters';
formatDateLabelFull(selectedDateLabel)   // "05 April"
formatEventDatetime(event.eventDatetime) // "2026-04-07 14:30"
```

---

## 四、實作優先順序

| 優先 | 項目 | 影響範圍 | 風險 |
|---|---|---|---|
| 🔴 高 | 建立 `app/lib/formatters.ts` 並實作所有函式 | 新增，不影響現有程式 | 低 |
| 🔴 高 | Watchlist 欄位統一使用 `formatSigned` / `formatSignedPct` / `formatPrice` | 2 個檔案，9 個欄位 | 低 |
| 🟡 中 | Calendar 三個元件共用 `formatDateLabelFull` / `formatEventDatetime` | 3 個元件 | 低 |
| 🟡 中 | Company Profile tabs 統一使用 `formatUsdM` | 5 個 tab + NivoCharts | 中（需確認 toFixed 1 vs 2 的取捨） |
| 🟢 低 | `InvestmentNivoCharts` axis format callbacks 使用 `formatUsdM` / `formatPct` | 圖表軸 labels | 中（Nivo 的 format callback 型別） |

---

## 五、注意事項

1. **toFixed 1 vs 2 不一致問題**：各 tab 對 B 級金額的小數位數有差異（FundingTab=1，InvestmentTab=2，CompanyMATab tooltip=2、axis=1）。建議統一為 `decimals` 參數，各呼叫端自行指定，保留現有視覺差異。
2. **`formatSegmentValue` / `formatDocAmtStr` 維持現狀**：這兩個函式已在 `getFinancialStatementByCoCd.ts` 正確使用，不需移動。
3. **`calendarUtils.ts` 不需修改**：`formatDateLabelFull` 內部可複用 `monthShortToFull`，保持 import 關係。
4. **NTD 換算邏輯**：`DetailTable.convertToNtd()` 含特定業務邏輯，建議保留在 `DetailTable.tsx`，不納入 formatters（除非未來多處需要貨幣換算）。
