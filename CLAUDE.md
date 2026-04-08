# MIC (Lego) — Financial Dashboard

MIC 金融資訊儀表板。Next.js 14 靜態輸出，Taiwan/global financial data visualization。

## 🔧 Commands

```bash
npm run dev          # Dev server (Next.js HMR, http://localhost:3000/lego)
npm run build        # TypeScript check + static export to out/
npm run lint         # ESLint
```

## 🏗️ Architecture

```
app/
├── components/
│   ├── layout/          # TopNav, Sidebar, Banner
│   ├── news/            # NewsCard, CompanyRankingTable
│   ├── calendar/        # MonthGrid, WeekGrid, CalendarControls
│   └── collaboration/   # TaskPanel, ContentCard, CommentSection
├── contexts/            # LanguageContext, WatchlistContext, MobileSidebarContext
├── data/                # TypeScript data modules (navigation, sp500, news, etc.)
├── lib/                 # Pure utilities (parseContent, calendarUtils)
├── [feature]/           # Route pages (page.tsx + FeatureContent.tsx)
└── globals.css          # Single global stylesheet
content/                 # Markdown files with embedded JSON data blocks
```

**Page shell:** `TopNav → Banner → div.app-body → (Sidebar + main.main-content → div.page-pad)`

## 🎨 Key Conventions

- **CSS:** Single `globals.css`, vanilla CSS, CSS variables only — no Tailwind, no CSS Modules
- **Components:** `'use client'`, default export, feature-prefixed class names (e.g., `.cp-card`, `.de-panel`)
- **State:** React Context + localStorage — no Redux/Zustand
- **i18n:** `useLanguage()` → `{ lang }` → `zh` / `en`
- **Icons:** Inline SVG `viewBox="0 0 14 14"`, stored as path strings in `navigation.ts`
- **Charts:** Inline `<svg>` — no charting libraries
- **Deploy:** `basePath: '/lego'`, static export, trailing slashes

## 🧠 Superpowers Skills (`.github/skills/`)

此專案使用 **Superpowers plugin** 管理 AI skills。所有 project-level skills 存放於 `.github/skills/`。
啟動對話時，AI agent 會透過 Skill tool 按需載入 skill 內容。

### 核心 Skills

| Skill | 用途 |
|-------|------|
| `mic-development` | 元件結構、CSS 規範、Data layer、路由、RWD |
| `mic-ui-style` | 設計令牌、色彩、字體、陰影、動畫系統 |
| `using-superpowers` | 如何使用 Skill tool 的總入口 |
| `brainstorming` | 實作前的需求探索與規格確認 |
| `writing-plans` | 多步驟任務的計畫撰寫 |
| `executing-plans` | 計畫執行的流程管理 |
| `test-driven-development` | 測試驅動開發方法 |
| `systematic-debugging` | 系統性除錯流程 |
| `verification-before-completion` | 完成前的驗證清單 |
| `ui-ux-pro-max` | UI/UX 設計智慧（UI 實作時參考）|
| `ui-styling` | shadcn/ui + Tailwind 元件（非本專案主要使用）|

## 💻 Local Environment Setup

要在地端環境複製相同的 AI assistant 體驗：

### 1. 安裝 Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

### 2. 設定 `~/.claude/settings.json`

```json
{
  "enabledPlugins": {
    "superpowers@claude-plugins-official": true
  },
  "extraKnownMarketplaces": {
    "superpowers-marketplace": {
      "source": {
        "source": "github",
        "repo": "obra/superpowers-marketplace"
      }
    }
  }
}
```

### 3. 啟動 Claude Code

```bash
cd /path/to/lego
claude
```

Claude Code 會自動讀取 `CLAUDE.md`（本檔案），Superpowers plugin 會自動載入 `.github/skills/` 中的 skills。

### 4. 驗證環境

在 Claude Code 對話中輸入：
```
/skills
```
應可看到所有 `.github/skills/` 中的 skills 列表。

## 📁 Skills 目錄結構

```
.github/skills/
├── {skill-name}/
│   ├── SKILL.md          # 主要 skill 內容（YAML frontmatter + markdown）
│   ├── references/       # 詳細參考文件（可選）
│   ├── scripts/          # 輔助腳本（可選）
│   └── data/             # 資料檔案（可選）
```

**Skill frontmatter 格式：**
```yaml
---
name: skill-name
description: Use when [triggering conditions]
---
```

## 🔑 Design Tokens Quick Reference

```css
--c-dark: #1a2332;   --c-text: #111827;
--c-white: #ffffff;  --c-bg: #f3f4f6;
--c-accent: #4fc3f7; --c-pos: #16a34a;  --c-neg: #dc2626;
--radius-sm: 4px;    --radius: 8px;     --radius-lg: 10px;
```

詳細規格見 `mic-ui-style` skill。
