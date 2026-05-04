# Common Formatting — 技術工程文件

> **版本：** 1.0  
> **建立日期：** 2026-05-04  
> **維護路徑：** `app/lib/formatters.ts`

---

## 一、背景與動機

MIC 金融資訊儀表板在 Company Profile、Watchlist、Event Calendar 三大功能區中，各自以 inline 方式實作數值與日期格式化。同一邏輯在 **5+ 個元件中重複**，且存在以下問題：

| 問題 | 說明 |
|---|---|
| 不一致 | USD B 級金額的小數位數在不同元件為 1 或 2 位，視覺結果不一 |
| 難以維護 | 修改格式規則需同步多個元件 |
| 可讀性差 | Template literal 格式邏輯散落在 JSX 內，不易閱讀 |
| 無法測試 | Inline 邏輯無法單獨單元測試 |

---

## 二、架構決策

### 新增檔案

```
app/lib/formatters.ts
```

放置於 `app/lib/` 與現有工具函式同層：

```
app/lib/
├── calendarUtils.ts          # 已有：日曆日期工具
├── formatters.ts             # 新增：通用格式化工具 ← 本次新增
├── getFinancialStatementByCoCd.ts  # 已有：財報資料含 formatSegmentValue
└── parseContent.ts           # 已有：Markdown 解析
```

### 設計原則

1. **純函式**：無 React dependency，無副作用
2. **單一匯出點**：所有 formatter 從同一檔案匯出
3. **可選參數**：提供合理預設值，呼叫端可覆寫（例如 `decimals`）
4. **向後相容**：回傳字串型別，與既有 `getValue: h => string` 型別相容

---

## 三、函式 API 說明

### 3-1. `formatUsdM(valueM, decimals?)` — USD 金額（百萬為單位）

```typescript
export function formatUsdM(valueM: number, decimals = 1): string
```

| 輸入 valueM | decimals | 輸出 |
|---|---|---|
| 2500 | 1 (預設) | `"$2.5B"` |
| 2500 | 2 | `"$2.50B"` |
| 450 | 1 | `"$450M"` |
| 0.75 | 1 | `"$0.75M"` |

**邏輯：**
- `≥ 1000` → B 級，使用 `decimals` 位小數
- `1 ≤ v < 1000` → M 級，四捨五入整數＋千分位
- `< 1` → M 級，固定 2 位小數

---

### 3-2. `formatPrice(value)` — 股票價格

```typescript
export function formatPrice(value: number): string
```

固定 2 位小數，無千分位。

```
formatPrice(123.456) // "123.46"
formatPrice(5)       // "5.00"
```

---

### 3-3. `formatSigned(value, decimals?)` — 有號數值

```typescript
export function formatSigned(value: number, decimals = 2): string
```

正值前綴 `"+"`, 負值前綴 `"-"`（`toFixed` 自動加）。

```
formatSigned(1.234)  // "+1.23"
formatSigned(-0.456) // "-0.46"
```

---

### 3-4. `formatSignedPct(value, decimals?)` — 有號百分比

```typescript
export function formatSignedPct(value: number, decimals = 2): string
```

```
formatSignedPct(1.234)  // "+1.23%"
formatSignedPct(-0.456) // "-0.46%"
```

---

### 3-5. `formatPct(value, decimals?)` — 純百分比（無符號）

```typescript
export function formatPct(value: number, decimals = 1): string
```

```
formatPct(45.3)    // "45.3%"
formatPct(45.3, 0) // "45%"
```

---

### 3-6. `formatNumber(value, fractionDigits?)` — 千分位數值

```typescript
export function formatNumber(value: number, fractionDigits = 0): string
```

使用 `en-US` locale，確保 `","` 千分位分隔符一致性。

```
formatNumber(1234567)    // "1,234,567"
formatNumber(1234.5, 2)  // "1,234.50"
```

---

### 3-7. `formatDateLabelFull(dateLabel?)` — 短日期標籤轉長格式

```typescript
export function formatDateLabelFull(dateLabel: string | undefined): string
```

接受 `calendarUtils.getDateLabel()` 產生的 `"Apr 5"` 格式，轉換為 `"05 April"`。

```
formatDateLabelFull("Apr 5")   // "05 April"
formatDateLabelFull("Dec 31")  // "31 December"
formatDateLabelFull(undefined) // "—"
```

---

### 3-8. `formatEventDatetime(utcDatetime)` — UTC 時間轉本地顯示

```typescript
export function formatEventDatetime(utcDatetime: string): string
```

API 回傳 `"2026-04-07 00:00:00.0"` (UTC)，轉換為瀏覽器本地時間。

```
formatEventDatetime("2026-04-07 06:30:00.0")
// → "2026-04-07 14:30" (UTC+8 環境下)
```

---

### 3-9. `formatIsoDate(dateStr?)` — 擷取 YYYY-MM-DD

```typescript
export function formatIsoDate(dateStr: string | undefined): string
```

從任意含 `YYYY-MM-DD` 前綴的字串擷取日期部分。

```
formatIsoDate("2022-02-16 00:00:00.0") // "2022-02-16"
formatIsoDate(undefined)               // "—"
```

---

## 四、各元件修改清單

### Company Profile

| 元件 | 修改內容 | 使用函式 |
|---|---|---|
| `FundingTab.tsx` | 移除 `formatDate()` / `formatUsdValueM()` 本地定義 | `formatUsdM()`, `formatIsoDate()` |
| `InvestmentTab.tsx` | 移除 inline USD 金額邏輯 | `formatUsdM(v, 2)` |
| `AcquisitionTab.tsx` | 移除 inline tooltip / table 金額邏輯 | `formatUsdM(v)` tooltip, `formatUsdM(v, 2)` table |
| `CompanyMATab.tsx` | 移除 inline chart axis / tooltip / table 金額邏輯 | `formatUsdM(v, 1)` axis, `formatUsdM(v, 2)` tooltip+table |
| `InvestmentNivoCharts.tsx` | 保留 `formatChartLabel` 殼層但改為呼叫 `formatUsdM`；更新 tooltips、axis format、line chart | `formatUsdM()` |
| `CompanyProfileContent.tsx` | 移除 inline `toLocaleString()` / `+/-${v}%` | `formatNumber()`, `formatSignedPct(v, 1)`, `formatPct()` |

### Watchlist

| 元件 | 修改欄位 | 使用函式 |
|---|---|---|
| `WatchlistContent.tsx` | `price`, `change`, `changePct`, `cost`, `marketValue`, `unrealizedPL`, `unrealizedPct`, `todayGain`, `todayGainPct` | `formatPrice`, `formatSigned`, `formatSignedPct`, `formatNumber` |
| `WatchlistArchiveContent.tsx` | 同上 9 個欄位 | 同上 |

### Event Calendar

| 元件 | 修改內容 | 使用函式 |
|---|---|---|
| `CorpEventCategoryDetail.tsx` | 移除 `formatDateLabel()` / `formatEventDatetime()` 本地定義 | `formatDateLabelFull()`, `formatEventDatetime()` |
| `EventCategoryDetail.tsx` | 移除 `formatDateLabel()` 本地定義；更新 crypto price | `formatDateLabelFull()`, `formatNumber()` |
| `DetailTable.tsx` | 移除 inline `selectedDateLabel` 格式化邏輯 | `formatDateLabelFull()` |

---

## 五、不納入 formatters.ts 的例外說明

| 函式 / 邏輯 | 留存位置 | 原因 |
|---|---|---|
| `convertToNtd()` | `DetailTable.tsx` | 含 NTD 匯率換算業務邏輯，屬於元件特定需求 |
| `formatSegmentValue()` / `formatDocAmtStr()` | `getFinancialStatementByCoCd.ts` | 已在財報資料層正確使用，無需移動 |
| `calendarUtils` 工具 | `calendarUtils.ts` | `formatters.ts` 內部 import 使用，無需移動 |

---

## 六、使用規範

### 匯入方式（Named import，按需引入）

```typescript
// ✅ 正確 — 僅 import 需要的函式
import { formatUsdM, formatIsoDate } from '@/app/lib/formatters';

// ❌ 不建議 — wildcard import
import * as formatters from '@/app/lib/formatters';
```

### 參數選擇指引

| 場景 | 函式 | 建議 decimals |
|---|---|---|
| 圖表軸 label（空間有限） | `formatUsdM` | 預設 1 |
| 表格欄位（高精確度）| `formatUsdM` | 2 |
| Tooltip | `formatUsdM` | 1（可讀性優先）|
| 漲跌欄位（Change / P&L）| `formatSigned` | 預設 2 |
| 百分比欄位（Change % / QoQ） | `formatSignedPct` | 預設 2 |
| 財務指標 % | `formatPct` | 預設 1 |
| 大金額（Revenue / Market Value）| `formatNumber` | 2（貨幣）或 0（整數）|

---

## 七、擴充指引

新增格式化函式時，請遵循以下規範：

1. **放置於** `app/lib/formatters.ts`，於對應 Section 下新增
2. **撰寫 JSDoc**，包含 `@param`、`@returns`、`@example`
3. **純函式**：不依賴 React context、外部狀態、副作用
4. **回傳 `string`**：方便在 `getValue: h => string` 欄位定義中直接使用
5. **測試覆蓋**：未來若加入測試框架，應在 `app/lib/__tests__/formatters.test.ts` 新增對應單元測試
