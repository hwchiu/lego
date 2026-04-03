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
