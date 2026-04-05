# AI Chatbot Knowledge Base

This file defines the chatbot's guided navigation knowledge for tMIC.

```json
{
  "greeting": "Hi, I'm Mic! I'll guide you through tMIC based on your role. What best describes your role?",
  "roles": [
    {
      "id": "region-sales",
      "label": "Region Sales Manager",
      "icon": "📊",
      "prompt": "As a Region Sales Manager, which task would you like help with?",
      "scenarios": [
        {
          "id": "monitor-watchlist",
          "label": "Monitor Key Accounts & Financials",
          "summary": "Track performance and prepare for client conversations.",
          "steps": [
            "Open your Watchlist to see at-a-glance performance.",
            "Click a company to review its Company Profile.",
            "Check the Earnings calendar for upcoming reporting dates."
          ],
          "links": [
            { "label": "Watchlist", "href": "/watchlist/627836" },
            { "label": "Company Profile", "href": "/company-profile" },
            { "label": "Earnings", "href": "/earnings" }
          ]
        },
        {
          "id": "track-news",
          "label": "Track Industry News & Competitor Moves",
          "summary": "Stay informed on market signals affecting your accounts.",
          "steps": [
            "Open Market News and filter by sector or keyword.",
            "Review Press Release for official company announcements.",
            "Mark key dates in Event Calendar."
          ],
          "links": [
            { "label": "Market News", "href": "/market-news" },
            { "label": "Press Release", "href": "/press-release" },
            { "label": "Event Calendar", "href": "/event-calendar" }
          ]
        },
        {
          "id": "collaborate",
          "label": "Collaborate on Sales Reports",
          "summary": "Organize and share insights with your team.",
          "steps": [
            "Open Collaboration Playground and create a new canvas.",
            "Add card notes summarizing key findings.",
            "Use @mention to share with colleagues."
          ],
          "links": [
            { "label": "Collaboration Playground", "href": "/collaboration-playground" }
          ]
        }
      ]
    },
    {
      "id": "supply-chain",
      "label": "Supply Chain Analyst",
      "icon": "🌐",
      "prompt": "As a Supply Chain Analyst, what would you like to explore?",
      "scenarios": [
        {
          "id": "map-suppliers",
          "label": "Map Supplier Networks",
          "summary": "Visualize multi-tier supplier relationships and risks.",
          "steps": [
            "Go to Supply Chain Maps → Supplier to load the graph.",
            "Expand nodes to reveal Tier 1 and Tier 2 suppliers.",
            "Click a node to open its Company Profile."
          ],
          "links": [
            { "label": "Supplier Map", "href": "/supply-chain-maps/supplier" },
            { "label": "RMAP Overview", "href": "/supply-chain-maps" },
            { "label": "Company Profile", "href": "/company-profile" }
          ]
        },
        {
          "id": "competitor-ecosystem",
          "label": "Analyze Competitor Ecosystems",
          "summary": "Benchmark competitor supply chains and track M&A.",
          "steps": [
            "Open Supply Chain Maps → Competitor.",
            "Toggle to Customer view to see dependencies.",
            "Review M&A in Market Data for consolidation trends."
          ],
          "links": [
            { "label": "Competitor Map", "href": "/supply-chain-maps/competitor" },
            { "label": "Customer Map", "href": "/supply-chain-maps/customer" },
            { "label": "Market Data — M&A", "href": "/market-data/ma" }
          ]
        },
        {
          "id": "monitor-events",
          "label": "Monitor Supply Chain Events",
          "summary": "Track disruptions and emerging supply chain trends.",
          "steps": [
            "Visit Data Explore to browse supply chain datasets.",
            "Use Intelligence Search for specific supplier mentions.",
            "Check Market News and Event Calendar for disruption signals."
          ],
          "links": [
            { "label": "Data Explore", "href": "/data-explore" },
            { "label": "Market News", "href": "/market-news" },
            { "label": "Event Calendar", "href": "/event-calendar" }
          ]
        }
      ]
    },
    {
      "id": "investment-researcher",
      "label": "Investment Researcher",
      "icon": "🔬",
      "prompt": "As an Investment Researcher, which area would you like to explore?",
      "scenarios": [
        {
          "id": "deep-dive",
          "label": "Deep Dive Company Analysis",
          "summary": "Perform thorough financial and qualitative analysis.",
          "steps": [
            "Search a company in Company Profile for summary metrics.",
            "Review financials in the Financial Statement tab.",
            "Cross-reference with Market Data and Press Releases."
          ],
          "links": [
            { "label": "Company Profile", "href": "/company-profile" },
            { "label": "Market Data", "href": "/market-data" },
            { "label": "Press Release", "href": "/press-release" }
          ]
        },
        {
          "id": "market-themes",
          "label": "Explore Market Themes & M&A",
          "summary": "Identify macro trends and corporate consolidation activity.",
          "steps": [
            "Open Market Data → M&A to review recent deal flow.",
            "Use Data Explore to browse thematic datasets.",
            "Annotate findings in Collaboration Playground."
          ],
          "links": [
            { "label": "Market Data — M&A", "href": "/market-data/ma" },
            { "label": "Data Explore", "href": "/data-explore" },
            { "label": "Collaboration Playground", "href": "/collaboration-playground" }
          ]
        },
        {
          "id": "build-watchlist",
          "label": "Build a Research Watchlist",
          "summary": "Curate your coverage universe and monitor through earnings.",
          "steps": [
            "Create a new Watchlist to organize target companies.",
            "Add companies found through Company Profile research.",
            "Monitor Earnings and Event Calendar for key dates."
          ],
          "links": [
            { "label": "Create Watchlist", "href": "/watchlist/create" },
            { "label": "Watchlist", "href": "/watchlist/627836" },
            { "label": "Earnings", "href": "/earnings" }
          ]
        }
      ]
    }
  ]
}
```
