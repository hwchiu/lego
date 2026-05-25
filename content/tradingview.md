# TradingView Widget Configuration

```json
{
  "stockChartSrc": "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js",
  "marketOverviewSrc": "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js",
  "marketOverviewConfig": {
    "colorTheme": "light",
    "dateRange": "1D",
    "showChart": true,
    "locale": "en",
    "largeChartUrl": "",
    "isTransparent": false,
    "showSymbolLogo": true,
    "showFloatingTooltip": false,
    "tabs": [
      {
        "title": "Indices",
        "symbols": [
          { "s": "FOREXCOM:SPXUSD", "d": "S&P 500" },
          { "s": "FOREXCOM:DJI", "d": "Dow Jones" },
          { "s": "FOREXCOM:NSXUSD", "d": "Nasdaq 100" },
          { "s": "OANDA:XAUUSD", "d": "Gold" },
          { "s": "INDEX:NKY", "d": "Nikkei 225" },
          { "s": "INDEX:DEU40", "d": "DAX" }
        ],
        "originalTitle": "Indices"
      }
    ]
  }
}
```
