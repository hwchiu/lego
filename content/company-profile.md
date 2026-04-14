# Company Profile Data

## Financial Data

```json
{
  "companies": [
    {
      "symbol": "NVDA",
      "name": "NVIDIA Corporation",
      "localCurrency": "USD",
      "bbgId": "200710 US Equity",
      "stockExchange": "NASDAQ",
      "publicTags": ["Competitors", "Backend", "Foundry"],
      "myTags": ["Competitors", "Backend"]
    },
    {
      "symbol": "TC",
      "name": "TSMC",
      "localCurrency": "TWD",
      "bbgId": "200711 TW Equity",
      "stockExchange": "TWSE",
      "publicTags": ["Foundry", "Semiconductor", "AI"],
      "myTags": ["Foundry"]
    },
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "localCurrency": "USD",
      "bbgId": "200712 US Equity",
      "stockExchange": "NASDAQ",
      "publicTags": ["Tech", "Consumer", "AI"],
      "myTags": ["Tech"]
    },
    {
      "symbol": "INTC",
      "name": "Intel Corporation",
      "localCurrency": "USD",
      "bbgId": "200713 US Equity",
      "stockExchange": "NASDAQ",
      "publicTags": ["Semiconductor", "Foundry"],
      "myTags": []
    },
    {
      "symbol": "QCOM",
      "name": "Qualcomm Inc.",
      "localCurrency": "USD",
      "bbgId": "200714 US Equity",
      "stockExchange": "NASDAQ",
      "publicTags": ["Semiconductor", "Mobile"],
      "myTags": []
    }
  ],
  "financialData": {
    "NVDA": {
      "currentQtr": {
        "label": "23Q2",
        "revenue": 13507,
        "revenueUnit": "US$M",
        "revenueQoQ": 87.8,
        "grossMargin": 70.0,
        "grossMarginNote": "Last Quarter",
        "doi": 129
      },
      "nextQtr": {
        "label": "23Q3",
        "revenueMidpointGuidance": 16875,
        "revenueQoQ": 24.9
      },
      "financialIndices": [
        { "quarter": "21Q2", "netIncome": 2374, "totalRevenue": 6507, "grossProfit": 4088, "grossMarginPct": 62.8, "operatingMarginPct": 31.1, "netMarginPct": 36.5, "cashEquivalents": 6651, "guidance": null },
        { "quarter": "21Q3", "netIncome": 2464, "totalRevenue": 7103, "grossProfit": 4601, "grossMarginPct": 64.8, "operatingMarginPct": 37.3, "netMarginPct": 34.7, "cashEquivalents": 6849, "guidance": null },
        { "quarter": "21Q4", "netIncome": 3003, "totalRevenue": 7643, "grossProfit": 4939, "grossMarginPct": 64.6, "operatingMarginPct": 39.8, "netMarginPct": 39.3, "cashEquivalents": 1990, "guidance": null },
        { "quarter": "22Q1", "netIncome": 3493, "totalRevenue": 8290, "grossProfit": 5431, "grossMarginPct": 65.5, "operatingMarginPct": 40.1, "netMarginPct": 42.1, "cashEquivalents": 3524, "guidance": null },
        { "quarter": "22Q2", "netIncome": 656,  "totalRevenue": 6704, "grossProfit": 2917, "grossMarginPct": 43.5, "operatingMarginPct": -3.6, "netMarginPct": 9.8,  "cashEquivalents": 4396, "guidance": null },
        { "quarter": "22Q3", "netIncome": 680,  "totalRevenue": 5931, "grossProfit": 2860, "grossMarginPct": 48.2, "operatingMarginPct": 3.7,  "netMarginPct": 11.5, "cashEquivalents": 2946, "guidance": null },
        { "quarter": "22Q4", "netIncome": 1414, "totalRevenue": 6051, "grossProfit": 3566, "grossMarginPct": 58.9, "operatingMarginPct": 15.2, "netMarginPct": 23.4, "cashEquivalents": 3378, "guidance": null },
        { "quarter": "23Q1", "netIncome": 2043, "totalRevenue": 7192, "grossProfit": 4648, "grossMarginPct": 64.6, "operatingMarginPct": 28.8, "netMarginPct": 28.4, "cashEquivalents": 3389, "guidance": null },
        { "quarter": "23Q2", "netIncome": 6188, "totalRevenue": 13507, "grossProfit": 9462, "grossMarginPct": 70.1, "operatingMarginPct": 54.1, "netMarginPct": 45.8, "cashEquivalents": 1576, "guidance": 16875 }
      ],
      "revenueBreakdown": {
        "quarter": "23Q3",
        "items": [
          { "name": "Data Center",   "pct": 76.0 },
          { "name": "Gaming",        "pct": 16.0 },
          { "name": "Professional",  "pct": 4.0  },
          { "name": "Automotive",    "pct": 2.5  },
          { "name": "OEM & Other",   "pct": 1.5  }
        ]
      },
      "doiRevenue": [
        { "quarter": "22Q1", "doi": 65,  "revenue": 8290,  "guidance": null  },
        { "quarter": "22Q2", "doi": 94,  "revenue": 6704,  "guidance": null  },
        { "quarter": "22Q3", "doi": 127, "revenue": 5931,  "guidance": null  },
        { "quarter": "22Q4", "doi": 112, "revenue": 6051,  "guidance": null  },
        { "quarter": "23Q1", "doi": 97,  "revenue": 7192,  "guidance": null  },
        { "quarter": "23Q2", "doi": 129, "revenue": 13507, "guidance": 16875 }
      ]
    },
    "TC": {
      "currentQtr": {
        "label": "23Q2",
        "revenue": 15673,
        "revenueUnit": "US$M",
        "revenueQoQ": 10.2,
        "grossMargin": 54.1,
        "grossMarginNote": "Last Quarter",
        "doi": 88
      },
      "nextQtr": {
        "label": "23Q3",
        "revenueMidpointGuidance": 17200,
        "revenueQoQ": 9.7
      },
      "financialIndices": [
        { "quarter": "21Q2", "netIncome": 4810, "totalRevenue": 13292, "grossProfit": 6778, "grossMarginPct": 51.0, "operatingMarginPct": 40.0, "netMarginPct": 36.2, "cashEquivalents": 9876, "guidance": null },
        { "quarter": "21Q3", "netIncome": 5574, "totalRevenue": 14887, "grossProfit": 7740, "grossMarginPct": 52.0, "operatingMarginPct": 41.7, "netMarginPct": 37.4, "cashEquivalents": 11234, "guidance": null },
        { "quarter": "21Q4", "netIncome": 6605, "totalRevenue": 15745, "grossProfit": 8502, "grossMarginPct": 54.0, "operatingMarginPct": 43.9, "netMarginPct": 41.9, "cashEquivalents": 12562, "guidance": null },
        { "quarter": "22Q1", "netIncome": 7000, "totalRevenue": 17569, "grossProfit": 9540, "grossMarginPct": 54.3, "operatingMarginPct": 43.8, "netMarginPct": 39.8, "cashEquivalents": 13451, "guidance": null },
        { "quarter": "22Q2", "netIncome": 8160, "totalRevenue": 18155, "grossProfit": 10082, "grossMarginPct": 55.5, "operatingMarginPct": 48.7, "netMarginPct": 44.9, "cashEquivalents": 14233, "guidance": null },
        { "quarter": "22Q3", "netIncome": 8068, "totalRevenue": 20226, "grossProfit": 10719, "grossMarginPct": 53.0, "operatingMarginPct": 49.7, "netMarginPct": 39.9, "cashEquivalents": 15142, "guidance": null },
        { "quarter": "22Q4", "netIncome": 6985, "totalRevenue": 19934, "grossProfit": 9570, "grossMarginPct": 48.0, "operatingMarginPct": 41.1, "netMarginPct": 35.0, "cashEquivalents": 15764, "guidance": null },
        { "quarter": "23Q1", "netIncome": 6931, "totalRevenue": 16726, "grossProfit": 8765, "grossMarginPct": 52.4, "operatingMarginPct": 42.6, "netMarginPct": 41.4, "cashEquivalents": 14892, "guidance": null },
        { "quarter": "23Q2", "netIncome": 7041, "totalRevenue": 15673, "grossProfit": 8480, "grossMarginPct": 54.1, "operatingMarginPct": 42.5, "netMarginPct": 44.9, "cashEquivalents": 15673, "guidance": 17200 }
      ],
      "revenueBreakdown": {
        "quarter": "23Q3",
        "items": [
          { "name": "HPC",       "pct": 44.0 },
          { "name": "Smartphone","pct": 33.0 },
          { "name": "IoT",       "pct": 8.0  },
          { "name": "Automotive","pct": 6.0  },
          { "name": "DCE",       "pct": 5.0  },
          { "name": "Others",    "pct": 4.0  }
        ]
      },
      "doiRevenue": [
        { "quarter": "22Q1", "doi": 60,  "revenue": 17569, "guidance": null  },
        { "quarter": "22Q2", "doi": 72,  "revenue": 18155, "guidance": null  },
        { "quarter": "22Q3", "doi": 85,  "revenue": 20226, "guidance": null  },
        { "quarter": "22Q4", "doi": 92,  "revenue": 19934, "guidance": null  },
        { "quarter": "23Q1", "doi": 88,  "revenue": 16726, "guidance": null  },
        { "quarter": "23Q2", "doi": 88,  "revenue": 15673, "guidance": 17200 }
      ]
    },
    "AAPL": {
      "currentQtr": {
        "label": "23Q3",
        "revenue": 81797,
        "revenueUnit": "US$M",
        "revenueQoQ": -13.1,
        "grossMargin": 44.5,
        "grossMarginNote": "Last Quarter",
        "doi": 6
      },
      "nextQtr": {
        "label": "23Q4",
        "revenueMidpointGuidance": 89000,
        "revenueQoQ": 8.8
      },
      "financialIndices": [
        { "quarter": "21Q2", "netIncome": 21744, "totalRevenue": 81434, "grossProfit": 36239, "grossMarginPct": 44.5, "operatingMarginPct": 29.8, "netMarginPct": 26.7, "cashEquivalents": 37119, "guidance": null },
        { "quarter": "21Q3", "netIncome": 20551, "totalRevenue": 83360, "grossProfit": 37488, "grossMarginPct": 45.0, "operatingMarginPct": 27.1, "netMarginPct": 24.7, "cashEquivalents": 34050, "guidance": null },
        { "quarter": "21Q4", "netIncome": 28755, "totalRevenue": 90147, "grossProfit": 40062, "grossMarginPct": 44.4, "operatingMarginPct": 35.1, "netMarginPct": 31.9, "cashEquivalents": 42990, "guidance": null },
        { "quarter": "22Q1", "netIncome": 34631, "totalRevenue": 97278, "grossProfit": 43820, "grossMarginPct": 45.0, "operatingMarginPct": 39.3, "netMarginPct": 35.6, "cashEquivalents": 37119, "guidance": null },
        { "quarter": "22Q2", "netIncome": 19442, "totalRevenue": 82959, "grossProfit": 36306, "grossMarginPct": 43.8, "operatingMarginPct": 26.0, "netMarginPct": 23.4, "cashEquivalents": 28191, "guidance": null },
        { "quarter": "22Q3", "netIncome": 20721, "totalRevenue": 90146, "grossProfit": 40427, "grossMarginPct": 44.8, "operatingMarginPct": 26.8, "netMarginPct": 23.0, "cashEquivalents": 23646, "guidance": null },
        { "quarter": "22Q4", "netIncome": 29998, "totalRevenue": 117154, "grossProfit": 53219, "grossMarginPct": 45.4, "operatingMarginPct": 28.6, "netMarginPct": 25.6, "cashEquivalents": 23213, "guidance": null },
        { "quarter": "23Q1", "netIncome": 24160, "totalRevenue": 94836, "grossProfit": 42328, "grossMarginPct": 44.6, "operatingMarginPct": 28.7, "netMarginPct": 25.5, "cashEquivalents": 24687, "guidance": null },
        { "quarter": "23Q2", "netIncome": 19881, "totalRevenue": 81797, "grossProfit": 36413, "grossMarginPct": 44.5, "operatingMarginPct": 26.8, "netMarginPct": 24.3, "cashEquivalents": 26981, "guidance": 89000 }
      ],
      "revenueBreakdown": {
        "quarter": "23Q3",
        "items": [
          { "name": "iPhone",      "pct": 52.3 },
          { "name": "Services",    "pct": 22.2 },
          { "name": "Mac",         "pct": 8.6  },
          { "name": "iPad",        "pct": 7.1  },
          { "name": "Wearable",    "pct": 9.8  }
        ]
      },
      "doiRevenue": [
        { "quarter": "22Q1", "doi": 5,  "revenue": 97278,  "guidance": null  },
        { "quarter": "22Q2", "doi": 6,  "revenue": 82959,  "guidance": null  },
        { "quarter": "22Q3", "doi": 7,  "revenue": 90146,  "guidance": null  },
        { "quarter": "22Q4", "doi": 6,  "revenue": 117154, "guidance": null  },
        { "quarter": "23Q1", "doi": 5,  "revenue": 94836,  "guidance": null  },
        { "quarter": "23Q2", "doi": 6,  "revenue": 81797,  "guidance": 89000 }
      ]
    }
  }
}
```
