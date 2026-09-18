---
description: "Monthly Copilot cost summary — TSV for team spreadsheet, last 2 months."
---

# Copilot Cost Summary

Emits a quick-view (human-readable) + one TSV block ready to paste into a shared team spreadsheet.

```
DB_PATH=~/.local/share/opencode/opencode.db
CREDIT_TO_USD=0.01
```

---

## Pricing Table (usage-based, post-June 2026)

Source: https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing

### Anthropic — USD per 1M tokens

| Model             | Input  | Cache-R | Cache-W | Output  |
|-------------------|-------:|--------:|--------:|--------:|
| claude-haiku-4.5  |  $1.00 |   $0.10 |   $1.25 |   $5.00 |
| claude-sonnet-4   |  $3.00 |   $0.30 |   $3.75 |  $15.00 |
| claude-sonnet-4.5 |  $3.00 |   $0.30 |   $3.75 |  $15.00 |
| claude-sonnet-4.6 |  $3.00 |   $0.30 |   $3.75 |  $15.00 |
| claude-opus-4.5   |  $5.00 |   $0.50 |   $6.25 |  $25.00 |
| claude-opus-4.6   |  $5.00 |   $0.50 |   $6.25 |  $25.00 |
| claude-opus-4.7   |  $5.00 |   $0.50 |   $6.25 |  $25.00 |

### OpenAI — USD per 1M tokens

| Model          | Input  | Cache-R  | Output  |
|----------------|-------:|---------:|--------:|
| gpt-4.1        |  $2.00 |   $0.500 |   $8.00 |
| gpt-5-mini     |  $0.25 |   $0.025 |   $2.00 |
| gpt-5.2        |  $1.75 |   $0.175 |  $14.00 |
| gpt-5.2-codex  |  $1.75 |   $0.175 |  $14.00 |
| gpt-5.3-codex  |  $1.75 |   $0.175 |  $14.00 |
| gpt-5.4        |  $2.50 |   $0.250 |  $15.00 |
| gpt-5.4-mini   |  $0.75 |   $0.075 |   $4.50 |
| gpt-5.4-nano   |  $0.20 |   $0.020 |   $1.25 |
| gpt-5.5        |  $5.00 |   $0.500 |  $30.00 |
| gpt-5-nano     |  $0.20 |   $0.020 |   $1.25 |

### Google — USD per 1M tokens

| Model                  | Input  | Cache-R | Output  |
|------------------------|-------:|--------:|--------:|
| gemini-2.5-pro         |  $1.25 |   $0.125 |  $10.00 |
| gemini-3-flash-preview |  $0.50 |   $0.050 |   $3.00 |
| gemini-3.1-pro-preview |  $2.00 |   $0.200 |  $12.00 |
| gemini-3.5-flash       |  $1.50 |   $0.150 |   $9.00 |

### Fine-tuned (GitHub) — USD per 1M tokens

| Model       | Input  | Cache-R  | Output  |
|-------------|-------:|---------:|--------:|
| raptor-mini |  $0.25 |   $0.025 |   $2.00 |
| goldeneye   |  $1.25 |   $0.125 |  $10.00 |

### xAI — USD per 1M tokens

> Estimated — not listed on official GitHub Copilot pricing page.

| Model            | Input  | Cache-R | Output  |
|------------------|-------:|--------:|--------:|
| grok-code-fast-1 |  $0.20 |   $0.02 |   $1.50 |

### Model name normalization (DB → pricing key)

```
claude-opus-4-6           → claude-opus-4.6
claude-opus-4-7           → claude-opus-4.7
claude-sonnet-4-6         → claude-sonnet-4.6
claude-haiku-4-5          → claude-haiku-4.5
claude-haiku-4-5-20251001 → claude-haiku-4.5
claude-sonnet-4-5-*       → claude-sonnet-4.5
grok-code-fast-1          → grok-code-fast-1
```

Unrecognized model IDs → UNMAPPED; excluded from cost totals, reported at end.

---

## Workflow

### Step 1 — Resolve member

```bash
MEMBER="${1:-$(whoami)}"   # override: pass as first arg, e.g. /crystal/copilot-cost-summary alice
```

### Step 2 — Query DB by (month, model)

Date range: first day of the month 2 months ago → today.

```bash
sqlite3 "$DB_PATH" "
SELECT
  strftime('%Y-%m', time_created/1000, 'unixepoch')  AS month,
  json_extract(data, '$.modelID')                     AS model,
  COUNT(*)                                            AS msgs,
  SUM(json_extract(data, '$.tokens.input'))           AS input_tok,
  SUM(json_extract(data, '$.tokens.output'))          AS output_tok,
  SUM(json_extract(data, '$.tokens.cache.read'))      AS cache_r_tok,
  SUM(json_extract(data, '$.tokens.cache.write'))     AS cache_w_tok
FROM message
WHERE json_extract(data, '$.role') = 'assistant'
  AND json_extract(data, '$.tokens.input') IS NOT NULL
  AND time_created >= strftime('%s', date('now','start of month','-2 months')) * 1000
GROUP BY month, model
ORDER BY month ASC, input_tok DESC;
"
```

### Step 3 — Compute costs (Python)

Use `python3 -c "..."`. Do NOT round intermediate values — only round final Cost_USD (2dp) and Credits (0dp).

For each `(month, model)` row:
- Normalize model name → pricing key
- Look up `(input_price, cache_r_price, cache_w_price, output_price)` from table above
- `cost = (input_tok * input_price + cache_r_tok * cache_r_price + cache_w_tok * cache_w_price + output_tok * output_price) / 1_000_000`
- Non-Anthropic: `cache_w_tok` is always 0 — treat as such
- Unmapped model: cost = 0, flag for report

Aggregate per month:
```
month_input_tok   = SUM(input_tok)    across all models in month
month_output_tok  = SUM(output_tok)
month_cache_r_tok = SUM(cache_r_tok)
month_cache_w_tok = SUM(cache_w_tok)
month_msgs        = SUM(msgs)
month_cost_usd    = SUM(cost)
month_credits     = ROUND(month_cost_usd / 0.01)
top_model         = model with highest cost in month
top_pct           = ROUND(top_model_cost / month_cost_usd * 100)  → e.g. "76%"
```

### Step 4 — Emit output

#### Quick view (human-readable, one line per month)

```
# Copilot Cost Summary  ·  <earliest_month>–<latest_month>
Member  : <MEMBER>
Pricing : usage-based post-June 2026  ·  1 credit = $0.01

<month> : <msgs> msgs · in <X.XM> / out <X.XM> / cr <X,XXXM> / cw <X.XM>  →  $<cost>  (<credits> cr)  · top: <top_model> (<top_pct>%)
<month> : ...
```

Token display rules: divide by 1,000,000, show 1dp. Use commas for thousands. Examples: `179.3M`, `3,038M`, `79.3M`.

#### TSV block (Monthly Summary)

```
─── MONTHLY SUMMARY  paste into Summary tab ──────────────────────────────────
Month	Member	Msgs	Input_tok	Output_tok	Cache_R_tok	Cache_W_tok	Cost_USD	Credits	Top_Model	Top_Pct
<month>	<MEMBER>	<msgs>	<input_tok>	<output_tok>	<cache_r_tok>	<cache_w_tok>	<cost_usd>	<credits>	<top_model>	<top_pct>
...
──────────────────────────────────────────────────────────────────────────────
```

- `Cost_USD`: raw float, 2 decimal places (e.g. `2653.47`)
- `Credits`: raw integer (e.g. `265347`)
- `Top_Pct`: integer, no `%` symbol (e.g. `76`) — spreadsheet formula-safe
- Token columns: raw integers — no suffix, no commas
- Header row printed once, identical every run — rows stack correctly across team members

#### Unmapped models (if any)

```
UNMAPPED (excluded from cost): <model>  <msgs> msgs · <input_tok> input · <output_tok> output
```

---

## Example output

```
# Copilot Cost Summary  ·  Apr–May 2026
Member  : alan
Pricing : usage-based post-June 2026  ·  1 credit = $0.01

2026-04 : 44,385 msgs · in 179.3M / out 18.7M / cr 3,038M / cw 79.3M  →  $2,653  (265,300 cr)  · top: claude-opus-4.6 (76%)
2026-05 : 64,499 msgs · in  70.5M / out 32.8M / cr 4,259M / cw 596.6M →  $4,591  (459,100 cr)  · top: claude-sonnet-4.6 (62%)

─── MONTHLY SUMMARY  paste into Summary tab ──────────────────────────────────
Month	Member	Msgs	Input_tok	Output_tok	Cache_R_tok	Cache_W_tok	Cost_USD	Credits	Top_Model	Top_Pct
2026-04	alan	44385	179337441	18655501	3037551663	79256822	2653.00	265300	claude-opus-4.6	76
2026-05	alan	64499	70549894	32761096	4259296881	596574467	4591.00	459100	claude-sonnet-4.6	62
──────────────────────────────────────────────────────────────────────────────
```

---

## Execution notes

- Run the SQLite query with `bash` → `sqlite3`.
- Run all arithmetic with `python3 -c "..."` — no manual token math.
- The quick-view and TSV block are printed to stdout; no file is written.
