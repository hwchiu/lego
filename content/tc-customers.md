# Customer Network Data

> Sources: company 10-K filings and public revenue disclosures (FY2023–FY2024).
> `transactionAmount` in $M USD (illustrative annual customer revenue estimate).

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
    "productCategories": [
      "Smartphones",
      "Personal Computers",
      "Tablets",
      "Wearables"
    ],
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
    "productCategories": [
      "AI Accelerators",
      "Data Center GPUs",
      "Automotive SoC"
    ],
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
    "productCategories": [
      "PC Processors",
      "AI GPUs",
      "Data Center CPUs"
    ],
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
    "productCategories": [
      "Mobile SoC",
      "5G Modems",
      "Automotive Chips"
    ],
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
    "productCategories": [
      "Networking ASICs",
      "Custom AI Chips",
      "Storage Controllers"
    ],
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
    "productCategories": [
      "Data Infrastructure",
      "Custom AI ASICs",
      "Optical DSP"
    ],
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
    "productCategories": [
      "Mobile SoC",
      "Smart TV Chips",
      "IoT Processors"
    ],
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
    "productCategories": [
      "Image Sensors",
      "Gaming Consoles",
      "Consumer Electronics"
    ],
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
    "productCategories": [
      "PC Processors",
      "Data Center CPUs",
      "AI Accelerators"
    ],
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
    "productCategories": [
      "Analog Chips",
      "Embedded Processors",
      "Industrial ICs"
    ],
    "industryCategory": "Industrial & Analog"
  }
]
```

---

## Customer Edges

```json
[]
```

---

## Customer News Feed

```json
[]
```

---

## Industry Transaction Summary

```json
[
  {
    "industry": "Consumer Electronics",
    "totalAmount": 19500,
    "customers": [
      "AAPL",
      "SONY"
    ]
  },
  {
    "industry": "AI & Data Center",
    "totalAmount": 9200,
    "customers": [
      "NVDA"
    ]
  },
  {
    "industry": "PC & Data Center",
    "totalAmount": 9700,
    "customers": [
      "AMD",
      "INTC"
    ]
  },
  {
    "industry": "Mobile & Connectivity",
    "totalAmount": 10000,
    "customers": [
      "QCOM",
      "MTKMF"
    ]
  },
  {
    "industry": "Networking & Cloud",
    "totalAmount": 7200,
    "customers": [
      "AVGO",
      "MRVL"
    ]
  },
  {
    "industry": "Industrial & Analog",
    "totalAmount": 800,
    "customers": [
      "TXN"
    ]
  }
]
```
