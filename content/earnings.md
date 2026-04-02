# Earnings Calendar Data

此為假資料，僅供展示用途。包含四個資料集：
- `weekDays`：本週（Mar 29 – Apr 4）每日財報公司列表
- `aprilMonthData`：四月整月財報日曆（週一至週五）
- `epsData`：每股盈餘（EPS）報告列表
- `revenueData`：營收報告列表

```json
{
  "weekDays": [
    { "dayLabel": "SUN", "dateLabel": "Mar 29" },
    {
      "dayLabel": "MON", "dateLabel": "Mar 30",
      "companyCount": 50,
      "companies": ["WBA","JEF","CTAS","LEN","RPM","MO","SNX","AYI","NVT","HELE"]
    },
    {
      "dayLabel": "TUE", "dateLabel": "Mar 31",
      "companyCount": 58,
      "companies": ["PAYX","MKC","ACN","NKE","STZ","WGO","DLTR","FIVE","COST","CASY"]
    },
    {
      "dayLabel": "WED", "dateLabel": "Apr 1", "isToday": true,
      "companyCount": 19,
      "companies": ["TLK","CAG","LW","MSM","UNF","CALM","PENG","TLRY","PSMT","BNED"]
    },
    {
      "dayLabel": "THU", "dateLabel": "Apr 2",
      "companyCount": 26,
      "companies": ["AZZ","GMS","CIEN","LNTH","AIR","SCSC","ORN","STRT","AMSF","HOFT"]
    },
    {
      "dayLabel": "FRI", "dateLabel": "Apr 3",
      "companyCount": 12,
      "companies": ["STZ","WGO","DLTR","FIVE","COST","CASY","GIS","TSN","CPB","SJM"]
    },
    { "dayLabel": "SAT", "dateLabel": "Apr 4" }
  ],

  "aprilMonthData": [
    {
      "dayLabel": "MON", "dateLabel": "Apr 6",
      "companyCount": 34,
      "companies": ["AAPL","MSFT","JPM","WFC","BAC","GS","MS","C","V","MA"]
    },
    {
      "dayLabel": "TUE", "dateLabel": "Apr 7",
      "companyCount": 41,
      "companies": ["TSLA","NVDA","META","GOOGL","UNH","JNJ","PFE","ABBV","MRK","LLY"]
    },
    {
      "dayLabel": "WED", "dateLabel": "Apr 8",
      "companyCount": 28,
      "companies": ["CVX","XOM","COP","SLB","CAT","DE","MMM","HON","GE","BA"]
    },
    {
      "dayLabel": "THU", "dateLabel": "Apr 9",
      "companyCount": 37,
      "companies": ["LMT","RTX","NOC","GD","WMT","TGT","HD","LOW","MCD","SBUX"]
    },
    {
      "dayLabel": "FRI", "dateLabel": "Apr 10",
      "companyCount": 15,
      "companies": ["NKE","DIS","NFLX","CMCSA","T","VZ","AMT","PLD","SPG","O"]
    },
    {
      "dayLabel": "MON", "dateLabel": "Apr 13",
      "companyCount": 52,
      "companies": ["JPM","GS","WFC","MS","C","BLK","AXP","SCHW","CB","PGR"]
    },
    {
      "dayLabel": "TUE", "dateLabel": "Apr 14",
      "companyCount": 63,
      "companies": ["BAC","USB","PNC","TFC","CFG","RF","HBAN","KEY","FITB","MTB"]
    },
    {
      "dayLabel": "WED", "dateLabel": "Apr 15",
      "companyCount": 48,
      "companies": ["NFLX","JNJ","UAL","AA","ASML","STT","FAST","CSX","ACN","SYK"]
    },
    {
      "dayLabel": "THU", "dateLabel": "Apr 16",
      "companyCount": 71,
      "companies": ["TSM","IBKR","UNH","PPG","DHI","ABT","ISRG","TRV","USB","CMA"]
    },
    {
      "dayLabel": "FRI", "dateLabel": "Apr 17",
      "companyCount": 22,
      "companies": ["AXP","SLB","RF","HBAN","ERIE","HSY","BKR","CFG","ALLY","FHN"]
    },
    {
      "dayLabel": "MON", "dateLabel": "Apr 20",
      "companyCount": 45,
      "companies": ["HAL","VZ","ZION","NDAQ","FITB","EQT","FCX","KMI","OKE","WMB"]
    },
    {
      "dayLabel": "TUE", "dateLabel": "Apr 21",
      "companyCount": 58,
      "companies": ["GOOGL","GE","LMT","RTX","PCAR","PHM","VLO","F","GM","MMC"]
    },
    {
      "dayLabel": "WED", "dateLabel": "Apr 22",
      "companyCount": 67,
      "companies": ["META","BA","T","IBM","TSLA","TXN","NOW","LRCX","CDNS","ADSK"]
    },
    {
      "dayLabel": "THU", "dateLabel": "Apr 23",
      "companyCount": 79,
      "companies": ["AMZN","MSFT","INTC","MRK","ABBV","MO","MMM","CAT","UNP","CMG"]
    },
    {
      "dayLabel": "FRI", "dateLabel": "Apr 24",
      "companyCount": 31,
      "companies": ["EQIX","PSA","XOM","CVX","SHW","HON","AON","BX","KKR","APO"]
    },
    {
      "dayLabel": "MON", "dateLabel": "Apr 27",
      "companyCount": 44,
      "companies": ["AAPL","WM","ROP","ODFL","BDX","PKG","ITW","MAS","VMC","MLM"]
    },
    {
      "dayLabel": "TUE", "dateLabel": "Apr 28",
      "companyCount": 56,
      "companies": ["AMD","SNAP","V","MA","PFE","BMY","GILD","AMGN","BIIB","REGN"]
    },
    {
      "dayLabel": "WED", "dateLabel": "Apr 29",
      "companyCount": 62,
      "companies": ["NVDA","META","AMZN","GOOGL","MSFT","QCOM","AVGO","AMAT","KLAC","MCHP"]
    },
    {
      "dayLabel": "THU", "dateLabel": "Apr 30",
      "companyCount": 53,
      "companies": ["AAPL","AMZN","INTC","MA","MCD","CME","HST","CAR","IRM","DLR"]
    },
    {
      "dayLabel": "FRI", "dateLabel": "May 1",
      "companyCount": 18,
      "companies": ["ANET","DXCM","RBLX","DASH","COIN","SQ","PYPL","BILL","HOOD","SOFI"]
    }
  ],

  "epsData": [
    {
      "symbol": "TLK", "company": "PT Telekomunikasi Indonesia Tbk", "report": "Pre",
      "mktCap": "$17.2B", "epsNormalized": "$0.42", "epsYoY": "+3.2%", "epsYoYPositive": true,
      "epsGaap": "$0.38", "epsActual": "$0.43", "epsBeatMiss": "Beat",
      "lastQGaap": "$0.41", "lastQBeatMiss": "Beat", "beatsL2Y": 4, "missedL2Y": 2
    },
    {
      "symbol": "CAG", "company": "Conagra Brands, Inc.", "report": "Pre",
      "mktCap": "$10.8B", "epsNormalized": "$0.61", "epsYoY": "−8.4%", "epsYoYPositive": false,
      "epsGaap": "$0.58", "epsActual": "$0.56", "epsBeatMiss": "Miss",
      "lastQGaap": "$0.68", "lastQBeatMiss": "Miss", "beatsL2Y": 3, "missedL2Y": 5
    },
    {
      "symbol": "LW", "company": "Lamb Weston Holdings, Inc.", "report": "Pre",
      "mktCap": "$4.2B", "epsNormalized": "$0.48", "epsYoY": "−22.3%", "epsYoYPositive": false,
      "epsGaap": "$0.44", "epsActual": null, "epsBeatMiss": null,
      "lastQGaap": "$0.76", "lastQBeatMiss": "Miss", "beatsL2Y": 2, "missedL2Y": 6
    },
    {
      "symbol": "MSM", "company": "MSC Industrial Direct Co., Inc.", "report": "Post",
      "mktCap": "$3.1B", "epsNormalized": "$1.08", "epsYoY": "−5.2%", "epsYoYPositive": false,
      "epsGaap": "$1.02", "epsActual": null, "epsBeatMiss": null,
      "lastQGaap": "$1.12", "lastQBeatMiss": "Beat", "beatsL2Y": 5, "missedL2Y": 3
    },
    {
      "symbol": "UNF", "company": "UniFirst Corporation", "report": "Pre",
      "mktCap": "$1.5B", "epsNormalized": "$1.95", "epsYoY": "+2.8%", "epsYoYPositive": true,
      "epsGaap": "$1.88", "epsActual": null, "epsBeatMiss": null,
      "lastQGaap": "$1.86", "lastQBeatMiss": "Beat", "beatsL2Y": 6, "missedL2Y": 2
    },
    {
      "symbol": "CALM", "company": "Cal-Maine Foods, Inc.", "report": "Pre",
      "mktCap": "$3.8B", "epsNormalized": "$5.42", "epsYoY": "+187.3%", "epsYoYPositive": true,
      "epsGaap": "$5.10", "epsActual": null, "epsBeatMiss": null,
      "lastQGaap": "$6.15", "lastQBeatMiss": "Beat", "beatsL2Y": 7, "missedL2Y": 1
    },
    {
      "symbol": "PENG", "company": "Penguin Solutions, Inc.", "report": "Post",
      "mktCap": "$0.4B", "epsNormalized": "$0.28", "epsYoY": "−12.5%", "epsYoYPositive": false,
      "epsGaap": "$0.25", "epsActual": null, "epsBeatMiss": null,
      "lastQGaap": "$0.31", "lastQBeatMiss": "Beat", "beatsL2Y": 3, "missedL2Y": 5
    },
    {
      "symbol": "TLRY", "company": "Tilray Brands, Inc.", "report": "Post",
      "mktCap": "$1.2B", "epsNormalized": "−$0.05", "epsYoY": "+16.7%", "epsYoYPositive": true,
      "epsGaap": "−$0.08", "epsActual": null, "epsBeatMiss": null,
      "lastQGaap": "−$0.06", "lastQBeatMiss": "Miss", "beatsL2Y": 2, "missedL2Y": 6
    }
  ],

  "revenueData": [
    {
      "symbol": "TLK", "company": "PT Telekomunikasi Indonesia Tbk", "report": "Pre",
      "mktCap": "$17.2B", "revConsensus": "$3.28B", "revYoY": "+4.1%", "revYoYPositive": true,
      "revHighEst": "$3.41B", "revActual": "$3.31B", "revBeatMiss": "Beat",
      "lastQActual": "$3.15B", "lastQBeatMiss": "Beat"
    },
    {
      "symbol": "CAG", "company": "Conagra Brands, Inc.", "report": "Pre",
      "mktCap": "$10.8B", "revConsensus": "$2.96B", "revYoY": "−3.8%", "revYoYPositive": false,
      "revHighEst": "$3.04B", "revActual": "$2.91B", "revBeatMiss": "Miss",
      "lastQActual": "$3.08B", "lastQBeatMiss": "Miss"
    },
    {
      "symbol": "LW", "company": "Lamb Weston Holdings, Inc.", "report": "Pre",
      "mktCap": "$4.2B", "revConsensus": "$1.51B", "revYoY": "−9.2%", "revYoYPositive": false,
      "revHighEst": "$1.58B", "revActual": null, "revBeatMiss": null,
      "lastQActual": "$1.66B", "lastQBeatMiss": "Miss"
    },
    {
      "symbol": "CALM", "company": "Cal-Maine Foods, Inc.", "report": "Pre",
      "mktCap": "$3.8B", "revConsensus": "$1.08B", "revYoY": "+94.6%", "revYoYPositive": true,
      "revHighEst": "$1.14B", "revActual": null, "revBeatMiss": null,
      "lastQActual": "$1.11B", "lastQBeatMiss": "Beat"
    },
    {
      "symbol": "TLRY", "company": "Tilray Brands, Inc.", "report": "Post",
      "mktCap": "$1.2B", "revConsensus": "$209.4M", "revYoY": "−5.1%", "revYoYPositive": false,
      "revHighEst": "$218.0M", "revActual": null, "revBeatMiss": null,
      "lastQActual": "$220.6M", "lastQBeatMiss": "Miss"
    }
  ]
}
```
