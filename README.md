# SPX Strategy Command — v2

Production-ready multi-strategy SPX options dashboard with AI signals, live Greeks, OI/GEX analysis, and a real-time data health system.

---

## What's New in v2

| Feature | v1 | v2 |
|---------|----|----|
| Strategy signals | Rule-based only | Rule-based + Claude AI ranking |
| Greeks | None | Black-Scholes dollar-weighted per strategy |
| OI / GEX | None | Full OI chart, GEX, max pain, put/call walls |
| Data health | None | Live feed status bar with pulsing dot per feed |
| VIX strip | 4 metrics | VIX + VIX9D + VIX3M + HV20 + VVIX |
| Term structure | Slope value | Visual bar chart + slope indicator |
| Portfolio Greeks | None | Aggregated delta/theta/vega/gamma across open trades |
| AI narration | None | Claude ranks all active strategies with narration + exit timing |
| Levels | Basic | 14 levels incl. BB, EMA8/21, OI walls, max pain |
| Auto-refresh | Yes | Yes + live countdown timer |

---

## Strategies (all 20)

| Category | Strategies |
|----------|-----------|
| Neutral / Credit | Iron Condor, Iron Butterfly, Short Strangle, Short Straddle |
| Bullish | Long Call, Bull Call Spread, Bull Put Spread, Cash Secured Put, Long Call Butterfly |
| Bearish | Long Put, Bear Put Spread, Bear Call Spread, Long Put Butterfly, Short Call |
| Volatility | Long Straddle, Long Strangle |
| Calendars | Call Calendar, Put Calendar, Call Diagonal, Put Diagonal |

---

## Icons

All SVG icons use the exact same spec as the SPX Vol Ladder project:
- `strokeWidth="1.3"` · `strokeLinecap="round"` · `strokeLinejoin="round"`
- `width="16" height="16"` · `viewBox="0 0 24 24"`
- `fill="none"` · `stroke="currentColor"`

Tab icons: Market (signal waves), Alerts (lightning bolt), OI/GEX (bar chart), Trades (document).

---

## Data Health Bar

Every live feed gets its own pill with a pulsing green dot when healthy:
- **SPX** — price + OHLCV history (Yahoo Finance ^GSPC)
- **VIX** — implied vol (^VIX)
- **VIX9D** — 9-day vol (^VIX9D)
- **VIX3M** — 3-month vol (^VIX3M)
- **10Y Yield** — risk-free rate proxy (^TNX)
- **VVIX** — vol-of-vol (^VVIX)
- **Claude AI** — Anthropic API connectivity

Dot states: pulsing green = live, amber = delayed, red = failed.

---

## Greeks

Computed server-side-equivalent using Black-Scholes-Merton (European, continuous dividend):
- Dividend yield: 1.4% (SPX historical average)
- Risk-free rate: 5.3% (approximate current TNX)
- IV input: live VIX per strategy DTE
- Output: dollar-weighted (multiplied by 100 × contracts)

Key Greeks per strategy type:
- **Credit spreads** → Theta (daily income), Vega (IV risk), Gamma (acceleration risk)
- **Long options** → Delta (directional), Theta (decay), Vega (vol benefit)
- **Straddles/strangles** → Vega (primary driver), Gamma, Theta (headwind)
- **Calendars/diagonals** → Vega (term spread), Theta (differential decay), Delta (directional)

---

## Setup

### 1. Environment variables (Vercel)
```
DASHBOARD_PASSWORD=your_password_here
ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Deploy
```bash
# Push to GitHub → connect to Vercel → add env vars → auto-deploys
```

### 3. Local dev
```bash
npm install
npm run dev
# http://localhost:3000
```

---

## API Routes

| Route | Purpose |
|-------|---------|
| `GET /api/strategy-data` | All market data + analytics (SPX, VIX, VIX9D, VIX3M, TNX, VVIX, realized vol, term structure, Bollinger Bands, EMA8/21, GEX, OI chain, max pain, put/call walls, PCR, skew) |
| `POST /api/analyze` | Claude proxy — same pattern as existing Vol Ladder |

---

## Data Sources

All free:
- Yahoo Finance: `^GSPC`, `^VIX`, `^VIX9D`, `^VIX3M`, `^TNX`, `^VVIX`
- Options chain: Synthetic Black-Scholes model built from live VIX (Yahoo chain is unreliable server-side)
- AI: Anthropic Claude (`claude-sonnet-4-20250514`)

---

## File Structure

```
app/
  layout.js
  page.js                        ← Full dashboard (2,000+ lines React)
  api/
    strategy-data/route.js       ← Yahoo Finance + all analytics + GEX/OI
    analyze/route.js             ← Claude proxy
next.config.js
package.json
vercel.json
README.md
```
