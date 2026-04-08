# T Company Customer Network Data

> Sources: T Company Annual Reports, company 10-K filings, public revenue disclosures (FY2023–FY2024).
> `transactionAmount` in $M USD (estimated annual wafer revenue from T Company).

---

## Customer Nodes

```json
[
  {
    "id": "AAPL",
    "name": "Apple",
    "ticker": "AAPL",
    "exchange": "NASDAQ",
    "country": "USA",
    "relationship": "Largest Customer — Custom Silicon (A/M-series)",
    "purchaseItems": "A17 Pro, M3/M4 SoC, custom AI silicon",
    "financials": {
      "revenue": "$383.3B",
      "grossMargin": "45.6%",
      "marketCap": "~$2.9T"
    },
    "color": "#1565c0",
    "productCategories": ["Smartphones", "Personal Computers", "Tablets", "Wearables"],
    "industryCategory": "Consumer Electronics"
  },
  {
    "id": "NVDA",
    "name": "NVIDIA",
    "ticker": "NVDA",
    "exchange": "NASDAQ",
    "country": "USA",
    "relationship": "AI Accelerator & GPU Customer",
    "purchaseItems": "H100/H200/B100 GPUs, Grace CPU, networking SoC",
    "financials": {
      "revenue": "$60.9B",
      "grossMargin": "72.7%",
      "marketCap": "~$2.2T"
    },
    "color": "#76b900",
    "productCategories": ["AI Accelerators", "Data Center GPUs", "Automotive SoC"],
    "industryCategory": "AI & Data Center"
  },
  {
    "id": "AMD",
    "name": "Advanced Micro Devices",
    "ticker": "AMD",
    "exchange": "NASDAQ",
    "country": "USA",
    "relationship": "CPU/GPU & FPGA Customer",
    "purchaseItems": "Ryzen CPUs, Instinct MI300X, Radeon GPUs",
    "financials": {
      "revenue": "$22.7B",
      "grossMargin": "47.4%",
      "marketCap": "~$230B"
    },
    "color": "#ed1c24",
    "productCategories": ["PC Processors", "AI GPUs", "Data Center CPUs"],
    "industryCategory": "PC & Data Center"
  },
  {
    "id": "QCOM",
    "name": "Qualcomm",
    "ticker": "QCOM",
    "exchange": "NASDAQ",
    "country": "USA",
    "relationship": "Mobile SoC & Connectivity Customer",
    "purchaseItems": "Snapdragon 8 Gen series, X-series modems, RFFE",
    "financials": {
      "revenue": "$38.9B",
      "grossMargin": "55.9%",
      "marketCap": "~$185B"
    },
    "color": "#3253dc",
    "productCategories": ["Mobile SoC", "5G Modems", "Automotive Chips"],
    "industryCategory": "Mobile & Connectivity"
  },
  {
    "id": "AVGO",
    "name": "Broadcom",
    "ticker": "AVGO",
    "exchange": "NASDAQ",
    "country": "USA",
    "relationship": "Networking & Custom ASIC Customer",
    "purchaseItems": "Custom AI XPUs, networking ASICs, storage controllers",
    "financials": {
      "revenue": "$51.6B",
      "grossMargin": "67.9%",
      "marketCap": "~$780B"
    },
    "color": "#cc0000",
    "productCategories": ["Networking ASICs", "Custom AI Chips", "Storage Controllers"],
    "industryCategory": "Networking & Cloud"
  },
  {
    "id": "MRVL",
    "name": "Marvell Technology",
    "ticker": "MRVL",
    "exchange": "NASDAQ",
    "country": "USA",
    "relationship": "Data Infrastructure Silicon Customer",
    "purchaseItems": "Custom AI ASICs, data center PHY, storage controllers",
    "financials": {
      "revenue": "$5.5B",
      "grossMargin": "47.9%",
      "marketCap": "~$65B"
    },
    "color": "#6d28d9",
    "productCategories": ["Data Infrastructure", "Custom AI ASICs", "Optical DSP"],
    "industryCategory": "Networking & Cloud"
  },
  {
    "id": "MTKMF",
    "name": "MediaTek",
    "ticker": "2454.TW",
    "exchange": "TWSE",
    "country": "Taiwan",
    "relationship": "Mobile & IoT SoC Customer",
    "purchaseItems": "Dimensity 9300 series, T-series Wi-Fi SoC, IoT chips",
    "financials": {
      "revenue": "$16.3B",
      "grossMargin": "47.1%",
      "marketCap": "~$55B"
    },
    "color": "#0891b2",
    "productCategories": ["Mobile SoC", "Smart TV Chips", "IoT Processors"],
    "industryCategory": "Mobile & Connectivity"
  },
  {
    "id": "SONY",
    "name": "Sony Group",
    "ticker": "SONY",
    "exchange": "NYSE",
    "country": "Japan",
    "relationship": "Image Sensor & PS5 SoC Customer",
    "purchaseItems": "PlayStation 5 SoC (custom AMD GPU), CMOS image sensors",
    "financials": {
      "revenue": "$88.2B",
      "grossMargin": "27.3%",
      "marketCap": "~$105B"
    },
    "color": "#1a1a1a",
    "productCategories": ["Image Sensors", "Gaming Consoles", "Consumer Electronics"],
    "industryCategory": "Consumer Electronics"
  },
  {
    "id": "INTC",
    "name": "Intel",
    "ticker": "INTC",
    "exchange": "NASDAQ",
    "country": "USA",
    "relationship": "Advanced Process Node Customer (partial)",
    "purchaseItems": "Intel 3 / Intel 18A test lots, Meteor Lake tiles",
    "financials": {
      "revenue": "$54.2B",
      "grossMargin": "41.7%",
      "marketCap": "~$90B"
    },
    "color": "#0068b5",
    "productCategories": ["PC Processors", "Data Center CPUs", "AI Accelerators"],
    "industryCategory": "PC & Data Center"
  },
  {
    "id": "TXN",
    "name": "Texas Instruments",
    "ticker": "TXN",
    "exchange": "NASDAQ",
    "country": "USA",
    "relationship": "Analog & Embedded Processing Customer",
    "purchaseItems": "High-performance analog ICs, embedded MCUs",
    "financials": {
      "revenue": "$17.5B",
      "grossMargin": "65.8%",
      "marketCap": "~$155B"
    },
    "color": "#c0392b",
    "productCategories": ["Analog Chips", "Embedded Processors", "Industrial ICs"],
    "industryCategory": "Industrial & Analog"
  }
]
```

---

## Customer Edges (TC → Customer)

```json
[
  {
    "from": "TC",
    "to": "AAPL",
    "transactionAmount": 17500,
    "newsCoMentionCount": 524,
    "commonSupplierCount": 12,
    "commonCustomerCount": 2,
    "crossShareholdingRatio": 0.0,
    "commonBoardMembers": 0
  },
  {
    "from": "TC",
    "to": "NVDA",
    "transactionAmount": 9200,
    "newsCoMentionCount": 398,
    "commonSupplierCount": 8,
    "commonCustomerCount": 3,
    "crossShareholdingRatio": 0.0,
    "commonBoardMembers": 0
  },
  {
    "from": "TC",
    "to": "AMD",
    "transactionAmount": 6500,
    "newsCoMentionCount": 312,
    "commonSupplierCount": 9,
    "commonCustomerCount": 4,
    "crossShareholdingRatio": 0.0,
    "commonBoardMembers": 0
  },
  {
    "from": "TC",
    "to": "QCOM",
    "transactionAmount": 5500,
    "newsCoMentionCount": 287,
    "commonSupplierCount": 7,
    "commonCustomerCount": 5,
    "crossShareholdingRatio": 0.0,
    "commonBoardMembers": 0
  },
  {
    "from": "TC",
    "to": "AVGO",
    "transactionAmount": 4800,
    "newsCoMentionCount": 245,
    "commonSupplierCount": 6,
    "commonCustomerCount": 3,
    "crossShareholdingRatio": 0.0,
    "commonBoardMembers": 0
  },
  {
    "from": "TC",
    "to": "MTKMF",
    "transactionAmount": 4500,
    "newsCoMentionCount": 198,
    "commonSupplierCount": 5,
    "commonCustomerCount": 2,
    "crossShareholdingRatio": 0.0,
    "commonBoardMembers": 0
  },
  {
    "from": "TC",
    "to": "MRVL",
    "transactionAmount": 2400,
    "newsCoMentionCount": 156,
    "commonSupplierCount": 4,
    "commonCustomerCount": 2,
    "crossShareholdingRatio": 0.0,
    "commonBoardMembers": 0
  },
  {
    "from": "TC",
    "to": "INTC",
    "transactionAmount": 3200,
    "newsCoMentionCount": 289,
    "commonSupplierCount": 11,
    "commonCustomerCount": 5,
    "crossShareholdingRatio": 0.0,
    "commonBoardMembers": 0
  },
  {
    "from": "TC",
    "to": "SONY",
    "transactionAmount": 2000,
    "newsCoMentionCount": 134,
    "commonSupplierCount": 3,
    "commonCustomerCount": 1,
    "crossShareholdingRatio": 0.0,
    "commonBoardMembers": 0
  },
  {
    "from": "TC",
    "to": "TXN",
    "transactionAmount": 800,
    "newsCoMentionCount": 78,
    "commonSupplierCount": 2,
    "commonCustomerCount": 1,
    "crossShareholdingRatio": 0.0,
    "commonBoardMembers": 0
  }
]
```

---

## Customer News Feed

```json
[
  {
    "id": 1,
    "title": "Apple Secures Exclusive T Company 3nm Capacity for iPhone 16 Pro A17 Pro Chip Through 2025",
    "tickers": ["AAPL", "TC"],
    "source": "Bloomberg",
    "time": "Today, 9:15 AM",
    "category": "Supply Chain"
  },
  {
    "id": 2,
    "title": "NVIDIA Places Record T Company CoWoS-L Orders for H200 and Upcoming B100 GPU Production",
    "tickers": ["NVDA", "TC"],
    "source": "Reuters",
    "time": "Today, 8:30 AM",
    "category": "Capacity"
  },
  {
    "id": 3,
    "title": "AMD's Instinct MI300X Ramps at T Company N5, Signals Strong AI Datacenter Demand in 2025",
    "tickers": ["AMD", "TC"],
    "source": "Seeking Alpha",
    "time": "Yesterday, 6:00 PM",
    "category": "Earnings"
  },
  {
    "id": 4,
    "title": "Qualcomm Snapdragon 8 Gen 4 Tape-Out at T Company N3E Confirmed for Late 2024 Volume Ramp",
    "tickers": ["QCOM", "TC"],
    "source": "AnandTech",
    "time": "Yesterday, 4:45 PM",
    "category": "Supply Chain"
  },
  {
    "id": 5,
    "title": "Broadcom's Custom XPU Business on Track for $10B Revenue, All Chips Fabbed at T Company",
    "tickers": ["AVGO", "TC"],
    "source": "Financial Times",
    "time": "Apr 2, 3:00 PM",
    "category": "Earnings"
  },
  {
    "id": 6,
    "title": "MediaTek Dimensity 9400 Tape-Out at T Company N3E, Targets Flagship Android Market",
    "tickers": ["MTKMF", "TC"],
    "source": "Nikkei Asia",
    "time": "Apr 2, 11:00 AM",
    "category": "Supply Chain"
  },
  {
    "id": 7,
    "title": "Marvell Unveils Next-Gen Custom AI Silicon Platform Built on T Company 3nm Process",
    "tickers": ["MRVL", "TC"],
    "source": "Business Wire",
    "time": "Apr 1, 9:30 AM",
    "category": "Strategy"
  },
  {
    "id": 8,
    "title": "Intel Foundry Services Transfers Meteor Lake Tile Production to T Company to Meet Holiday Demand",
    "tickers": ["INTC", "TC"],
    "source": "Tom's Hardware",
    "time": "Mar 31, 2:00 PM",
    "category": "Geopolitical"
  },
  {
    "id": 9,
    "title": "Sony's Next-Gen Image Sensor Adopts T Company Stacked Process, Enabling 8K at 60fps",
    "tickers": ["SONY", "TC"],
    "source": "Nikkei",
    "time": "Mar 31, 10:00 AM",
    "category": "Strategy"
  },
  {
    "id": 10,
    "title": "Texas Instruments Dual-Sources Key Analog Lines from T Company Specialty Fabs Amid Tariff Risks",
    "tickers": ["TXN", "TC"],
    "source": "Reuters",
    "time": "Mar 30, 8:00 AM",
    "category": "Tariff"
  },
  {
    "id": 11,
    "title": "T Company Arizona Fab Begins 4nm Apple Silicon Production, Easing US Geopolitical Supply Concerns",
    "tickers": ["TC", "AAPL"],
    "source": "The Verge",
    "time": "Mar 29, 2:00 PM",
    "category": "Geopolitical"
  },
  {
    "id": 12,
    "title": "NVIDIA and T Company Sign Long-Term Advanced Packaging Deal for CoWoS and SoIC Technologies",
    "tickers": ["NVDA", "TC"],
    "source": "SA News",
    "time": "Mar 28, 11:00 AM",
    "category": "Capacity"
  }
]
```

---

## Industry Transaction Summary

```json
[
  { "industry": "Consumer Electronics", "totalAmount": 19500, "customers": ["AAPL", "SONY"] },
  { "industry": "AI & Data Center",     "totalAmount": 9200,  "customers": ["NVDA"] },
  { "industry": "PC & Data Center",     "totalAmount": 9700,  "customers": ["AMD", "INTC"] },
  { "industry": "Mobile & Connectivity","totalAmount": 10000, "customers": ["QCOM", "MTKMF"] },
  { "industry": "Networking & Cloud",   "totalAmount": 7200,  "customers": ["AVGO", "MRVL"] },
  { "industry": "Industrial & Analog",  "totalAmount": 800,   "customers": ["TXN"] }
]
```
