# Watchlist Persistent Data

## Watchlist Names

```json
{
  "627836": "Watchlist1",
  "738291": "Watchlist-TSM",
  "394827": "Watchlist2"
}
```

## Symbol Orders

```json
{
  "627836": ["TSM", "TSLA", "QCOM", "GOOGL", "SONY", "AAPL", "NVDA", "ASML"],
  "738291": ["TSM", "TSLA", "QCOM", "GOOGL", "SONY", "AAPL", "NVDA", "ASML"],
  "394827": ["TSM", "TSLA", "QCOM", "GOOGL", "SONY", "AAPL", "NVDA", "ASML"]
}
```

> **Note:** This file records the default state. Actual user modifications are persisted in `localStorage` under the key `wl-names` (for names) and `wl-orders` (for symbol orders), keyed by watchlist ID.

## Entity Data

> Auto-updated by `scripts/fetch-stock-data.mjs`.
> Last updated: 2026-04-03T04:28:18.601Z

Full holding-table data for every tracked symbol. User-added symbols are persisted in `localStorage` under the key `wl-extra-holdings`.

> **DOI** = Days of Inventory Outstanding (a supply-chain efficiency metric; lower values indicate faster inventory turnover).

```json
{
  "TSM": {
    "symbol": "TSM",
    "price": 339.04,
    "change": -2.45,
    "changePct": -0.72,
    "shares": 120,
    "cost": 105.3,
    "todayGain": -294,
    "todayGainPct": -0.72,
    "revenue": "NT$3.81T",
    "revenueQoQ": "N/A",
    "revenueYoY": "+20.5%",
    "grossMargin": "59.9%",
    "doi": "N/A",
    "nextEarning": "Apr 16, 2026",
    "lastQtrRevenue": "N/A",
    "lastQtrGrossMargin": "N/A",
    "lastQtrDOI": "N/A"
  },
  "TSLA": {
    "symbol": "TSLA",
    "price": 360.59,
    "change": -20.67,
    "changePct": -5.42,
    "shares": 50,
    "cost": 196.4,
    "todayGain": -1033.5,
    "todayGainPct": -5.42,
    "revenue": "$94.83B",
    "revenueQoQ": "N/A",
    "revenueYoY": "-3.1%",
    "grossMargin": "18.0%",
    "doi": "N/A",
    "nextEarning": "Apr 22, 2026",
    "lastQtrRevenue": "N/A",
    "lastQtrGrossMargin": "N/A",
    "lastQtrDOI": "N/A"
  },
  "QCOM": {
    "symbol": "QCOM",
    "price": 126.8,
    "change": -0.48,
    "changePct": -0.38,
    "shares": 80,
    "cost": 128.9,
    "todayGain": -38.4,
    "todayGainPct": -0.38,
    "revenue": "$44.87B",
    "revenueQoQ": "N/A",
    "revenueYoY": "+5.0%",
    "grossMargin": "55.1%",
    "doi": "N/A",
    "nextEarning": "Apr 29, 2026",
    "lastQtrRevenue": "N/A",
    "lastQtrGrossMargin": "N/A",
    "lastQtrDOI": "N/A"
  },
  "GOOGL": {
    "symbol": "GOOGL",
    "price": 295.77,
    "change": -1.62,
    "changePct": -0.54,
    "shares": 60,
    "cost": 138.5,
    "todayGain": -97.2,
    "todayGainPct": -0.54,
    "revenue": "$402.84B",
    "revenueQoQ": "N/A",
    "revenueYoY": "+18.0%",
    "grossMargin": "59.7%",
    "doi": "N/A",
    "nextEarning": "Apr 23, 2026",
    "lastQtrRevenue": "N/A",
    "lastQtrGrossMargin": "N/A",
    "lastQtrDOI": "N/A"
  },
  "SONY": {
    "symbol": "SONY",
    "price": 21.14,
    "change": 0.02,
    "changePct": 0.09,
    "shares": 200,
    "cost": 18.7,
    "todayGain": 4,
    "todayGainPct": 0.09,
    "revenue": "¥13.17T",
    "revenueQoQ": "N/A",
    "revenueYoY": "+0.5%",
    "grossMargin": "29.5%",
    "doi": "N/A",
    "nextEarning": "May 14, 2026",
    "lastQtrRevenue": "N/A",
    "lastQtrGrossMargin": "N/A",
    "lastQtrDOI": "N/A"
  },
  "AAPL": {
    "symbol": "AAPL",
    "price": 255.92,
    "change": 0.29,
    "changePct": 0.11,
    "shares": 45,
    "cost": 167.8,
    "todayGain": 13.05,
    "todayGainPct": 0.11,
    "revenue": "$435.62B",
    "revenueQoQ": "N/A",
    "revenueYoY": "+15.7%",
    "grossMargin": "47.3%",
    "doi": "N/A",
    "nextEarning": "Apr 30, 2026",
    "lastQtrRevenue": "N/A",
    "lastQtrGrossMargin": "N/A",
    "lastQtrDOI": "N/A"
  },
  "NVDA": {
    "symbol": "NVDA",
    "price": 177.39,
    "change": 1.64,
    "changePct": 0.93,
    "shares": 30,
    "cost": 512.6,
    "todayGain": 49.2,
    "todayGainPct": 0.93,
    "revenue": "$215.94B",
    "revenueQoQ": "N/A",
    "revenueYoY": "+73.2%",
    "grossMargin": "71.1%",
    "doi": "N/A",
    "nextEarning": "May 20, 2026",
    "lastQtrRevenue": "N/A",
    "lastQtrGrossMargin": "N/A",
    "lastQtrDOI": "N/A"
  },
  "ASML": {
    "symbol": "ASML",
    "price": 1317.23,
    "change": -42.53,
    "changePct": -3.13,
    "shares": 20,
    "cost": 598,
    "todayGain": -850.6,
    "todayGainPct": -3.13,
    "revenue": "€32.67B",
    "revenueQoQ": "N/A",
    "revenueYoY": "+4.9%",
    "grossMargin": "52.8%",
    "doi": "N/A",
    "nextEarning": "Apr 15, 2026",
    "lastQtrRevenue": "N/A",
    "lastQtrGrossMargin": "N/A",
    "lastQtrDOI": "N/A"
  }
}
```

### Field Descriptions

| Field | Description |
|---|---|
| `symbol` | Stock ticker symbol |
| `price` | Current share price (USD) |
| `change` | Absolute price change today (USD) |
| `changePct` | Percentage price change today (%) |
| `shares` | Number of shares held |
| `cost` | Average cost basis per share (USD) |
| `todayGain` | Total dollar gain/loss today across all shares |
| `todayGainPct` | Percentage gain/loss today (%) |
| `revenue` | Trailing twelve months revenue (formatted, in reporting currency) |
| `revenueQoQ` | Revenue change vs. prior quarter |
| `revenueYoY` | Revenue change vs. same quarter last year |
| `grossMargin` | Gross profit margin (trailing) |
| `doi` | Days of Inventory Outstanding |
| `nextEarning` | Next scheduled earnings release date |
| `lastQtrRevenue` | Previous quarter revenue |
| `lastQtrGrossMargin` | Previous quarter gross margin |
| `lastQtrDOI` | Previous quarter Days of Inventory Outstanding |
