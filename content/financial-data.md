# Financial Data — T Company Key Customers

**Disclaimer:** All financial figures below are sample/mock data for demonstration purposes only. They do not represent actual financial results and should not be used for investment decisions.

Financial statements for T Company's 10 major customers. Figures are approximate, illustrative, and based on publicly available annual and quarterly reports.

## Company List

```json
[
  { "symbol": "AAPL",  "name": "Apple Inc.",                    "sector": "Technology",       "marketCap": "3.0T",  "currency": "USD", "description": "World's largest technology company; T Company's biggest customer (~25% of revenue) for A-series and M-series chips." },
  { "symbol": "NVDA",  "name": "NVIDIA Corporation",            "sector": "Semiconductors",   "marketCap": "2.6T",  "currency": "USD", "description": "Leading GPU and AI accelerator designer. Relies on T Company's advanced nodes (4nm/3nm) for data-center GPUs." },
  { "symbol": "AMD",   "name": "Advanced Micro Devices",        "sector": "Semiconductors",   "marketCap": "210B",  "currency": "USD", "description": "Fabless CPU/GPU designer. Partners with T Company for Ryzen, EPYC, and Radeon products." },
  { "symbol": "QCOM",  "name": "Qualcomm Incorporated",         "sector": "Semiconductors",   "marketCap": "165B",  "currency": "USD", "description": "Leader in mobile SoCs and wireless technology. Snapdragon chips are primarily manufactured at T Company." },
  { "symbol": "AVGO",  "name": "Broadcom Inc.",                 "sector": "Semiconductors",   "marketCap": "680B",  "currency": "USD", "description": "Diversified chip and infrastructure software company. Uses T Company for advanced networking and custom AI ASICs." },
  { "symbol": "MRVL",  "name": "Marvell Technology Inc.",       "sector": "Semiconductors",   "marketCap": "55B",   "currency": "USD", "description": "Specializes in data infrastructure semiconductors. T Company manufactures its cloud-optimized chips." },
  { "symbol": "NXPI",  "name": "NXP Semiconductors N.V.",       "sector": "Semiconductors",   "marketCap": "48B",   "currency": "USD", "description": "Automotive and IoT chip leader. Partners with T Company for advanced automotive-grade processors." },
  { "symbol": "STM",   "name": "STMicroelectronics N.V.",       "sector": "Semiconductors",   "marketCap": "24B",   "currency": "USD", "description": "European semiconductor leader in automotive and industrial chips. Collaborates with T Company on FD-SOI nodes." },
  { "symbol": "SONY",  "name": "Sony Group Corporation",        "sector": "Technology",       "marketCap": "95B",   "currency": "USD", "description": "Global electronics and entertainment conglomerate. Uses T Company for image sensors and PlayStation chip components." },
  { "symbol": "TXN",   "name": "Texas Instruments Incorporated","sector": "Semiconductors",   "marketCap": "145B",  "currency": "USD", "description": "Analog and embedded processing leader. Leverages T Company for some advanced digital products alongside its own fabs." }
]
```

## Income Statement

```json
{
  "AAPL": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024", "Q1 FY25", "Q2 FY25"],
    "rows": [
      ["Revenue ($B)", "394.3", "383.3", "391.0", "124.3", "95.4"],
      ["Cost of Revenue ($B)", "223.5", "214.1", "210.4", "65.5", "52.0"],
      ["Gross Profit ($B)", "170.8", "169.1", "180.7", "58.8", "43.3"],
      ["Gross Margin (%)", "43.3%", "44.1%", "46.2%", "47.3%", "45.4%"],
      ["R&D Expense ($B)", "26.3", "29.9", "31.4", "8.0", "8.0"],
      ["SG&A Expense ($B)", "25.1", "24.9", "26.0", "6.4", "6.2"],
      ["Operating Income ($B)", "119.4", "114.3", "123.2", "44.4", "29.1"],
      ["Operating Margin (%)", "30.3%", "29.8%", "31.5%", "35.7%", "30.5%"],
      ["Net Income ($B)", "99.8", "97.0", "93.7", "36.3", "24.8"],
      ["Net Margin (%)", "25.3%", "25.3%", "24.0%", "29.2%", "26.0%"],
      ["EPS (diluted)", "$6.11", "$6.13", "$6.08", "$2.40", "$1.65"]
    ]
  },
  "NVDA": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024", "Q1 FY25", "Q2 FY25"],
    "rows": [
      ["Revenue ($B)", "26.9", "26.9", "60.9", "26.0", "30.0"],
      ["Cost of Revenue ($B)", "11.6", "11.6", "16.6", "6.5", "7.5"],
      ["Gross Profit ($B)", "15.3", "15.3", "44.3", "19.5", "22.5"],
      ["Gross Margin (%)", "56.9%", "56.9%", "72.7%", "75.0%", "75.0%"],
      ["R&D Expense ($B)", "7.0", "7.3", "8.7", "2.7", "3.1"],
      ["SG&A Expense ($B)", "2.2", "2.4", "2.7", "0.7", "0.8"],
      ["Operating Income ($B)", "6.1", "5.6", "32.9", "16.1", "18.6"],
      ["Operating Margin (%)", "22.7%", "20.8%", "54.1%", "61.9%", "62.0%"],
      ["Net Income ($B)", "4.4", "4.4", "29.8", "14.9", "16.6"],
      ["Net Margin (%)", "16.4%", "16.4%", "49.0%", "57.3%", "55.3%"],
      ["EPS (diluted)", "$1.74", "$1.74", "$11.93", "$5.98", "$6.63"]
    ]
  },
  "AMD": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024", "Q1 FY25", "Q2 FY25"],
    "rows": [
      ["Revenue ($B)", "23.6", "22.7", "25.8", "7.4", "7.7"],
      ["Cost of Revenue ($B)", "11.5", "11.1", "12.0", "3.5", "3.6"],
      ["Gross Profit ($B)", "12.1", "11.6", "13.8", "3.9", "4.1"],
      ["Gross Margin (%)", "51.3%", "51.1%", "53.5%", "52.7%", "53.2%"],
      ["R&D Expense ($B)", "5.0", "5.9", "6.3", "1.7", "1.8"],
      ["SG&A Expense ($B)", "1.8", "1.8", "2.0", "0.5", "0.5"],
      ["Operating Income ($B)", "1.3", "-0.1", "1.0", "0.5", "0.6"],
      ["Operating Margin (%)", "5.5%", "-0.4%", "3.9%", "6.8%", "7.8%"],
      ["Net Income ($B)", "1.3", "0.9", "1.6", "0.7", "0.8"],
      ["Net Margin (%)", "5.5%", "4.0%", "6.2%", "9.5%", "10.4%"],
      ["EPS (diluted)", "$0.84", "$0.53", "$0.94", "$0.47", "$0.49"]
    ]
  },
  "QCOM": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024", "Q1 FY25", "Q2 FY25"],
    "rows": [
      ["Revenue ($B)", "44.2", "35.8", "38.9", "11.7", "10.8"],
      ["Cost of Revenue ($B)", "20.0", "16.5", "17.5", "5.2", "4.7"],
      ["Gross Profit ($B)", "24.2", "19.3", "21.4", "6.5", "6.1"],
      ["Gross Margin (%)", "54.8%", "53.9%", "55.0%", "55.6%", "56.5%"],
      ["R&D Expense ($B)", "9.4", "9.0", "9.0", "2.4", "2.4"],
      ["SG&A Expense ($B)", "2.2", "2.1", "2.1", "0.5", "0.5"],
      ["Operating Income ($B)", "12.6", "8.2", "10.3", "3.6", "3.2"],
      ["Operating Margin (%)", "28.5%", "22.9%", "26.5%", "30.8%", "29.6%"],
      ["Net Income ($B)", "12.9", "7.2", "10.1", "3.1", "2.8"],
      ["Net Margin (%)", "29.2%", "20.1%", "26.0%", "26.5%", "25.9%"],
      ["EPS (diluted)", "$10.29", "$6.01", "$8.40", "$2.85", "$2.70"]
    ]
  },
  "AVGO": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024", "Q1 FY25", "Q2 FY25"],
    "rows": [
      ["Revenue ($B)", "33.2", "35.8", "51.6", "14.9", "14.1"],
      ["Cost of Revenue ($B)", "12.8", "11.8", "18.5", "5.3", "5.0"],
      ["Gross Profit ($B)", "20.4", "24.0", "33.1", "9.6", "9.1"],
      ["Gross Margin (%)", "61.4%", "67.0%", "64.1%", "64.4%", "64.5%"],
      ["R&D Expense ($B)", "5.1", "5.3", "9.3", "3.0", "2.7"],
      ["SG&A Expense ($B)", "1.5", "1.5", "2.5", "0.8", "0.8"],
      ["Operating Income ($B)", "13.8", "17.2", "21.3", "5.8", "5.6"],
      ["Operating Margin (%)", "41.6%", "48.0%", "41.3%", "38.9%", "39.7%"],
      ["Net Income ($B)", "11.5", "14.1", "5.9", "5.5", "5.4"],
      ["Net Margin (%)", "34.6%", "39.4%", "11.4%", "36.9%", "38.3%"],
      ["EPS (diluted)", "$24.37", "$30.53", "$4.38", "$1.14", "$1.14"]
    ]
  },
  "MRVL": {
    "columns": ["Metric", "FY2023", "FY2024", "FY2025", "Q1 FY26", "Q2 FY26"],
    "rows": [
      ["Revenue ($B)", "5.9", "5.5", "5.8", "1.9", "2.0"],
      ["Cost of Revenue ($B)", "2.7", "2.6", "2.6", "0.8", "0.8"],
      ["Gross Profit ($B)", "3.2", "2.9", "3.2", "1.1", "1.2"],
      ["Gross Margin (%)", "54.2%", "52.7%", "55.2%", "57.9%", "60.0%"],
      ["R&D Expense ($B)", "2.3", "2.4", "2.5", "0.7", "0.7"],
      ["SG&A Expense ($B)", "0.5", "0.5", "0.5", "0.1", "0.1"],
      ["Operating Income ($B)", "0.4", "0.0", "0.2", "0.3", "0.4"],
      ["Operating Margin (%)", "6.8%", "0.0%", "3.4%", "15.8%", "20.0%"],
      ["Net Income ($B)", "0.2", "-0.1", "0.1", "0.3", "0.4"],
      ["Net Margin (%)", "3.4%", "-1.8%", "1.7%", "15.8%", "20.0%"],
      ["EPS (diluted)", "$0.23", "-$0.13", "$0.12", "$0.29", "$0.35"]
    ]
  },
  "NXPI": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024", "Q1 FY25", "Q2 FY25"],
    "rows": [
      ["Revenue ($B)", "13.2", "13.3", "12.6", "3.1", "3.0"],
      ["Cost of Revenue ($B)", "6.2", "6.2", "6.0", "1.5", "1.5"],
      ["Gross Profit ($B)", "7.0", "7.1", "6.6", "1.6", "1.5"],
      ["Gross Margin (%)", "53.0%", "53.4%", "52.4%", "51.6%", "50.0%"],
      ["R&D Expense ($B)", "2.0", "2.1", "2.1", "0.5", "0.5"],
      ["SG&A Expense ($B)", "0.6", "0.6", "0.6", "0.2", "0.2"],
      ["Operating Income ($B)", "4.4", "4.4", "3.9", "0.9", "0.8"],
      ["Operating Margin (%)", "33.3%", "33.1%", "31.0%", "29.0%", "26.7%"],
      ["Net Income ($B)", "3.3", "3.1", "2.7", "0.6", "0.6"],
      ["Net Margin (%)", "25.0%", "23.3%", "21.4%", "19.4%", "20.0%"],
      ["EPS (diluted)", "$12.26", "$11.79", "$10.54", "$2.28", "$2.17"]
    ]
  },
  "STM": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024", "Q1 FY25", "Q2 FY25"],
    "rows": [
      ["Revenue ($B)", "16.1", "17.3", "13.3", "2.9", "2.7"],
      ["Cost of Revenue ($B)", "8.0", "8.5", "7.6", "1.8", "1.7"],
      ["Gross Profit ($B)", "8.1", "8.8", "5.7", "1.1", "1.0"],
      ["Gross Margin (%)", "50.3%", "50.9%", "42.9%", "37.9%", "37.0%"],
      ["R&D Expense ($B)", "2.0", "2.3", "2.3", "0.6", "0.6"],
      ["SG&A Expense ($B)", "0.9", "1.0", "1.0", "0.3", "0.3"],
      ["Operating Income ($B)", "5.2", "5.5", "2.4", "0.2", "0.1"],
      ["Operating Margin (%)", "32.3%", "31.8%", "18.0%", "6.9%", "3.7%"],
      ["Net Income ($B)", "4.2", "4.2", "1.6", "0.1", "0.1"],
      ["Net Margin (%)", "26.1%", "24.3%", "12.0%", "3.4%", "3.7%"],
      ["EPS (diluted)", "$4.40", "$4.42", "$1.72", "$0.12", "$0.09"]
    ]
  },
  "SONY": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024", "Q1 FY25", "Q2 FY25"],
    "rows": [
      ["Revenue ($B)", "83.0", "87.6", "86.6", "21.0", "20.5"],
      ["Cost of Revenue ($B)", "57.5", "60.0", "58.6", "14.5", "14.2"],
      ["Gross Profit ($B)", "25.5", "27.6", "28.0", "6.5", "6.3"],
      ["Gross Margin (%)", "30.7%", "31.5%", "32.3%", "31.0%", "30.7%"],
      ["R&D Expense ($B)", "5.9", "6.4", "6.7", "1.7", "1.7"],
      ["SG&A Expense ($B)", "7.8", "8.1", "8.0", "2.0", "2.0"],
      ["Operating Income ($B)", "11.8", "13.1", "13.3", "2.8", "2.6"],
      ["Operating Margin (%)", "14.2%", "15.0%", "15.4%", "13.3%", "12.7%"],
      ["Net Income ($B)", "9.8", "10.0", "8.9", "2.0", "1.9"],
      ["Net Margin (%)", "11.8%", "11.4%", "10.3%", "9.5%", "9.3%"],
      ["EPS (diluted)", "$7.75", "$8.13", "$7.22", "$1.60", "$1.55"]
    ]
  },
  "TXN": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024", "Q1 FY25", "Q2 FY25"],
    "rows": [
      ["Revenue ($B)", "20.0", "17.5", "15.6", "3.7", "3.9"],
      ["Cost of Revenue ($B)", "7.2", "6.9", "7.1", "1.8", "1.9"],
      ["Gross Profit ($B)", "12.8", "10.6", "8.5", "1.9", "2.0"],
      ["Gross Margin (%)", "64.0%", "60.6%", "54.5%", "51.4%", "51.3%"],
      ["R&D Expense ($B)", "1.7", "1.9", "1.9", "0.5", "0.5"],
      ["SG&A Expense ($B)", "0.8", "0.8", "0.8", "0.2", "0.2"],
      ["Operating Income ($B)", "10.3", "7.9", "5.8", "1.2", "1.3"],
      ["Operating Margin (%)", "51.5%", "45.1%", "37.2%", "32.4%", "33.3%"],
      ["Net Income ($B)", "8.7", "6.5", "4.8", "1.0", "1.1"],
      ["Net Margin (%)", "43.5%", "37.1%", "30.8%", "27.0%", "28.2%"],
      ["EPS (diluted)", "$9.39", "$7.17", "$5.26", "$1.10", "$1.20"]
    ]
  }
}
```

## Balance Sheet

```json
{
  "AAPL": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024"],
    "rows": [
      ["ASSETS", "", "", ""],
      ["Cash & Equivalents ($B)", "23.6", "29.9", "29.9"],
      ["Short-term Investments ($B)", "24.7", "31.6", "35.2"],
      ["Accounts Receivable ($B)", "28.2", "29.5", "33.4"],
      ["Inventories ($B)", "4.9", "6.3", "7.3"],
      ["Total Current Assets ($B)", "135.4", "143.6", "153.0"],
      ["PP&E net ($B)", "42.1", "43.7", "45.7"],
      ["Total Assets ($B)", "352.8", "352.6", "364.9"],
      ["LIABILITIES", "", "", ""],
      ["Accounts Payable ($B)", "64.1", "62.6", "68.9"],
      ["Total Current Liabilities ($B)", "153.9", "145.3", "176.1"],
      ["Long-term Debt ($B)", "98.1", "95.3", "85.8"],
      ["Total Liabilities ($B)", "302.1", "290.4", "308.0"],
      ["EQUITY", "", "", ""],
      ["Common Stock & APIC ($B)", "64.8", "73.8", "83.3"],
      ["Retained Earnings ($B)", "-3.1", "-21.4", "-18.6"],
      ["Total Equity ($B)", "50.7", "62.1", "56.9"]
    ]
  },
  "NVDA": {
    "columns": ["Metric", "FY2023", "FY2024", "FY2025"],
    "rows": [
      ["ASSETS", "", "", ""],
      ["Cash & Equivalents ($B)", "3.4", "7.3", "8.6"],
      ["Short-term Investments ($B)", "9.9", "15.7", "26.2"],
      ["Accounts Receivable ($B)", "3.8", "9.8", "17.8"],
      ["Inventories ($B)", "5.2", "5.3", "8.6"],
      ["Total Current Assets ($B)", "23.1", "44.3", "65.7"],
      ["PP&E net ($B)", "3.8", "4.0", "6.3"],
      ["Total Assets ($B)", "41.2", "65.7", "111.6"],
      ["LIABILITIES", "", "", ""],
      ["Accounts Payable ($B)", "1.1", "2.7", "4.5"],
      ["Total Current Liabilities ($B)", "6.6", "10.6", "18.4"],
      ["Long-term Debt ($B)", "9.7", "8.5", "8.5"],
      ["Total Liabilities ($B)", "17.2", "22.8", "30.1"],
      ["EQUITY", "", "", ""],
      ["Common Stock & APIC ($B)", "11.1", "13.1", "14.4"],
      ["Retained Earnings ($B)", "12.9", "29.8", "67.1"],
      ["Total Equity ($B)", "22.1", "42.9", "81.5"]
    ]
  },
  "AMD": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024"],
    "rows": [
      ["ASSETS", "", "", ""],
      ["Cash & Equivalents ($B)", "4.8", "3.9", "4.5"],
      ["Short-term Investments ($B)", "1.2", "1.7", "2.2"],
      ["Accounts Receivable ($B)", "2.1", "1.8", "2.0"],
      ["Inventories ($B)", "1.6", "1.8", "1.9"],
      ["Total Current Assets ($B)", "12.1", "11.1", "12.2"],
      ["PP&E net ($B)", "1.5", "1.6", "1.8"],
      ["Goodwill ($B)", "24.2", "24.2", "24.3"],
      ["Total Assets ($B)", "67.6", "67.9", "69.2"],
      ["LIABILITIES", "", "", ""],
      ["Accounts Payable ($B)", "0.6", "0.8", "0.8"],
      ["Total Current Liabilities ($B)", "3.9", "3.8", "4.0"],
      ["Long-term Debt ($B)", "2.5", "1.7", "1.7"],
      ["Total Liabilities ($B)", "8.7", "7.9", "8.3"],
      ["EQUITY", "", "", ""],
      ["Common Stock & APIC ($B)", "60.3", "62.4", "63.2"],
      ["Retained Earnings ($B)", "-1.4", "-2.4", "-2.3"],
      ["Total Equity ($B)", "58.9", "60.0", "60.9"]
    ]
  },
  "QCOM": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024"],
    "rows": [
      ["ASSETS", "", "", ""],
      ["Cash & Equivalents ($B)", "2.8", "3.8", "7.3"],
      ["Short-term Investments ($B)", "2.7", "1.9", "2.8"],
      ["Accounts Receivable ($B)", "3.0", "3.1", "3.7"],
      ["Inventories ($B)", "4.8", "5.0", "3.6"],
      ["Total Current Assets ($B)", "15.7", "16.8", "20.9"],
      ["PP&E net ($B)", "4.3", "4.3", "4.3"],
      ["Total Assets ($B)", "37.4", "35.2", "38.0"],
      ["LIABILITIES", "", "", ""],
      ["Accounts Payable ($B)", "3.2", "2.7", "2.6"],
      ["Total Current Liabilities ($B)", "8.0", "7.5", "8.5"],
      ["Long-term Debt ($B)", "14.9", "13.5", "13.7"],
      ["Total Liabilities ($B)", "29.9", "28.5", "30.6"],
      ["EQUITY", "", "", ""],
      ["Common Stock & APIC ($B)", "8.0", "8.6", "10.0"],
      ["Retained Earnings ($B)", "-0.5", "-1.9", "-2.6"],
      ["Total Equity ($B)", "7.5", "6.7", "7.4"]
    ]
  },
  "AVGO": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024"],
    "rows": [
      ["ASSETS", "", "", ""],
      ["Cash & Equivalents ($B)", "12.1", "14.2", "9.3"],
      ["Short-term Investments ($B)", "0.2", "0.5", "0.4"],
      ["Accounts Receivable ($B)", "2.6", "3.1", "4.7"],
      ["Inventories ($B)", "1.9", "1.7", "2.3"],
      ["Total Current Assets ($B)", "19.1", "21.7", "18.9"],
      ["PP&E net ($B)", "2.0", "2.0", "3.6"],
      ["Goodwill ($B)", "40.5", "41.2", "119.2"],
      ["Total Assets ($B)", "75.4", "72.9", "167.5"],
      ["LIABILITIES", "", "", ""],
      ["Accounts Payable ($B)", "1.0", "1.1", "1.8"],
      ["Total Current Liabilities ($B)", "7.6", "7.5", "15.0"],
      ["Long-term Debt ($B)", "39.3", "37.5", "66.3"],
      ["Total Liabilities ($B)", "56.4", "54.3", "126.8"],
      ["EQUITY", "", "", ""],
      ["Common Stock & APIC ($B)", "22.7", "25.2", "52.5"],
      ["Retained Earnings ($B)", "-3.7", "-6.6", "-11.8"],
      ["Total Equity ($B)", "19.0", "18.6", "40.7"]
    ]
  },
  "MRVL": {
    "columns": ["Metric", "FY2024", "FY2025", "FY2026E"],
    "rows": [
      ["ASSETS", "", "", ""],
      ["Cash & Equivalents ($B)", "0.9", "1.2", "1.5"],
      ["Accounts Receivable ($B)", "0.8", "0.9", "1.0"],
      ["Inventories ($B)", "0.7", "0.8", "0.9"],
      ["Total Current Assets ($B)", "3.2", "3.7", "4.1"],
      ["PP&E net ($B)", "0.7", "0.8", "0.9"],
      ["Goodwill ($B)", "12.0", "12.1", "12.1"],
      ["Total Assets ($B)", "20.5", "21.4", "22.3"],
      ["LIABILITIES", "", "", ""],
      ["Total Current Liabilities ($B)", "1.5", "1.6", "1.7"],
      ["Long-term Debt ($B)", "4.0", "3.8", "3.5"],
      ["Total Liabilities ($B)", "7.2", "7.0", "6.8"],
      ["EQUITY", "", "", ""],
      ["Total Equity ($B)", "13.3", "14.4", "15.5"]
    ]
  },
  "NXPI": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024"],
    "rows": [
      ["ASSETS", "", "", ""],
      ["Cash & Equivalents ($B)", "3.3", "3.7", "2.9"],
      ["Accounts Receivable ($B)", "1.3", "1.3", "1.2"],
      ["Inventories ($B)", "2.2", "2.4", "2.2"],
      ["Total Current Assets ($B)", "9.2", "9.8", "8.8"],
      ["PP&E net ($B)", "3.1", "3.2", "3.5"],
      ["Goodwill ($B)", "9.1", "9.1", "9.1"],
      ["Total Assets ($B)", "26.0", "26.2", "25.8"],
      ["LIABILITIES", "", "", ""],
      ["Total Current Liabilities ($B)", "3.2", "3.3", "3.2"],
      ["Long-term Debt ($B)", "10.6", "10.4", "10.1"],
      ["Total Liabilities ($B)", "17.1", "17.1", "16.8"],
      ["EQUITY", "", "", ""],
      ["Total Equity ($B)", "8.9", "9.1", "9.0"]
    ]
  },
  "STM": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024"],
    "rows": [
      ["ASSETS", "", "", ""],
      ["Cash & Equivalents ($B)", "2.5", "3.5", "2.8"],
      ["Accounts Receivable ($B)", "1.4", "1.5", "1.2"],
      ["Inventories ($B)", "2.1", "2.7", "2.8"],
      ["Total Current Assets ($B)", "8.7", "10.2", "9.2"],
      ["PP&E net ($B)", "6.2", "7.1", "8.3"],
      ["Total Assets ($B)", "17.8", "20.1", "21.1"],
      ["LIABILITIES", "", "", ""],
      ["Total Current Liabilities ($B)", "3.0", "3.2", "3.0"],
      ["Long-term Debt ($B)", "2.7", "2.7", "2.9"],
      ["Total Liabilities ($B)", "7.3", "8.1", "8.5"],
      ["EQUITY", "", "", ""],
      ["Total Equity ($B)", "10.5", "12.0", "12.6"]
    ]
  },
  "SONY": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024"],
    "rows": [
      ["ASSETS", "", "", ""],
      ["Cash & Equivalents ($B)", "11.0", "12.0", "11.5"],
      ["Accounts Receivable ($B)", "7.5", "8.0", "8.2"],
      ["Inventories ($B)", "3.5", "3.7", "3.9"],
      ["Total Current Assets ($B)", "42.0", "44.0", "45.0"],
      ["PP&E net ($B)", "9.5", "10.0", "10.5"],
      ["Total Assets ($B)", "231.0", "250.0", "255.0"],
      ["LIABILITIES", "", "", ""],
      ["Total Current Liabilities ($B)", "36.0", "38.0", "39.0"],
      ["Long-term Debt ($B)", "7.5", "7.0", "7.2"],
      ["Total Liabilities ($B)", "188.0", "205.0", "210.0"],
      ["EQUITY", "", "", ""],
      ["Total Equity ($B)", "43.0", "45.0", "45.0"]
    ]
  },
  "TXN": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024"],
    "rows": [
      ["ASSETS", "", "", ""],
      ["Cash & Equivalents ($B)", "9.0", "8.7", "7.0"],
      ["Short-term Investments ($B)", "1.6", "2.0", "2.5"],
      ["Accounts Receivable ($B)", "1.6", "1.9", "1.8"],
      ["Inventories ($B)", "2.4", "3.5", "4.4"],
      ["Total Current Assets ($B)", "18.7", "19.8", "19.1"],
      ["PP&E net ($B)", "8.7", "12.0", "16.0"],
      ["Total Assets ($B)", "30.8", "35.3", "38.1"],
      ["LIABILITIES", "", "", ""],
      ["Total Current Liabilities ($B)", "2.8", "3.4", "3.5"],
      ["Long-term Debt ($B)", "8.5", "11.3", "13.8"],
      ["Total Liabilities ($B)", "17.0", "22.3", "25.7"],
      ["EQUITY", "", "", ""],
      ["Total Equity ($B)", "13.8", "13.0", "12.4"]
    ]
  }
}
```

## Cash Flow Statement

```json
{
  "AAPL": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024"],
    "rows": [
      ["OPERATING ACTIVITIES", "", "", ""],
      ["Net Income ($B)", "99.8", "97.0", "93.7"],
      ["Depreciation & Amortization ($B)", "11.1", "11.5", "11.4"],
      ["Changes in Working Capital ($B)", "-6.0", "-5.5", "9.0"],
      ["Operating Cash Flow ($B)", "122.2", "114.0", "118.3"],
      ["INVESTING ACTIVITIES", "", "", ""],
      ["Capital Expenditures ($B)", "-10.7", "-10.9", "-9.0"],
      ["Acquisitions ($B)", "-1.5", "-1.0", "-1.5"],
      ["Purchases of Investments ($B)", "-76.5", "-40.0", "-43.0"],
      ["Investing Cash Flow ($B)", "-22.4", "-30.0", "-8.9"],
      ["FINANCING ACTIVITIES", "", "", ""],
      ["Stock Buybacks ($B)", "-90.2", "-77.5", "-94.9"],
      ["Dividends Paid ($B)", "-14.8", "-15.0", "-15.2"],
      ["Net Debt Issued ($B)", "9.4", "-5.2", "-5.0"],
      ["Financing Cash Flow ($B)", "-110.7", "-108.5", "-121.0"],
      ["FREE CASH FLOW", "", "", ""],
      ["Free Cash Flow ($B)", "111.4", "103.1", "109.3"]
    ]
  },
  "NVDA": {
    "columns": ["Metric", "FY2023", "FY2024", "FY2025"],
    "rows": [
      ["OPERATING ACTIVITIES", "", "", ""],
      ["Net Income ($B)", "4.4", "29.8", "72.9"],
      ["Depreciation & Amortization ($B)", "1.5", "1.6", "1.8"],
      ["Changes in Working Capital ($B)", "-0.4", "-8.2", "-11.0"],
      ["Operating Cash Flow ($B)", "5.6", "28.1", "67.2"],
      ["INVESTING ACTIVITIES", "", "", ""],
      ["Capital Expenditures ($B)", "-1.0", "-1.1", "-3.3"],
      ["Purchases of Investments ($B)", "-10.1", "-19.3", "-58.8"],
      ["Investing Cash Flow ($B)", "-9.5", "-10.7", "-30.5"],
      ["FINANCING ACTIVITIES", "", "", ""],
      ["Stock Buybacks ($B)", "-3.4", "-9.5", "-33.8"],
      ["Dividends Paid ($B)", "-0.4", "-0.4", "-0.4"],
      ["Net Debt Issued ($B)", "0.0", "0.0", "0.0"],
      ["Financing Cash Flow ($B)", "-3.8", "-9.9", "-35.8"],
      ["FREE CASH FLOW", "", "", ""],
      ["Free Cash Flow ($B)", "4.6", "27.0", "63.9"]
    ]
  },
  "AMD": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024"],
    "rows": [
      ["OPERATING ACTIVITIES", "", "", ""],
      ["Net Income ($B)", "1.3", "0.9", "1.6"],
      ["Depreciation & Amortization ($B)", "4.6", "4.7", "4.5"],
      ["Changes in Working Capital ($B)", "-0.5", "0.4", "0.3"],
      ["Operating Cash Flow ($B)", "3.6", "3.5", "4.3"],
      ["INVESTING ACTIVITIES", "", "", ""],
      ["Capital Expenditures ($B)", "-0.6", "-0.6", "-0.7"],
      ["Investing Cash Flow ($B)", "-1.6", "-0.6", "-0.8"],
      ["FINANCING ACTIVITIES", "", "", ""],
      ["Stock Buybacks ($B)", "-3.2", "-0.7", "-0.4"],
      ["Dividends Paid ($B)", "0.0", "0.0", "0.0"],
      ["Financing Cash Flow ($B)", "-3.5", "-0.6", "-0.5"],
      ["FREE CASH FLOW", "", "", ""],
      ["Free Cash Flow ($B)", "3.0", "2.9", "3.6"]
    ]
  },
  "QCOM": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024"],
    "rows": [
      ["OPERATING ACTIVITIES", "", "", ""],
      ["Net Income ($B)", "12.9", "7.2", "10.1"],
      ["Depreciation & Amortization ($B)", "1.6", "1.7", "1.7"],
      ["Changes in Working Capital ($B)", "-0.3", "2.1", "-1.5"],
      ["Operating Cash Flow ($B)", "9.4", "11.3", "11.5"],
      ["INVESTING ACTIVITIES", "", "", ""],
      ["Capital Expenditures ($B)", "-1.2", "-1.0", "-0.9"],
      ["Investing Cash Flow ($B)", "-5.1", "-2.4", "0.5"],
      ["FINANCING ACTIVITIES", "", "", ""],
      ["Stock Buybacks ($B)", "-6.5", "-5.2", "-3.7"],
      ["Dividends Paid ($B)", "-3.2", "-3.5", "-3.7"],
      ["Financing Cash Flow ($B)", "-14.0", "-7.5", "-4.0"],
      ["FREE CASH FLOW", "", "", ""],
      ["Free Cash Flow ($B)", "8.2", "10.3", "10.6"]
    ]
  },
  "AVGO": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024"],
    "rows": [
      ["OPERATING ACTIVITIES", "", "", ""],
      ["Net Income ($B)", "11.5", "14.1", "5.9"],
      ["Depreciation & Amortization ($B)", "2.6", "2.8", "7.9"],
      ["Changes in Working Capital ($B)", "0.1", "0.2", "2.0"],
      ["Operating Cash Flow ($B)", "16.3", "18.0", "19.9"],
      ["INVESTING ACTIVITIES", "", "", ""],
      ["Capital Expenditures ($B)", "-0.4", "-0.5", "-0.7"],
      ["Acquisitions ($B)", "-61.2", "-0.2", "0.0"],
      ["Investing Cash Flow ($B)", "-1.8", "0.3", "-0.3"],
      ["FINANCING ACTIVITIES", "", "", ""],
      ["Stock Buybacks ($B)", "-7.7", "-8.9", "-11.5"],
      ["Dividends Paid ($B)", "-7.5", "-8.3", "-9.2"],
      ["Financing Cash Flow ($B)", "11.6", "-15.7", "-18.8"],
      ["FREE CASH FLOW", "", "", ""],
      ["Free Cash Flow ($B)", "15.9", "17.5", "19.2"]
    ]
  },
  "MRVL": {
    "columns": ["Metric", "FY2024", "FY2025", "FY2026E"],
    "rows": [
      ["OPERATING ACTIVITIES", "", "", ""],
      ["Net Income ($B)", "-0.1", "0.1", "0.6"],
      ["Depreciation & Amortization ($B)", "0.9", "0.9", "0.9"],
      ["Operating Cash Flow ($B)", "0.9", "1.2", "1.7"],
      ["INVESTING ACTIVITIES", "", "", ""],
      ["Capital Expenditures ($B)", "-0.2", "-0.2", "-0.3"],
      ["Investing Cash Flow ($B)", "-0.3", "-0.3", "-0.3"],
      ["FINANCING ACTIVITIES", "", "", ""],
      ["Stock Buybacks ($B)", "-0.5", "-0.5", "-0.5"],
      ["Dividends Paid ($B)", "-0.2", "-0.2", "-0.2"],
      ["Financing Cash Flow ($B)", "-0.7", "-0.8", "-0.8"],
      ["FREE CASH FLOW", "", "", ""],
      ["Free Cash Flow ($B)", "0.7", "1.0", "1.4"]
    ]
  },
  "NXPI": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024"],
    "rows": [
      ["OPERATING ACTIVITIES", "", "", ""],
      ["Net Income ($B)", "3.3", "3.1", "2.7"],
      ["Depreciation & Amortization ($B)", "0.8", "0.8", "0.9"],
      ["Operating Cash Flow ($B)", "3.6", "3.9", "3.3"],
      ["INVESTING ACTIVITIES", "", "", ""],
      ["Capital Expenditures ($B)", "-0.9", "-1.0", "-1.0"],
      ["Investing Cash Flow ($B)", "-1.0", "-1.0", "-1.1"],
      ["FINANCING ACTIVITIES", "", "", ""],
      ["Stock Buybacks ($B)", "-2.5", "-2.0", "-1.5"],
      ["Dividends Paid ($B)", "-1.1", "-1.2", "-1.3"],
      ["Financing Cash Flow ($B)", "-2.6", "-2.4", "-1.5"],
      ["FREE CASH FLOW", "", "", ""],
      ["Free Cash Flow ($B)", "2.7", "2.9", "2.3"]
    ]
  },
  "STM": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024"],
    "rows": [
      ["OPERATING ACTIVITIES", "", "", ""],
      ["Net Income ($B)", "4.2", "4.2", "1.6"],
      ["Depreciation & Amortization ($B)", "1.2", "1.4", "1.6"],
      ["Operating Cash Flow ($B)", "4.5", "4.2", "1.9"],
      ["INVESTING ACTIVITIES", "", "", ""],
      ["Capital Expenditures ($B)", "-2.1", "-2.6", "-2.5"],
      ["Investing Cash Flow ($B)", "-2.2", "-2.7", "-2.6"],
      ["FINANCING ACTIVITIES", "", "", ""],
      ["Stock Buybacks ($B)", "-0.5", "-0.9", "-0.6"],
      ["Dividends Paid ($B)", "-0.4", "-0.4", "-0.4"],
      ["Financing Cash Flow ($B)", "1.3", "1.2", "0.2"],
      ["FREE CASH FLOW", "", "", ""],
      ["Free Cash Flow ($B)", "2.4", "1.6", "-0.6"]
    ]
  },
  "SONY": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024"],
    "rows": [
      ["OPERATING ACTIVITIES", "", "", ""],
      ["Net Income ($B)", "9.8", "10.0", "8.9"],
      ["Depreciation & Amortization ($B)", "4.0", "4.3", "4.5"],
      ["Operating Cash Flow ($B)", "13.0", "14.5", "13.8"],
      ["INVESTING ACTIVITIES", "", "", ""],
      ["Capital Expenditures ($B)", "-3.5", "-3.8", "-4.0"],
      ["Investing Cash Flow ($B)", "-6.5", "-8.0", "-7.5"],
      ["FINANCING ACTIVITIES", "", "", ""],
      ["Stock Buybacks ($B)", "-1.0", "-1.2", "-1.3"],
      ["Dividends Paid ($B)", "-0.5", "-0.5", "-0.5"],
      ["Financing Cash Flow ($B)", "-2.5", "-3.5", "-4.0"],
      ["FREE CASH FLOW", "", "", ""],
      ["Free Cash Flow ($B)", "9.5", "10.7", "9.8"]
    ]
  },
  "TXN": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024"],
    "rows": [
      ["OPERATING ACTIVITIES", "", "", ""],
      ["Net Income ($B)", "8.7", "6.5", "4.8"],
      ["Depreciation & Amortization ($B)", "1.4", "1.7", "2.3"],
      ["Operating Cash Flow ($B)", "9.0", "6.7", "6.0"],
      ["INVESTING ACTIVITIES", "", "", ""],
      ["Capital Expenditures ($B)", "-3.0", "-5.1", "-5.5"],
      ["Investing Cash Flow ($B)", "-4.6", "-7.1", "-7.9"],
      ["FINANCING ACTIVITIES", "", "", ""],
      ["Stock Buybacks ($B)", "-4.0", "-1.3", "-0.5"],
      ["Dividends Paid ($B)", "-4.0", "-4.4", "-4.7"],
      ["Financing Cash Flow ($B)", "0.9", "2.4", "2.6"],
      ["FREE CASH FLOW", "", "", ""],
      ["Free Cash Flow ($B)", "6.0", "1.6", "0.5"]
    ]
  }
}
```

## Financial Ratios

```json
{
  "AAPL": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024", "TTM"],
    "rows": [
      ["VALUATION", "", "", "", ""],
      ["P/E Ratio", "24.0x", "30.9x", "33.8x", "32.5x"],
      ["P/S Ratio", "5.9x", "7.8x", "8.0x", "7.9x"],
      ["P/B Ratio", "47.7x", "47.4x", "52.4x", "50.0x"],
      ["EV/EBITDA", "20.2x", "24.5x", "26.5x", "25.0x"],
      ["PROFITABILITY", "", "", "", ""],
      ["Return on Equity (%)", "196.9%", "156.1%", "164.6%", "160.0%"],
      ["Return on Assets (%)", "28.3%", "27.5%", "25.7%", "26.0%"],
      ["Return on Invested Capital (%)", "62.5%", "56.0%", "54.3%", "55.0%"],
      ["EFFICIENCY", "", "", "", ""],
      ["Asset Turnover", "1.12x", "1.09x", "1.07x", "1.08x"],
      ["Inventory Turnover", "45.8x", "34.0x", "28.6x", "30.0x"],
      ["LEVERAGE", "", "", "", ""],
      ["Debt/Equity", "1.97x", "1.52x", "1.50x", "1.48x"],
      ["Net Debt ($B)", "90.2", "75.0", "57.0", "60.0"],
      ["Interest Coverage", "40.0x", "38.0x", "42.0x", "40.0x"],
      ["GROWTH", "", "", "", ""],
      ["Revenue Growth YoY (%)", "7.8%", "-2.8%", "2.0%", "5.0%"],
      ["EPS Growth YoY (%)", "8.6%", "0.3%", "-0.8%", "10.0%"]
    ]
  },
  "NVDA": {
    "columns": ["Metric", "FY2023", "FY2024", "FY2025", "TTM"],
    "rows": [
      ["VALUATION", "", "", "", ""],
      ["P/E Ratio", "61.7x", "64.2x", "36.4x", "38.0x"],
      ["P/S Ratio", "17.4x", "32.5x", "25.8x", "26.0x"],
      ["P/B Ratio", "23.1x", "45.0x", "32.0x", "33.0x"],
      ["EV/EBITDA", "50.0x", "55.0x", "28.0x", "30.0x"],
      ["PROFITABILITY", "", "", "", ""],
      ["Return on Equity (%)", "19.9%", "69.5%", "89.5%", "91.0%"],
      ["Return on Assets (%)", "10.7%", "45.4%", "65.3%", "66.0%"],
      ["Return on Invested Capital (%)", "19.0%", "67.0%", "87.0%", "88.0%"],
      ["EFFICIENCY", "", "", "", ""],
      ["Asset Turnover", "0.65x", "0.93x", "0.82x", "0.85x"],
      ["Inventory Turnover", "5.2x", "11.5x", "7.1x", "7.5x"],
      ["LEVERAGE", "", "", "", ""],
      ["Debt/Equity", "0.44x", "0.20x", "0.10x", "0.09x"],
      ["Net Debt ($B)", "-3.6", "-14.5", "-26.3", "-28.0"],
      ["Interest Coverage", "12.0x", "83.0x", "195.0x", "200.0x"],
      ["GROWTH", "", "", "", ""],
      ["Revenue Growth YoY (%)", "0.0%", "126.4%", "114.2%", "78.0%"],
      ["EPS Growth YoY (%)", "0.0%", "585.4%", "147.5%", "60.0%"]
    ]
  },
  "AMD": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024", "TTM"],
    "rows": [
      ["VALUATION", "", "", "", ""],
      ["P/E Ratio", "50.0x", "134.0x", "72.3x", "60.0x"],
      ["P/S Ratio", "2.9x", "2.9x", "5.5x", "5.0x"],
      ["P/B Ratio", "1.2x", "1.9x", "2.4x", "2.2x"],
      ["EV/EBITDA", "20.0x", "38.0x", "46.0x", "40.0x"],
      ["PROFITABILITY", "", "", "", ""],
      ["Return on Equity (%)", "2.2%", "1.5%", "2.6%", "3.0%"],
      ["Return on Assets (%)", "1.9%", "1.3%", "2.3%", "2.5%"],
      ["Return on Invested Capital (%)", "2.5%", "1.8%", "3.0%", "3.5%"],
      ["EFFICIENCY", "", "", "", ""],
      ["Asset Turnover", "0.35x", "0.33x", "0.37x", "0.38x"],
      ["Inventory Turnover", "7.2x", "6.2x", "6.3x", "6.5x"],
      ["LEVERAGE", "", "", "", ""],
      ["Debt/Equity", "0.04x", "0.03x", "0.03x", "0.03x"],
      ["Net Debt ($B)", "-3.5", "-3.9", "-5.0", "-5.2"],
      ["Interest Coverage", "22.0x", "15.0x", "19.0x", "20.0x"],
      ["GROWTH", "", "", "", ""],
      ["Revenue Growth YoY (%)", "43.6%", "-3.8%", "13.7%", "18.0%"],
      ["EPS Growth YoY (%)", "56.0%", "-36.9%", "77.4%", "25.0%"]
    ]
  },
  "QCOM": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024", "TTM"],
    "rows": [
      ["VALUATION", "", "", "", ""],
      ["P/E Ratio", "10.9x", "15.0x", "16.2x", "15.5x"],
      ["P/S Ratio", "3.2x", "2.5x", "3.8x", "3.5x"],
      ["P/B Ratio", "18.9x", "16.4x", "21.3x", "20.0x"],
      ["EV/EBITDA", "9.0x", "12.0x", "14.0x", "13.0x"],
      ["PROFITABILITY", "", "", "", ""],
      ["Return on Equity (%)", "171.8%", "107.5%", "136.5%", "130.0%"],
      ["Return on Assets (%)", "34.5%", "20.5%", "26.6%", "25.0%"],
      ["Return on Invested Capital (%)", "60.0%", "38.0%", "52.0%", "50.0%"],
      ["EFFICIENCY", "", "", "", ""],
      ["Asset Turnover", "1.18x", "1.02x", "1.02x", "1.05x"],
      ["Inventory Turnover", "4.2x", "3.3x", "4.9x", "5.0x"],
      ["LEVERAGE", "", "", "", ""],
      ["Debt/Equity", "1.99x", "2.01x", "1.85x", "1.90x"],
      ["Net Debt ($B)", "9.4", "8.0", "3.6", "3.0"],
      ["Interest Coverage", "22.0x", "12.0x", "17.0x", "18.0x"],
      ["GROWTH", "", "", "", ""],
      ["Revenue Growth YoY (%)", "31.7%", "-18.9%", "8.7%", "12.0%"],
      ["EPS Growth YoY (%)", "55.5%", "-41.6%", "39.8%", "15.0%"]
    ]
  },
  "AVGO": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024", "TTM"],
    "rows": [
      ["VALUATION", "", "", "", ""],
      ["P/E Ratio", "18.7x", "24.5x", "120.0x", "35.0x"],
      ["P/S Ratio", "6.5x", "9.6x", "12.2x", "11.0x"],
      ["P/B Ratio", "11.3x", "18.5x", "16.8x", "16.0x"],
      ["EV/EBITDA", "13.0x", "17.0x", "28.0x", "25.0x"],
      ["PROFITABILITY", "", "", "", ""],
      ["Return on Equity (%)", "60.5%", "75.8%", "14.5%", "40.0%"],
      ["Return on Assets (%)", "15.3%", "19.3%", "3.5%", "10.0%"],
      ["Return on Invested Capital (%)", "22.0%", "28.0%", "12.0%", "18.0%"],
      ["EFFICIENCY", "", "", "", ""],
      ["Asset Turnover", "0.44x", "0.49x", "0.31x", "0.35x"],
      ["Inventory Turnover", "6.7x", "6.9x", "8.0x", "8.5x"],
      ["LEVERAGE", "", "", "", ""],
      ["Debt/Equity", "2.07x", "2.02x", "1.63x", "1.60x"],
      ["Net Debt ($B)", "27.2", "23.3", "57.0", "55.0"],
      ["Interest Coverage", "9.0x", "11.0x", "5.0x", "8.0x"],
      ["GROWTH", "", "", "", ""],
      ["Revenue Growth YoY (%)", "20.9%", "7.8%", "44.2%", "20.0%"],
      ["EPS Growth YoY (%)", "24.0%", "25.2%", "-85.6%", "80.0%"]
    ]
  },
  "MRVL": {
    "columns": ["Metric", "FY2024", "FY2025", "FY2026E", "TTM"],
    "rows": [
      ["VALUATION", "", "", "", ""],
      ["P/E Ratio", "N/A", "N/A", "85.0x", "80.0x"],
      ["P/S Ratio", "5.0x", "5.3x", "7.5x", "7.0x"],
      ["P/B Ratio", "2.3x", "2.7x", "3.8x", "3.5x"],
      ["EV/EBITDA", "30.0x", "35.0x", "40.0x", "38.0x"],
      ["PROFITABILITY", "", "", "", ""],
      ["Return on Equity (%)", "-0.8%", "0.7%", "3.9%", "5.0%"],
      ["Return on Assets (%)", "-0.5%", "0.5%", "2.7%", "3.0%"],
      ["Return on Invested Capital (%)", "1.5%", "2.5%", "6.0%", "7.0%"],
      ["EFFICIENCY", "", "", "", ""],
      ["Asset Turnover", "0.27x", "0.28x", "0.32x", "0.33x"],
      ["Inventory Turnover", "3.7x", "3.8x", "4.2x", "4.5x"],
      ["LEVERAGE", "", "", "", ""],
      ["Debt/Equity", "0.30x", "0.26x", "0.23x", "0.20x"],
      ["Net Debt ($B)", "3.1", "2.6", "2.0", "1.8"],
      ["Interest Coverage", "3.0x", "5.0x", "10.0x", "12.0x"],
      ["GROWTH", "", "", "", ""],
      ["Revenue Growth YoY (%)", "7.3%", "5.5%", "35.0%", "40.0%"],
      ["EPS Growth YoY (%)", "N/A", "N/A", "192.0%", "150.0%"]
    ]
  },
  "NXPI": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024", "TTM"],
    "rows": [
      ["VALUATION", "", "", "", ""],
      ["P/E Ratio", "13.1x", "16.5x", "17.1x", "16.0x"],
      ["P/S Ratio", "3.3x", "3.7x", "3.5x", "3.2x"],
      ["P/B Ratio", "4.8x", "5.4x", "5.2x", "5.0x"],
      ["EV/EBITDA", "11.0x", "13.0x", "13.5x", "12.5x"],
      ["PROFITABILITY", "", "", "", ""],
      ["Return on Equity (%)", "37.1%", "34.1%", "30.0%", "28.0%"],
      ["Return on Assets (%)", "12.7%", "11.8%", "10.5%", "10.0%"],
      ["Return on Invested Capital (%)", "18.0%", "17.5%", "15.5%", "14.0%"],
      ["EFFICIENCY", "", "", "", ""],
      ["Asset Turnover", "0.51x", "0.51x", "0.49x", "0.50x"],
      ["Inventory Turnover", "2.8x", "2.6x", "2.7x", "2.8x"],
      ["LEVERAGE", "", "", "", ""],
      ["Debt/Equity", "1.19x", "1.14x", "1.12x", "1.10x"],
      ["Net Debt ($B)", "7.3", "6.7", "7.2", "7.0"],
      ["Interest Coverage", "12.0x", "12.0x", "10.0x", "10.0x"],
      ["GROWTH", "", "", "", ""],
      ["Revenue Growth YoY (%)", "25.7%", "0.8%", "-5.3%", "-2.0%"],
      ["EPS Growth YoY (%)", "30.0%", "-3.8%", "-10.6%", "0.0%"]
    ]
  },
  "STM": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024", "TTM"],
    "rows": [
      ["VALUATION", "", "", "", ""],
      ["P/E Ratio", "9.5x", "8.8x", "24.0x", "28.0x"],
      ["P/S Ratio", "2.5x", "2.3x", "2.4x", "2.2x"],
      ["P/B Ratio", "3.8x", "3.2x", "2.9x", "2.7x"],
      ["EV/EBITDA", "7.0x", "6.5x", "12.0x", "13.0x"],
      ["PROFITABILITY", "", "", "", ""],
      ["Return on Equity (%)", "40.0%", "35.0%", "12.7%", "8.0%"],
      ["Return on Assets (%)", "23.6%", "20.9%", "7.6%", "5.0%"],
      ["Return on Invested Capital (%)", "35.0%", "30.0%", "11.0%", "7.0%"],
      ["EFFICIENCY", "", "", "", ""],
      ["Asset Turnover", "0.91x", "0.86x", "0.63x", "0.58x"],
      ["Inventory Turnover", "3.8x", "3.2x", "2.7x", "2.5x"],
      ["LEVERAGE", "", "", "", ""],
      ["Debt/Equity", "0.26x", "0.23x", "0.23x", "0.24x"],
      ["Net Debt ($B)", "0.2", "-0.8", "0.1", "0.3"],
      ["Interest Coverage", "30.0x", "28.0x", "14.0x", "8.0x"],
      ["GROWTH", "", "", "", ""],
      ["Revenue Growth YoY (%)", "26.0%", "7.5%", "-23.1%", "-15.0%"],
      ["EPS Growth YoY (%)", "68.0%", "0.5%", "-61.1%", "-50.0%"]
    ]
  },
  "SONY": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024", "TTM"],
    "rows": [
      ["VALUATION", "", "", "", ""],
      ["P/E Ratio", "9.8x", "9.7x", "10.8x", "10.5x"],
      ["P/S Ratio", "1.2x", "1.1x", "1.1x", "1.1x"],
      ["P/B Ratio", "2.2x", "2.1x", "2.1x", "2.0x"],
      ["EV/EBITDA", "7.5x", "7.5x", "7.8x", "7.5x"],
      ["PROFITABILITY", "", "", "", ""],
      ["Return on Equity (%)", "22.8%", "22.2%", "19.8%", "19.0%"],
      ["Return on Assets (%)", "4.2%", "4.0%", "3.5%", "3.3%"],
      ["Return on Invested Capital (%)", "8.0%", "8.0%", "7.5%", "7.0%"],
      ["EFFICIENCY", "", "", "", ""],
      ["Asset Turnover", "0.36x", "0.35x", "0.34x", "0.33x"],
      ["Inventory Turnover", "16.7x", "16.4x", "15.4x", "15.0x"],
      ["LEVERAGE", "", "", "", ""],
      ["Debt/Equity", "0.17x", "0.16x", "0.16x", "0.15x"],
      ["Net Debt ($B)", "-3.5", "-5.0", "-4.3", "-4.5"],
      ["Interest Coverage", "25.0x", "28.0x", "27.0x", "26.0x"],
      ["GROWTH", "", "", "", ""],
      ["Revenue Growth YoY (%)", "14.2%", "5.5%", "-1.1%", "2.0%"],
      ["EPS Growth YoY (%)", "10.0%", "4.9%", "-11.2%", "3.0%"]
    ]
  },
  "TXN": {
    "columns": ["Metric", "FY2022", "FY2023", "FY2024", "TTM"],
    "rows": [
      ["VALUATION", "", "", "", ""],
      ["P/E Ratio", "18.4x", "28.0x", "40.0x", "38.0x"],
      ["P/S Ratio", "8.0x", "8.2x", "10.0x", "9.5x"],
      ["P/B Ratio", "11.8x", "12.3x", "17.0x", "16.0x"],
      ["EV/EBITDA", "14.0x", "18.0x", "26.0x", "24.0x"],
      ["PROFITABILITY", "", "", "", ""],
      ["Return on Equity (%)", "63.0%", "50.0%", "38.7%", "36.0%"],
      ["Return on Assets (%)", "28.2%", "18.4%", "12.6%", "11.0%"],
      ["Return on Invested Capital (%)", "42.0%", "32.0%", "22.0%", "20.0%"],
      ["EFFICIENCY", "", "", "", ""],
      ["Asset Turnover", "0.65x", "0.50x", "0.41x", "0.38x"],
      ["Inventory Turnover", "3.0x", "2.0x", "1.6x", "1.5x"],
      ["LEVERAGE", "", "", "", ""],
      ["Debt/Equity", "0.62x", "0.87x", "1.11x", "1.15x"],
      ["Net Debt ($B)", "-2.1", "0.6", "4.3", "5.0"],
      ["Interest Coverage", "33.0x", "22.0x", "14.0x", "12.0x"],
      ["GROWTH", "", "", "", ""],
      ["Revenue Growth YoY (%)", "14.3%", "-12.5%", "-10.9%", "-3.0%"],
      ["EPS Growth YoY (%)", "22.4%", "-23.6%", "-26.6%", "-5.0%"]
    ]
  }
}
```
