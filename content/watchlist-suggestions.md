# Watchlist AI Suggestions

This file contains curated lists of companies related to current events and topics,
used by the "Create Watchlist" page to pre-populate symbol lists.

## Current Events

### US-Iran Conflict (美伊戰爭)

Companies most affected by escalating US-Iran tensions — spanning defense contractors, energy producers, and cybersecurity firms:

| Symbol | Company | Reason |
|--------|---------|--------|
| LMT | Lockheed Martin | Leading US defense contractor; direct beneficiary of military spending |
| RTX | RTX Corporation (Raytheon) | Key missile & air defense systems supplier to US military |
| NOC | Northrop Grumman | Advanced defense electronics & stealth aircraft |
| GD | General Dynamics | Armored vehicles, naval systems, and munitions |
| BA | Boeing | Military aircraft and precision munitions |
| XOM | Exxon Mobil | Major oil producer; energy prices spike with Middle East tensions |
| CVX | Chevron | Integrated oil & gas; geopolitical risk premium |
| COP | ConocoPhillips | Upstream crude exposure to supply disruption |
| OXY | Occidental Petroleum | High oil-price leverage among US E&P companies |
| MPC | Marathon Petroleum | Refining margins benefit from crude price volatility |

```json
{
  "id": "event-us-iran",
  "label": "US-Iran Conflict",
  "symbols": ["LMT", "RTX", "NOC", "GD", "BA", "XOM", "CVX", "COP", "OXY", "MPC"]
}
```

---

### Anthropic Claude Code Source Code Leak

Companies in the AI and cybersecurity space most relevant to this event:

| Symbol | Company | Reason |
|--------|---------|--------|
| GOOGL | Alphabet (Google) | Major Anthropic investor (~$300M); competitive AI landscape |
| AMZN | Amazon | Lead Anthropic investor ($4B commitment); cloud AI services |
| MSFT | Microsoft | OpenAI partner; benefits from competitor credibility risk |
| NVDA | NVIDIA | AI chip infrastructure; Anthropic a major GPU customer |
| CRWD | CrowdStrike | Cybersecurity leader; enterprise demand surges after AI leaks |
| PANW | Palo Alto Networks | AI-powered security platform; direct relevance to code security |
| ZS | Zscaler | Zero-trust cloud security; protects AI workloads |
| OKTA | Okta | Identity & access management critical after code breaches |
| S | SentinelOne | AI-native cybersecurity detection and response |
| PLTR | Palantir | AI/data security and government-grade protection platforms |

```json
{
  "id": "event-claude-leak",
  "label": "Anthropic Claude Code Leak",
  "symbols": ["GOOGL", "AMZN", "MSFT", "NVDA", "CRWD", "PANW", "ZS", "OKTA", "S", "PLTR"]
}
```

---

### Taiwan-US Reciprocal Trade Agreement (臺美簽署「對等貿易協定」確立對等關稅15%)

Companies with significant Taiwan-US trade flows and supply chain exposure:

| Symbol | Company | Reason |
|--------|---------|--------|
| TC | TSMC (TSMC) | World's largest contract chipmaker; central to Taiwan-US trade |
| AAPL | Apple | >90% of iPhone production in Asia; direct tariff exposure |
| QCOM | Qualcomm | Fabless; chips manufactured in Taiwan |
| AVGO | Broadcom | Semiconductor & infrastructure; Taiwan manufacturing reliance |
| AMAT | Applied Materials | Semiconductor equipment exported to Taiwan fabs |
| LRCX | Lam Research | Key etch & deposition tools for Taiwan fabs |
| INTC | Intel | Expanding into contract manufacturing; competes with TSMC |
| TXN | Texas Instruments | Analog chips; significant Taiwan manufacturing |
| MU | Micron Technology | Memory chips; Taiwan production facilities |
| KLAC | KLA Corporation | Wafer inspection tools; critical Taiwan supply chain |

```json
{
  "id": "event-taiwan-us-trade",
  "label": "Taiwan-US Trade Agreement (15% Tariff)",
  "symbols": ["TC", "AAPL", "QCOM", "AVGO", "AMAT", "LRCX", "INTC", "TXN", "MU", "KLAC"]
}
```

---

## Topics

### Next-gen AI

Companies leading the next generation of artificial intelligence infrastructure, models, and applications:

| Symbol | Company | Reason |
|--------|---------|--------|
| NVDA | NVIDIA | Dominant AI accelerator GPU (H100/B200) provider |
| MSFT | Microsoft | Azure AI + OpenAI partnership; Copilot product suite |
| GOOGL | Alphabet | Gemini models; TPU hardware; DeepMind research |
| META | Meta Platforms | Llama open-source models; AI-driven ad platform |
| AMZN | Amazon | AWS Bedrock; Trainium/Inferentia chips; Anthropic stake |
| AAPL | Apple | Apple Intelligence on-device AI; M-series neural engine |
| AMD | AMD | MI300X GPU challenging NVIDIA; ROCm software stack |
| QCOM | Qualcomm | On-device AI (Snapdragon); NPU leadership in mobile |
| ARM | Arm Holdings | CPU IP powering AI edge devices and mobile NPUs |
| SMCI | Super Micro Computer | AI server rack integration; NVIDIA GPU server systems |

```json
{
  "id": "topic-next-gen-ai",
  "label": "Next-gen AI",
  "symbols": ["NVDA", "MSFT", "GOOGL", "META", "AMZN", "AAPL", "AMD", "QCOM", "ARM", "SMCI"]
}
```

---

### Semiconductors

Core semiconductor manufacturers and equipment companies driving chip innovation:

| Symbol | Company | Reason |
|--------|---------|--------|
| NVDA | NVIDIA | GPU/AI accelerator dominance |
| TC | TSMC | World's leading pure-play foundry |
| INTC | Intel | Diversified chipmaker; IDM 2.0 strategy |
| AMD | AMD | CPU/GPU market share gains vs INTC/NVDA |
| QCOM | Qualcomm | Mobile SoC and RF chip leader |
| ASML | ASML | Only maker of EUV lithography machines |
| AMAT | Applied Materials | Largest semiconductor equipment company |
| LRCX | Lam Research | Etch and deposition equipment |
| KLAC | KLA Corporation | Process control and inspection tools |
| MU | Micron Technology | DRAM and NAND memory leader |
| AVGO | Broadcom | ASICs, networking, and storage chips |
| TXN | Texas Instruments | Analog and embedded processors |

```json
{
  "id": "topic-semiconductors",
  "label": "Semiconductors",
  "symbols": ["NVDA", "TC", "INTC", "AMD", "QCOM", "ASML", "AMAT", "LRCX", "KLAC", "MU", "AVGO", "TXN"]
}
```

---

### 3D Fabric (Advanced Packaging)

Companies pioneering 3D chip stacking, advanced packaging, and heterogeneous integration:

| Symbol | Company | Reason |
|--------|---------|--------|
| TC | TSMC | CoWoS, SoIC, and InFO advanced packaging leader |
| NVDA | NVIDIA | H100/B200 use CoWoS HBM packaging |
| AMD | AMD | 3D V-Cache stacking; chiplet architecture |
| INTC | Intel | Foveros 3D stacking and EMIB interconnect |
| MU | Micron | HBM3E for AI accelerators; advanced DRAM packaging |
| AMKR | Amkor Technology | Leading OSAT for advanced packaging services |
| ASX | ASE Technology | Advanced packaging and testing services |
| SMCI | Super Micro Computer | AI server systems with advanced packaged chips |
| AMAT | Applied Materials | Advanced packaging deposition and etch equipment |
| ENTG | Entegris | Materials and process solutions for advanced packaging |

```json
{
  "id": "topic-3d-fabric",
  "label": "3D Fabric",
  "symbols": ["TC", "NVDA", "AMD", "INTC", "MU", "AMKR", "ASX", "SMCI", "AMAT", "ENTG"]
}
```

---

### US Reciprocal Tariff Policy (美國對等關稅政策)

Companies with significant exposure to US reciprocal tariff policy affecting imports and global supply chains:

| Symbol | Company | Reason |
|--------|---------|--------|
| AAPL | Apple | ~90% of hardware manufactured in China/Asia; high tariff risk |
| MSFT | Microsoft | Surface hardware; Azure data center hardware imports |
| AMZN | Amazon | Marketplace seller disruption; AWS hardware supply chain |
| TSLA | Tesla | Manufacturing in China for non-US sales; steel/aluminum imports |
| NKE | Nike | ~50% of footwear sourced from Vietnam/China |
| WMT | Walmart | Import-heavy retail; ~70% of goods from overseas |
| COST | Costco | Significant private-label imports affected by tariffs |
| TGT | Target | Heavy reliance on imported apparel and electronics |
| TC | TSMC | Semiconductor tariffs threaten chip supply cost |
| QCOM | Qualcomm | Chip designs manufactured overseas; US tariff exposure |

```json
{
  "id": "topic-reciprocal-tariff",
  "label": "US Reciprocal Tariff Policy",
  "symbols": ["AAPL", "MSFT", "AMZN", "TSLA", "NKE", "WMT", "COST", "TGT", "TC", "QCOM"]
}
```
