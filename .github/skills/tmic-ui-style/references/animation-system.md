# 動畫與過渡系統

tMIC 的動態效果規範——所有過渡時間、緩動函數、關鍵影格動畫的完整參照。

## 過渡（Transition）規範

### 時間尺度

| 時長 | 名稱 | 用途 | 緩動 |
|------|------|------|------|
| `0.1s` | Instant | 極快回饋（search item hover） | `ease` |
| `0.12s` | Fast | 色彩變化、checkbox、選項 | `ease` |
| **`0.15s`** | **Standard** | **最常用：按鈕、邊框、背景** | `ease` |
| `0.18s` | Modal | 彈窗進場、面板進場 | `ease` |
| `0.22s` | Panel | Sidebar 收合、Panel 滑入 | `ease` |
| `0.28s` | Drawer | Mobile sidebar 滑入 | `cubic-bezier(0.4, 0, 0.2, 1)` |

### 常用過渡宣告

```css
/* 色彩類 */
transition: background 0.15s, color 0.15s;
transition: background 0.15s, color 0.15s, border-color 0.15s;

/* 邊框類 */
transition: border-color 0.15s;

/* 透明度 */
transition: opacity 0.15s;

/* 陰影類 */
transition: box-shadow 0.12s;

/* 變形類 */
transition: transform 0.18s ease;

/* 複合類 */
transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;

/* Sidebar 收合（多屬性同步） */
transition: width 0.22s ease, min-width 0.22s ease;

/* Mobile drawer（自然進出） */
transition: left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
```

### 過渡規則

1. **不使用 `transition: all`**——明確列出變化的屬性
2. **標準時長 `0.15s`**——除非有特殊理由，否則統一使用
3. **背景 + 邊框 + 色彩要同步**——確保 hover 態視覺一致
4. **大面積元素用較長時間**——Sidebar（0.22s）、Drawer（0.28s）
5. **小元素用較短時間**——Checkbox（0.12s）、快速反饋（0.1s）

## 關鍵影格動畫（Keyframes）

### chatbot-slide-in

聊天機器人面板從右側滑入。

```css
@keyframes chatbot-slide-in {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(16px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}
/* 使用：animation: chatbot-slide-in 0.22s ease; */
```

### chatbot-dot-bounce

聊天載入中的三點跳動動畫。

```css
@keyframes chatbot-dot-bounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  40% {
    transform: translateY(-6px);
    opacity: 1;
  }
}
/* 使用：animation: chatbot-dot-bounce 1.2s infinite; */
/* 三點延遲：nth-child(2) delay 0.2s, nth-child(3) delay 0.4s */
```

### wl-modal-in

Watchlist modal 縮放淡入。

```css
@keyframes wl-modal-in {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
/* 使用：animation: wl-modal-in 0.18s ease; */
```

### rmapPanelIn

Supply Chain 面板從左側滑入。

```css
@keyframes rmapPanelIn {
  from {
    opacity: 0;
    transform: translateX(-24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
/* 使用：animation: rmapPanelIn 0.18s ease; */
```

### de-panel-slide-in

Data Explore 面板從右側滑入。

```css
@keyframes de-panel-slide-in {
  from {
    opacity: 0;
    transform: translateX(16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
/* 使用：animation: de-panel-slide-in 0.22s ease; */
```

### pr-stack-expand-in

Press Release 堆疊卡片展開動畫。

```css
@keyframes pr-stack-expand-in {
  from {
    opacity: 0;
    transform: translate(-12px, -12px) scale(0.88);
  }
  to {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
}
/* 使用：animation: pr-stack-expand-in 0.15s ease-out both; */
```

### is-cursor-blink

Intelligence Search 游標閃爍。

```css
@keyframes is-cursor-blink {
  0%, 49%, 100% { opacity: 1; }
  50%, 99%      { opacity: 0; }
}
/* 使用：animation: is-cursor-blink 1.1s step-end infinite; */
```

## 新增動畫的慣例

### 進場動畫模板

當需要新增面板或彈窗進場動畫時，遵循此模板：

**從右滑入**
```css
@keyframes {prefix}-slide-in {
  from { opacity: 0; transform: translateX(16px); }
  to   { opacity: 1; transform: translateX(0); }
}
.{prefix}-panel {
  animation: {prefix}-slide-in 0.22s ease;
}
```

**從左滑入**
```css
@keyframes {prefix}-slide-in {
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

**縮放淡入（彈窗）**
```css
@keyframes {prefix}-modal-in {
  from { opacity: 0; transform: scale(0.92) translateY(-20px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.{prefix}-modal {
  animation: {prefix}-modal-in 0.18s ease;
}
```

### 命名規則

- 名稱格式：`{feature-prefix}-{action}`
- 常見 action：`slide-in`、`modal-in`、`expand-in`、`fade-in`
- 範例：`de-panel-slide-in`、`wl-modal-in`、`pr-stack-expand-in`

### 效能原則

1. **僅使用 `transform` + `opacity`** 做動畫——這兩個屬性使用 GPU 加速，不觸發 layout/paint
2. **避免對 `width`、`height`、`margin`、`padding` 做動畫**（例外：sidebar collapse 因為影響佈局，使用 `width` transition）
3. **所有持續動畫（infinite）必須用 `will-change` 或確認不影響效能**
4. **未來考慮加入 `prefers-reduced-motion`**：
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```
