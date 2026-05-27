# Earnings Evidence A-team Implementation Plan

> **For agentic workers:** REQUIRED: Use the `subagent-driven-development` skill (if subagents available) or the `executing-plans` skill to implement this plan. Skill definitions are in `.github/skills/`. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 先以靜態 Marvell 範例完成台灣時間版本，並為「方案3 + A-team sub-model/agent」建立可逐步落地的實作骨架與交接流程。

**Architecture:** 先在既有 `earnings-evidence` 頁面維持靜態渲染，替換為 Marvell 案例並校準 TW 時間呈現；接著以 evidence-first 管線切分為 Collector / Extractors / Reconciliation / Confidence / Gatekeeper 五段，逐步替換靜態資料來源。每階段都保留可回滾的靜態 fallback。

**Tech Stack:** Next.js App Router、TypeScript、既有 `app/data/*` 靜態資料模組、Markdown 文件。

---

## Chunk 1: 靜態 Marvell 範例落地

### Task 1: 新增 Marvell 靜態 case

**Files:**
- Modify: `app/data/earningsEvidenceData.ts`
- Test: `app/earnings-evidence/page.tsx`（頁面渲染檢視）

- [ ] **Step 1: 新增 `marvellCalendarQ22026Case` 資料結構**
- [ ] **Step 2: 設定 eventTimeTw 為 `2026-05-28 04:45 (UTC+8)`，並保留 ET/PT 欄位**
- [ ] **Step 3: 新增 source 與 evidence pointer（至少 2 組）**
- [ ] **Step 4: 更新 taskPlan，標示靜態範例流程**
- [ ] **Step 5: Commit**

### Task 2: 頁面改為 Marvell 靜態範例

**Files:**
- Modify: `app/earnings-evidence/page.tsx`

- [ ] **Step 1: 導入 `marvellCalendarQ22026Case` 取代現有 Broadcom case**
- [ ] **Step 2: 標題、副標與 Event Time 卡片統一以 TW 為主呈現**
- [ ] **Step 3: 保留 evidence / confidence / task plan 區塊格式**
- [ ] **Step 4: Commit**

---

## Chunk 2: Broadcom 時間校準與雙案例準備

### Task 3: Broadcom 日期改為 CY2026-Q2 對齊

**Files:**
- Modify: `app/data/earningsEvidenceData.ts`

- [ ] **Step 1: 調整 `broadcomCalendarQ12026Case` 命名與 targetWindow（Q2）**
- [ ] **Step 2: 事件時間校準為 `2026-06-04 06:00 (UTC+8)`（對應 ET 盤後）**
- [ ] **Step 3: 明確註記來源版本與待複核欄位**
- [ ] **Step 4: Commit**

---

## Chunk 3: A-team 管線骨架（不接真 API）

### Task 4: 建立 prompt 模板與 scoring 規格檔

**Files:**
- Create: `docs/earnings-evidence-model-a-prompt.md`
- Create: `docs/earnings-evidence-model-b-prompt.md`
- Create: `docs/earnings-evidence-model-c-prompt.md`
- Create: `docs/earnings-confidence-scoring-spec.md`

- [ ] **Step 1: 複製設計文件中的模板為獨立 prompt 檔**
- [ ] **Step 2: 定義固定 JSON schema 與欄位約束**
- [ ] **Step 3: 定義 scoring 計分規則與閾值**
- [ ] **Step 4: Commit**

### Task 5: 定義靜態管線介面（stub）

**Files:**
- Create: `app/lib/earningsEvidencePipeline.ts`
- Modify: `app/earnings-evidence/page.tsx`

- [ ] **Step 1: 建立 `runStaticEvidencePipeline(caseId)` stub 介面**
- [ ] **Step 2: 回傳固定結構（collector/extractor/reconcile/scoring/publish）**
- [ ] **Step 3: 頁面改為經由 stub 讀取資料（仍為靜態）**
- [ ] **Step 4: Commit**

---

## Chunk 4: 驗證與交接

### Task 6: Build 驗證與 PR handoff

**Files:**
- Modify: `docs/earnings-evidence-a-team-design-2026-05-27.md`（補最終結果）

- [ ] **Step 1: 安裝依賴（若尚未） `npm install`**
- [ ] **Step 2: 執行 `npm run build`**
- [ ] **Step 3: 將 build 結果與已知限制寫入設計文件**
- [ ] **Step 4: 在 PR 描述新增 CLI 接手說明與下一步清單**
- [ ] **Step 5: Commit**
