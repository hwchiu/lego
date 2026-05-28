# Dell Earnings Agent

Monitors Dell Q1 FY2027 earnings and exposes results via REST API.

## Setup

```bash
cp .env.example .env
# Edit .env — set ANTHROPIC_API_KEY
npm install
```

## Run

```bash
npm run dev          # development (ts-node)
npm run build        # compile to dist/
npm start            # production (compiled)
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |
| `PORT` | No | HTTP port (default: 3001) |
| `EARNINGS_DATE` | No | ISO UTC fallback if Claude can't resolve date |

## API

- `GET /api/earnings` — full agent state
- `GET /api/health` — `{ ok: true, status: "WAITING|LIVE|DONE" }`
