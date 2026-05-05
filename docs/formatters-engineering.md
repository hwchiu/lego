# Common Formatting — 技術工程文件

> **版本：** 3.0  
> **建立日期：** 2026-05-04（v1.0）  
> **更新日期：** 2026-05-05（v3.0）  
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
| 顏色 hard-code | Excel 匯出與 UI 元件以欄位名稱決定顏色，無法重用 |
| 單位 hard-code | 各元件自行在字串中拼接 `M`/`B`，無法統一控制 |

---

## 二、架構決策

### 檔案位置

```
app/lib/
├── calendarUtils.ts                # 已有：日曆日期工具
├── formatters.ts                   # 通用格式化 + 顏色推導工具（單一來源）
├── getFinancialStatementByCoCd.ts  # 已有：財報資料含 formatSegmentValue
└── parseContent.ts                 # 已有：Markdown 解析
```

### 設計原則

1. **純函式**：無 React dependency，無副作用
2. **單一匯出點**：所有 formatter 從同一檔案匯出
3. **可選參數**：提供合理預設值，呼叫端可覆寫
4. **型別安全**：回傳 `string`，與既有 `getValue: h => string` 型別相容
5. **資料型態驅動顏色**：顏色推導函式依值的內容與型態判斷，不需 hard-code 欄位名稱
6. **單位分離**：格式化函式**不**在輸出字串中附加 `M`/`B` 等單位後綴；呼叫端負責在 UI 中標示單位（如欄位標題、tooltip 說明文字）

---

## 三、函式 API 說明（v3.0 完整版）

### Section 1 — Currency / Money

#### `formatUsdM(valueM, decimals?)` — USD 金額（百萬為單位）

```typescript
export function formatUsdM(valueM: number, decimals = 1): string
```

> **v3 變更：輸出不含 M / B 後綴。** 呼叫端需自行在 UI 中標示單位。

| 輸入 valueM | decimals | v2 輸出 | **v3 輸出（新）** |
|---|---|---|---|
| 2500 | 1 (預設) | `"$2.5B"` | **`"$2.5"`** |
| 2500 | 2 | `"$2.50B"` | **`"$2.50"`** |
| 450 | — | `"$450.00M"` | **`"$450.00"`** |
| 1234.5 | — | `"$1,234.50M"` | **`"$1,234.50"`** |
| 0.5 | — | `"$0.50M"` | **`"$0.50"`** |

邏輯：
- `≥ 1000` → 換算為 B 級，`decimals` 控制精度
- `1 ≤ v < 1000` → M 級，固定 2 位小數 + 千分位
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

`formatSigned(1.234) // "+1.23"`

---

#### `formatSignedPct(value, decimals?)` — 有號百分比

```typescript
export function formatSignedPct(value: number, decimals = 2): string
```

回傳格式化字串；顏色由呼叫端透過 `inferColorClass(value)` 取得 CSS class。

```typescript
formatSignedPct(1.234)   // "+1.23%"
formatSignedPct(-0.456)  // "-0.46%"

// 搭配顏色：
const cls = inferColorClass(value);
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

#### `formatNumber(value, fractionDigits?)` — 千分位數值

```typescript
export function formatNumber(value: number, fractionDigits = 2): string
```

| 呼叫 | 輸出 |
|---|---|
| `formatNumber(1234567)` | `"1,234,567.00"` |
| `formatNumber(1234.5, 2)` | `"1,234.50"` |
| `formatNumber(1234, 0)` | `"1,234"` |

---

### Section 5 — Dates

#### `formatDateLabelFull(dateLabel?)` — 短日期轉長格式

`"Apr 5"` → `"05 April"` | `undefined` → `"—"`

#### `formatEventDatetime(utcDatetime)` — UTC 轉本地時間

`"2026-04-07 06:30:00.0"` (UTC) → `"2026-04-07 14:30"` (UTC+8)

#### `formatIsoDate(dateStr?)` — 擷取 YYYY-MM-DD

`"2022-02-16 00:00:00.0"` → `"2022-02-16"` | `undefined` → `"—"`

---

### Section 6 — Color Inference

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
| 其他 | `""` |

#### `inferColorArgb(value)` — Excel ARGB 顏色

```typescript
export function inferColorArgb(value: string | number): string | null
```

正值 → `"FF16A34A"` | 負值 → `"FFDC2626"` | 中性 → `null`

---

## 四、各元件修改清單（v1.0 ~ v3.0 累計）

### `app/lib/formatters.ts`

| 版本 | 變更 |
|---|---|
| v1.0 | 建立通用格式化函式（formatUsdM, formatPrice, formatSigned, formatSignedPct, formatPct, formatNumber, formatDateLabelFull, formatEventDatetime, formatIsoDate） |
| v2.0 | formatNumber 預設 fractionDigits 0→2；formatUsdM M 級固定 2 小數；新增 inferColorClass, inferColorArgb；移除重複定義 |
| v3.0 | **formatUsdM 輸出移除 M/B 後綴**；移除 v1 的老版函式殘留（確認只剩一份定義） |

### Company Profile

| 元件 | 版本 | 變更 |
|---|---|---|
| `FundingTab.tsx` | v1 | 移除本地 formatDate/formatUsdValueM |
| `InvestmentTab.tsx` | v1 | 移除 inline USD 金額邏輯 |
| `AcquisitionTab.tsx` | v1 | 移除 inline tooltip / table |
| `CompanyMATab.tsx` | v2 | 移除 inline `Math.round(val)M` |
| `InvestmentNivoCharts.tsx` | v1+v3 | formatChartLabel → formatUsdM；axis right 移除 `B` 後綴 |
| `CompanyProfileContent.tsx` | v1 | 移除 inline toLocaleString / +/-% |
| `FinancialStatementTab.tsx` | v2 | currency 預設值 `'original'` → `'usd'` |

### Watchlist

| 元件 | 版本 | 變更 |
|---|---|---|
| `WatchlistContent.tsx` | v1+v2 | 9 個欄位格式化；getCellColor 改用 inferColorArgb；getClass 改用 inferColorClass |
| `WatchlistArchiveContent.tsx` | v1+v2 | 同上 |

### Supply Chain Maps

| 元件 | 版本 | 變更 |
|---|---|---|
| `supply-chain-maps/customer/page.tsx` | v3 | `formatAmount` → `formatUsdM`（移除 M/B 後綴） |
| `supply-chain-maps/customer/CustomerGraph.tsx` | v3 | `formatAmount` → `formatUsdM` |
| `supply-chain-maps/supplier/page.tsx` | v3 | `formatRevenue` → `formatUsdM` |
| `my-rmap/customer/page.tsx` | v3 | `formatAmount` → `formatUsdM` |
| `my-rmap/supplier/page.tsx` | v3 | `formatRevenue` → `formatUsdM` |

### Market Data

| 元件 | 版本 | 變更 |
|---|---|---|
| `market-data/ma/page.tsx` | v3 | `formatDealValue` → `formatUsdM(v, 2)`；KPI card、table row、chart axis 移除 M/B 後綴 |

### Event Calendar

| 元件 | 版本 | 變更 |
|---|---|---|
| `CorpEventCategoryDetail.tsx` | v1 | 移除本地日期工具 |
| `EventCategoryDetail.tsx` | v1 | 移除本地日期工具；crypto price 改用 formatNumber |
| `DetailTable.tsx` | v1 | 移除 inline 日期格式化 |

---

## 五、不納入 formatters.ts 的例外說明

| 函式 / 邏輯 | 留存位置 | 原因 |
|---|---|---|
| `convertToNtd()` | `DetailTable.tsx` | 含 NTD 匯率換算業務邏輯 |
| `formatSegmentValue()` / `formatDocAmtStr()` | `getFinancialStatementByCoCd.ts` | 財報資料層特定邏輯 |
| `calendarUtils` 工具 | `calendarUtils.ts` | formatters.ts 內部使用 |

---

## 六、使用規範

### 匯入方式

```typescript
// ✅ Named import，按需引入
import { formatUsdM, inferColorClass } from '@/app/lib/formatters';
```

### 單位標示責任

> **格式化函式只輸出純數值字串（含 `$` 前綴），不附加 M / B / K 等後綴。**

呼叫端需自行在合適位置標示單位：

```tsx
// ── 欄位標題 ──
<th>Deal Value (B)</th>
<td>{formatUsdM(deal.valueM, 2)}</td>   // → "$2.50"

// ── Tooltip ──
<div>Value: {formatUsdM(tooltip.valueM)} B</div>

// ── 摘要卡片 ──
<div className="kpi-value">{formatUsdM(value)}<span className="kpi-unit">B</span></div>
```

### 參數選擇指引

| 場景 | 函式 | 建議 decimals |
|---|---|---|
| 圖表軸 label（空間有限） | `formatUsdM` | B 級 0-1 |
| 表格欄位（高精確度）| `formatUsdM` | B 級 2，M 級固定 2 |
| 漲跌欄位 | `formatSigned` | 預設 2 |
| 百分比 + 顏色 | `formatSignedPct` + `inferColorClass` | 預設 2 |
| 大金額（純千分位）| `formatNumber` | 預設 2 |
| Excel 顏色 | `inferColorArgb` | N/A |
| UI 顏色 class | `inferColorClass` | N/A |

---

## 七、擴充指引

1. 放置於 `app/lib/formatters.ts`，於對應 Section 下新增
2. 撰寫 JSDoc，包含 `@param`、`@returns`、`@example`
3. 純函式：不依賴 React context、外部狀態
4. 回傳 `string`
5. **格式化函式不附加單位後綴**
6. 顏色邏輯請擴充 `inferColorClass` / `inferColorArgb`，不在元件內 hard-code
