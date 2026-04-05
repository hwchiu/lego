# Watchlist Custom Views

This file documents the structure of user-defined Watchlist views.
Actual user data is persisted in `localStorage` under the key `wl-custom-views`.

## Default View Order

```json
["Summary", "Health Score", "Ratings", "Holdings"]
```

> **Note:** Built-in views (Summary, Health Score, Ratings, Holdings) cannot be deleted but can be hidden.
> User-created views can be deleted or hidden. View order changes are persisted in `localStorage` under `wl-view-order`.

## Custom Views (User-Created)

```json
[]
```

> Each custom view object has the shape:
> ```json
> {
>   "id": "view-<uuid>",
>   "name": "My View",
>   "columns": ["price", "change", "changePct", "grossMargin", "doi"],
>   "hidden": false
> }
> ```

## Column Catalog

The following column IDs are available for custom views:

### Trading
| ID | Label |
|---|---|
| `price` | Price |
| `change` | Change |
| `changePct` | Change % |
| `volume` | Volume |
| `avgVolume` | Avg Volume (30D) |
| `52wHigh` | 52W High |
| `52wLow` | 52W Low |
| `beta` | Beta |
| `marketCap` | Market Cap |

### Earnings
| ID | Label |
|---|---|
| `nextEarning` | Next Earning Release |
| `revenueQoQ` | Revenue QoQ |
| `revenueYoY` | Revenue YoY |
| `lastQtrRevenue` | Last Qtr Revenue |
| `epsGrowthYoY` | EPS Growth YoY |

### Valuation
| ID | Label |
|---|---|
| `peRatio` | P/E Ratio |
| `forwardPE` | Forward P/E |
| `psRatio` | P/S Ratio |
| `pbRatio` | P/B Ratio |
| `evEbitda` | EV/EBITDA |
| `dividendYield` | Dividend Yield |
| `marketCap` | Market Cap |

### Growth
| ID | Label |
|---|---|
| `revenueYoY` | Revenue YoY |
| `revenueQoQ` | Revenue QoQ |
| `epsGrowthYoY` | EPS Growth YoY |
| `revCagr3y` | Revenue CAGR (3Y) |

### Performance
| ID | Label |
|---|---|
| `todayGain` | Today's Gain |
| `todayGainPct` | Today's % Gain |
| `return1m` | 1M Return |
| `return3m` | 3M Return |
| `return1y` | 1Y Return |
| `returnYtd` | YTD Return |

### Benchmarks
| ID | Label |
|---|---|
| `vsSP500` | vs S&P 500 (1Y) |
| `vsNasdaq` | vs Nasdaq (1Y) |
| `vsSector` | vs Sector (1Y) |
| `beta` | Beta |

### Profitability
| ID | Label |
|---|---|
| `grossMargin` | Gross Margin |
| `operatingMargin` | Operating Margin |
| `netMargin` | Net Margin |
| `roe` | ROE |
| `roic` | ROIC |
| `lastQtrGrossMargin` | Last Qtr Gross Margin |

### Ownership
| ID | Label |
|---|---|
| `shares` | Shares |
| `cost` | Cost |
| `marketValue` | Market Value |
| `unrealizedPL` | Unrealized P&L |
| `unrealizedPct` | Unrealized % |

### Debt
| ID | Label |
|---|---|
| `debtEquity` | Debt/Equity |
| `currentRatio` | Current Ratio |
| `netDebt` | Net Debt |
| `doi` | DOI |
| `lastQtrDOI` | Last Qtr DOI |
