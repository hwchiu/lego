# 元件樣式模板

可直接複製使用的 CSS 模板，涵蓋 MIC 中最常見的 UI 元件模式。

## Card

```css
.{prefix}-card {
  background: var(--c-white);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  padding: 20px 22px;
  margin-bottom: 16px;
}
```

### Card 變體

**可點擊 Card（帶 hover 浮起）**
```css
.{prefix}-card--clickable {
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.{prefix}-card--clickable:hover {
  border-color: var(--c-border-2);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
```

**選中 Card（帶 accent ring）**
```css
.{prefix}-card.selected {
  border-color: var(--c-accent);
  box-shadow: 0 0 0 2px rgba(79, 195, 247, 0.18);
}
```

**緊湊 Card**
```css
.{prefix}-card--compact {
  padding: 12px 14px;
}
```

## Button

### Toggle Button（最常用）

```css
.{prefix}-toggle-btn {
  padding: 4px 11px;
  font-size: 11.5px;
  font-weight: 500;
  background: var(--c-white);
  border: 1px solid var(--c-border-2);
  border-radius: var(--radius-sm);
  color: var(--c-text-3);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.{prefix}-toggle-btn:hover {
  background: var(--c-bg);
  color: var(--c-text-2);
}
.{prefix}-toggle-btn.active {
  background: var(--c-btn-active);
  color: var(--c-white);
  border-color: var(--c-btn-active);
}
```

### 箭頭 / 方向按鈕

```css
.{prefix}-arrow-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--c-border-2);
  background: var(--c-white);
  color: var(--c-text-3);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.{prefix}-arrow-btn:hover {
  background: var(--c-bg);
  border-color: var(--c-border-2);
}
```

### Icon-Only Button

```css
.{prefix}-icon-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--c-text-3);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.{prefix}-icon-btn:hover {
  background: var(--c-bg);
  color: var(--c-text);
}
```

### Sidebar 內的 Icon Button（暗色背景）

```css
.sidebar-icon-btn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: rgba(255,255,255,0.45);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.sidebar-icon-btn:hover {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.85);
}
```

### Pill Button（分類篩選）

```css
.{prefix}-pill-btn {
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 500;
  background: var(--c-white);
  border: 1px solid var(--c-border-2);
  border-radius: 20px;
  color: var(--c-text-3);
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}
.{prefix}-pill-btn.active {
  background: var(--c-dark);
  color: var(--c-white);
  border-color: var(--c-dark);
}
```

## Input

### 標準搜尋輸入框

```css
.{prefix}-search-input {
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--c-border-2);
  border-radius: var(--radius);
  font-size: 12.5px;
  font-family: var(--font);
  color: var(--c-text);
  background: var(--c-bg);
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}
.{prefix}-search-input::placeholder {
  color: var(--c-text-4);
}
.{prefix}-search-input:focus {
  border-color: var(--c-dark);
  background: var(--c-white);
}
```

### 帶圖標的搜尋框

```css
.{prefix}-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.{prefix}-search-wrap .search-icon {
  position: absolute;
  left: 10px;
  color: var(--c-text-4);
  pointer-events: none;
}
.{prefix}-search-wrap input {
  padding-left: 30px;  /* 為 icon 預留空間 */
}
```

## Dropdown

```css
.{prefix}-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 180px;
  background: var(--c-white);
  border: 1px solid var(--c-border-2);
  border-radius: var(--radius);
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  z-index: 200;
  padding: 4px 0;
}
.{prefix}-dropdown-item {
  padding: 6px 12px;
  font-size: 12px;
  color: var(--c-text-2);
  cursor: pointer;
  transition: background 0.12s;
}
.{prefix}-dropdown-item:hover {
  background: var(--c-bg);
}
.{prefix}-dropdown-item.active {
  color: var(--c-text);
  font-weight: 600;
}
```

## Modal

```css
/* 背景遮罩 */
.{prefix}-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 499;
}

/* 彈窗本體 */
.{prefix}-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--c-white);
  border-radius: var(--radius);
  box-shadow: 0 8px 24px rgba(0,0,0,0.10);
  z-index: 500;
  padding: 24px;
  max-width: 520px;
  width: 90vw;
  animation: modal-in 0.18s ease;
}

@keyframes modal-in {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.92) translateY(-20px); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1) translateY(0); }
}
```

## Table

```css
.{prefix}-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.{prefix}-table th {
  font-size: 10px;
  font-weight: 700;
  color: var(--c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 8px 10px;
  border-bottom: 1.5px solid var(--c-border-2);
  text-align: left;
}
.{prefix}-table td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--c-border);
  color: var(--c-text-2);
}
.{prefix}-table tr:hover {
  background: var(--c-bg);
}
```

## Badge

### NEW Badge

```css
.{prefix}-badge-new {
  display: inline-block;
  background: rgb(191, 48, 48);
  color: var(--c-white);
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  line-height: 1;
}
```

### Coming Soon Badge

```css
.{prefix}-badge-soon {
  display: inline-block;
  background: #1e66f5;
  color: #fff;
  padding: 1px 3px;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 700;
}
```

### 狀態 Badge（通用）

```css
.{prefix}-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
}
```

## Eyebrow / Section Label

```css
.{prefix}-eyebrow {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--c-text-3);
  margin-bottom: 8px;
}
```

## Section Title

```css
.{prefix}-section-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--c-text);
  margin-bottom: 12px;
}
```

## Tabs

```css
.{prefix}-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1.5px solid var(--c-border);
  margin-bottom: 16px;
}
.{prefix}-tab {
  padding: 8px 16px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--c-text-3);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
  margin-bottom: -1.5px;
}
.{prefix}-tab:hover {
  color: var(--c-text-2);
}
.{prefix}-tab.active {
  color: var(--c-text);
  font-weight: 600;
  border-bottom-color: var(--c-dark);
}
```

## Sidebar Active Nav Item

```css
.sidebar-nav a {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 16px;
  font-size: 11.5px;
  color: rgba(255,255,255,0.62);
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: background 0.15s, color 0.15s;
}
.sidebar-nav a:hover {
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.85);
}
.sidebar-nav a.active {
  background: linear-gradient(90deg, rgba(79,195,247,0.17), rgba(79,195,247,0.04));
  color: var(--c-accent);
  font-weight: 600;
  border-left-color: var(--c-accent);
}
```

## Avatar

```css
.{prefix}-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid var(--c-border-2);
}
```

## Data Value (漲跌色)

```css
.{prefix}-pos {
  color: var(--c-pos);
  font-weight: 600;
}
.{prefix}-neg {
  color: var(--c-neg);
  font-weight: 600;
}
```

## Scrollbar（Webkit + Firefox）

```css
.{prefix}-scroll::-webkit-scrollbar {
  width: 4px;
}
.{prefix}-scroll::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.10);
  border-radius: 2px;
}
.{prefix}-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.10) transparent;
}
```

## Focus / Active 狀態模板

### Focus Ring（標準）

```css
.{prefix}-focusable:focus {
  outline: none;
  border-color: var(--c-dark);
  box-shadow: 0 0 0 2px rgba(79, 195, 247, 0.18);
}
```

### Hover Elevation（浮起效果）

```css
.{prefix}-hoverable {
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
}
.{prefix}-hoverable:hover {
  background: var(--c-bg);
  border-color: var(--c-border-2);
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
}
```
