# FinScope Prototype Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static 3-page prototype of a financial information platform (Home, News, Earnings) for investor demo.

**Architecture:** Pure HTML/CSS/JS with no frameworks. Shared CSS (`css/styles.css`) defines design tokens, layout primitives, and component styles. Shared JS (`js/main.js`) handles all interactions (tab filtering, calendar clicks, nav highlights). Each page is a standalone HTML file with shared nav/footer.

**Tech Stack:** HTML5, CSS3 (Grid, Flexbox, custom properties), vanilla JavaScript (ES6+)

**Spec:** `docs/superpowers/specs/2026-04-01-finscope-prototype-design.md`

---

## Chunk 1: Foundation — CSS Design System & Homepage

### Task 1: Create CSS Design System

**Files:**
- Create: `css/styles.css`

- [ ] **Step 1: Create `css/styles.css` with CSS custom properties and base reset**

```css
/* === Design Tokens === */
:root {
  --color-primary: #1565c0;
  --color-success: #2e7d32;
  --color-danger: #c62828;
  --color-warning: #e65100;
  --color-bg: #ffffff;
  --color-bg-section: #f8f9fa;
  --color-text: #212121;
  --color-text-secondary: #666666;
  --color-text-muted: #999999;
  --color-border: #e0e0e0;
  --font-stack: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif;
  --radius-card: 8px;
  --radius-pill: 20px;
  --radius-button: 6px;
  --shadow-card: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-card-hover: 0 4px 12px rgba(0,0,0,0.15);
  /* Category tag colors */
  --tag-us-bg: #e3f2fd;    --tag-us-text: #1565c0;
  --tag-tw-bg: #e8f5e9;    --tag-tw-text: #2e7d32;
  --tag-industry-bg: #fce4ec; --tag-industry-text: #c62828;
  --tag-macro-bg: #fff3e0;  --tag-macro-text: #e65100;
  --tag-intl-bg: #f3e5f5;  --tag-intl-text: #7b1fa2;
  /* Market card colors */
  --market-up-bg: #e8f5e9;
  --market-down-bg: #ffebee;
}

/* === Reset & Base === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--font-stack);
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.6;
}
a { color: var(--color-primary); text-decoration: none; }
a:hover { text-decoration: underline; }
```

- [ ] **Step 2: Add navbar styles**

```css
/* === Navbar === */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  padding: 0 32px;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 32px;
}
.navbar-logo {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}
.navbar-links {
  display: flex;
  gap: 4px;
  list-style: none;
}
.navbar-links a {
  padding: 6px 14px;
  border-radius: var(--radius-button);
  color: var(--color-text-secondary);
  font-size: 15px;
  transition: background 0.2s, color 0.2s;
}
.navbar-links a:hover { background: var(--color-bg-section); color: var(--color-text); text-decoration: none; }
.navbar-links a.active { background: var(--color-primary); color: #fff; }
.navbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}
.search-box {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  font-size: 14px;
  width: 200px;
  outline: none;
  font-family: var(--font-stack);
}
.search-box:focus { border-color: var(--color-primary); }
.btn-login {
  padding: 6px 16px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-button);
  font-size: 14px;
  cursor: pointer;
  font-family: var(--font-stack);
}
.btn-login:hover { opacity: 0.9; }
```

- [ ] **Step 3: Add footer, layout container, and card base styles**

```css
/* === Footer === */
.footer {
  background: var(--color-bg-section);
  border-top: 1px solid var(--color-border);
  padding: 24px 32px;
  margin-top: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.footer-links { display: flex; gap: 16px; list-style: none; }
.footer-links a { color: var(--color-text-secondary); }
.footer-links a:hover { color: var(--color-primary); }

/* === Layout === */
.container { max-width: 1200px; margin: 0 auto; padding: 24px 32px; }
.page-title { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
.page-subtitle { font-size: 15px; color: var(--color-text-secondary); margin-bottom: 24px; }

/* === Card === */
.card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  transition: transform 0.2s, box-shadow 0.2s;
}
.card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover); }
.card-header { padding: 16px 16px 8px; font-weight: 700; font-size: 16px; }
.card-body { padding: 0 16px 16px; }
.card-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
  font-size: 14px;
}
.card-footer a { font-weight: 500; }
```

- [ ] **Step 4: Add market ticker card, pill tab, tag, and grid styles**

```css
/* === Market Ticker Cards === */
.market-cards { display: flex; gap: 12px; margin-bottom: 24px; }
.market-card {
  flex: 1;
  padding: 12px 16px;
  border-radius: var(--radius-card);
  text-align: center;
}
.market-card.up { background: var(--market-up-bg); }
.market-card.down { background: var(--market-down-bg); }
.market-card-name { font-size: 12px; color: var(--color-text-secondary); margin-bottom: 2px; }
.market-card-value { font-size: 18px; font-weight: 700; }
.market-card.up .market-card-value { color: var(--color-success); }
.market-card.down .market-card-value { color: var(--color-danger); }
.market-card-change { font-size: 13px; }
.market-card.up .market-card-change { color: var(--color-success); }
.market-card.down .market-card-change { color: var(--color-danger); }

/* === Pill Tabs === */
.pill-tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
.pill-tab {
  padding: 6px 16px;
  border-radius: var(--radius-pill);
  border: none;
  background: #f0f0f0;
  font-size: 14px;
  cursor: pointer;
  font-family: var(--font-stack);
  transition: background 0.2s, color 0.2s;
}
.pill-tab:hover { background: #e0e0e0; }
.pill-tab.active { background: var(--color-primary); color: #fff; }

/* === Category Tags === */
.tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
}
.tag-us { background: var(--tag-us-bg); color: var(--tag-us-text); }
.tag-tw { background: var(--tag-tw-bg); color: var(--tag-tw-text); }
.tag-industry { background: var(--tag-industry-bg); color: var(--tag-industry-text); }
.tag-macro { background: var(--tag-macro-bg); color: var(--tag-macro-text); }
.tag-intl { background: var(--tag-intl-bg); color: var(--tag-intl-text); }

/* === Grid Layouts === */
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

/* === Utility === */
.text-muted { color: var(--color-text-muted); }
.text-secondary { color: var(--color-text-secondary); }
.text-sm { font-size: 13px; }
.text-xs { font-size: 12px; }
.font-bold { font-weight: 700; }
.mt-8 { margin-top: 8px; }
.mt-16 { margin-top: 16px; }
.mb-8 { margin-bottom: 8px; }
.mb-16 { margin-bottom: 16px; }
.truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

- [ ] **Step 5: Add earnings-page-specific styles (calendar, result tags, chart placeholder)**

```css
/* === Earnings Calendar === */
.mini-calendar {
  background: var(--color-bg-section);
  padding: 16px;
  border-radius: var(--radius-card);
  margin-bottom: 24px;
}
.mini-calendar-title { text-align: center; font-weight: 700; margin-bottom: 12px; }
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  text-align: center;
  font-size: 13px;
}
.calendar-header { color: var(--color-text-muted); font-size: 12px; padding: 4px; }
.calendar-day { padding: 6px; border-radius: 4px; cursor: default; }
.calendar-day.has-us { background: var(--tag-us-bg); color: var(--tag-us-text); font-weight: 700; cursor: pointer; }
.calendar-day.has-tw { background: var(--tag-tw-bg); color: var(--tag-tw-text); font-weight: 700; cursor: pointer; }
.calendar-day.has-multi { background: var(--tag-macro-bg); color: var(--tag-macro-text); font-weight: 700; cursor: pointer; }
.calendar-day.selected { outline: 2px solid var(--color-primary); outline-offset: -2px; }
.calendar-legend {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 8px;
  font-size: 11px;
  color: var(--color-text-muted);
}
.calendar-legend span::before {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin-right: 4px;
  vertical-align: middle;
}
.calendar-legend .legend-us::before { background: var(--tag-us-bg); }
.calendar-legend .legend-tw::before { background: var(--tag-tw-bg); }
.calendar-legend .legend-multi::before { background: var(--tag-macro-bg); }

/* === Earnings Result Tags === */
.result-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
}
.result-beat { background: #e8f5e9; color: var(--color-success); }
.result-miss { background: #ffebee; color: var(--color-danger); }
.result-pending { background: #e3f2fd; color: var(--color-primary); }

/* === Chart Placeholder === */
.chart-placeholder {
  background: #f0f0f0;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 10px;
}

/* === News Item (homepage list items) === */
.news-item {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}
.news-item:last-child { border-bottom: none; }
.news-item-title { font-weight: 500; color: var(--color-text); }
.news-item-meta { font-size: 12px; color: var(--color-text-muted); margin-top: 2px; display: flex; align-items: center; gap: 8px; }

/* === News Card (news page grid items) === */
.news-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 16px;
  box-shadow: var(--shadow-card);
  transition: transform 0.2s, box-shadow 0.2s;
}
.news-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover); }
.news-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.news-card-title { font-weight: 700; font-size: 15px; margin-bottom: 6px; }
.news-card-summary { font-size: 13px; color: var(--color-text-secondary); }

/* === Earnings Card === */
.earnings-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  padding: 16px;
  box-shadow: var(--shadow-card);
  transition: transform 0.2s, box-shadow 0.2s;
}
.earnings-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover); }
.earnings-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.earnings-card-company { font-weight: 700; font-size: 16px; }
.earnings-card-data { font-size: 13px; color: var(--color-text-secondary); line-height: 1.8; }

/* === Empty State === */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 48px 16px;
  color: var(--color-text-muted);
  font-size: 15px;
}

/* === Filter Row === */
.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.filter-select {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  font-size: 14px;
  font-family: var(--font-stack);
  background: var(--color-bg);
}

/* === Fade-in animation for filtered items === */
.fade-in {
  animation: fadeIn 0.3s ease-in;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 6: Verify CSS file loads without errors**

Run: Open `css/styles.css` in browser dev tools or verify file exists.
Expected: No syntax errors.

- [ ] **Step 7: Commit CSS foundation**

```bash
git add css/styles.css
git commit -m "feat: add CSS design system with all component styles"
```

---

### Task 2: Create Homepage (index.html)

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create `index.html` with navbar, market cards, three-column content area, and footer**

The file should contain:
1. HTML5 doctype, `<head>` linking `css/styles.css` and `js/main.js` (deferred)
2. `<nav class="navbar">` with logo "🏦 FinScope", links (首頁 active, 新聞, 財報), search box, login button
3. `<section class="market-cards">` with 5 cards: S&P 500 (up), 加權指數 (down), NASDAQ (up), 道瓊工業 (up), BTC/USD (up) — using spec data values
4. `<div class="grid-3">` with 3 cards:
   - 📰 最新新聞: 5 news items with tags and times, "查看全部 →" linking to `news.html`
   - 📊 精選分析: 5 analysis items with authors and times, "查看全部 →" linking to `news.html`
   - 📅 即將公布財報: 5 company entries with codes and dates, "查看全部 →" linking to `earnings.html`
5. `<footer>` with copyright and links

- [ ] **Step 2: Open `index.html` in browser to verify layout**

Run: `open index.html`
Expected: Dashboard layout renders — navbar at top, 5 market cards in a row, 3-column content below, footer at bottom.

- [ ] **Step 3: Commit homepage**

```bash
git add index.html
git commit -m "feat: add homepage with dashboard layout"
```

---

## Chunk 2: News Page & Earnings Page

### Task 3: Create News Page (news.html)

**Files:**
- Create: `news.html`

- [ ] **Step 1: Create `news.html` with navbar, pill tabs, 2-column news card grid, and footer**

The file should contain:
1. Same `<head>` and `<nav>` as index.html (with 新聞 link set to `active`)
2. Page title "市場新聞"
3. `<div class="pill-tabs">` with 6 buttons: 全部 (active), 🇺🇸 美股, 🇹🇼 台股, 🏭 產業, 📈 總經, 🌐 國際 — each with `data-filter` attribute matching category
4. `<div class="grid-2" id="news-grid">` with 12 news cards (2 per category + 2 extras in 美股 and 台股), each card has:
   - `data-category` attribute (us/tw/industry/macro/intl)
   - Category tag (`.tag-us`, etc.) + time label
   - Bold title + 2-line summary (`.truncate-2`)
5. Sample data from spec: 10 headlines + 2 extras to reach 12, with generated summaries (2-3 sentences each)
6. An empty state element: `<div class="empty-state" style="display:none">目前沒有符合條件的資料</div>`
7. Footer

- [ ] **Step 2: Open `news.html` in browser to verify layout**

Run: `open news.html`
Expected: News page shows pill tabs and 12 cards in 2-column grid. Tabs don't filter yet (JS not implemented).

- [ ] **Step 3: Commit news page**

```bash
git add news.html
git commit -m "feat: add news page with tab filtering UI and 12 sample articles"
```

---

### Task 4: Create Earnings Page (earnings.html)

**Files:**
- Create: `earnings.html`

- [ ] **Step 1: Create `earnings.html` with navbar, filter row, mini calendar, 2-column earnings card grid, and footer**

The file should contain:
1. Same `<head>` and `<nav>` as other pages (with 財報 link set to `active`)
2. Page title "財報日曆"
3. Filter row: pill tabs with `data-filter-type="time"` attribute — 本週 (`data-filter="this-week"`, active), 下週 (`data-filter="next-week"`), 本月 (`data-filter="month"`) + `<select id="market-filter">` dropdown with options: 全部 (`value="all"`), 美股 (`value="us"`), 台股 (`value="tw"`)
4. Mini calendar for April 2026:
   - Header row: 一 二 三 四 五 六 日
   - Day cells with correct April 2026 layout (April 1 = Wednesday)
   - Marked days: 3 (has-us, AAPL), 5 (has-tw, 2330), 7 (has-us, MSFT), 10 (has-tw, 2317), 12 (has-us, NVDA), 15 (has-tw, 2454)
   - Each marked day has `data-date` attribute
   - Legend: 🔵 美股 🟢 台股 🟠 多家公布
5. `<div class="grid-2" id="earnings-grid">` with 6 earnings cards from spec data, each card has:
   - `data-market` (us/tw) and `data-date` (4/3, etc.) and `data-week` (this/next/month) attributes
   - Company emoji + ticker code + result tag (`.result-beat`, `.result-miss`, `.result-pending`)
   - EPS line: "預估 EPS: $X.XX" and if available "實際 EPS: $Y.YY" (bold, green/red)
   - Revenue line: "預估營收: $XB"
   - Chart placeholder: `<div class="chart-placeholder">📊 EPS 趨勢圖</div>`
6. Empty state element: `<div class="empty-state" id="earnings-empty" style="display:none">目前沒有符合條件的資料</div>`
7. Footer

Data assignment for `data-week`:
- 本週 this-week (4/1-4/6): AAPL (4/3), 2330 (4/5)
- 下週 next-week (4/7-4/13): MSFT (4/7), 2317 (4/10), NVDA (4/12)
- 本月 month (4/14+): 2454 (4/15)
- Note: `month` filter shows ALL 6 cards (not just 4/14+). Each card has only one `data-week` value for its "natural" week.

- [ ] **Step 2: Open `earnings.html` in browser to verify layout**

Run: `open earnings.html`
Expected: Earnings page shows filter row, mini calendar with colored dates, and 6 earnings cards in 2-column grid.

- [ ] **Step 3: Commit earnings page**

```bash
git add earnings.html
git commit -m "feat: add earnings page with calendar and card grid"
```

---

## Chunk 3: JavaScript Interactions & Final Polish

### Task 5: Create JavaScript Interactions (main.js)

**Files:**
- Create: `js/main.js`

- [ ] **Step 1: Create `js/main.js` with all interactive functionality**

The file should contain these features:

1. **Nav highlight** — On `DOMContentLoaded`, read `window.location.pathname` and add `active` class to the matching navbar link. Match logic: `index.html` or `/` → 首頁, `news.html` → 新聞, `earnings.html` → 財報.

2. **News tab filtering** — Attach click listeners to all `.pill-tab` inside `news.html`. On click:
   - Remove `active` from all tabs, add to clicked tab
   - Read `data-filter` from the clicked tab
   - If filter is `all`, show all `.news-card` elements
   - Otherwise, show only cards whose `data-category` matches the filter
   - Add `.fade-in` class to shown cards (remove after animation via `animationend` listener)
   - Show `.empty-state` if no cards match, hide otherwise

3. **Earnings time filter** — Attach click listeners to pill tabs in `earnings.html` filter row (identified by `data-filter-type="time"`). On click:
   - Remove `active` from sibling tabs, add to clicked
   - Read `data-filter` value: `this-week`, `next-week`, `month`
   - If filter is `month`, show ALL earnings cards regardless of `data-week`
   - Otherwise show only cards whose `data-week` matches the filter
   - Combine with market filter (read current `<select>` value)
   - Show `.empty-state` if no cards match

4. **Earnings market filter** — On `<select>` change:
   - Read selected value: `all`, `us`, `tw`
   - Combine with current time tab filter
   - Show/hide `.earnings-card` based on both `data-market` and `data-week`
   - Show `.empty-state` if no cards match

5. **Calendar day click** — Attach click listener to `.calendar-day` elements that have `has-us`, `has-tw`, or `has-multi` classes. On click:
   - Toggle `selected` class (clicking again deselects)
   - If a day is selected, filter earnings cards to only show that date (`data-date`)
   - If deselected, revert to current tab+select filter state
   - Reset time tab to "本月" when a calendar day is selected

All filter functions should share a single `applyEarningsFilter()` function that reads the current state of all three filter controls (time tab, market select, calendar day) and applies them together.

- [ ] **Step 2: Open each page in browser and test interactions**

Test in browser:
1. `index.html` — Verify nav "首頁" is highlighted
2. `news.html` — Click each tab, verify cards filter correctly. Click a tab with no results to verify empty state appears.
3. `earnings.html` — Click time tabs, change market dropdown, click calendar days. Verify filters work together.

- [ ] **Step 3: Commit JavaScript**

```bash
git add js/main.js
git commit -m "feat: add interactive filtering for news tabs, earnings filters, and calendar"
```

---

### Task 6: Visual Verification & Final Commit

**Files:**
- Modify: all HTML/CSS as needed for polish

- [ ] **Step 1: Cross-page navigation test**

Open each page and click all nav links. Verify:
- All 3 pages load correctly
- Nav highlight is correct on each page
- "查看全部 →" links on homepage go to correct pages

- [ ] **Step 2: Fix any visual issues found during testing**

Common things to check:
- Card spacing and alignment consistency
- Market cards evenly distributed
- Footer sits at bottom
- Pill tabs wrap properly if window is narrow (but desktop only)

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: finalize FinScope prototype with all 3 pages"
```
