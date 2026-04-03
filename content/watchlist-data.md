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

Full holding-table data for every tracked symbol. User-added symbols are persisted in `localStorage` under the key `wl-extra-holdings`.

> **DOI** = Days of Inventory Outstanding (a supply-chain efficiency metric; lower values indicate faster inventory turnover).

```json
{
  "TSM": {
    "symbol": "TSM",
    "price": 168.42,
    "change": 2.14,
    "changePct": 1.29,
    "shares": 120,
    "cost": 105.30,
    "todayGain": 256.80,
    "todayGainPct": 1.29,
    "revenue": "$25.53B",
    "revenueQoQ": "+3.8%",
    "revenueYoY": "+35.3%",
    "grossMargin": "58.8%",
    "doi": "72",
    "nextEarning": "Jul 17, 2025",
    "lastQtrRevenue": "$26.88B",
    "lastQtrGrossMargin": "59.0%",
    "lastQtrDOI": "68"
  },
  "TSLA": {
    "symbol": "TSLA",
    "price": 248.73,
    "change": -3.82,
    "changePct": -1.51,
    "shares": 50,
    "cost": 196.40,
    "todayGain": -191.00,
    "todayGainPct": -1.51,
    "revenue": "$19.34B",
    "revenueQoQ": "-4.2%",
    "revenueYoY": "-9.3%",
    "grossMargin": "17.1%",
    "doi": "55",
    "nextEarning": "Jul 22, 2025",
    "lastQtrRevenue": "$25.71B",
    "lastQtrGrossMargin": "19.8%",
    "lastQtrDOI": "51"
  },
  "QCOM": {
    "symbol": "QCOM",
    "price": 152.61,
    "change": 1.28,
    "changePct": 0.85,
    "shares": 80,
    "cost": 128.90,
    "todayGain": 102.40,
    "todayGainPct": 0.85,
    "revenue": "$10.84B",
    "revenueQoQ": "+1.2%",
    "revenueYoY": "+17.3%",
    "grossMargin": "55.9%",
    "doi": "84",
    "nextEarning": "Jul 30, 2025",
    "lastQtrRevenue": "$11.67B",
    "lastQtrGrossMargin": "56.3%",
    "lastQtrDOI": "79"
  },
  "GOOGL": {
    "symbol": "GOOGL",
    "price": 168.94,
    "change": 0.72,
    "changePct": 0.43,
    "shares": 60,
    "cost": 138.50,
    "todayGain": 43.20,
    "todayGainPct": 0.43,
    "revenue": "$90.23B",
    "revenueQoQ": "+2.7%",
    "revenueYoY": "+12.8%",
    "grossMargin": "57.3%",
    "doi": "N/A",
    "nextEarning": "Apr 29, 2025",
    "lastQtrRevenue": "$96.47B",
    "lastQtrGrossMargin": "58.1%",
    "lastQtrDOI": "N/A"
  },
  "SONY": {
    "symbol": "SONY",
    "price": 21.34,
    "change": -0.18,
    "changePct": -0.84,
    "shares": 200,
    "cost": 18.70,
    "todayGain": -36.00,
    "todayGainPct": -0.84,
    "revenue": "$22.18B",
    "revenueQoQ": "-8.3%",
    "revenueYoY": "+4.6%",
    "grossMargin": "28.4%",
    "doi": "42",
    "nextEarning": "May 14, 2025",
    "lastQtrRevenue": "$28.74B",
    "lastQtrGrossMargin": "27.9%",
    "lastQtrDOI": "38"
  },
  "AAPL": {
    "symbol": "AAPL",
    "price": 212.49,
    "change": 1.54,
    "changePct": 0.73,
    "shares": 45,
    "cost": 167.80,
    "todayGain": 69.30,
    "todayGainPct": 0.73,
    "revenue": "$95.36B",
    "revenueQoQ": "-23.4%",
    "revenueYoY": "+5.1%",
    "grossMargin": "47.2%",
    "doi": "8",
    "nextEarning": "May 1, 2025",
    "lastQtrRevenue": "$124.30B",
    "lastQtrGrossMargin": "46.9%",
    "lastQtrDOI": "7"
  },
  "NVDA": {
    "symbol": "NVDA",
    "price": 884.27,
    "change": 12.43,
    "changePct": 1.43,
    "shares": 30,
    "cost": 512.60,
    "todayGain": 372.90,
    "todayGainPct": 1.43,
    "revenue": "$44.07B",
    "revenueQoQ": "+12.4%",
    "revenueYoY": "+69.2%",
    "grossMargin": "74.6%",
    "doi": "28",
    "nextEarning": "May 28, 2025",
    "lastQtrRevenue": "$39.33B",
    "lastQtrGrossMargin": "73.5%",
    "lastQtrDOI": "31"
  },
  "ASML": {
    "symbol": "ASML",
    "price": 682.14,
    "change": -4.32,
    "changePct": -0.63,
    "shares": 20,
    "cost": 598.00,
    "todayGain": -86.40,
    "todayGainPct": -0.63,
    "revenue": "$7.74B",
    "revenueQoQ": "-12.8%",
    "revenueYoY": "+46.1%",
    "grossMargin": "52.7%",
    "doi": "185",
    "nextEarning": "Jul 16, 2025",
    "lastQtrRevenue": "$9.26B",
    "lastQtrGrossMargin": "51.9%",
    "lastQtrDOI": "179"
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
| `revenue` | Most recent quarter revenue (formatted string, e.g. "$25.53B") |
| `revenueQoQ` | Revenue change vs. prior quarter (e.g. "+3.8%") |
| `revenueYoY` | Revenue change vs. same quarter last year (e.g. "+35.3%") |
| `grossMargin` | Gross profit margin for the most recent quarter (e.g. "58.8%") |
| `doi` | Days of Inventory Outstanding for the most recent quarter |
| `nextEarning` | Next scheduled earnings release date |
| `lastQtrRevenue` | Previous quarter revenue (formatted string) |
| `lastQtrGrossMargin` | Previous quarter gross margin |
| `lastQtrDOI` | Previous quarter Days of Inventory Outstanding |
