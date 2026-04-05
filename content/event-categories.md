# Event Categories Data

Event data for 8 non-earnings market categories. Companies in scope: TSMC (TSM) and its key
customers (AAPL, NVDA, AMD, QCOM, AVGO) and suppliers (ASML, AMAT, LRCX, KLAC, SNPS, CDNS).
All events are representative April 2025 data for display purposes.

## Bonds

```json
{
  "Apr 7": [
    {
      "cellLabel": "AAPL",
      "symbol": "AAPL",
      "company": "Apple Inc.",
      "eventType": "Issuance",
      "amount": "$5.0B",
      "coupon": "4.65%",
      "maturity": "2034",
      "rating": "Aaa",
      "description": "Apple priced a $5.0B senior unsecured green bond offering at 4.65% due 2034. Proceeds are earmarked for renewable energy procurement, recycled material sourcing, and carbon-neutral manufacturing initiatives aligned with Apple's 2030 climate pledge."
    }
  ],
  "Apr 9": [
    {
      "cellLabel": "TSM",
      "symbol": "TSM",
      "company": "Taiwan Semiconductor",
      "eventType": "Issuance",
      "amount": "$3.0B",
      "coupon": "4.80%",
      "maturity": "2032",
      "rating": "AA-",
      "description": "TSMC priced a $3.0B dual-tranche senior notes offering (10-year and 5-year tranches) to fund N2 process node fab expansion in Arizona Phase 2 and Hsinchu Advanced Packaging Phase 3. Order book was 4.2x oversubscribed, reflecting strong investor confidence in AI chip demand."
    }
  ],
  "Apr 10": [
    {
      "cellLabel": "NVDA",
      "symbol": "NVDA",
      "company": "NVIDIA Corporation",
      "eventType": "Rating Change",
      "amount": "—",
      "coupon": "—",
      "maturity": "—",
      "rating": "Aa3",
      "description": "Moody's upgraded NVIDIA's long-term issuer rating to Aa3 from A2, citing exceptional AI-driven revenue growth, expanding data center margins, and robust free cash flow generation exceeding $30B annually. The upgrade positions NVIDIA among the highest-rated semiconductor companies globally."
    }
  ],
  "Apr 14": [
    {
      "cellLabel": "AVGO",
      "symbol": "AVGO",
      "company": "Broadcom Inc.",
      "eventType": "Rating Reaffirm",
      "amount": "—",
      "coupon": "—",
      "maturity": "—",
      "rating": "BBB",
      "description": "S&P Global reaffirmed Broadcom's BBB credit rating with a stable outlook, noting improving leverage metrics following VMware integration synergies. Net debt/EBITDA is expected to decline to 2.8x by FY2025, supported by strong custom ASIC (XPU) demand from hyperscalers including Google and Meta."
    }
  ],
  "Apr 17": [
    {
      "cellLabel": "QCOM",
      "symbol": "QCOM",
      "company": "Qualcomm Inc.",
      "eventType": "Maturity",
      "amount": "$750M",
      "coupon": "3.25%",
      "maturity": "Apr 2025",
      "rating": "A-",
      "description": "Qualcomm repaid $750M in 3.25% senior notes at scheduled maturity. Management indicated plans to refinance with a new offering in H2 2025 at current market rates. Qualcomm maintains a $4.0B revolving credit facility as backup liquidity, supporting its ongoing Snapdragon X Elite PC chip ramp."
    }
  ],
  "Apr 22": [
    {
      "cellLabel": "ASML",
      "symbol": "ASML",
      "company": "ASML Holding N.V.",
      "eventType": "Issuance",
      "amount": "€2.0B",
      "coupon": "3.90%",
      "maturity": "2035",
      "rating": "AA-",
      "description": "ASML successfully priced a €2.0B green Eurobond at 3.90% due 2035, attracting orders from over 120 institutional investors across Europe and Asia. Proceeds are designated for energy-efficient High-NA EUV lithography R&D and sustainable fab equipment design, aligned with ASML's 2025 ESG framework."
    }
  ],
  "Apr 24": [
    {
      "cellLabel": "AMAT",
      "symbol": "AMAT",
      "company": "Applied Materials",
      "eventType": "Issuance",
      "amount": "$1.5B",
      "coupon": "4.55%",
      "maturity": "2033",
      "rating": "A+",
      "description": "Applied Materials issued $1.5B in 8-year senior notes at 4.55% to fund semiconductor equipment R&D, capacity expansion for Gate-All-Around (GAA) patterning systems, and accelerated share repurchase program. Demand from logic and memory customers continues to drive equipment orders at record backlog levels."
    }
  ],
  "Apr 28": [
    {
      "cellLabel": "LRCX",
      "symbol": "LRCX",
      "company": "Lam Research",
      "eventType": "Issuance",
      "amount": "$800M",
      "coupon": "4.70%",
      "maturity": "2031",
      "rating": "A",
      "description": "Lam Research priced $800M senior unsecured notes at 4.70% due 2031 for general corporate purposes including working capital and opportunistic share repurchases. Lam's etch and deposition equipment portfolio serves TSM's advanced node ramp and memory customer capacity expansions at Samsung and Micron."
    }
  ]
}
```

## Commodities

```json
{
  "Apr 2": [
    {
      "cellLabel": "Silicon",
      "commodity": "Silicon Wafer (300mm)",
      "unit": "USD/unit",
      "price": "85.40",
      "change": "+1.76",
      "changePct": "+2.1%",
      "weekHigh": "86.50",
      "weekLow": "83.20",
      "relevance": "Primary substrate for TSM advanced node fabs; AMAT and LRCX process equipment consumables"
    }
  ],
  "Apr 7": [
    {
      "cellLabel": "Neodymium",
      "commodity": "Neodymium (NdFeB)",
      "unit": "USD/tonne",
      "price": "71200",
      "change": "+1050",
      "changePct": "+1.5%",
      "weekHigh": "72000",
      "weekLow": "69800",
      "relevance": "Rare earth used in precision motors and magnetic actuators inside ASML EUV systems"
    },
    {
      "cellLabel": "Dysprosium",
      "commodity": "Dysprosium Oxide",
      "unit": "USD/tonne",
      "price": "2340",
      "change": "-18",
      "changePct": "-0.8%",
      "weekHigh": "2400",
      "weekLow": "2310",
      "relevance": "Critical rare earth for high-temperature magnets in EUV stage systems (ASML, TSM)"
    }
  ],
  "Apr 9": [
    {
      "cellLabel": "Copper",
      "commodity": "Copper (LME)",
      "unit": "USD/tonne",
      "price": "9825",
      "change": "-79",
      "changePct": "-0.8%",
      "weekHigh": "9980",
      "weekLow": "9790",
      "relevance": "Interconnect metal for advanced packaging (CoWoS/SoIC) at TSM; used in AMAT plating systems"
    }
  ],
  "Apr 14": [
    {
      "cellLabel": "Neon Gas",
      "commodity": "Neon Gas (99.99%)",
      "unit": "USD/m³",
      "price": "980",
      "change": "+30",
      "changePct": "+3.2%",
      "weekHigh": "995",
      "weekLow": "950",
      "relevance": "Essential laser excimer gas for DUV/ArF lithography steps at TSM, NVDA, AMD wafer fabs"
    }
  ],
  "Apr 16": [
    {
      "cellLabel": "Photoresist",
      "commodity": "ArF Photoresist Index",
      "unit": "Index (Base 2020=100)",
      "price": "142.5",
      "change": "+1.3",
      "changePct": "+0.9%",
      "weekHigh": "144.0",
      "weekLow": "140.8",
      "relevance": "Key patterning chemical used in every wafer layer at TSM; demand tied to AAPL, NVDA, AMD production"
    }
  ],
  "Apr 21": [
    {
      "cellLabel": "GaN Substrate",
      "commodity": "GaN Substrate (6-inch)",
      "unit": "USD/wafer",
      "price": "180",
      "change": "+2",
      "changePct": "+1.1%",
      "weekHigh": "183",
      "weekLow": "177",
      "relevance": "Power device substrate for RF front-end chips manufactured by QCOM, AVGO; AMAT CVD equipment"
    }
  ],
  "Apr 23": [
    {
      "cellLabel": "Argon",
      "commodity": "Argon Gas (industrial)",
      "unit": "USD/m³",
      "price": "42.0",
      "change": "-0.13",
      "changePct": "-0.3%",
      "weekHigh": "43.2",
      "weekLow": "41.8",
      "relevance": "Carrier and purge gas for LRCX etch chambers and AMAT CVD deposition systems"
    }
  ],
  "Apr 28": [
    {
      "cellLabel": "Helium",
      "commodity": "Helium (Grade 6.0)",
      "unit": "USD/m³",
      "price": "29.5",
      "change": "+0.21",
      "changePct": "+0.7%",
      "weekHigh": "30.1",
      "weekLow": "29.2",
      "relevance": "Cryogenic cooling for ASML High-NA EUV superconducting components; leak-test gas at KLAC inspection tools"
    }
  ]
}
```

## Countries

```json
{
  "Apr 3": [
    {
      "cellLabel": "Taiwan",
      "country": "Taiwan",
      "flag": "🇹🇼",
      "eventType": "Policy",
      "title": "TSMC Phase 3 Advanced Packaging Approved",
      "description": "Taiwan's Executive Yuan approved TSMC's Phase 3 CoWoS advanced packaging capacity expansion in Hsinchu Science Park, targeting a 50% output increase by end-2026. The NT$420B ($13B) investment is supported by a 25% tax credit under the Statute for Industrial Innovation. The expansion directly serves NVIDIA GB300, AMD MI400, and Apple A-series packaging demand.",
      "affectedCompanies": ["TSM", "NVDA", "AMD", "AAPL"],
      "impact": "High"
    }
  ],
  "Apr 7": [
    {
      "cellLabel": "USA",
      "country": "United States",
      "flag": "🇺🇸",
      "eventType": "Funding",
      "title": "CHIPS Act Awards $2.6B Grant to TSMC Arizona",
      "description": "The US Department of Commerce finalized a $2.6B direct grant and up to $5B in loan guarantees to TSMC's Arizona subsidiary for its N3 and N2 fabs in Phoenix. The agreement conditions 40% domestic equipment sourcing, benefiting Applied Materials, Lam Research, and KLA. TSMC Arizona is on track for first N3 wafer output in H2 2025.",
      "affectedCompanies": ["TSM", "AMAT", "LRCX", "KLAC"],
      "impact": "High"
    }
  ],
  "Apr 10": [
    {
      "cellLabel": "Netherlands",
      "country": "Netherlands",
      "flag": "🇳🇱",
      "eventType": "Regulation",
      "title": "ASML Export Licenses Renewed for 2025–2026",
      "description": "The Dutch Ministry of Foreign Affairs renewed ASML's export licenses for ArF immersion and DUV systems to non-restricted markets through 2026. EUV export restrictions to China remain in force. ASML reaffirmed €35B–37B revenue guidance for 2025, with High-NA EUV shipments to TSMC, Samsung, and Intel accelerating.",
      "affectedCompanies": ["ASML", "TSM"],
      "impact": "Medium"
    }
  ],
  "Apr 14": [
    {
      "cellLabel": "Japan",
      "country": "Japan",
      "flag": "🇯🇵",
      "eventType": "Subsidy",
      "title": "METI Approves ¥120B for TSMC Kumamoto Phase 2",
      "description": "Japan's Ministry of Economy, Trade and Industry (METI) approved ¥120B ($800M) in additional subsidies for TSMC's Kumamoto Phase 2 fab (JASM joint venture with Sony and Denso). The 6nm/7nm facility targets automotive sensors and image processors, with Synopsys and Cadence Design selected as primary EDA partners. Production is slated for Q3 2026.",
      "affectedCompanies": ["TSM", "SNPS", "CDNS"],
      "impact": "High"
    }
  ],
  "Apr 17": [
    {
      "cellLabel": "South Korea",
      "country": "South Korea",
      "flag": "🇰🇷",
      "eventType": "Report",
      "title": "K-Semiconductor Q1 Equipment Market Report",
      "description": "South Korea's Ministry of Science released its Q1 K-Semiconductor Belt report, showing 18% YoY growth in semiconductor equipment imports. Applied Materials, Lam Research, and KLA collectively hold 62% market share in Korean advanced logic fabs. Samsung's 2nm GAA ramp has driven etch equipment orders up 34% versus Q1 2024.",
      "affectedCompanies": ["AMAT", "LRCX", "KLAC"],
      "impact": "Medium"
    }
  ],
  "Apr 21": [
    {
      "cellLabel": "India",
      "country": "India",
      "flag": "🇮🇳",
      "eventType": "Milestone",
      "title": "TATA Electronics Dholera Fab Groundbreaking",
      "description": "TATA Electronics announced the groundbreaking of its Dholera semiconductor fab in Gujarat with a $11B investment commitment. Cadence Design Systems and Synopsys were selected as EDA platform partners for 28nm/40nm process qualification. Applied Materials signed a preferred supplier agreement for CVD and PVD equipment. Full production is targeted by 2028.",
      "affectedCompanies": ["CDNS", "SNPS", "AMAT"],
      "impact": "Medium"
    }
  ],
  "Apr 24": [
    {
      "cellLabel": "Germany",
      "country": "Germany",
      "flag": "🇩🇪",
      "eventType": "Funding",
      "title": "EU Chips Act Phase 2 Disbursements",
      "description": "The EU Chips Act disbursed the first €1.4B tranche to support Intel's Magdeburg fab and Infineon's Dresden expansion. ASML confirmed as sole EUV lithography supplier for both facilities. Synopsys and Cadence Design Systems have been engaged for digital twin process simulation and DFM qualification across both fabs.",
      "affectedCompanies": ["ASML", "SNPS", "CDNS"],
      "impact": "Medium"
    }
  ]
}
```

## Cryptocurrency

```json
{
  "Apr 2": [
    {
      "cellLabel": "BTC",
      "cryptoSymbol": "BTC",
      "name": "Bitcoin",
      "price": "82450",
      "change": "+2543",
      "changePct": "+3.2%",
      "volume": "$42.1B",
      "marketCap": "$1.63T",
      "relevance": "BTC mining difficulty hit all-time high; NVIDIA H100/H200 GPU hashrate adoption surges — indirect data center revenue catalyst for NVDA"
    }
  ],
  "Apr 7": [
    {
      "cellLabel": "ETH",
      "cryptoSymbol": "ETH",
      "name": "Ethereum",
      "price": "3120",
      "change": "+55",
      "changePct": "+1.8%",
      "volume": "$18.6B",
      "marketCap": "$375B",
      "relevance": "DePIN (Decentralized Physical Infrastructure) protocols drive AVGO networking ASIC demand for validator node operators"
    }
  ],
  "Apr 9": [
    {
      "cellLabel": "SOL",
      "cryptoSymbol": "SOL",
      "name": "Solana",
      "price": "142.5",
      "change": "-1.3",
      "changePct": "-0.9%",
      "volume": "$8.2B",
      "marketCap": "$65B",
      "relevance": "Web3 edge-compute demand growing; QCOM Snapdragon mobile SoC design wins in blockchain wallet hardware accelerating"
    }
  ],
  "Apr 14": [
    {
      "cellLabel": "AVAX",
      "cryptoSymbol": "AVAX",
      "name": "Avalanche",
      "price": "28.3",
      "change": "+0.58",
      "changePct": "+2.1%",
      "volume": "$1.4B",
      "marketCap": "$11.8B",
      "relevance": "Enterprise blockchain subnet launches driving custom ASIC tapeout orders at TSM 5nm — Ava Labs partnerships increasing"
    }
  ]
}
```

## Currencies

```json
{
  "Apr 2": [
    {
      "cellLabel": "TWD/USD",
      "pair": "TWD/USD",
      "rate": "32.45",
      "change": "-0.039",
      "changePct": "-0.12%",
      "description": "Taiwan Central Bank held benchmark rate at 2.0% in quarterly policy meeting. TWD softened mildly on broader USD strength. TSMC's USD-denominated revenue books a NT$ translation gain of ~0.1% on overseas earnings.",
      "affectedCompanies": ["TSM"]
    }
  ],
  "Apr 7": [
    {
      "cellLabel": "JPY/USD",
      "pair": "JPY/USD",
      "rate": "151.2",
      "change": "+1.21",
      "changePct": "+0.81%",
      "description": "Bank of Japan maintained accommodative stance, pushing JPY to 151.2. Weaker yen increases USD-equivalent cost of ASML EUV equipment purchased by Japanese fabs (JASM/Kumamoto). Tokyo Electron yen revenue loses USD-export pricing competitiveness.",
      "affectedCompanies": ["ASML", "TSM"]
    }
  ],
  "Apr 9": [
    {
      "cellLabel": "EUR/USD",
      "pair": "EUR/USD",
      "rate": "1.082",
      "change": "-0.003",
      "changePct": "-0.28%",
      "description": "ECB cut rates by 25bps to 3.15%, weakening EUR. ASML, which reports in EUR, benefits from USD-invoiced tool revenue translating to higher EUR earnings. European R&D cost base in EUR creates a modest operating hedge.",
      "affectedCompanies": ["ASML"]
    }
  ],
  "Apr 14": [
    {
      "cellLabel": "KRW/USD",
      "pair": "KRW/USD",
      "rate": "1356",
      "change": "+6.8",
      "changePct": "+0.50%",
      "description": "Korean won depreciated on regional risk sentiment. Samsung and SK Hynix benefit from USD export pricing uplift; equipment costs from AMAT, LRCX, and KLAC rise in KRW terms, compressing Korean fab capex budgets in local currency.",
      "affectedCompanies": ["AMAT", "LRCX", "KLAC"]
    }
  ],
  "Apr 21": [
    {
      "cellLabel": "TWD/USD",
      "pair": "TWD/USD",
      "rate": "32.1",
      "change": "-0.35",
      "changePct": "-1.08%",
      "description": "TWD strengthened on positive US-Taiwan trade framework discussions and TSMC's strong Q1 earnings beat. The move reduces TSMC's USD-to-NT$ translation gain but signals solid Taiwan macroeconomic fundamentals and FDI inflows.",
      "affectedCompanies": ["TSM"]
    }
  ],
  "Apr 25": [
    {
      "cellLabel": "CNH/USD",
      "pair": "CNH/USD",
      "rate": "7.28",
      "change": "+0.015",
      "changePct": "+0.21%",
      "description": "Offshore yuan weakened slightly following PBOC guidance. Semiconductor-related export controls limit NVDA, AMAT, and LRCX China revenues. USD-CNH dynamics affect pricing competitiveness for US-based chip designers accessing Chinese OEM customers.",
      "affectedCompanies": ["NVDA", "AMAT", "LRCX"]
    }
  ]
}
```

## Dividend Aristocrats

```json
{
  "Apr 3": [
    {
      "cellLabel": "QCOM",
      "symbol": "QCOM",
      "company": "Qualcomm Inc.",
      "exDate": "Mar 27",
      "payDate": "Jun 26",
      "dividend": "$0.87",
      "annualDividend": "$3.48",
      "yield": "2.14%",
      "frequency": "Quarterly",
      "consecutiveYears": 21,
      "annualGrowth": "+6.2%"
    }
  ],
  "Apr 9": [
    {
      "cellLabel": "AAPL",
      "symbol": "AAPL",
      "company": "Apple Inc.",
      "exDate": "Apr 9",
      "payDate": "May 15",
      "dividend": "$0.25",
      "annualDividend": "$1.00",
      "yield": "0.51%",
      "frequency": "Quarterly",
      "consecutiveYears": 12,
      "annualGrowth": "+4.5%"
    }
  ],
  "Apr 14": [
    {
      "cellLabel": "AVGO",
      "symbol": "AVGO",
      "company": "Broadcom Inc.",
      "exDate": "Apr 14",
      "payDate": "Apr 30",
      "dividend": "$5.25",
      "annualDividend": "$21.00",
      "yield": "1.19%",
      "frequency": "Quarterly",
      "consecutiveYears": 13,
      "annualGrowth": "+14.2%"
    }
  ],
  "Apr 17": [
    {
      "cellLabel": "KLAC",
      "symbol": "KLAC",
      "company": "KLA Corporation",
      "exDate": "Apr 17",
      "payDate": "Jun 1",
      "dividend": "$1.70",
      "annualDividend": "$6.80",
      "yield": "0.76%",
      "frequency": "Quarterly",
      "consecutiveYears": 15,
      "annualGrowth": "+14.8%"
    }
  ]
}
```

## Dividend Champions

```json
{
  "Apr 3": [
    {
      "cellLabel": "AMAT",
      "symbol": "AMAT",
      "company": "Applied Materials",
      "exDate": "Apr 3",
      "payDate": "Jun 12",
      "dividend": "$0.40",
      "annualDividend": "$1.60",
      "yield": "0.87%",
      "frequency": "Quarterly",
      "consecutiveYears": 7,
      "annualGrowth": "+22.6%"
    }
  ],
  "Apr 9": [
    {
      "cellLabel": "LRCX",
      "symbol": "LRCX",
      "company": "Lam Research",
      "exDate": "Apr 9",
      "payDate": "Apr 23",
      "dividend": "$2.30",
      "annualDividend": "$9.20",
      "yield": "0.83%",
      "frequency": "Quarterly",
      "consecutiveYears": 12,
      "annualGrowth": "+18.4%"
    }
  ],
  "Apr 14": [
    {
      "cellLabel": "TSM",
      "symbol": "TSM",
      "company": "Taiwan Semiconductor",
      "exDate": "Apr 14",
      "payDate": "Oct 10",
      "dividend": "$2.00",
      "annualDividend": "$4.00",
      "yield": "1.82%",
      "frequency": "Semi-annual",
      "consecutiveYears": 8,
      "annualGrowth": "+8.9%"
    }
  ],
  "Apr 21": [
    {
      "cellLabel": "CDNS",
      "symbol": "CDNS",
      "company": "Cadence Design Systems",
      "exDate": "Apr 21",
      "payDate": "May 15",
      "dividend": "$0.30",
      "annualDividend": "$1.20",
      "yield": "0.21%",
      "frequency": "Quarterly",
      "consecutiveYears": 4,
      "annualGrowth": "+33.3%"
    }
  ]
}
```

## Dividends

```json
{
  "Apr 3": [
    {
      "cellLabel": "QCOM",
      "symbol": "QCOM",
      "company": "Qualcomm Inc.",
      "exDate": "Mar 27",
      "payDate": "Jun 26",
      "dividend": "$0.87",
      "yield": "2.14%",
      "frequency": "Quarterly",
      "type": "Regular Cash"
    },
    {
      "cellLabel": "AMAT",
      "symbol": "AMAT",
      "company": "Applied Materials",
      "exDate": "Apr 3",
      "payDate": "Jun 12",
      "dividend": "$0.40",
      "yield": "0.87%",
      "frequency": "Quarterly",
      "type": "Regular Cash"
    }
  ],
  "Apr 7": [
    {
      "cellLabel": "TSM",
      "symbol": "TSM",
      "company": "Taiwan Semiconductor",
      "exDate": "Apr 7",
      "payDate": "Oct 10",
      "dividend": "$2.00",
      "yield": "1.82%",
      "frequency": "Semi-annual",
      "type": "Regular Cash"
    }
  ],
  "Apr 9": [
    {
      "cellLabel": "AAPL",
      "symbol": "AAPL",
      "company": "Apple Inc.",
      "exDate": "Apr 9",
      "payDate": "May 15",
      "dividend": "$0.25",
      "yield": "0.51%",
      "frequency": "Quarterly",
      "type": "Regular Cash"
    },
    {
      "cellLabel": "LRCX",
      "symbol": "LRCX",
      "company": "Lam Research",
      "exDate": "Apr 9",
      "payDate": "Apr 23",
      "dividend": "$2.30",
      "yield": "0.83%",
      "frequency": "Quarterly",
      "type": "Regular Cash"
    }
  ],
  "Apr 14": [
    {
      "cellLabel": "AVGO",
      "symbol": "AVGO",
      "company": "Broadcom Inc.",
      "exDate": "Apr 14",
      "payDate": "Apr 30",
      "dividend": "$5.25",
      "yield": "1.19%",
      "frequency": "Quarterly",
      "type": "Regular Cash"
    },
    {
      "cellLabel": "TSM",
      "symbol": "TSM",
      "company": "Taiwan Semiconductor",
      "exDate": "Apr 14",
      "payDate": "Oct 10",
      "dividend": "$2.00",
      "yield": "1.82%",
      "frequency": "Semi-annual",
      "type": "Regular Cash"
    }
  ],
  "Apr 17": [
    {
      "cellLabel": "KLAC",
      "symbol": "KLAC",
      "company": "KLA Corporation",
      "exDate": "Apr 17",
      "payDate": "Jun 1",
      "dividend": "$1.70",
      "yield": "0.76%",
      "frequency": "Quarterly",
      "type": "Regular Cash"
    },
    {
      "cellLabel": "NVDA",
      "symbol": "NVDA",
      "company": "NVIDIA Corporation",
      "exDate": "Apr 17",
      "payDate": "Apr 25",
      "dividend": "$0.01",
      "yield": "0.03%",
      "frequency": "Quarterly",
      "type": "Regular Cash"
    }
  ],
  "Apr 21": [
    {
      "cellLabel": "CDNS",
      "symbol": "CDNS",
      "company": "Cadence Design Systems",
      "exDate": "Apr 21",
      "payDate": "May 15",
      "dividend": "$0.30",
      "yield": "0.21%",
      "frequency": "Quarterly",
      "type": "Regular Cash"
    }
  ],
  "Apr 24": [
    {
      "cellLabel": "SNPS",
      "symbol": "SNPS",
      "company": "Synopsys Inc.",
      "exDate": "Apr 24",
      "payDate": "May 20",
      "dividend": "$0.25",
      "yield": "0.28%",
      "frequency": "Quarterly",
      "type": "Regular Cash"
    }
  ]
}
```
