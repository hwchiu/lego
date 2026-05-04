# Common Formatting — 技術工程文件

> **版本：** 2.0  
> **建立日期：** 2026-05-04（v1.0）  
> **更新日期：** 2026-05-04（v2.0）  
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
| 顏色 hard-code | Excel 匯出與 UI 元件以欄位名稱（如 `'Revenue QoQ'`）決定顏色，無法重用 |

---

## 二、架構決策

### 檔案位置

```
app/lib/
├── calendarUtils.ts                # 已有：日曆日期工具
├── formatters.ts                   # 通用格式化 + 顏色推導工具
├── getFinancialStatementByCoCd.ts  # 已有：財報資料含 formatSegmentValue
└── parseContent.ts                 # 已有：Markdown 解析
```

### 設計原則

1. **純函式**：無 React dependency，無副作用
2. **單一匯出點**：所有 formatter 從同一檔案匯出
3. **可選參數**：提供合理預設值，呼叫端可覆寫
4. **型別安全**：回傳 `string`，與既有 `getValue: h => string` 型別相容
5. **資料型態驅動顏色**：顏色推導函式依值的**內容與型態**判斷，不需要 hard-code 欄位名稱

---

## 三、函式 API 說明（v2.0 完整版）

### Section 1 — Currency / Money

#### `formatUsdM(valueM, decimals?)` — USD 金額（百萬為單位）

```typescript
export function formatUsdM(valueM: number, decimals = 1): string
```

| 輸入 valueM | decimals | v1 輸出 | **v2 輸出（新）** |
|---|---|---|---|
| 2500 | 1 (預設) | `"$2.5B"` | `"$2.5B"` (不變) |
| 2500 | 2 | `"$2.50B"` | `"$2.50B"` (不變) |
| 450 | — | `"$450M"` | **`"$450.00M"`** |
| 1234.5 | — | `"$1,235M"` | **`"$1,234.50M"`** |
| 0.75 | — | `"$0.75M"` | `"$0.75M"` (不變) |

**v2 變更：M 級從 `Math.round(...).toLocaleString()` 改為固定 2 位小數 + 千分位**

邏輯：
- `≥ 1000` → B 級，`decimals` 控制 B 級小數位
- `1 ≤ v < 1000` → M 級，**固定 2 位小數 + 千分位**
- `< 1` → M 級，固定 2 位小數

---

#### `formatPrice(value)` — 股票價格

```typescript
export function formatPrice(value: number): string
```

固定 2 位小數，無千分位。`formatPrice(123.456) // "123.46"`

---

### Section 2 — Signed Numbers

#### `formatSigned(value, decimals?)` — 有號數值

```typescript
export function formatSigned(value: number, decimals = 2): string
```

正值前綴 `"+"`, 負值自帶 `"-"`。`formatSigned(1.234) // "+1.23"`

---

#### `formatSignedPct(value, decimals?)` — 有號百分比

```typescript
export function formatSignedPct(value: number, decimals = 2): string
```

回傳格式化字串；顏色渲染由呼叫端透過 `inferColorClass(value)` 取得 CSS class 後套用。

```
formatSignedPct(1.234)  // "+1.23%"
formatSignedPct(-0.456) // "-0.46%"

// 搭配顏色：
const cls = inferColorClass(value);    // "pos" | "neg" | ""
// <span className={`cp-value ${cls}`}>{formatSignedPct(value)}</span>
```

---

### Section 3 — Percentages

#### `formatPct(value, decimals?)` — 純百分比（無符號）

```typescript
export function formatPct(value: number, decimals = 1): string
```

`formatPct(45.3) // "45.3%"`

---

### Section 4 — General Numbers

#### `formatNumber(value, fractionDigits?)` — 千分位數值 ⚠️ 預設值更新

```typescript
export function formatNumber(value: number, fractionDigits = 2): string
```

| 版本 | 預設 fractionDigits | `formatNumber(1234567)` 輸出 |
|---|---|---|
| v1 | `0` | `"1,234,567"` |
| **v2** | **`2`** | **`"1,234,567.00"`** |

v2 改為預設 2 位小數，確保財務數字顯示精確。需要整數格式時，明確傳入 `formatNumber(v, 0)`。

```
formatNumber(1234567)    // "1,234,567.00"  (v2 預設)
formatNumber(1234.5, 2)  // "1,234.50"
formatNumber(1234, 0)    // "1,234"         (需整數時明確指定)
```

---

### Section 5 — Dates

#### `formatDateLabelFull(dateLabel?)` — 短日期轉長格式

```typescript
export function formatDateLabelFull(dateLabel: string | undefined): string
```

`"Apr 5"` → `"05 April"` | `undefined` → `"—"`

---

#### `formatEventDatetime(utcDatetime)` — UTC 轉本地時間

```typescript
export function formatEventDatetime(utcDatetime: string): string
```

`"2026-04-07 06:30:00.0"` (UTC) → `"2026-04-07 14:30"` (UTC+8)

---

#### `formatIsoDate(dateStr?)` — 擷取 YYYY-MM-DD

```typescript
export function formatIsoDate(dateStr: string | undefined): string
```

`"2022-02-16 00:00:00.0"` → `"2022-02-16"` | `undefined` → `"—"`

---

### Section 6 — Color Inference（新增，v2.0）

> **核心設計：依資料內容 / 型態判斷顏色，不 hard-code 欄位名稱**

#### `inferColorClass(value)` — CSS 顏色 class

```typescript
export function inferColorClass(value: string | number): 'pos' | 'neg' | ''
```

| 輸入 | 輸出 |
|---|---|
| `number > 0` | `"pos"` (綠色) |
| `number < 0` | `"neg"` (紅色) |
| `number === 0` | `""` (中性) |
| `string` 開頭 `"+"` | `"pos"` |
| `string` 開頭 `"-"` | `"neg"` |
| 其他（`"N/A"`, `"TBD"` 等） | `""` |

```typescript
inferColorClass(1.5)      // "pos"
inferColorClass(-0.3)     // "neg"
inferColorClass("+1.2%")  // "pos"
inferColorClass("-0.5%")  // "neg"
inferColorClass("N/A")    // ""

// 使用範例 — 取代欄位名稱 hard-code：
getClass: h => inferColorClass(h.revenueQoQ)   // ✅ 依值內容
// 舊寫法（已移除）：
// getClass: h => h.revenueQoQ.startsWith('+') ? 'pos' : 'neg'  // ❌ 字串比較
```

---

#### `inferColorArgb(value)` — Excel ARGB 顏色

```typescript
export function inferColorArgb(value: string | number): string | null
```

| 結果 | ARGB 值 | 對應 CSS |
|---|---|---|
| 正值 | `"FF16A34A"` | `--c-pos: #16a34a` |
| 負值 | `"FFDC2626"` | `--c-neg: #dc2626` |
| 中性 | `null` | 預設顏色 |

```typescript
// 使用範例 — Excel 匯出取代欄位名稱 hard-code：
function getCellColor(h: Holding, col: string): string | null {
  return inferColorArgb(getCellValue(h, col));  // ✅ 依值內容
}
// 舊寫法（已移除）：
// if (col === 'Revenue QoQ') return ...        // ❌ 欄位名稱比較
// if (col === 'Change') return ...             // ❌ 欄位名稱比較
```

---

## 四、各元件修改清單（v1.0）

> v1.0 初次建立時的元件修改，詳細說明見 v1.0 文件。

| 元件 | 修改摘要 |
|---|---|
| `FundingTab.tsx` | 移除本地 `formatDate()` / `formatUsdValueM()`，改用 `formatUsdM`, `formatIsoDate` |
| `InvestmentTab.tsx` | 移除 inline USD 金額邏輯，改用 `formatUsdM(v, 2)` |
| `AcquisitionTab.tsx` | 移除 inline tooltip / table 金額，改用 `formatUsdM` |
| `CompanyMATab.tsx` | 移除 inline chart axis / tooltip / table，改用 `formatUsdM` |
| `InvestmentNivoCharts.tsx` | `formatChartLabel` 委派至 `formatUsdM` |
| `CompanyProfileContent.tsx` | 移除 `toLocaleString()` / `+/-${v}%`，改用 `formatNumber`, `formatSignedPct`, `formatPct` |
| `WatchlistContent.tsx` | 9 個數值欄位使用 `formatPrice/formatSigned/formatSignedPct/formatNumber` |
| `WatchlistArchiveContent.tsx` | 同上 |
| `CorpEventCategoryDetail.tsx` | 移除本地 `formatDateLabel` / `formatEventDatetime` |
| `EventCategoryDetail.tsx` | 移除本地 `formatDateLabel`，crypto price 改用 `formatNumber` |
| `DetailTable.tsx` | 移除 inline 日期格式化，改用 `formatDateLabelFull` |

---

## 五、各元件修改清單（v2.0）

### 格式調整

| 元件 | 修改說明 | 影響函式 |
|---|---|---|
| `CompanyMATab.tsx` | 移除 M 級 inline `Math.round(val)M`，改用 `formatUsdM(val)` | `formatUsdM` |
| (所有使用 `formatNumber` 無顯式 fractionDigits) | 預設輸出從整數變為 2 位小數 | `formatNumber` default 0→2 |

### 顏色推導（不 hard-code 欄位名稱）

| 元件 | 舊做法 | 新做法 |
|---|---|---|
| `WatchlistContent.tsx` `ALL_COLUMNS.revenueQoQ/revenueYoY` `getClass` | `h.revenueQoQ.startsWith('+') ? 'pos' : 'neg'` | `inferColorClass(h.revenueQoQ)` |
| `WatchlistContent.tsx` `getCellColor` | `if (col === 'Revenue QoQ') ...` | `inferColorArgb(getCellValue(h, col))` |
| `WatchlistArchiveContent.tsx` `ALL_COLUMNS.revenueQoQ/revenueYoY` `getClass` | 同上 | `inferColorClass(h.revenueQoQ)` |
| `WatchlistArchiveContent.tsx` `getCellColor` | `if (col === 'Change'/'Revenue QoQ'...) ...` | `inferColorArgb(getCellValue(h, col))` |

### Company Profile 幣別預設值

| 元件 | 舊預設 | 新預設 | 說明 |
|---|---|---|---|
| `FinancialStatementTab.tsx` | `useState<Currency>('original')` | `useState<Currency>('usd')` | 幣別 toggle 預設顯示 USD |

---

## 六、不納入 formatters.ts 的例外說明

| 函式 / 邏輯 | 留存位置 | 原因 |
|---|---|---|
| `convertToNtd()` | `DetailTable.tsx` | 含 NTD 匯率換算業務邏輯，屬於元件特定需求 |
| `formatSegmentValue()` / `formatDocAmtStr()` | `getFinancialStatementByCoCd.ts` | 已在財報資料層正確使用，無需移動 |
| `calendarUtils` 工具 | `calendarUtils.ts` | `formatters.ts` 內部 import 使用 |

---

## 七、使用規範

### 匯入方式（Named import，按需引入）

```typescript
// ✅ 正確 — 僅 import 需要的函式
import { formatUsdM, formatIsoDate, inferColorClass } from '@/app/lib/formatters';

// ❌ 不建議 — wildcard import
import * as formatters from '@/app/lib/formatters';
```

### 參數選擇指引

| 場景 | 函式 | 建議 decimals |
|---|---|---|
| 圖表軸 label（空間有限） | `formatUsdM` | B 級 1，M 級固定 2 |
| 表格欄位（高精確度）| `formatUsdM` | B 級 2，M 級固定 2 |
| Tooltip | `formatUsdM` | B 級 1 |
| 漲跌欄位（Change / P&L）| `formatSigned` | 預設 2 |
| 百分比欄位 + 顏色 | `formatSignedPct` + `inferColorClass` | 預設 2 |
| 財務指標 % | `formatPct` | 預設 1 |
| 大金額（Revenue / Market Value）| `formatNumber` | 預設 2（若要整數：傳 0）|
| Excel 顏色 | `inferColorArgb` | N/A |
| UI 顏色 class | `inferColorClass` | N/A |

### 顏色渲染模式

```tsx
// ── UI 元件（JSX）──
const cls = inferColorClass(value);
<span className={`my-value ${cls}`}>{formatSignedPct(value)}</span>

// ── ColDef getClass（Watchlist 欄位定義）──
getClass: h => inferColorClass(h.revenueQoQ)

// ── Excel 匯出 ──
function getCellColor(h: Holding, col: string): string | null {
  return inferColorArgb(getCellValue(h, col));
}
```

---

## 八、擴充指引

新增格式化函式時，請遵循以下規範：

1. **放置於** `app/lib/formatters.ts`，於對應 Section 下新增
2. **撰寫 JSDoc**，包含 `@param`、`@returns`、`@example`
3. **純函式**：不依賴 React context、外部狀態、副作用
4. **回傳 `string`**：方便在 `getValue: h => string` 欄位定義中直接使用
5. **顏色邏輯**：若需要顏色，請擴充 `inferColorClass` / `inferColorArgb`，不在元件內 hard-code
6. **測試覆蓋**：未來若加入測試框架，應在 `app/lib/__tests__/formatters.test.ts` 新增對應單元測試
