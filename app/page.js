"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ══════════════════════════════════════════════════════════════
// DESIGN SYSTEM — exact match to SPX Vol Ladder project
// ══════════════════════════════════════════════════════════════
const COLORS = {
  bg: "#0a0e1a",
  bgCard: "rgba(15,20,35,0.7)",
  border: "rgba(255,255,255,0.07)",
  text: "#e8ecf4",
  textMuted: "#a0b0c8",   // was #8892a4 — bumped up for readability
  textDim: "#6a7f95",     // was #556078 — bumped up so it's actually visible
  textDark: "#4a6070",    // was #3a4256 — was nearly invisible, now readable
  green: "#00e676",
  greenDim: "#26a69a",
  red: "#ff5252",
  redDim: "#ef5350",
  yellow: "#ffca28",
  blue: "#64b5f6",
  blueBright: "#42a5f5",
  purple: "#ab47bc",
  accent: "#0f3460",
  cyan: "#29b6f6",
};
const mono = "Arial, Helvetica, sans-serif";

// Card base style — used throughout
const C = {
  background: COLORS.bgCard,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 12,
  padding: "16px 18px",
};

// ══════════════════════════════════════════════════════════════
// ICONS — strokeWidth 1.3, strokeLinecap round, strokeLinejoin round
// width/height 16, viewBox "0 0 24 24", fill none, stroke currentColor
// ══════════════════════════════════════════════════════════════
const ICONS = {
  // Tab: Live Market — broadcast/signal waves
  market: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.636 5.636a9 9 0 1 0 12.728 0"/><path d="M8.464 8.464a5 5 0 1 0 7.072 0"/><circle cx="12" cy="12" r="1"/>
    </svg>
  ),
  // Tab: Strategy Alerts — lightning bolt
  alerts: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  // Tab: OI / GEX — bar chart
  oigex: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="6" height="13"/><rect x="9" y="2" width="6" height="18"/><rect x="16" y="11" width="6" height="9"/>
    </svg>
  ),
  // Tab: Trades — document/ledger
  trades: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  // Refresh — rotating arrows
  refresh: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  // Chevron down
  chevronDown: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  // Chevron up
  chevronUp: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  ),
  // AI / brain — sparkle star
  ai: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  // Trend up — rising arrow
  trendUp: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
  ),
  // Greeks / sigma — activity waveform
  greeks: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  // Exit / clock
  exit: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  // Warning / caution
  warning: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  // Feed health — wifi
  feed: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/>
    </svg>
  ),
};

// ══════════════════════════════════════════════════════════════
// BLACK-SCHOLES GREEKS (client-side, SPX European style)
// ══════════════════════════════════════════════════════════════
function normCDF(x) {
  const a1=0.254829592, a2=-0.284496736, a3=1.421413741, a4=-1.453152027, a5=1.061405429, p=0.3275911;
  const sign = x < 0 ? -1 : 1;
  const t = 1 / (1 + p * Math.abs(x) / Math.SQRT2);
  const y = 1 - (((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x/2);
  return 0.5 * (1 + sign * y);
}
function normPDF(x) { return Math.exp(-0.5*x*x) / Math.sqrt(2*Math.PI); }

function bsGreeks(S, K, T, sigma, r = 0.053, q = 0.014, type = "call") {
  if (T <= 0 || sigma <= 0 || S <= 0 || K <= 0) return { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0, price: 0 };
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S/K) + (r - q + sigma*sigma/2)*T) / (sigma*sqrtT);
  const d2 = d1 - sigma*sqrtT;
  const eqT = Math.exp(-q*T), erT = Math.exp(-r*T);
  const Nd1 = normCDF(d1), Nd2 = normCDF(d2);
  const Nd1n = normCDF(-d1), Nd2n = normCDF(-d2);
  const nd1 = normPDF(d1);

  if (type === "call") {
    const price = S*eqT*Nd1 - K*erT*Nd2;
    const delta = eqT * Nd1;
    const gamma = eqT * nd1 / (S * sigma * sqrtT);
    const theta = (-(S*eqT*nd1*sigma)/(2*sqrtT) - r*K*erT*Nd2 + q*S*eqT*Nd1) / 365;
    const vega  = S*eqT*nd1*sqrtT / 100;
    const rho   = K*T*erT*Nd2 / 100;
    return { delta, gamma, theta, vega, rho, price };
  } else {
    const price = K*erT*Nd2n - S*eqT*Nd1n;
    const delta = eqT * (Nd1 - 1);
    const gamma = eqT * nd1 / (S * sigma * sqrtT);
    const theta = (-(S*eqT*nd1*sigma)/(2*sqrtT) + r*K*erT*Nd2n - q*S*eqT*Nd1n) / 365;
    const vega  = S*eqT*nd1*sqrtT / 100;
    const rho   = -K*T*erT*Nd2n / 100;
    return { delta, gamma, theta, vega, rho, price };
  }
}

// Compute position-level Greeks for a strategy given live market data
function computeStrategyGreeks(stratId, m) {
  if (!m) return null;
  const { spx: S, vix, sma20 } = m;
  const ivAnnual = (vix / 100);
  const r = 0.053, q = 0.014;

  // Helper: compute net greeks for a spread (short - long)
  function spreadGreeks(shortK, longK, T, type) {
    const short = bsGreeks(S, shortK, T, ivAnnual, r, q, type);
    const long  = bsGreeks(S, longK,  T, ivAnnual, r, q, type);
    // Net: short minus long (from seller's perspective)
    return {
      delta: -(short.delta - long.delta),
      gamma: -(short.gamma - long.gamma),
      theta:  (short.theta - long.theta),  // positive theta for credit spread
      vega:  -(short.vega  - long.vega),
      price:   short.price - long.price,
    };
  }

  const T35 = 35/365, T21 = 21/365, T14 = 14/365, T7 = 7/365;
  // Strike targets based on delta approximations
  const shortPut  = Math.round(S * 0.972 / 5) * 5; // ~7Δ put
  const longPut   = Math.round(S * 0.957 / 5) * 5;
  const shortCall = Math.round(S * 1.018 / 5) * 5; // ~8Δ call
  const longCall  = Math.round(S * 1.033 / 5) * 5;
  const atmStrike = Math.round(S / 5) * 5;

  const Greeks = {};

  switch(stratId) {
    case "iron_condor": {
      const pg = spreadGreeks(shortPut, longPut, T35, "put");
      const cg = spreadGreeks(shortCall, longCall, T35, "call");
      Greeks.delta = (pg.delta + cg.delta) * 100;
      Greeks.gamma = (pg.gamma + cg.gamma) * 100 * S;
      Greeks.theta = (pg.theta + cg.theta) * 100;
      Greeks.vega  = (pg.vega  + cg.vega)  * 100;
      Greeks.credit = (pg.price + cg.price) * 100;
      break;
    }
    case "iron_butterfly": {
      const shortStrad = {
        delta: -(bsGreeks(S, atmStrike, T21, ivAnnual, r, q, "put").delta  + bsGreeks(S, atmStrike, T21, ivAnnual, r, q, "call").delta),
        gamma: -(bsGreeks(S, atmStrike, T21, ivAnnual, r, q, "put").gamma  + bsGreeks(S, atmStrike, T21, ivAnnual, r, q, "call").gamma),
        theta:   bsGreeks(S, atmStrike, T21, ivAnnual, r, q, "put").theta  + bsGreeks(S, atmStrike, T21, ivAnnual, r, q, "call").theta,
        vega:  -(bsGreeks(S, atmStrike, T21, ivAnnual, r, q, "put").vega   + bsGreeks(S, atmStrike, T21, ivAnnual, r, q, "call").vega),
        credit:  bsGreeks(S, atmStrike, T21, ivAnnual, r, q, "put").price  + bsGreeks(S, atmStrike, T21, ivAnnual, r, q, "call").price,
      };
      Greeks.delta  = shortStrad.delta * 100;
      Greeks.gamma  = shortStrad.gamma * 100 * S;
      Greeks.theta  = shortStrad.theta * 100;
      Greeks.vega   = shortStrad.vega  * 100;
      Greeks.credit = shortStrad.credit * 100;
      break;
    }
    case "short_strangle":
    case "short_straddle": {
      const K = stratId === "short_straddle" ? atmStrike : shortPut;
      const Kc = stratId === "short_straddle" ? atmStrike : shortCall;
      const putG  = bsGreeks(S, K,  T21, ivAnnual, r, q, "put");
      const callG = bsGreeks(S, Kc, T21, ivAnnual, r, q, "call");
      Greeks.delta  = -(putG.delta  + callG.delta)  * 100;
      Greeks.gamma  = -(putG.gamma  + callG.gamma)  * 100 * S;
      Greeks.theta  =  (putG.theta  + callG.theta)  * 100;
      Greeks.vega   = -(putG.vega   + callG.vega)   * 100;
      Greeks.credit =  (putG.price  + callG.price)  * 100;
      break;
    }
    case "call":
    case "bull_call_spread": {
      const T = T21;
      const K1 = Math.round(S * 1.01 / 5) * 5;
      if (stratId === "call") {
        const g = bsGreeks(S, K1, T, ivAnnual, r, q, "call");
        Greeks.delta = g.delta * 100; Greeks.gamma = g.gamma * 100 * S;
        Greeks.theta = g.theta * 100; Greeks.vega  = g.vega  * 100;
        Greeks.debit = -g.price * 100;
      } else {
        const K2 = Math.round(S * 1.015 / 5) * 5;
        const g1 = bsGreeks(S, K1, T35, ivAnnual, r, q, "call");
        const g2 = bsGreeks(S, K2, T35, ivAnnual, r, q, "call");
        Greeks.delta = (g1.delta - g2.delta) * 100; Greeks.gamma = (g1.gamma - g2.gamma) * 100 * S;
        Greeks.theta = (g1.theta - g2.theta) * 100; Greeks.vega  = (g1.vega  - g2.vega)  * 100;
        Greeks.debit = -(g1.price - g2.price) * 100;
      }
      break;
    }
    case "bull_put_spread":
    case "cash_secured_put": {
      const pg = stratId === "bull_put_spread"
        ? spreadGreeks(shortPut, longPut, T35, "put")
        : { ...bsGreeks(S, shortPut, T21, ivAnnual, r, q, "put"), theta: bsGreeks(S, shortPut, T21, ivAnnual, r, q, "put").theta };
      Greeks.delta  = stratId === "bull_put_spread" ? pg.delta * 100 : -bsGreeks(S, shortPut, T21, ivAnnual, r, q, "put").delta * 100;
      Greeks.gamma  = stratId === "bull_put_spread" ? pg.gamma * 100 * S : -bsGreeks(S, shortPut, T21, ivAnnual, r, q, "put").gamma * 100 * S;
      Greeks.theta  = pg.theta * 100;
      Greeks.vega   = pg.vega  * 100;
      Greeks.credit = pg.price * 100;
      break;
    }
    case "put":
    case "put_spread":
    case "bear_put_spread": {
      const K1 = Math.round(S * 0.99 / 5) * 5;
      if (stratId === "put") {
        const g = bsGreeks(S, K1, T21, ivAnnual, r, q, "put");
        Greeks.delta = g.delta * 100; Greeks.gamma = g.gamma * 100 * S;
        Greeks.theta = g.theta * 100; Greeks.vega  = g.vega  * 100;
        Greeks.debit = -g.price * 100;
      } else {
        const K2 = Math.round(S * 0.975 / 5) * 5;
        const g1 = bsGreeks(S, K1, T35, ivAnnual, r, q, "put");
        const g2 = bsGreeks(S, K2, T35, ivAnnual, r, q, "put");
        Greeks.delta = (g1.delta - g2.delta) * 100; Greeks.gamma = (g1.gamma - g2.gamma) * 100 * S;
        Greeks.theta = (g1.theta - g2.theta) * 100; Greeks.vega  = (g1.vega  - g2.vega)  * 100;
        Greeks.debit = -(g1.price - g2.price) * 100;
      }
      break;
    }
    case "bear_call_spread": {
      const cg2 = spreadGreeks(shortCall, longCall, T35, "call");
      Greeks.delta  = cg2.delta * 100; Greeks.gamma  = cg2.gamma * 100 * S;
      Greeks.theta  = cg2.theta * 100; Greeks.vega   = cg2.vega  * 100;
      Greeks.credit = cg2.price * 100;
      break;
    }
    case "short_call": {
      const g = bsGreeks(S, shortCall, T14, ivAnnual, r, q, "call");
      Greeks.delta = -g.delta * 100; Greeks.gamma = -g.gamma * 100 * S;
      Greeks.theta =  g.theta * 100; Greeks.vega  = -g.vega  * 100;
      Greeks.credit = g.price * 100;
      break;
    }
    case "long_straddle": {
      const pg = bsGreeks(S, atmStrike, T14, ivAnnual, r, q, "put");
      const cg = bsGreeks(S, atmStrike, T14, ivAnnual, r, q, "call");
      Greeks.delta = (pg.delta + cg.delta) * 100; Greeks.gamma = (pg.gamma + cg.gamma) * 100 * S;
      Greeks.theta = (pg.theta + cg.theta) * 100; Greeks.vega  = (pg.vega  + cg.vega)  * 100;
      Greeks.debit = -(pg.price + cg.price) * 100;
      break;
    }
    case "long_strangle": {
      const Kp = Math.round(S * 0.985 / 5) * 5, Kc2 = Math.round(S * 1.015 / 5) * 5;
      const pg = bsGreeks(S, Kp,  T21, ivAnnual, r, q, "put");
      const cg = bsGreeks(S, Kc2, T21, ivAnnual, r, q, "call");
      Greeks.delta = (pg.delta + cg.delta) * 100; Greeks.gamma = (pg.gamma + cg.gamma) * 100 * S;
      Greeks.theta = (pg.theta + cg.theta) * 100; Greeks.vega  = (pg.vega  + cg.vega)  * 100;
      Greeks.debit = -(pg.price + cg.price) * 100;
      break;
    }
    default: {
      // Calendar/diagonal — approx: long vega, positive theta differential
      // trendScore not in scope here; use m.trendScore safely
      const ts = m.trendScore ?? 0;
      Greeks.delta = ts > 0 ? 15 : -15;
      Greeks.gamma = -5;
      Greeks.theta = 12;
      Greeks.vega  = 80;
      Greeks.debit = -200;
    }
  }

  // Round all to 2dp
  for (const k of Object.keys(Greeks)) Greeks[k] = +Greeks[k].toFixed(2);
  return Greeks;
}

// ══════════════════════════════════════════════════════════════
// STRATEGY DEFINITIONS
// ══════════════════════════════════════════════════════════════
function buildStrategies(m) {
  if (!m) return [];
  const { spx: S, vix, rv20d, ivEdge, termSlope, trendScore, sma20, rvRank, vrpPct } = m;
  // Null-safe fallbacks — Yahoo Finance can return null for some symbols
  const _ivEdge    = ivEdge    ?? 0;
  const _termSlope = termSlope ?? 0;
  const _trendScore= trendScore?? 0;
  const _rvRank    = rvRank    ?? 50;
  const _sma20     = sma20     ?? S;
  const ivAnnual   = vix / 100;

  const all = [
    // ── NEUTRAL / CREDIT ────────────────────────────────────────────────
    {
      id: "iron_condor", name: "Iron Condor", type: "neutral", credit: true,
      icon: "≡",
      desc: "Sell OTM put spread + OTM call spread. Maximum profit if SPX expires between short strikes. The cornerstone of systematic premium selling.",
      conditions: () => vix >= 16 && vix <= 28 && _ivEdge > 0 && Math.abs(_trendScore) < 0.5,
      prob: () => Math.min(85, 68 + _ivEdge * 2 + (_termSlope > 0 ? 4 : 0)),
      keyGreeks: ["theta", "vega", "gamma"],
      setup: (g) => ({
        DTE: "28–35 DTE",
        "Short put": `~${Math.round(S * 0.972 / 5) * 5} (6–8Δ)`,
        "Short call": `~${Math.round(S * 1.018 / 5) * 5} (8–10Δ)`,
        Wings: "50pt spreads",
        "Target credit": g ? `~$${Math.abs(g.credit ?? 0).toFixed(0)}` : "live BS calc",
        "Hold time": "21–35 days",
      }),
      exitRules: [
        "Close at 50% of max credit — no exceptions",
        "Exit if either short strike hits 25Δ",
        "Hard stop: loss reaches 2× credit received",
        "Never hold below 14 DTE unless at 50%+ profit",
      ],
      why: () => `VIX ${vix.toFixed(1)} in optimal 16–28 range. IV/HV edge +${_ivEdge.toFixed(1)}pts gives sellers structural advantage. ${_termSlope > 0 ? `Contango term structure (+${_termSlope.toFixed(2)}) confirms stable vol environment.` : "Monitor term structure carefully."} ${Math.abs(_trendScore) < 0.3 ? "Price action range-bound — neutral structure ideal." : ""}`,
      rrRatio: "1:0.5 (credit)",
    },
    {
      id: "iron_butterfly", name: "Iron Butterfly", type: "neutral", credit: true,
      icon: "⌒",
      desc: "Sell ATM straddle, buy OTM wings. Higher credit than IC. Tighter profit range. Best on pinning days near max pain.",
      conditions: () => vix >= 14 && vix <= 22 && _ivEdge > 2 && Math.abs(_trendScore) < 0.3 && _rvRank < 40,
      prob: () => Math.min(78, 55 + _ivEdge * 2),
      keyGreeks: ["theta", "gamma", "vega"],
      setup: (g) => ({
        DTE: "7–21 DTE",
        Strike: `${Math.round(S / 5) * 5} (ATM / max pain)`,
        Wings: "30–40pt each side",
        "Target credit": g ? `~$${Math.abs(g.credit ?? 0).toFixed(0)}` : "live BS calc",
        "Hold time": "7–14 days",
      }),
      exitRules: [
        "Close at 25–35% profit — tighter than IC due to gamma risk",
        "Must exit by 7 DTE — gamma spikes dangerously here",
        "If tested: roll untested side toward tested side",
        "Never hold through expiry",
      ],
      why: () => `Low RV rank (${_rvRank.toFixed(0)}%) + IV edge +${_ivEdge.toFixed(1)}pts = elevated ATM premium. Butterfly captures maximum theta decay at the pin. VIX ${vix.toFixed(1)} supports high center-strike premium.`,
      rrRatio: "1:0.4 (credit)",
    },
    {
      id: "short_strangle", name: "Short Strangle", type: "neutral", credit: true,
      icon: "∩",
      desc: "Sell OTM put + OTM call (undefined risk). Higher credit than IC. Requires naked margin and active management.",
      conditions: () => vix >= 12 && vix <= 20 && _ivEdge > 3 && Math.abs(_trendScore) < 0.4,
      prob: () => Math.min(82, 72 + _ivEdge * 1.5),
      keyGreeks: ["theta", "vega", "delta"],
      setup: (g) => ({
        DTE: "21–30 DTE",
        "Short put": `~${Math.round(S * 0.972 / 5) * 5} (7Δ)`,
        "Short call": `~${Math.round(S * 1.018 / 5) * 5} (8Δ)`,
        "Target credit": g ? `~$${Math.abs(g.credit ?? 0).toFixed(0)}` : "live BS calc",
        Risk: "Undefined — add wing hedge",
        "Hold time": "14–21 days",
      }),
      exitRules: [
        "Close at 50% profit",
        "Roll tested side if delta exceeds 20 on either leg",
        "Buy 5Δ wing at entry as emergency hedge — always",
        "Hard exit if VIX spikes above 22 intraday",
      ],
      why: () => `VIX ${vix.toFixed(1)} in low regime + IV/HV edge +${_ivEdge.toFixed(1)}. Undefined risk compensated by superior credit vs IC. Only trade with buffer buying power and wing hedge.`,
      rrRatio: "1:0.6 (credit)",
    },
    {
      id: "short_straddle", name: "Short Straddle", type: "neutral", credit: true,
      icon: "▽",
      desc: "Sell ATM put + ATM call. Maximum theta but maximum gamma risk. High-conviction setup requiring very tight management.",
      conditions: () => vix >= 14 && vix <= 20 && _ivEdge > 5 && _rvRank < 30,
      prob: () => Math.min(72, 50 + _ivEdge * 2),
      keyGreeks: ["theta", "gamma", "vega"],
      setup: (g) => ({
        DTE: "14–21 DTE",
        Strike: `${Math.round(S / 5) * 5} (ATM)`,
        "Target credit": g ? `~$${Math.abs(g.credit ?? 0).toFixed(0)}` : "live BS calc",
        Risk: "Unlimited both directions",
        "Hold time": "7–14 days",
      }),
      exitRules: [
        "Profit target: 25–30% of credit — very tight",
        "Stop at 1× credit loss — tight stop, no debate",
        "Adjust at 10Δ breach: roll to new ATM",
        "Size at 50% of normal position due to risk",
      ],
      why: () => `Extreme IV/HV edge +${_ivEdge.toFixed(1)} with RV rank only ${_rvRank.toFixed(0)}% — rare maximum-premium setup. Requires active management. Keep size small.`,
      rrRatio: "1:0.3 (credit)",
    },
    // ── BULLISH ─────────────────────────────────────────────────────────
    {
      id: "call", name: "Long Call", type: "bullish", credit: false,
      icon: "↗",
      desc: "Buy OTM call. Defined risk with unlimited upside. Best when strong directional conviction with low IV.",
      conditions: () => _trendScore > 0.4 && vix < 22 && _rvRank > 35,
      prob: () => Math.min(68, 35 + _trendScore * 30),
      keyGreeks: ["delta", "theta", "vega"],
      setup: (g) => ({
        DTE: "14–30 DTE",
        Strike: `~${Math.round(S * 1.01 / 5) * 5} (30–40Δ)`,
        "Max risk": g ? `~$${Math.abs(g.debit ?? 0).toFixed(0)} debit` : "premium paid",
        Reward: "Unlimited above strike",
        "Hold time": "5–15 days",
      }),
      exitRules: [
        "Target 100–150% profit on option premium",
        "Stop at 50% loss of premium paid",
        "Never hold through expiry unless deep ITM",
        "Sell half at +75% — let rest run as free trade",
      ],
      why: () => `Strong bullish trend score +${_trendScore.toFixed(2)}. VIX ${vix.toFixed(1)} makes long options affordable. Buy directional convexity — theta headwind manageable at this DTE.`,
      rrRatio: "1:2+ (debit)",
    },
    {
      id: "bull_call_spread", name: "Bull Call Spread", type: "bullish", credit: false,
      icon: "↗",
      desc: "Buy lower call, sell higher call. Defined risk + defined reward. Lower cost than naked call. Best in moderate uptrends.",
      conditions: () => _trendScore > 0.25 && vix >= 16 && vix <= 32,
      prob: () => Math.min(72, 45 + _trendScore * 20 + (vix > 20 ? 5 : 0)),
      keyGreeks: ["delta", "theta", "vega"],
      setup: (g) => ({
        DTE: "21–35 DTE",
        "Buy strike": `~${Math.round(S * 1.005 / 5) * 5}`,
        "Sell strike": `~${Math.round(S * 1.015 / 5) * 5}`,
        "Net debit": g ? `~$${Math.abs(g.debit ?? 0).toFixed(0)}` : "40–60% of width",
        "Hold time": "10–21 days",
      }),
      exitRules: [
        "Close at 50–75% of max profit",
        "Exit at 50% debit loss",
        "Take 30% partial profit on first 50% move toward target",
        "Roll up if both legs go deep ITM and bull thesis intact",
      ],
      why: () => `Moderate bullish trend (${_trendScore.toFixed(2)}) with VIX ${vix.toFixed(1)}. Spread reduces premium cost vs naked call while maintaining directional exposure.`,
      rrRatio: "1:1.5 (debit)",
    },
    {
      id: "bull_put_spread", name: "Bull Put Spread", type: "bullish", credit: true,
      icon: "↗",
      desc: "Sell OTM put, buy lower put. Collect credit for a bullish directional bet. Theta works for you.",
      conditions: () => _trendScore > 0.1 && vix >= 18 && _ivEdge > 0,
      prob: () => Math.min(80, 65 + _trendScore * 12 + _ivEdge),
      keyGreeks: ["theta", "delta", "vega"],
      setup: (g) => ({
        DTE: "21–35 DTE",
        "Short put": `~${Math.round(S * 0.97 / 5) * 5} (8–10Δ)`,
        "Long put": `~${Math.round(S * 0.955 / 5) * 5}`,
        "Target credit": g ? `~$${Math.abs(g.credit ?? 0).toFixed(0)}` : "live BS calc",
        "Hold time": "14–25 days",
      }),
      exitRules: [
        "Close at 50% of max credit",
        "Roll down if short put delta exceeds 20",
        "Stop: loss = 2× credit received",
        "Do not defend below 15 DTE — close instead",
      ],
      why: () => `Bullish trend + IV/HV edge +${_ivEdge.toFixed(1)} — collect theta on a directional thesis. Credit spread provides margin efficiency.`,
      rrRatio: "1:0.5 (credit)",
    },
    {
      id: "cash_secured_put", name: "Cash Secured Put", type: "bullish", credit: true,
      icon: "↙",
      desc: "Sell OTM put secured by cash. Income strategy. Best when neutral-to-bullish near support.",
      conditions: () => _trendScore > -0.1 && vix >= 20 && S < _sma20 * 1.02,
      prob: () => Math.min(82, 72 + _ivEdge),
      keyGreeks: ["theta", "delta", "vega"],
      setup: (g) => ({
        DTE: "14–21 DTE",
        Strike: `~${Math.round(S * 0.965 / 5) * 5} (8–12Δ)`,
        Collateral: `${Math.round(S * 0.965 / 5) * 5} per contract`,
        "Target credit": g ? `~$${Math.abs(g.credit ?? 0).toFixed(0)}` : "live BS calc",
        "Hold time": "14–21 days",
      }),
      exitRules: [
        "Close at 50% of credit",
        "Defend at 20Δ — roll down and out 14+ days",
        "Accept assignment only if strategic SPX exposure desired",
        "Never roll below 5 DTE",
      ],
      why: () => `Near ${_sma20.toFixed(0)} SMA with elevated VIX ${vix.toFixed(1)} — collect rich put premium at a defined entry level. Neutral-to-bullish setup.`,
      rrRatio: "1:0.5 (credit)",
    },
    {
      id: "long_call_butterfly", name: "Long Call Butterfly", type: "bullish", credit: false,
      icon: "∧",
      desc: "Buy two calls at wing strikes, sell two at body. Maximum profit at exact body strike. Very cheap, high leverage on pin.",
      conditions: () => _trendScore > 0.2 && vix > 20 && _rvRank < 45,
      prob: () => Math.min(52, 22 + _trendScore * 20),
      keyGreeks: ["gamma", "theta", "vega"],
      setup: () => ({
        DTE: "21–35 DTE",
        "Lower wing": `~${Math.round(S * 1.005 / 5) * 5}`,
        "Body (2×)": `~${Math.round(S * 1.01 / 5) * 5}`,
        "Upper wing": `~${Math.round(S * 1.015 / 5) * 5}`,
        "Net debit": "Very small (5–15pts)",
        "Hold time": "14–25 days",
      }),
      exitRules: [
        "Target 100–200% on debit paid",
        "Exit if SPX moves 2% above upper wing",
        "Size at max 0.5% risk — this is a lotto trade",
        "Close if thesis changes",
      ],
      why: () => `Low cost, high reward asymmetric bet. VIX ${vix.toFixed(1)} elevated = cheap wings. Best as small-size add alongside a core neutral position.`,
      rrRatio: "1:10+ at pin (debit)",
    },
    // ── BEARISH ─────────────────────────────────────────────────────────
    {
      id: "put", name: "Long Put", type: "bearish", credit: false,
      icon: "↘",
      desc: "Buy OTM put. Defined risk downside exposure. Best with strong bearish catalyst and affordable IV.",
      conditions: () => _trendScore < -0.4 && vix < 26,
      prob: () => Math.min(65, 30 + Math.abs(_trendScore) * 28),
      keyGreeks: ["delta", "theta", "vega"],
      setup: (g) => ({
        DTE: "14–30 DTE",
        Strike: `~${Math.round(S * 0.99 / 5) * 5} (30–40Δ)`,
        "Max risk": g ? `~$${Math.abs(g.debit ?? 0).toFixed(0)} debit` : "premium paid",
        Reward: "Profits as SPX falls",
        "Hold time": "5–15 days",
      }),
      exitRules: [
        "Target 100–150% profit on premium",
        "Stop at 50% premium loss",
        "Roll strike down if deep ITM and still bearish",
        "Sell put spread against it to reduce cost if needed",
      ],
      why: () => `Strong bearish trend score ${_trendScore.toFixed(2)}. VIX ${vix.toFixed(1)} still affordable for buying puts. Directional downside conviction trade.`,
      rrRatio: "1:2+ (debit)",
    },
    {
      id: "put_spread", name: "Bear Put Spread", type: "bearish", credit: false,
      icon: "↘",
      desc: "Buy higher put, sell lower put. Defined cost + defined reward. More capital-efficient than naked put.",
      conditions: () => _trendScore < -0.2 && vix >= 16,
      prob: () => Math.min(68, 40 + Math.abs(_trendScore) * 22),
      keyGreeks: ["delta", "theta", "vega"],
      setup: (g) => ({
        DTE: "21–35 DTE",
        "Buy put": `~${Math.round(S * 0.995 / 5) * 5}`,
        "Sell put": `~${Math.round(S * 0.98 / 5) * 5}`,
        "Net debit": g ? `~$${Math.abs(g.debit ?? 0).toFixed(0)}` : "40–60% of width",
        "Hold time": "10–21 days",
      }),
      exitRules: [
        "Close at 50–75% of max profit",
        "Exit at 50% debit loss",
        "Trail stop if SPX drops sharply — lock in gains",
        "Roll down if both legs go deep ITM and bearish thesis intact",
      ],
      why: () => `Bearish trend ${_trendScore.toFixed(2)} — spread reduces debit cost vs naked put while capturing downside move.`,
      rrRatio: "1:1.5 (debit)",
    },
    {
      id: "bear_call_spread", name: "Bear Call Spread", type: "bearish", credit: true,
      icon: "↙",
      desc: "Sell lower call, buy higher call. Collect credit for a bearish bet. SPX must stay below short strike.",
      conditions: () => _trendScore < -0.1 && vix >= 18 && _ivEdge > 0,
      prob: () => Math.min(80, 65 + Math.abs(_trendScore) * 12 + _ivEdge),
      keyGreeks: ["theta", "delta", "vega"],
      setup: (g) => ({
        DTE: "21–35 DTE",
        "Short call": `~${Math.round(S * 1.03 / 5) * 5} (8–10Δ)`,
        "Long call": `~${Math.round(S * 1.045 / 5) * 5}`,
        "Target credit": g ? `~$${Math.abs(g.credit ?? 0).toFixed(0)}` : "live BS calc",
        "Hold time": "14–25 days",
      }),
      exitRules: [
        "Close at 50% of max credit",
        "Defend if short call delta exceeds 20",
        "Stop: loss = 2× credit received",
        "Do not defend below 15 DTE",
      ],
      why: () => `Bearish trend + IV edge — credit spread with cap on upside risk. Best if SPX stays below short strike.`,
      rrRatio: "1:0.5 (credit)",
    },
    {
      id: "long_put_butterfly", name: "Long Put Butterfly", type: "bearish", credit: false,
      icon: "∨",
      desc: "Buy two puts at wing strikes, sell two at body. Max profit at body strike at expiry. Asymmetric bearish pin trade.",
      conditions: () => _trendScore < -0.2 && vix > 20,
      prob: () => Math.min(50, 20 + Math.abs(_trendScore) * 18),
      keyGreeks: ["gamma", "theta", "vega"],
      setup: () => ({
        DTE: "21–35 DTE",
        Body: `~${Math.round(S * 0.99 / 5) * 5}`,
        Wings: "±10–15pts around body",
        "Net debit": "Very small",
        "Max reward": `~${Math.round(S * 0.005)} at pin`,
        "Hold time": "14–25 days",
      }),
      exitRules: [
        "Target 100–200% on debit paid",
        "Size at max 0.5% risk — asymmetric lotto",
        "Close if SPX rallies past the midpoint",
        "Let run if approaching body into expiry",
      ],
      why: () => `Cheap bearish pin trade. Minimal debit, maximum reward if SPX hits body at expiry. Best paired with a core IC as a directional hedge.`,
      rrRatio: "1:8+ at pin (debit)",
    },
    {
      id: "short_call", name: "Short Call", type: "bearish", credit: true,
      icon: "↘",
      desc: "Sell OTM call naked. Collect premium. SPX must stay below strike. Undefined risk above — active management required.",
      conditions: () => _trendScore < -0.3 && vix >= 20 && S > _sma20 * 0.99,
      prob: () => Math.min(82, 73 + Math.abs(_trendScore) * 10),
      keyGreeks: ["theta", "delta", "gamma"],
      setup: (g) => ({
        DTE: "14–21 DTE",
        Strike: `~${Math.round(S * 1.025 / 5) * 5} (7–10Δ)`,
        "Target credit": g ? `~$${Math.abs(g.credit ?? 0).toFixed(0)}` : "live BS calc",
        Risk: "Unlimited above strike",
        "Hold time": "7–14 days",
      }),
      exitRules: [
        "Close at 50% of credit received",
        "Buy back if delta exceeds 20 — roll up and out",
        "Hard stop: 3× credit loss — no debate",
        "Always have a defined-risk hedge on same expiry",
      ],
      why: () => `Strong bearish trend + SPX near SMA ${_sma20.toFixed(0)}. VIX ${vix.toFixed(1)} elevated — sell elevated call premium with conviction.`,
      rrRatio: "1:0.6 (credit)",
    },
    // ── VOLATILITY ──────────────────────────────────────────────────────
    {
      id: "long_straddle", name: "Long Straddle", type: "volatility", credit: false,
      icon: "V",
      desc: "Buy ATM put + ATM call. Profits from large move in either direction. Best pre-catalyst when IV is cheap.",
      conditions: () => vix < 18 && _rvRank > 30 && _ivEdge < 2,
      prob: () => Math.min(65, 35 + (20 - vix) * 1.2),
      keyGreeks: ["vega", "gamma", "theta"],
      setup: (g) => ({
        DTE: "7–21 DTE",
        Strike: `${Math.round(S / 5) * 5} (ATM)`,
        "Max risk": g ? `~$${Math.abs(g.debit ?? 0).toFixed(0)} debit` : "combined premium",
        Reward: "Unlimited in either direction",
        "Hold time": "3–10 days",
      }),
      exitRules: [
        "Target 50–100% on combined premium",
        "Exit profitable leg, hold other as free rider",
        "Cut at 40% total loss if vol does not materialize",
        "Exit if vol does not expand in first 48 hours",
      ],
      why: () => `VIX ${vix.toFixed(1)} historically cheap — if vol expansion comes, straddle doubles. RV rank ${_rvRank.toFixed(0)}% suggests realized vol likely to expand.`,
      rrRatio: "1:2+ (needs big move)",
    },
    {
      id: "long_strangle", name: "Long Strangle", type: "volatility", credit: false,
      icon: "∪",
      desc: "Buy OTM put + OTM call. Cheaper than straddle, needs larger move. Best when expecting a big move but unsure direction.",
      conditions: () => vix < 20 && _rvRank > 25,
      prob: () => Math.min(58, 28 + (20 - vix) * 1.0),
      keyGreeks: ["vega", "gamma", "theta"],
      setup: (g) => ({
        DTE: "14–30 DTE",
        "Put strike": `~${Math.round(S * 0.985 / 5) * 5} (15–20Δ)`,
        "Call strike": `~${Math.round(S * 1.015 / 5) * 5} (15–20Δ)`,
        "Max risk": g ? `~$${Math.abs(g.debit ?? 0).toFixed(0)} debit` : "combined debit",
        "Needs move": "~1.5% SPX to profit",
        "Hold time": "5–15 days",
      }),
      exitRules: [
        "Target 75–100% combined profit",
        "Exit profitable leg, leave runner",
        "Stop at 40% total premium loss",
        "Never hold through a known catalyst already fully priced in",
      ],
      why: () => `VIX ${vix.toFixed(1)} cheap — OTM strangle gives vol convexity at lower cost than straddle. Best ahead of unknown catalysts.`,
      rrRatio: "1:2 (needs big move)",
    },
    // ── CALENDARS ──────────────────────────────────────────────────────
    {
      id: "call_calendar", name: "Call Calendar", type: "calendar", credit: false,
      icon: "↕",
      desc: "Buy far call, sell near call at same strike. Profits from time decay differential and term structure slope.",
      conditions: () => _termSlope > 0.5 && vix > 15 && Math.abs(_trendScore) < 0.5,
      prob: () => Math.min(68, 50 + _termSlope * 8),
      keyGreeks: ["vega", "theta", "delta"],
      setup: () => ({
        "Near leg": "14–21 DTE short",
        "Far leg": "35–45 DTE long",
        Strike: `~${Math.round(S / 5) * 5} (ATM)`,
        "Net debit": "Small debit",
        "Hold time": "7–14 days (close before near expires)",
      }),
      exitRules: [
        "Close BEFORE near leg expires — never let it expire worthless",
        "Target 25–40% on total debit paid",
        "Exit if SPX moves 2% from strike",
        "Can roll near leg out if trade is working",
      ],
      why: () => `Positive vol term slope +${_termSlope.toFixed(2)} — sell expensive near-term vol, own cheap far vol. Calendar captures slope premium with theta advantage.`,
      rrRatio: "1:1 (debit)",
    },
    {
      id: "put_calendar", name: "Put Calendar", type: "calendar", credit: false,
      icon: "↕",
      desc: "Buy far put, sell near put. Bearish-neutral. Profits from time decay differential + potential SPX softness.",
      conditions: () => _termSlope > 0.3 && _trendScore < 0.1,
      prob: () => Math.min(65, 48 + _termSlope * 6),
      keyGreeks: ["vega", "theta", "delta"],
      setup: () => ({
        "Near leg": "14–21 DTE short",
        "Far leg": "35–45 DTE long",
        Strike: `~${Math.round(S * 0.985 / 5) * 5} (15–20Δ)`,
        "Net debit": "Small debit",
        "Hold time": "7–14 days",
      }),
      exitRules: [
        "Close before near leg expires",
        "Target 25–40% on total debit",
        "Exit if SPX gaps through strike",
        "Roll near leg at 50% decay if thesis intact",
      ],
      why: () => `Sell near-term put premium into VIX ${vix.toFixed(1)}, own far puts for protection. Term slope +${_termSlope.toFixed(2)} provides structural edge.`,
      rrRatio: "1:1 (debit)",
    },
    {
      id: "call_diagonal", name: "Call Diagonal", type: "calendar", credit: false,
      icon: "↗",
      desc: "Buy far ATM call, sell near OTM call. Directional + time decay. Roll near leg repeatedly for income.",
      conditions: () => _trendScore > 0.2 && _termSlope > 0.2,
      prob: () => Math.min(65, 45 + _trendScore * 15 + _termSlope * 5),
      keyGreeks: ["delta", "vega", "theta"],
      setup: () => ({
        "Near leg": "14–21 DTE short OTM call",
        "Far leg": "35–45 DTE long ATM call",
        Roll: "Roll short leg when 50% decayed",
        "Hold time": "21–35 days",
      }),
      exitRules: [
        "Roll short call when it decays 50% — generates income",
        "Close full position at 40% profit on total debit",
        "Exit if short call goes deep ITM — stop rolling",
        "Book profit on long leg if SPX hits directional target",
      ],
      why: () => `Bullish trend +${_trendScore.toFixed(2)} + positive term slope +${_termSlope.toFixed(2)} = diagonal earns from direction AND time decay. Income-generating directional trade.`,
      rrRatio: "1:1.5 (debit)",
    },
    {
      id: "put_diagonal", name: "Put Diagonal", type: "calendar", credit: false,
      icon: "↘",
      desc: "Buy far ATM put, sell near OTM put. Bearish directional + time decay. Roll near leg for income.",
      conditions: () => _trendScore < -0.2 && _termSlope > 0.2,
      prob: () => Math.min(65, 45 + Math.abs(_trendScore) * 15 + _termSlope * 5),
      keyGreeks: ["delta", "vega", "theta"],
      setup: () => ({
        "Near leg": "14–21 DTE short OTM put",
        "Far leg": "35–45 DTE long ATM put",
        Roll: "Roll short leg when 50% decayed",
        "Hold time": "21–35 days",
      }),
      exitRules: [
        "Roll short put when 50% decayed",
        "Close full at 40% profit on total debit",
        "Exit if short put goes deep ITM",
        "Size: 1–2% risk on full diagonal",
      ],
      why: () => `Bearish trend ${_trendScore.toFixed(2)} + term slope — diagonal earns time decay income while maintaining downside exposure.`,
      rrRatio: "1:1.5 (debit)",
    },
  ];

  return all.map(s => ({
    ...s,
    active: s.conditions(),
    probValue: +s.prob().toFixed(1),
    greeks: computeStrategyGreeks(s.id, m),
  }));
}

// ══════════════════════════════════════════════════════════════
// AI ANALYSIS via Claude proxy
// ══════════════════════════════════════════════════════════════
async function runClaudeAnalysis(m, strategies, pw) {
  const active = strategies.filter(s => s.active).slice(0, 12);
  const systemPrompt = `You are an expert SPX options strategist. Analyze market conditions and rank strategies. Return ONLY valid JSON, no prose, no markdown.`;
  const prompt = `
<context>
SPX: ${m.spx.toFixed(2)} | Change: ${m.changePct?.toFixed(2)}%
VIX: ${m.vix.toFixed(1)} | VIX9D: ${m.vix9d.toFixed(1)} | VIX3M: ${m.vix3m.toFixed(1)}
IV/HV Edge (20d): ${m.ivEdge?.toFixed(2)} | VRP: ${m.vrpPct?.toFixed(1)}%
Term slope: ${m.termSlope?.toFixed(2)} (${m.termStructure})
Trend score: ${m.trendScore?.toFixed(2)} | RV Rank: ${m.rvRank?.toFixed(0)}%
Regime: ${m.regime}
VVIX: ${m.vvix?.toFixed(1) ?? "N/A"}
GEX: ${m.gexRegime} | Skew: ${m.skewProxy}
OI PCR: ${m.oiPcr?.toFixed(2) ?? "N/A"} | Max pain: ${m.maxPain}
Put wall: ${m.putWall} | Call wall: ${m.callWall}
BB upper: ${m.bbUpper?.toFixed(0)} | BB lower: ${m.bbLower?.toFixed(0)}
</context>

<strategies>
${active.map(s => `${s.id}: type=${s.type}, credit=${s.credit}, prob=${s.probValue}%, theta=${s.greeks?.theta?.toFixed(2) ?? "?"}/day, vega=${s.greeks?.vega?.toFixed(2) ?? "?"}`).join("\n")}
</strategies>

<instructions>
Score each active strategy 0-100. Weight: POP 30%, risk-reward 25%, theta efficiency 20%, IV context 15%, market fit 10%.
Penalize premium-selling if IV rank below 30%. Penalize short delta in backwardation. Reward straddle/strangle buys if IV cheap.
Think step by step before scoring.
</instructions>

<output_format>
Return exactly this JSON:
{
  "regime_summary": "one sentence about current market regime",
  "key_risk": "one sentence about biggest risk right now",
  "rankings": [
    {"id": "strategy_id", "rank": 1, "score": 85, "narration": "one sentence why now", "exit_timing": "specific exit guidance"}
  ]
}
Only include active strategies. Sort by rank ascending.
</output_format>`;

  const res = await fetch(`/api/analyze?pw=${encodeURIComponent(pw || "")}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, systemPrompt }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || "Analyze API error");
  const text = data.text || "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in response");
  return JSON.parse(match[0]);
}

// ══════════════════════════════════════════════════════════════
// EXTERNAL AI ANALYSIS — Grok (xAI) and OpenAI
// ══════════════════════════════════════════════════════════════
async function runExternalAI(provider, m, strategies, pw) {
  const active = strategies.filter(s => s.active).slice(0, 12);
  const prompt = `You are an expert SPX options strategist. Analyze these market conditions and rank the strategies below.

MARKET: SPX ${m.spx?.toFixed(2)} (${m.changePct >= 0 ? "+" : ""}${m.changePct?.toFixed(2)}%) | VIX ${m.vix?.toFixed(1)} | IV/HV Edge ${m.ivEdge?.toFixed(1)}pts | Term slope ${m.termSlope?.toFixed(2)} (${m.termStructure}) | Trend ${m.trendScore?.toFixed(2)} | RV Rank ${m.rvRank?.toFixed(0)}% | Regime: ${m.regime} | GEX: ${m.gexRegime} | Max Pain: ${m.maxPain} | Put Wall: ${m.putWall} | Call Wall: ${m.callWall}

ACTIVE STRATEGIES:
${active.map(s => `- ${s.id}: type=${s.type}, credit=${s.credit}, prob=${s.probValue}%, theta=$${s.greeks?.theta?.toFixed(0) ?? "?"}/day`).join("\n")}

Return ONLY this JSON (no markdown, no explanation):
{"regime_summary":"one sentence","key_risk":"one sentence","rankings":[{"id":"strategy_id","rank":1,"score":85,"narration":"one sentence why now","exit_timing":"specific exit"}]}
Sort by rank ascending. Only include active strategies.`;

  const res = await fetch(`/api/external-ai?pw=${encodeURIComponent(pw || "")}&provider=${provider}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || `${provider} API error`);
  const text = data.text || "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in response");
  return JSON.parse(match[0]);
}
// ══════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    setLoading(true); setError(false);
    const res = await fetch(`/api/strategy-data?pw=${encodeURIComponent(pw)}`);
    if (res.ok) onLogin(pw); else setError(true);
    setLoading(false);
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(145deg, ${COLORS.bg} 0%, #0f1524 40%, #111927 100%)`, fontFamily: mono }}>
      <div style={{ background: "rgba(15,20,35,0.9)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 20, padding: "48px 40px", width: 380, textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.text, marginBottom: 4 }}>SPX STRATEGY</div>
        <div style={{ fontSize: 12, color: COLORS.textDark, letterSpacing: 2, marginBottom: 36, textTransform: "uppercase" }}>Command · v2</div>
        <input type="password" placeholder="Enter password" value={pw}
          onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ width: "100%", padding: "14px 18px", background: "rgba(255,255,255,0.04)",
            border: error ? `1px solid ${COLORS.red}` : "1px solid rgba(255,255,255,0.08)", borderRadius: 10,
            color: COLORS.text, fontSize: 15, outline: "none", boxSizing: "border-box", marginBottom: 20 }} />
        {error && <div style={{ color: COLORS.red, fontSize: 12, marginTop: -12, marginBottom: 12 }}>Wrong password</div>}
        <button onClick={handleSubmit} disabled={loading || !pw}
          style={{ width: "100%", padding: 14, background: `linear-gradient(135deg, ${COLORS.accent}, #1a2845)`,
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#a0b4d0", fontSize: 13,
            fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
            cursor: loading || !pw ? "not-allowed" : "pointer", opacity: !pw ? 0.5 : 1 }}>
          {loading ? "Verifying..." : "Enter"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════
export default function Home() {
  const [pw, setPw] = useState(null);
  if (!pw) return <LoginScreen onLogin={setPw} />;
  return <App pw={pw} />;
}

// ══════════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════════
function App({ pw }) {
  const [tab, setTab] = useState("market");
  const [mktData, setMktData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [grokResult, setGrokResult] = useState(null);
  const [grokLoading, setGrokLoading] = useState(false);
  const [grokError, setGrokError] = useState(null);
  const [openaiResult, setOpenaiResult] = useState(null);
  const [openaiLoading, setOpenaiLoading] = useState(false);
  const [openaiError, setOpenaiError] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [trades, setTrades] = useState([]);
  const [activeTrades, setActiveTrades] = useState([]);

  // Load persisted trades after mount (localStorage not available during SSR)
  useEffect(() => {
    try {
      const t = localStorage.getItem("spx_v2_trades");
      const a = localStorage.getItem("spx_v2_active");
      if (t) setTrades(JSON.parse(t));
      if (a) setActiveTrades(JSON.parse(a));
    } catch {}
  }, []);
  const [dismissed, setDismissed] = useState(new Set());
  const [stratFilter, setStratFilter] = useState("all");
  const [minProb, setMinProb] = useState(60);
  const [accountSize, setAccountSize] = useState(150000);
  const [riskPct, setRiskPct] = useState(1);
  const [refreshSecs, setRefreshSecs] = useState(60);
  const [nextRefresh, setNextRefresh] = useState(60);
  const autoRef = useRef(null);
  const countRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/strategy-data?pw=${encodeURIComponent(pw)}`);
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || `API ${res.status}`);
      setMktData(processData(json));
      setLastUpdated(new Date().toLocaleTimeString());
      setNextRefresh(refreshSecs);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, [pw, refreshSecs]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh with countdown
  useEffect(() => {
    clearInterval(autoRef.current); clearInterval(countRef.current);
    autoRef.current  = setInterval(fetchData, refreshSecs * 1000);
    countRef.current = setInterval(() => setNextRefresh(n => n > 0 ? n - 1 : refreshSecs), 1000);
    return () => { clearInterval(autoRef.current); clearInterval(countRef.current); };
  }, [fetchData, refreshSecs]);

  const saveTrades = useCallback((t, a) => {
    try { localStorage.setItem("spx_v2_trades", JSON.stringify(t)); localStorage.setItem("spx_v2_active", JSON.stringify(a)); } catch {}
  }, []);

  const strategies = useMemo(() => mktData ? buildStrategies(mktData) : [], [mktData]);
  const riskDollar = accountSize * riskPct / 100;

  const runAI = async () => {
    if (!mktData || !strategies.length) return;
    setAiLoading(true); setAiError(null);
    try {
      const result = await runClaudeAnalysis(mktData, strategies, pw);
      setAiResult(result);
    } catch (e) { setAiError(e.message); }
    setAiLoading(false);
  };

  const runGrok = async () => {
    if (!mktData || !strategies.length) return;
    setGrokLoading(true); setGrokError(null);
    try {
      const result = await runExternalAI("grok", mktData, strategies, pw);
      setGrokResult(result);
    } catch (e) { setGrokError(e.message); }
    setGrokLoading(false);
  };

  const runOpenAI = async () => {
    if (!mktData || !strategies.length) return;
    setOpenaiLoading(true); setOpenaiError(null);
    try {
      const result = await runExternalAI("openai", mktData, strategies, pw);
      setOpenaiResult(result);
    } catch (e) { setOpenaiError(e.message); }
    setOpenaiLoading(false);
  };

  const runCompare = async () => {
    setCompareOpen(true);
    if (!aiResult) runAI();
    if (!grokResult) runGrok();
    if (!openaiResult) runOpenAI();
  };

  // Tab bar styles — exact match to existing project
  const tabStyle = (active) => ({
    padding: "10px 22px 10px 18px", fontSize: 13, fontWeight: 700, fontFamily: mono, letterSpacing: 0.8,
    textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s",
    border: `1px solid ${active ? "rgba(255,255,255,0.08)" : "transparent"}`,
    borderBottom: active ? "1px solid #0f1524" : `1px solid ${COLORS.border}`,
    borderRadius: "8px 8px 0 0",
    background: active ? "linear-gradient(180deg, rgba(20,28,50,0.95) 0%, #0f1524 100%)" : "transparent",
    color: active ? COLORS.blue : COLORS.textDim,
    marginBottom: -1,
    display: "flex", alignItems: "center", gap: 8,
  });

  return (
    <>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:#0a0e1a}
        ::-webkit-scrollbar-thumb{background:#1e2a3a;border-radius:3px}
      `}</style>
      <div style={{ minHeight: "100vh", background: `linear-gradient(145deg, ${COLORS.bg} 0%, #0f1524 40%, #111927 100%)`,
        fontFamily: mono, color: COLORS.text }}>

        {/* ── HEADER — same structure as existing project ── */}
        <div style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          backdropFilter: "blur(12px)", background: "rgba(10,14,26,0.85)", position: "sticky", top: 0, zIndex: 20 }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 900, color: COLORS.text }}>SPX STRATEGY COMMAND</div>
            <div style={{ fontSize: 11, color: COLORS.textDark, letterSpacing: 2, textTransform: "uppercase" }}>v2 · Multi-Strategy · AI-Powered · Greeks · OI/GEX</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* VIX strip */}
            {mktData && [
              { label: "VIX",   val: mktData.vix?.toFixed(1),   col: mktData.vix > 25 ? COLORS.red : COLORS.yellow },
              { label: "VIX9D", val: mktData.vix9d?.toFixed(1), col: COLORS.yellow },
              { label: "VIX3M", val: mktData.vix3m?.toFixed(1), col: COLORS.yellow },
              { label: "HV20",  val: mktData.rv20d?.toFixed(1), col: COLORS.blue },
              { label: "VVIX",  val: mktData.vvix?.toFixed(1) ?? "—", col: COLORS.purple },
            ].map(({ label, val, col }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                padding: "3px 10px", background: "rgba(255,255,255,0.03)",
                border: `1px solid ${COLORS.border}`, borderRadius: 4 }}>
                <span style={{ fontSize: 9, color: COLORS.textDark, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: col }}>{val}</span>
              </div>
            ))}
            <div style={{ width: 1, height: 28, background: COLORS.border }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 8 }}>
                {mktData ? mktData.spx.toFixed(2) : "—"}
                <span style={{ fontSize: 12, color: COLORS.textDim }}>SPX</span>
                {mktData && <div style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.green,
                  boxShadow: `0 0 6px ${COLORS.green}`, animation: "pulse 2s ease-in-out infinite" }} />}
              </div>
              {mktData && (
                <div style={{ fontSize: 11, fontWeight: 700,
                  color: mktData.changePct >= 0 ? COLORS.green : COLORS.red, textAlign: "right" }}>
                  {mktData.changePct >= 0 ? "+" : ""}{mktData.changePct.toFixed(2)}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── DATA HEALTH BAR ── */}
        <DataHealthBar streamHealth={mktData?.streamHealth} loading={loading} lastUpdated={lastUpdated} nextRefresh={nextRefresh}
          aiResult={aiResult} grokResult={grokResult} openaiResult={openaiResult} />

        {/* ── BODY: sidebar + main ── */}
        <div style={{ display: "grid", gridTemplateColumns: "248px 1fr", minHeight: "calc(100vh - 120px)" }}>
          <Sidebar mktData={mktData} strategies={strategies} accountSize={accountSize} setAccountSize={setAccountSize}
            riskPct={riskPct} setRiskPct={setRiskPct} riskDollar={riskDollar}
            refreshSecs={refreshSecs} setRefreshSecs={setRefreshSecs}
            stratFilter={stratFilter} setStratFilter={setStratFilter}
            minProb={minProb} setMinProb={setMinProb}
            aiResult={aiResult} aiLoading={aiLoading} aiError={aiError} onRunAI={runAI}
            grokResult={grokResult} grokLoading={grokLoading} grokError={grokError} onRunGrok={runGrok}
            openaiResult={openaiResult} openaiLoading={openaiLoading} openaiError={openaiError} onRunOpenAI={runOpenAI}
            compareOpen={compareOpen} setCompareOpen={setCompareOpen} onRunCompare={runCompare}
            activeTrades={activeTrades} />

          <div style={{ overflow: "auto" }}>
            {/* Tab bar */}
            <div style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "0 24px",
              display: "flex", alignItems: "flex-end", background: "rgba(10,14,26,0.6)", position: "sticky", top: 0, zIndex: 10 }}>
              <button style={tabStyle(tab === "market")} onClick={() => setTab("market")}>{ICONS.market} Live Market</button>
              <button style={tabStyle(tab === "alerts")} onClick={() => setTab("alerts")}>{ICONS.alerts} Strategy Alerts</button>
              <button style={tabStyle(tab === "oigex")} onClick={() => setTab("oigex")}>{ICONS.oigex} OI / GEX</button>
              <div style={{ flex: 1 }} />
              <button style={tabStyle(tab === "trades")} onClick={() => setTab("trades")}>
                {ICONS.trades} Trades ({activeTrades.length})
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: "20px 24px 60px" }}>
              {error && (
                <div style={{ background: "rgba(255,82,82,0.08)", border: `1px solid ${COLORS.red}`, borderRadius: 8,
                  padding: "10px 14px", marginBottom: 16, fontSize: 12, color: COLORS.red, display: "flex", alignItems: "center", gap: 8 }}>
                  {ICONS.warning} Data error: {error} — showing last known data if available
                </div>
              )}
              {tab === "market"  && <MarketTab mktData={mktData} strategies={strategies} onRefresh={fetchData} loading={loading} />}
              {tab === "alerts"  && <AlertsTab mktData={mktData} strategies={strategies}
                aiResult={aiResult} grokResult={grokResult} openaiResult={openaiResult}
                dismissed={dismissed} setDismissed={setDismissed} stratFilter={stratFilter} minProb={minProb}
                riskDollar={riskDollar} activeTrades={activeTrades} setActiveTrades={setActiveTrades}
                trades={trades} setTrades={setTrades} saveTrades={saveTrades} lastUpdated={lastUpdated} />}
              {tab === "oigex"   && <OIGEXTab mktData={mktData} />}
              {tab === "trades"  && <TradesTab activeTrades={activeTrades} setActiveTrades={setActiveTrades}
                trades={trades} setTrades={setTrades} saveTrades={saveTrades} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// DATA HEALTH BAR — live feed status with pulsing dots
// ══════════════════════════════════════════════════════════════
function DataHealthBar({ streamHealth, loading, lastUpdated, nextRefresh, aiResult, grokResult, openaiResult }) {
  if (!streamHealth) return (
    <div style={{ background: "rgba(10,14,26,0.95)", borderBottom: `1px solid ${COLORS.border}`,
      padding: "6px 24px", display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.textDark,
        animation: "pulse 1.5s ease-in-out infinite" }} />
      <span style={{ fontSize: 10, color: COLORS.textDark, letterSpacing: 1, textTransform: "uppercase" }}>Initializing data feeds...</span>
    </div>
  );

  const marketFeeds = [
    { key: "spx",   label: "SPX",      critical: true  },
    { key: "vix",   label: "VIX",      critical: true  },
    { key: "vix9d", label: "VIX9D",    critical: false },
    { key: "vix3m", label: "VIX3M",    critical: false },
    { key: "tnx",   label: "10Y",      critical: false },
    { key: "vvix",  label: "VVIX",     critical: false },
  ];

  const aiFeeds = [
    { key: "claude",  label: "Claude",  ok: !!aiResult,      icon: "◆", color: COLORS.blue   },
    { key: "grok",    label: "Grok",    ok: !!grokResult,    icon: "✕", color: "#ff6b35"      },
    { key: "openai",  label: "OpenAI",  ok: !!openaiResult,  icon: "⬡", color: COLORS.green  },
  ];

  const allOk = marketFeeds.filter(f => f.critical).every(f => streamHealth[f.key]?.ok);

  const FeedPill = ({ label, ok, dotColor, valStr, loading: ld }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px",
      background: ok ? "rgba(0,230,118,0.06)" : "rgba(255,82,82,0.06)",
      border: `1px solid ${ok ? "rgba(0,230,118,0.2)" : "rgba(255,82,82,0.2)"}`, borderRadius: 12 }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, flexShrink: 0,
        boxShadow: ok ? `0 0 4px ${COLORS.green}88` : "none",
        animation: ok && !ld ? "pulse 2.5s ease-in-out infinite" : "none" }} />
      <span style={{ fontSize: 9, fontWeight: 700, color: ok ? COLORS.green : COLORS.red, letterSpacing: 0.5 }}>{label}</span>
      {valStr && <span style={{ fontSize: 9, color: COLORS.textDim }}>{valStr}</span>}
    </div>
  );

  const Divider = () => (
    <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)", flexShrink: 0, margin: "0 4px" }} />
  );

  return (
    <div style={{ background: "rgba(10,14,26,0.98)", borderBottom: `1px solid ${COLORS.border}`,
      padding: "5px 24px", display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>

      {/* Left: market data feeds */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {ICONS.feed}
        <span style={{ fontSize: 9, color: COLORS.textDark, letterSpacing: 2, textTransform: "uppercase", marginRight: 2 }}>Data</span>
        {marketFeeds.map(({ key, label }) => {
          const h = streamHealth[key];
          const ok = h?.ok ?? false;
          const valStr = h?.price != null ? ` ${h.price.toFixed ? h.price.toFixed(key === "tnx" ? 2 : 1) : h.price}` : "";
          return <FeedPill key={key} label={label} ok={ok} dotColor={ok ? COLORS.green : COLORS.red} valStr={valStr} loading={loading} />;
        })}
      </div>

      <Divider />

      {/* Center: AI model feeds */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ fontSize: 9, color: COLORS.textDark, letterSpacing: 2, textTransform: "uppercase", marginRight: 2 }}>AI</span>
        {aiFeeds.map(({ key, label, ok, icon, color }) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px",
            background: ok ? `${color}10` : "rgba(255,255,255,0.03)",
            border: `1px solid ${ok ? color + "40" : "rgba(255,255,255,0.06)"}`, borderRadius: 12 }}>
            <span style={{ fontSize: 8, color: ok ? color : COLORS.textDark }}>{icon}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: ok ? color : COLORS.textDark, letterSpacing: 0.5 }}>{label}</span>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: ok ? color : COLORS.textDark, flexShrink: 0,
              boxShadow: ok ? `0 0 4px ${color}88` : "none",
              animation: ok ? "pulse 2.5s ease-in-out infinite" : "none" }} />
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {/* Right: status + timing */}
      <div style={{ fontSize: 9, color: COLORS.textDark }}>
        {allOk
          ? <span style={{ color: COLORS.greenDim }}>All feeds live</span>
          : <span style={{ color: COLORS.yellow }}>Some feeds degraded</span>}
        {lastUpdated && ` · Synced ${lastUpdated}`}
        {nextRefresh != null && ` · Next in ${nextRefresh}s`}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════════════════════════
function Sidebar({ mktData, strategies, accountSize, setAccountSize, riskPct, setRiskPct, riskDollar,
  refreshSecs, setRefreshSecs, stratFilter, setStratFilter, minProb, setMinProb,
  aiResult, aiLoading, aiError, onRunAI,
  grokResult, grokLoading, grokError, onRunGrok,
  openaiResult, openaiLoading, openaiError, onRunOpenAI,
  compareOpen, setCompareOpen, onRunCompare,
  activeTrades }) {

  const regime = mktData?.regime ?? "NEUTRAL";
  const regColors = { BULLISH: COLORS.green, BEARISH: COLORS.red, NEUTRAL: COLORS.yellow, VOLATILE: COLORS.purple };
  const regBg  = { BULLISH: "rgba(0,230,118,.06)", BEARISH: "rgba(255,82,82,.06)", NEUTRAL: "rgba(255,202,40,.06)", VOLATILE: "rgba(171,71,188,.06)" };
  const col = regColors[regime] ?? COLORS.yellow;
  const activeCount = strategies.filter(s => s.active).length;

  const sbl = { fontSize: 9, color: COLORS.textDim, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
    borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 4, marginBottom: 8 };
  const inp = { background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 4,
    color: COLORS.text, fontFamily: mono, fontSize: 11, padding: "5px 8px", outline: "none", width: "100%" };
  const mr  = { display: "flex", justifyContent: "space-between", padding: "4px 0",
    borderBottom: `1px solid ${COLORS.border}`, fontSize: 10 };

  // Reusable AI provider box
  const AIBox = ({ label, icon, bgColor, result, loading, error, onRun }) => {
    const topRank = result?.rankings?.[0];
    const topName = topRank ? (strategies.find(s => s.id === topRank.id)?.name ?? topRank.id) : null;
    return (
      <div style={{ background: `${bgColor}08`, border: `1px solid ${bgColor}25`, borderRadius: 7, padding: "9px 11px", marginBottom: 7 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 12, color: bgColor }}>{icon}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: bgColor, letterSpacing: 0.5 }}>{label}</span>
          </div>
          {topRank && !loading && (
            <span style={{ fontSize: 8, padding: "1px 6px", borderRadius: 8, background: `${bgColor}18`,
              color: bgColor, border: `1px solid ${bgColor}40`, fontWeight: 700 }}>
              #{topRank.rank} · {topRank.score}/100
            </span>
          )}
        </div>
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: COLORS.textMuted, fontSize: 10, marginBottom: 5 }}>
            <div style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>{ICONS.refresh}</div>
            Analyzing...
          </div>
        )}
        {error && !loading && <div style={{ fontSize: 9, color: COLORS.red, marginBottom: 4, lineHeight: 1.4 }}>{error}</div>}
        {topName && !loading && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.text, marginBottom: 2 }}>{topName}</div>
            {result?.regime_summary && (
              <div style={{ fontSize: 9, color: COLORS.textMuted, lineHeight: 1.5, marginBottom: 3 }}>{result.regime_summary}</div>
            )}
            {result?.key_risk && (
              <div style={{ fontSize: 9, color: COLORS.yellow, lineHeight: 1.4, display: "flex", gap: 4 }}>
                <span style={{ flexShrink: 0 }}>⚠</span><span>{result.key_risk}</span>
              </div>
            )}
          </>
        )}
        {!topName && !loading && !error && (
          <div style={{ fontSize: 9, color: COLORS.textDim, marginBottom: 3 }}>Not yet run</div>
        )}
        <button onClick={onRun} disabled={loading || !mktData}
          style={{ width: "100%", marginTop: 6, padding: "5px 8px",
            background: `${bgColor}10`, border: `1px solid ${bgColor}30`,
            color: bgColor, fontFamily: mono, fontSize: 9, fontWeight: 700,
            cursor: loading || !mktData ? "not-allowed" : "pointer",
            borderRadius: 3, letterSpacing: 1, textTransform: "uppercase",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
          {ICONS.ai} {loading ? "Analyzing..." : topName ? "Re-run" : "Run Analysis"}
        </button>
      </div>
    );
  };

  const anyResults = aiResult || grokResult || openaiResult;
  const allThree   = aiResult && grokResult && openaiResult;

  return (
    <div style={{ background: "rgba(10,14,26,0.97)", borderRight: `1px solid ${COLORS.border}`,
      padding: "16px 14px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Regime */}
      <div>
        <div style={sbl}>Market Regime</div>
        <div style={{ background: regBg[regime], border: `1px solid ${col}30`, borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Current</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: col, letterSpacing: 2, marginBottom: 8 }}>{regime}</div>
          {mktData && [
            { k: "Term slope",  v: `${(mktData.termSlope ?? 0) > 0 ? "+" : ""}${(mktData.termSlope ?? 0).toFixed(2)} ${mktData.termStructure}`, c: mktData.termSlope > 0 ? COLORS.green : COLORS.red },
            { k: "IV/HV edge",  v: `${(mktData.ivEdge ?? 0) > 0 ? "+" : ""}${(mktData.ivEdge ?? 0).toFixed(1)} pts`, c: (mktData.ivEdge ?? 0) > 2 ? COLORS.green : COLORS.yellow },
            { k: "VRP",         v: mktData.vrpPct != null ? `${mktData.vrpPct.toFixed(0)}% premium` : "—", c: (mktData.vrpPct ?? 0) > 15 ? COLORS.green : COLORS.yellow },
            { k: "Trend score", v: (mktData.trendScore ?? 0).toFixed(2), c: COLORS.text },
            { k: "GEX regime",  v: mktData.gexRegime, c: mktData.gexRegime === "positive" ? COLORS.green : COLORS.red },
            { k: "Active signals", v: `${activeCount}/20`, c: activeCount > 5 ? COLORS.green : COLORS.yellow },
          ].map(r => (
            <div key={r.k} style={mr}>
              <span style={{ color: COLORS.textMuted }}>{r.k}</span>
              <span style={{ fontWeight: 700, color: r.c }}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Greeks */}
      {activeTrades.length > 0 && mktData && (
        <div>
          <div style={sbl}>Portfolio Greeks (live)</div>
          <PortfolioGreeks activeTrades={activeTrades} mktData={mktData} />
        </div>
      )}

      {/* ── AI ANALYSIS ── */}
      <div>
        <div style={sbl}>AI Analysis</div>
        <AIBox label="Claude" icon="◆" bgColor={COLORS.blue}
          result={aiResult} loading={aiLoading} error={aiError} onRun={onRunAI} />
        <AIBox label="Grok (xAI)" icon="✕" bgColor="#ff6b35"
          result={grokResult} loading={grokLoading} error={grokError} onRun={onRunGrok} />
        <AIBox label="OpenAI GPT-4o" icon="⬡" bgColor={COLORS.green}
          result={openaiResult} loading={openaiLoading} error={openaiError} onRun={onRunOpenAI} />

        {/* Compare all 3 button */}
        <button onClick={onRunCompare} disabled={!mktData || aiLoading || grokLoading || openaiLoading}
          style={{ width: "100%", padding: "8px 10px", marginTop: 2,
            background: anyResults ? "rgba(255,202,40,.08)" : "rgba(255,255,255,.02)",
            border: `1px solid ${anyResults ? "rgba(255,202,40,.4)" : COLORS.border}`,
            color: anyResults ? COLORS.yellow : COLORS.textDim,
            fontFamily: mono, fontSize: 10, fontWeight: 700,
            cursor: !mktData ? "not-allowed" : "pointer",
            borderRadius: 5, letterSpacing: 1, textTransform: "uppercase",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .2s" }}>
          {ICONS.ai} Compare All 3
        </button>

        {/* Comparison panel */}
        {compareOpen && anyResults && (
          <div style={{ marginTop: 8, background: "rgba(255,202,40,.04)", border: "1px solid rgba(255,202,40,.2)",
            borderRadius: 7, padding: "10px 12px" }}>
            <div style={{ fontSize: 9, color: COLORS.yellow, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
              Top Pick Comparison
            </div>
            {[
              { label: "Claude",  result: aiResult,     col: COLORS.blue  },
              { label: "Grok",    result: grokResult,   col: "#ff6b35"    },
              { label: "OpenAI",  result: openaiResult, col: COLORS.green },
            ].map(({ label, result: r, col: c }) => {
              const top = r?.rankings?.[0];
              const topName = top ? (strategies.find(s => s.id === top.id)?.name ?? top.id) : null;
              return (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "5px 8px", marginBottom: 4, background: `${c}08`, borderRadius: 4, border: `1px solid ${c}20` }}>
                  <span style={{ color: c, fontWeight: 700, fontSize: 9, width: 48 }}>{label}</span>
                  <span style={{ color: topName ? COLORS.text : COLORS.textDim, fontWeight: 700, fontSize: 9, flex: 1, textAlign: "center" }}>
                    {topName ?? "Not run"}
                  </span>
                  <span style={{ color: COLORS.textDim, fontSize: 8, width: 32, textAlign: "right" }}>
                    {top?.score ?? "—"}/100
                  </span>
                </div>
              );
            })}
            {allThree && (() => {
              const picks = [aiResult, grokResult, openaiResult].map(r => r?.rankings?.[0]?.id);
              const allAgree  = picks[0] && picks[0] === picks[1] && picks[1] === picks[2];
              const twoAgree  = !allAgree && picks[0] && (picks[0] === picks[1] || picks[0] === picks[2] || picks[1] === picks[2]);
              const agreeBg   = allAgree ? "rgba(0,230,118,.1)" : twoAgree ? "rgba(255,202,40,.1)" : "rgba(255,82,82,.08)";
              const agreeCol  = allAgree ? COLORS.green : twoAgree ? COLORS.yellow : COLORS.red;
              return (
                <div style={{ padding: "7px 9px", borderRadius: 4, marginTop: 6, background: agreeBg,
                  border: `1px solid ${agreeCol}30` }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: agreeCol, marginBottom: 3 }}>
                    {allAgree ? "✓ All 3 Agree" : twoAgree ? "~ 2 of 3 Agree" : "✗ No Consensus"}
                  </div>
                  <div style={{ fontSize: 9, color: COLORS.textMuted, lineHeight: 1.5 }}>
                    {allAgree
                      ? `Strong signal — ${strategies.find(s => s.id === picks[0])?.name ?? picks[0]} is unanimous top pick.`
                      : twoAgree
                      ? "Two models agree. Review the outlier's reasoning before trading."
                      : "Models disagree — market conditions may be ambiguous. Size down or wait."}
                  </div>
                </div>
              );
            })()}
            <button onClick={() => setCompareOpen(false)}
              style={{ width: "100%", marginTop: 8, padding: "4px", background: "transparent",
                border: `1px solid ${COLORS.border}`, color: COLORS.textDim, fontFamily: mono,
                fontSize: 9, cursor: "pointer", borderRadius: 3 }}>
              Close
            </button>
          </div>
        )}
      </div>

      {/* Account */}
      <div>
        <div style={sbl}>Account</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10, color: COLORS.textMuted }}>Account Size ($)</label>
            <input type="number" value={accountSize} onChange={e => setAccountSize(+e.target.value || 150000)}
              style={inp} min={10000} step={5000} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10, color: COLORS.textMuted }}>
              Risk per trade: <strong style={{ color: COLORS.yellow }}>{riskPct.toFixed(2)}%</strong>
            </label>
            <input type="range" min={0.5} max={3} step={0.25} value={riskPct}
              onChange={e => setRiskPct(+e.target.value)} style={{ accentColor: COLORS.green, width: "100%", cursor: "pointer" }} />
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "6px 10px",
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: COLORS.textDim }}>Max risk / trade</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.yellow }}>${riskDollar.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div>
        <div style={sbl}>Alert Filters</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10, color: COLORS.textMuted }}>Min Probability (%)</label>
            <input type="number" value={minProb} onChange={e => setMinProb(+e.target.value || 60)}
              style={inp} min={50} max={95} step={5} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 10, color: COLORS.textMuted }}>Strategy filter</label>
            <select value={stratFilter} onChange={e => setStratFilter(e.target.value)}
              style={{ ...inp, appearance: "none", cursor: "pointer" }}>
              <option value="all">All Strategies</option>
              <option value="neutral">Neutral Only</option>
              <option value="bullish">Bullish Only</option>
              <option value="bearish">Bearish Only</option>
              <option value="volatility">Volatility Only</option>
              <option value="calendar">Calendars Only</option>
              <option value="credit">Credit Only</option>
              <option value="debit">Debit Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Refresh */}
      <div>
        <div style={sbl}>Auto Refresh</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <label style={{ fontSize: 10, color: COLORS.textMuted }}>
            Interval: <strong style={{ color: COLORS.text }}>{refreshSecs}s</strong>
          </label>
          <input type="range" min={15} max={300} step={15} value={refreshSecs}
            onChange={e => setRefreshSecs(+e.target.value)} style={{ accentColor: COLORS.cyan, width: "100%", cursor: "pointer" }} />
        </div>
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ background: "rgba(255,82,82,.05)", border: "1px solid rgba(255,82,82,.2)",
        borderRadius: 4, padding: "8px 10px", fontSize: 10, color: "rgba(255,120,120,.75)", lineHeight: 1.6 }}>
        ⚠ EDUCATIONAL USE ONLY — NOT FINANCIAL ADVICE. Options involve substantial risk of loss.
      </div>
    </div>
  );
}

// Portfolio Greeks aggregated across open trades
function PortfolioGreeks({ activeTrades, mktData }) {
  const agg = useMemo(() => {
    let delta = 0, gamma = 0, theta = 0, vega = 0;
    for (const t of activeTrades) {
      const g = computeStrategyGreeks(t.stratId, mktData);
      if (!g) continue;
      delta += g.delta ?? 0; gamma += g.gamma ?? 0;
      theta += g.theta ?? 0; vega  += g.vega  ?? 0;
    }
    return { delta: +delta.toFixed(2), gamma: +gamma.toFixed(2), theta: +theta.toFixed(2), vega: +vega.toFixed(2) };
  }, [activeTrades, mktData]);

  const cells = [
    { k: "Net Δ/day $", v: `${agg.delta >= 0 ? "+" : ""}$${agg.delta.toFixed(0)}`, c: Math.abs(agg.delta) > 500 ? COLORS.yellow : COLORS.text },
    { k: "Net θ/day $", v: `+$${Math.abs(agg.theta).toFixed(0)}`,                  c: COLORS.green },
    { k: "Net vega $",  v: `${agg.vega >= 0 ? "+" : ""}$${agg.vega.toFixed(0)}`,   c: agg.vega < 0 ? COLORS.red : COLORS.green },
    { k: "Net γ $",     v: `${agg.gamma >= 0 ? "+" : ""}$${agg.gamma.toFixed(0)}`,  c: agg.gamma < 0 ? COLORS.red : COLORS.text },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
      {cells.map(({ k, v, c }) => (
        <div key={k} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "5px 8px" }}>
          <div style={{ fontSize: 8, color: COLORS.textDark, letterSpacing: 1, textTransform: "uppercase" }}>{k}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: c }}>{v}</div>
        </div>
      ))}
      <div style={{ gridColumn: "1/-1", fontSize: 9, color: COLORS.textDark, marginTop: 2 }}>
        Dollar-weighted · Black-Scholes · {activeTrades.length} position{activeTrades.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MARKET TAB
// ══════════════════════════════════════════════════════════════
function MarketTab({ mktData, strategies, onRefresh, loading }) {
  if (!mktData) return <LoadingState />;
  const m = mktData;
  const up = m.changePct >= 0;
  const typeColors = { neutral: COLORS.cyan, bullish: COLORS.green, bearish: COLORS.red, volatility: COLORS.purple, calendar: COLORS.yellow };

  const metricCards = [
    { label: "SPX Price", val: m.spx.toFixed(2), sub: `${up ? "+" : ""}${m.changePct.toFixed(2)}%`, subCol: up ? COLORS.green : COLORS.red },
    { label: "VIX", val: m.vix?.toFixed(1), sub: m.vix > 25 ? "Elevated fear" : m.vix < 16 ? "Complacency" : "Normal range", col: m.vix > 25 ? COLORS.red : COLORS.yellow },
    { label: "IV/HV Edge", val: `${(m.ivEdge ?? 0) > 0 ? "+" : ""}${(m.ivEdge ?? 0).toFixed(1)}`, sub: (m.ivEdge ?? 0) > 2 ? "Sellers favored" : (m.ivEdge ?? 0) < 0 ? "Buyers favored" : "Neutral", col: (m.ivEdge ?? 0) > 2 ? COLORS.green : (m.ivEdge ?? 0) < 0 ? COLORS.red : COLORS.yellow },
    { label: "VRP", val: m.vrpPct != null ? `${m.vrpPct.toFixed(0)}%` : "—", sub: "IV premium over HV", col: (m.vrpPct ?? 0) > 15 ? COLORS.green : COLORS.yellow },
    { label: "Term Slope", val: (m.termSlope ?? 0).toFixed(2), sub: m.termStructure, col: m.termSlope > 0 ? COLORS.green : COLORS.red },
    { label: "1σ Move", val: m.sigma1day != null ? `±${m.sigma1day.toFixed(0)}` : "—", sub: m.sigma1day != null ? `±${(m.sigma1day / m.spx * 100).toFixed(2)}% today` : "loading", col: COLORS.cyan },
    { label: "Active Signals", val: strategies.filter(s => s.active).length, sub: `of 20 strategies`, col: COLORS.green },
  ];

  const conditions = [
    { label: "VIX level",      val: m.vix?.toFixed(1),   pass: m.vix >= 12 && m.vix <= 35, warn: m.vix > 28, note: m.vix > 28 ? "EXTREME — reduce size" : m.vix < 16 ? "Low — buy vol opportunities" : "Optimal premium-selling range" },
    { label: "IV vs HV edge",  val: `${(m.ivEdge ?? 0) > 0 ? "+" : ""}${(m.ivEdge ?? 0).toFixed(1)}`, pass: (m.ivEdge ?? 0) > 0, warn: (m.ivEdge ?? 0) < 0, note: (m.ivEdge ?? 0) > 3 ? "Strong seller structural edge" : (m.ivEdge ?? 0) > 0 ? "Slight edge — proceed carefully" : "No edge — avoid selling premium" },
    { label: "Term structure",  val: m.termStructure,      pass: m.termSlope > 0,  warn: m.termSlope < -0.3, note: m.termSlope > 0.5 ? "Healthy contango — stable" : m.termSlope < 0 ? "BACKWARDATION — stress signal" : "Near flat — watch closely" },
    { label: "HV20 vs VIX",    val: `${m.rv20d?.toFixed(1)}% vs ${m.vix?.toFixed(1)}`, pass: (m.rv20d ?? m.vix) < m.vix, warn: (m.rv20d ?? 0) > m.vix, note: (m.rv20d ?? 0) < m.vix ? "HV below IV — vol selling profitable" : "HV above IV — buyers win historically" },
    { label: "VVIX",           val: m.vvix?.toFixed(1) ?? "N/A", pass: !m.vvix || m.vvix < 120, warn: m.vvix > 120, note: !m.vvix ? "Not available" : m.vvix > 120 ? "Elevated — vol-of-vol stressed" : m.vvix > 100 ? "Mildly elevated — watch" : "Normal — vol surface stable" },
    { label: "GEX regime",     val: m.gexRegime,             pass: m.gexRegime === "positive", warn: false, note: m.gexRegime === "positive" ? "Positive GEX — dealer pinning, range-bound" : "Negative GEX — dealers amplifying moves" },
    { label: "Trend score",    val: (m.trendScore ?? 0).toFixed(2), pass: true, warn: Math.abs(m.trendScore ?? 0) > 0.5, note: Math.abs(m.trendScore ?? 0) > 0.5 ? "Strong trend — favor directional strategies" : "Range-bound — favor neutral/calendar" },
  ];

  const levels = [
    ["SPX Price",   m.spx.toFixed(2),                COLORS.text],
    ["Prev Close",  m.prevClose?.toFixed(2) ?? "—",  COLORS.yellow],
    ["20D SMA",     m.sma20?.toFixed(2) ?? "—",      COLORS.blue],
    ["EMA 8",       m.ema8?.toFixed(2) ?? "—",       COLORS.blueBright],
    ["EMA 21",      m.ema21?.toFixed(2) ?? "—",      COLORS.cyan],
    ["BB Upper",    m.bbUpper?.toFixed(2) ?? "—",    COLORS.purple],
    ["BB Lower",    m.bbLower?.toFixed(2) ?? "—",    COLORS.purple],
    ["1σ Upper",    m.sigma1day != null ? (m.spx + m.sigma1day).toFixed(2) : "—", COLORS.green],
    ["1σ Lower",    m.sigma1day != null ? (m.spx - m.sigma1day).toFixed(2) : "—", COLORS.red],
    ["52W High",    m.high52?.toFixed(2) ?? "—",     COLORS.greenDim],
    ["52W Low",     m.low52?.toFixed(2) ?? "—",      COLORS.redDim],
    ["Max Pain",    m.maxPain?.toString() ?? "—",    COLORS.yellow],
    ["Put Wall",    m.putWall?.toString() ?? "—",    COLORS.red],
    ["Call Wall",   m.callWall?.toString() ?? "—",   COLORS.green],
  ];

  const types = ["neutral","bullish","bearish","volatility","calendar"];

  return (
    <div>
      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: 18 }}>
        {metricCards.map(({ label, val, sub, col, subCol }) => (
          <div key={label} style={{ ...C, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: COLORS.textDark, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: col ?? COLORS.text }}>{val}</div>
            <div style={{ fontSize: 10, color: subCol ?? COLORS.textMuted, marginTop: 2 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* VIX term structure — connected dot sparkline */}
      <div style={{ ...C, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 14, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>
            VIX Term Structure
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 12,
            background: m.termSlope > 0 ? "rgba(0,230,118,.1)" : "rgba(255,82,82,.1)",
            color: m.termSlope > 0 ? COLORS.green : COLORS.red,
            border: `1px solid ${m.termSlope > 0 ? COLORS.green : COLORS.red}40` }}>
            {m.termSlope > 0 ? "↗ CONTANGO" : "↘ BACKWARDATION"}
          </div>
        </div>
        {(() => {
          const nodes = [
            { label: "VIX9D", sub: "9-day", val: m.vix9d ?? 0 },
            { label: "VIX",   sub: "30-day", val: m.vix ?? 0 },
            { label: "VIX3M", sub: "3-month", val: m.vix3m ?? 0 },
          ];
          const minV = Math.min(...nodes.map(n => n.val)) * 0.92;
          const maxV = Math.max(...nodes.map(n => n.val)) * 1.08;
          const range = maxV - minV || 1;
          // Normalize 0-100 for vertical positioning (inverted — high = up)
          const yPct = v => 100 - ((v - minV) / range * 100);
          const chartH = 80;
          const nodeW = 100 / nodes.length;
          return (
            <div style={{ position: "relative", height: chartH + 44, userSelect: "none" }}>
              {/* Grid lines */}
              {[0, 50, 100].map(pct => (
                <div key={pct} style={{ position: "absolute", left: 0, right: 0,
                  top: pct / 100 * chartH, borderTop: `1px dashed rgba(255,255,255,.06)` }} />
              ))}
              {/* SVG for connecting lines */}
              <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: chartH }}
                preserveAspectRatio="none" viewBox="0 0 100 100">
                {nodes.slice(0, -1).map((node, i) => {
                  const x1 = (i + 0.5) * nodeW;
                  const x2 = (i + 1.5) * nodeW;
                  const y1 = yPct(node.val);
                  const y2 = yPct(nodes[i + 1].val);
                  const going = nodes[i + 1].val > node.val;
                  return (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={going ? COLORS.green : COLORS.red}
                      strokeWidth="1.5" strokeLinecap="round"
                      strokeDasharray={going ? "none" : "3,2"} />
                  );
                })}
              </svg>
              {/* Nodes */}
              {nodes.map((node, i) => {
                const x = (i + 0.5) * nodeW;
                const y = yPct(node.val) / 100 * chartH;
                const isMin = node.val === Math.min(...nodes.map(n => n.val));
                const isMax = node.val === Math.max(...nodes.map(n => n.val));
                const dotCol = isMin ? COLORS.blue : isMax ? COLORS.red : COLORS.yellow;
                return (
                  <div key={node.label} style={{ position: "absolute", left: `${x}%`, top: y,
                    transform: "translate(-50%, -50%)" }}>
                    {/* Dot */}
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: dotCol,
                      border: `2px solid ${COLORS.bg}`, boxShadow: `0 0 6px ${dotCol}88`,
                      margin: "0 auto" }} />
                    {/* Value bubble */}
                    <div style={{ position: "absolute", top: -28, left: "50%", transform: "translateX(-50%)",
                      background: "rgba(15,20,35,0.95)", border: `1px solid ${dotCol}50`,
                      borderRadius: 4, padding: "1px 6px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: dotCol }}>{node.val.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
              {/* Labels row below chart */}
              <div style={{ position: "absolute", top: chartH + 8, left: 0, right: 0,
                display: "flex" }}>
                {nodes.map((node, i) => (
                  <div key={node.label} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted }}>{node.label}</div>
                    <div style={{ fontSize: 9, color: COLORS.textDim }}>{node.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
        {/* Plain-English summary */}
        <div style={{ marginTop: 12, padding: "8px 10px", borderRadius: 6,
          background: m.termSlope > 0 ? "rgba(0,230,118,.04)" : "rgba(255,82,82,.04)",
          border: `1px solid ${m.termSlope > 0 ? COLORS.green : COLORS.red}20` }}>
          <div style={{ fontSize: 10, color: m.termSlope > 0 ? COLORS.green : COLORS.red, fontWeight: 700, marginBottom: 3 }}>
            {m.termSlope > 0 ? "✓ Healthy contango — favor premium selling" : "⚠ Backwardation — vol term stress, reduce size"}
          </div>
          <div style={{ fontSize: 10, color: COLORS.textMuted, lineHeight: 1.5 }}>
            {m.termSlope > 0
              ? `Near-term vol (VIX9D ${m.vix9d?.toFixed(1)}) is cheaper than longer-term vol (VIX3M ${m.vix3m?.toFixed(1)}). Dealers are calm. Good environment for iron condors and short premium.`
              : `Near-term vol (VIX9D ${m.vix9d?.toFixed(1)}) is MORE expensive than VIX3M (${m.vix3m?.toFixed(1)}). This signals near-term stress. Reduce short-vol exposure and consider long vol strategies.`}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14, marginBottom: 16 }}>
        {/* Conditions */}
        <div style={C}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 6 }}>
            Market Conditions
          </div>
          {conditions.map(c => {
            const col = c.warn ? COLORS.red : c.pass ? COLORS.green : COLORS.yellow;
            return (
              <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px",
                background: c.warn ? "rgba(255,82,82,.04)" : c.pass ? "rgba(0,230,118,.03)" : "rgba(255,202,40,.03)",
                borderLeft: `2px solid ${col}`, borderRadius: 4, marginBottom: 5 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, color: COLORS.textMuted }}>{c.label}</span>
                  <span style={{ fontSize: 9, color: COLORS.textDark, marginLeft: 6 }}>— {c.note}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: col, fontFamily: mono }}>{c.val}</span>
              </div>
            );
          })}
        </div>

        {/* Key Levels */}
        <div style={C}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 6 }}>
            Key SPX Levels
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {levels.map(([label, val, col]) => (
                <tr key={label} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: "4px 0", fontSize: 11, color: COLORS.textMuted }}>{label}</td>
                  <td style={{ padding: "4px 0", fontSize: 11, fontWeight: 700, color: col, textAlign: "right", fontFamily: mono }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategy suitability */}
      <div style={C}>
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 6 }}>
          Strategy Suitability — Current Conditions
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10 }}>
          {types.map(t => {
            const all    = strategies.filter(s => s.type === t);
            const active = all.filter(s => s.active);
            const col    = typeColors[t];
            const pct    = all.length > 0 ? (active.length / all.length) * 100 : 0;
            return (
              <div key={t} style={{ background: active.length > 0 ? `${col}08` : "rgba(255,255,255,.02)",
                border: `1px solid ${active.length > 0 ? col + "30" : COLORS.border}`, borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: col, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>{t}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: active.length > 0 ? col : COLORS.textDim }}>
                  {active.length}/{all.length} <span style={{ fontSize: 10, color: COLORS.textDim }}>active</span>
                </div>
                <div style={{ height: 3, background: COLORS.border, borderRadius: 2, margin: "6px 0" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: col, borderRadius: 2, transition: "width .6s" }} />
                </div>
                <div style={{ fontSize: 9, color: COLORS.textDark, lineHeight: 1.5 }}>
                  {active.length > 0 ? active.map(s => s.name).join(" · ") : "No signals"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ALERTS TAB
// ══════════════════════════════════════════════════════════════
function AlertsTab({ mktData, strategies, aiResult, grokResult, openaiResult, dismissed, setDismissed, stratFilter, minProb,
  riskDollar, activeTrades, setActiveTrades, trades, setTrades, saveTrades, lastUpdated }) {

  if (!mktData) return <LoadingState />;

  // ── Alert timing tracking ────────────────────────────────────────────
  // alertFirstSeen: stratId → ISO timestamp of when it first became active
  // recentlyCleared: stratId → ISO timestamp of when it dropped off (shown briefly)
  const alertFirstSeen  = useRef({});
  const recentlyCleared = useRef({});
  const [, forceUpdate] = useState(0); // tick to re-render clock labels
  const tickRef = useRef(null);

  // Tick every 30s so "Xm ago" labels stay fresh
  useEffect(() => {
    tickRef.current = setInterval(() => forceUpdate(n => n + 1), 30000);
    return () => clearInterval(tickRef.current);
  }, []);

  // Active strategy IDs this render
  const activeIds = new Set(strategies.filter(s => s.active).map(s => s.id));

  // Record first-seen timestamps for newly active strategies
  const now = Date.now();
  activeIds.forEach(id => {
    if (!alertFirstSeen.current[id]) {
      alertFirstSeen.current[id] = now;
    }
  });

  // Detect strategies that just dropped off → add to recentlyCleared
  Object.keys(alertFirstSeen.current).forEach(id => {
    if (!activeIds.has(id) && !recentlyCleared.current[id]) {
      recentlyCleared.current[id] = now;
    }
  });

  // Remove cleared alerts after 90 seconds
  Object.keys(recentlyCleared.current).forEach(id => {
    if (now - recentlyCleared.current[id] > 90000) {
      delete recentlyCleared.current[id];
      delete alertFirstSeen.current[id];
    }
  });

  function formatAlertAge(timestamp) {
    const secs = Math.floor((now - timestamp) / 1000);
    if (secs < 60)  return "just now";
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m ago`;
  }

  // Cleared strategies that still have a recent timestamp (within 90s)
  const clearedToShow = Object.keys(recentlyCleared.current)
    .filter(id => now - recentlyCleared.current[id] <= 90000)
    .map(id => strategies.find(s => s.id === id))
    .filter(Boolean);

  const typeColors = { neutral: COLORS.cyan, bullish: COLORS.green, bearish: COLORS.red, volatility: COLORS.purple, calendar: COLORS.yellow };

  let filtered = strategies.filter(s => !dismissed.has(s.id) && s.active && s.probValue >= minProb);
  if (stratFilter === "neutral")    filtered = filtered.filter(s => s.type === "neutral");
  else if (stratFilter === "bullish")    filtered = filtered.filter(s => s.type === "bullish");
  else if (stratFilter === "bearish")    filtered = filtered.filter(s => s.type === "bearish");
  else if (stratFilter === "volatility") filtered = filtered.filter(s => s.type === "volatility");
  else if (stratFilter === "calendar")   filtered = filtered.filter(s => s.type === "calendar");
  else if (stratFilter === "credit")     filtered = filtered.filter(s => s.credit);
  else if (stratFilter === "debit")      filtered = filtered.filter(s => !s.credit);

  // Build combined AI ranking across all 3 models
  const allAiResults = [aiResult, grokResult, openaiResult].filter(Boolean);
  const combinedRankMap = {};
  allAiResults.forEach(result => {
    result.rankings?.forEach(r => {
      if (!combinedRankMap[r.id]) combinedRankMap[r.id] = { scores: [], narrations: [], exits: [] };
      combinedRankMap[r.id].scores.push(r.score);
      if (r.narration) combinedRankMap[r.id].narrations.push(r.narration);
      if (r.exit_timing) combinedRankMap[r.id].exits.push(r.exit_timing);
    });
  });
  // Average score across models, keep first narration
  const aiRankMap = {};
  Object.entries(combinedRankMap).forEach(([id, { scores, narrations, exits }]) => {
    aiRankMap[id] = {
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      modelCount: scores.length,
      narration: narrations[0] ?? null,
      exit_timing: exits[0] ?? null,
      rank: null, // set below
    };
  });

  // Sort: prefer combined AI avg score if any models ran, else by probValue
  if (allAiResults.length > 0) {
    filtered = filtered.sort((a, b) => {
      const sa = (aiRankMap[a.id]?.avgScore ?? 0) * 0.4 + a.probValue * 0.6;
      const sb = (aiRankMap[b.id]?.avgScore ?? 0) * 0.4 + b.probValue * 0.6;
      return sb - sa;
    });
  } else {
    filtered = filtered.sort((a, b) => b.probValue - a.probValue);
  }

  const takeTrade = (s) => {
    if (activeTrades.some(t => t.stratId === s.id)) return;
    const setupObj = s.setup(s.greeks);
    const trade = {
      id: s.id + "_" + Date.now(), stratId: s.id, name: s.name, type: s.type,
      credit: s.credit, spxEntry: mktData.spx, vixEntry: mktData.vix,
      prob: s.probValue, holdTime: setupObj["Hold time"] ?? setupObj["DTE"] ?? "—",
      exitRules: s.exitRules, riskDollar, greeksAtEntry: s.greeks,
      setup: setupObj, entryTime: new Date().toISOString(), pnl: 0,
    };
    const newActive = [...activeTrades, trade];
    const newTrades = [...trades, { ...trade, action: "Opened" }];
    setActiveTrades(newActive); setTrades(newTrades); saveTrades(newTrades, newActive);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 900, color: COLORS.green, letterSpacing: 2 }}>LIVE STRATEGY ALERTS</div>
          <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 2 }}>
            {filtered.length} strategies firing · Greeks computed from live VIX via Black-Scholes · {lastUpdated ? `Updated ${lastUpdated}` : ""}
            {allAiResults.length > 0 && <span style={{ color: COLORS.blue }}> · {allAiResults.length} AI model{allAiResults.length > 1 ? "s" : ""} ranked</span>}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ ...C, textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◎</div>
          <div style={{ color: COLORS.textDim, fontSize: 13, lineHeight: 1.8 }}>
            No strategies meet current conditions (min {minProb}% probability).<br/>
            Try lowering the minimum probability or adjusting the filter.
          </div>
        </div>
      ) : (
        filtered.map((s, i) => {
          const col         = typeColors[s.type];
          const probColor   = s.probValue >= 75 ? COLORS.green : s.probValue >= 65 ? COLORS.yellow : COLORS.red;
          const statusLabel = s.probValue >= 75 ? "TAKE TRADE" : s.probValue >= 65 ? "CONSIDER" : "MONITOR";
          const statusBg    = s.probValue >= 75 ? "rgba(0,230,118,.12)" : s.probValue >= 65 ? "rgba(255,202,40,.12)" : "rgba(255,82,82,.12)";
          const borderLeft  = s.probValue >= 75 ? COLORS.green : s.probValue >= 65 ? COLORS.yellow : COLORS.redDim;
          const alreadyLogged = activeTrades.some(t => t.stratId === s.id);
          const aiRank = aiRankMap[s.id] ?? null;
          const setupEntries = Object.entries(s.setup(s.greeks));
          const firstSeen = alertFirstSeen.current[s.id];
          const alertAge = firstSeen ? formatAlertAge(firstSeen) : null;

          return (
            <div key={s.id} style={{ ...C, borderLeft: `3px solid ${borderLeft}`, marginBottom: 14,
              animation: "fadeUp .3s ease both", animationDelay: `${i * 0.06}s` }}>
              {/* Header */}
              <div style={{ paddingBottom: 12, borderBottom: `1px solid ${COLORS.border}`, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  <span style={{ fontSize: 16, color: col }}>{s.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 900, color: COLORS.text, letterSpacing: 1 }}>{s.name}</span>
                  {/* Status badge */}
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                    padding: "3px 8px", borderRadius: 4, border: `1px solid ${borderLeft}`, color: probColor, background: statusBg }}>
                    {statusLabel}
                  </span>
                  {/* Type badge */}
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                    padding: "2px 7px", borderRadius: 4, border: `1px solid ${col}30`, color: col, background: `${col}10` }}>
                    {s.type}
                  </span>
                  {/* Credit/Debit badge */}
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                    padding: "2px 7px", borderRadius: 4,
                    color: s.credit ? COLORS.cyan : COLORS.purple,
                    border: `1px solid ${s.credit ? COLORS.cyan + "40" : COLORS.purple + "40"}`,
                    background: s.credit ? "rgba(41,182,246,.1)" : "rgba(171,71,188,.1)" }}>
                    {s.credit ? "CREDIT" : "DEBIT"}
                  </span>
                  {/* Alert age badge */}
                  {alertAge && (
                    <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4,
                      color: COLORS.textDim, border: `1px solid ${COLORS.border}`,
                      background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", gap: 3 }}>
                      🕐 {alertAge}
                    </span>
                  )}
                  {/* AI rank badge */}
                  {aiRank && (
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                      padding: "2px 7px", borderRadius: 4, color: COLORS.blue,
                      border: `1px solid rgba(100,181,246,.3)`, background: "rgba(100,181,246,.08)",
                      display: "flex", alignItems: "center", gap: 4 }}>
                      {ICONS.ai} AI {aiRank.avgScore}/100{aiRank.modelCount > 1 ? ` · ${aiRank.modelCount} models` : ""}
                    </span>
                  )}
                  <div style={{ flex: 1 }} />
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <div style={{ fontSize: 9, color: COLORS.textDim, marginBottom: 1 }}>PROBABILITY</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: probColor }}>{s.probValue.toFixed(0)}%</div>
                  </div>
                </div>
                {/* Probability bar */}
                <div style={{ height: 3, background: COLORS.border, borderRadius: 2 }}>
                  <div style={{ height: "100%", width: `${s.probValue}%`, background: probColor, borderRadius: 2, transition: "width .8s" }} />
                </div>
              </div>

              {/* Description */}
              <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 12,
                padding: "8px 12px", background: "rgba(255,255,255,.02)", borderLeft: `2px solid ${col}`, borderRadius: 4 }}>
                {s.desc}
              </div>

              {/* AI narration if available */}
              {aiRank?.narration && (
                <div style={{ fontSize: 11, color: COLORS.blue, lineHeight: 1.6, marginBottom: 12,
                  padding: "8px 12px", background: "rgba(100,181,246,.04)", border: "1px solid rgba(100,181,246,.15)", borderRadius: 6,
                  display: "flex", gap: 8, alignItems: "flex-start" }}>
                  {ICONS.ai}
                  <span>{aiRank.narration}</span>
                </div>
              )}

              {/* Why now */}
              <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.7, marginBottom: 12,
                padding: "8px 12px", background: "rgba(41,182,246,.03)", border: "1px solid rgba(41,182,246,.12)", borderRadius: 6 }}>
                <span style={{ fontSize: 9, color: COLORS.cyan, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>WHY NOW ▸ </span>
                {s.why()}
              </div>

              {/* Greeks row — dollar-weighted, strategy-specific */}
              {s.greeks && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    {ICONS.greeks}
                    <span style={{ fontSize: 9, color: COLORS.textDim, letterSpacing: 1.5, textTransform: "uppercase" }}>
                      Key Greeks (dollar-weighted · Black-Scholes · Live VIX {mktData.vix.toFixed(1)})
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                    {[
                      { k: "Theta / day", v: s.greeks.theta != null ? `${s.greeks.theta >= 0 ? "+" : ""}$${s.greeks.theta.toFixed(0)}` : "—", c: s.greeks.theta >= 0 ? COLORS.green : COLORS.red, important: s.keyGreeks.includes("theta") },
                      { k: "Vega",        v: s.greeks.vega  != null ? `${s.greeks.vega  >= 0 ? "+" : ""}$${s.greeks.vega.toFixed(0)}`  : "—", c: s.greeks.vega  >= 0 ? COLORS.green : COLORS.red, important: s.keyGreeks.includes("vega") },
                      { k: "Delta $",     v: s.greeks.delta != null ? `${s.greeks.delta >= 0 ? "+" : ""}$${s.greeks.delta.toFixed(0)}` : "—", c: Math.abs(s.greeks.delta ?? 0) > 200 ? COLORS.yellow : COLORS.text, important: s.keyGreeks.includes("delta") },
                      { k: "Gamma $",     v: s.greeks.gamma != null ? `${s.greeks.gamma >= 0 ? "+" : ""}$${s.greeks.gamma.toFixed(0)}` : "—", c: s.greeks.gamma < 0 ? COLORS.red : COLORS.text, important: s.keyGreeks.includes("gamma") },
                    ].map(({ k, v, c, important }) => (
                      <div key={k} style={{ background: important ? `${c}08` : "rgba(255,255,255,.025)",
                        border: `1px solid ${important ? c + "30" : COLORS.border}`, borderRadius: 6, padding: "7px 9px" }}>
                        <div style={{ fontSize: 8, color: COLORS.textDark, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{k}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: c }}>{v}</div>
                        {important && <div style={{ width: "100%", height: 1, background: c + "30", marginTop: 4 }} />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Setup grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 6, marginBottom: 12 }}>
                {setupEntries.map(([k, v]) => (
                  <div key={k} style={{ background: "rgba(255,255,255,.025)", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "7px 9px" }}>
                    <div style={{ fontSize: 8, color: COLORS.textDark, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: col }}>{v}</div>
                  </div>
                ))}
                <div style={{ background: "rgba(255,255,255,.025)", border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: "7px 9px" }}>
                  <div style={{ fontSize: 8, color: COLORS.textDark, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>R/R Ratio</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.blue }}>{s.rrRatio}</div>
                </div>
              </div>

              {/* Exit rules */}
              <div style={{ background: "rgba(255,202,40,.05)", border: "1px solid rgba(255,202,40,.18)",
                borderRadius: 6, padding: "10px 14px", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  {ICONS.exit}
                  <span style={{ fontSize: 9, color: COLORS.yellow, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Exit Rules</span>
                  {aiRank?.exit_timing && <span style={{ fontSize: 9, color: COLORS.blue, marginLeft: 8 }}>{ICONS.ai} {aiRank.exit_timing}</span>}
                </div>
                {s.exitRules.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, padding: "3px 0",
                    borderBottom: i < s.exitRules.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
                    <span style={{ fontSize: 10, color: COLORS.yellow, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                    <span style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.5 }}>{r}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={() => takeTrade(s)} disabled={alreadyLogged}
                  style={{ padding: "7px 18px",
                    background: alreadyLogged ? "rgba(255,255,255,.04)" : `linear-gradient(135deg, ${COLORS.greenDim}, rgba(0,179,88,.6))`,
                    border: `1px solid ${alreadyLogged ? COLORS.border : COLORS.green}`,
                    color: alreadyLogged ? COLORS.textDim : COLORS.green,
                    fontFamily: mono, fontSize: 11, fontWeight: 700, cursor: alreadyLogged ? "not-allowed" : "pointer",
                    borderRadius: 6, letterSpacing: 1, transition: "all .15s" }}>
                  {alreadyLogged ? "✓ LOGGED" : "▶ LOG TRADE"}
                </button>
                <button onClick={() => setDismissed(new Set([...dismissed, s.id]))}
                  style={{ padding: "7px 12px", background: "transparent", border: `1px solid ${COLORS.border}`,
                    color: COLORS.textDim, fontFamily: mono, fontSize: 11, cursor: "pointer", borderRadius: 6 }}>
                  ✕ Dismiss
                </button>
                <div style={{ flex: 1 }} />
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: COLORS.textDark }}>
                    SPX {mktData.spx.toFixed(2)} · VIX {mktData.vix.toFixed(1)}
                  </div>
                  {firstSeen && (
                    <div style={{ fontSize: 9, color: COLORS.textDark, marginTop: 1 }}>
                      First alerted {new Date(firstSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* ── Cleared alerts tombstones — strategies that just dropped off ── */}
      {clearedToShow.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 9, color: COLORS.textDark, letterSpacing: 1.5, textTransform: "uppercase",
            marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
            {ICONS.warning}
            <span>Alerts cleared in the last 90 seconds</span>
          </div>
          {clearedToShow.map(s => {
            const col = typeColors[s.type] ?? COLORS.textDim;
            const clearedAt = recentlyCleared.current[s.id];
            const secsAgo = Math.floor((now - clearedAt) / 1000);
            const opacity = Math.max(0.2, 1 - secsAgo / 90); // fade out over 90s
            return (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
                background: "rgba(255,255,255,0.02)", border: `1px solid ${COLORS.border}`,
                borderRadius: 8, marginBottom: 6, opacity }}>
                <div style={{ width: 3, height: 32, background: COLORS.textDark, borderRadius: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: COLORS.textDark }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textDim }}>{s.name}</div>
                  <div style={{ fontSize: 9, color: COLORS.textDark, marginTop: 1 }}>
                    Conditions no longer met · Was active for {formatAlertAge(alertFirstSeen.current[s.id] ?? clearedAt)} · Cleared {secsAgo}s ago
                  </div>
                </div>
                <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10,
                  background: "rgba(255,255,255,0.04)", color: COLORS.textDark, border: `1px solid ${COLORS.border}` }}>
                  CLEARED
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// OI / GEX TAB — simplified, plain-English
// ══════════════════════════════════════════════════════════════
function OIGEXTab({ mktData }) {
  if (!mktData) return <LoadingState />;
  const m = mktData;
  const chain = m.chain ?? [];
  const spot = m.spx;

  const gexPositive = (m.netGex ?? 0) > 0;
  const gexColor = gexPositive ? COLORS.green : COLORS.red;
  const gexStr = m.netGex != null
    ? (Math.abs(m.netGex) > 1e9 ? `${(m.netGex/1e9).toFixed(1)}B` : `${(m.netGex/1e6).toFixed(0)}M`)
    : "—";

  // ── The 3 numbers you actually need ──────────────────────────
  const keyNumbers = [
    {
      label: "Max Pain",
      val: m.maxPain?.toString() ?? "—",
      col: COLORS.yellow,
      what: "Where most options expire worthless",
      meaning: `SPX tends to drift toward ${m.maxPain} into expiry. This is the strike where option buyers lose the most money — market makers are incentivized to pin here.`,
      trade: m.maxPain && spot ? (
        Math.abs(spot - m.maxPain) < 20 ? `SPX is within 20pts of max pain (${m.maxPain}) — strong pinning likely. Great for IC/butterfly.`
        : spot > m.maxPain ? `SPX is ${(spot - m.maxPain).toFixed(0)}pts ABOVE max pain. Mild drift lower possible — favor slightly bearish IC placement.`
        : `SPX is ${(m.maxPain - spot).toFixed(0)}pts BELOW max pain. Mild drift higher possible — favor slightly bullish IC placement.`
      ) : "—",
    },
    {
      label: "Put Wall",
      val: m.putWall?.toString() ?? "—",
      col: COLORS.red,
      what: "Strong support level",
      meaning: `${m.putWall} has the most put open interest. This is a floor — if SPX falls here, put sellers step in hard to defend.`,
      trade: `Keep your short put strike ABOVE ${m.putWall}. This is your natural support. A strike below ${m.putWall} is in dangerous territory.`,
    },
    {
      label: "Call Wall",
      val: m.callWall?.toString() ?? "—",
      col: COLORS.green,
      what: "Strong resistance level",
      meaning: `${m.callWall} has the most call open interest. This is a ceiling — call sellers defend this level aggressively.`,
      trade: `Keep your short call strike BELOW ${m.callWall}. This is your natural resistance. Your safe zone is between ${m.putWall} and ${m.callWall}.`,
    },
  ];

  // ── OI chart — only show ±60pts around spot for clarity ──────
  const displayChain = chain.filter(r => Math.abs(r.strike - spot) <= 60);
  const maxOI = displayChain.length > 0
    ? Math.max(...displayChain.map(r => Math.max(r.putOI, r.callOI)))
    : 1;

  return (
    <div>
      {/* GEX plain-English banner */}
      <div style={{ ...C, marginBottom: 14, borderLeft: `3px solid ${gexColor}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: gexColor }}>
              {gexPositive ? "✓ Dealers are PINNING the market" : "⚠ Dealers are AMPLIFYING moves"}
            </div>
            <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>
              Net GEX: {gexStr} · {m.oiPcr?.toFixed(2) ?? "—"} put/call ratio · Skew: {m.skewProxy}
            </div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 20,
            background: `${gexColor}12`, color: gexColor, border: `1px solid ${gexColor}40` }}>
            {gexPositive ? "RANGE-BOUND" : "TRENDING"}
          </div>
        </div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.7 }}>
          {gexPositive
            ? `Positive GEX means dealers bought calls and sold puts. When SPX rises, they sell — when it falls, they buy. This acts like a rubber band that keeps SPX range-bound. Good for ${m.oiPcr > 1.2 ? "iron condors and short strangles" : "iron condors"}.`
            : `Negative GEX means dealers are short gamma. When SPX rises, they must buy more — when it falls, they sell more. This amplifies moves in both directions. Reduce short-vol exposure and widen your wings.`}
        </div>
      </div>

      {/* The 3 key numbers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 14 }}>
        {keyNumbers.map(({ label, val, col, what, meaning, trade }) => (
          <div key={label} style={{ ...C, borderTop: `2px solid ${col}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 9, color: COLORS.textMuted }}>{what}</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: col, fontFamily: mono }}>{val}</div>
            </div>
            <div style={{ fontSize: 10, color: COLORS.textMuted, lineHeight: 1.6, marginBottom: 8, borderTop: `1px solid ${COLORS.border}`, paddingTop: 8 }}>
              {meaning}
            </div>
            <div style={{ fontSize: 10, color: col, lineHeight: 1.5, padding: "6px 8px",
              background: `${col}08`, borderRadius: 4, border: `1px solid ${col}20` }}>
              <span style={{ fontWeight: 700 }}>→ </span>{trade}
            </div>
          </div>
        ))}
      </div>

      {/* OI chart — simplified horizontal bars */}
      <div style={{ ...C, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 12, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>
            Open Interest Map — ±60pts around SPX
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 9, color: COLORS.textDim }}>
            <span><span style={{ color: COLORS.red }}>▌</span> Puts (support)</span>
            <span><span style={{ color: COLORS.green }}>▌</span> Calls (resistance)</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {displayChain.map(row => {
            const isSpot    = row.strike === Math.round(spot / 5) * 5;
            const isMaxPain = row.strike === m.maxPain;
            const isPutWall = row.strike === m.putWall;
            const isCallWall= row.strike === m.callWall;
            const putPct    = row.putOI  / maxOI;
            const callPct   = row.callOI / maxOI;
            const highlight = isSpot || isMaxPain || isPutWall || isCallWall;
            const rowBg     = isSpot ? "rgba(100,181,246,.06)" : isMaxPain ? "rgba(255,202,40,.05)" : "transparent";
            const labelCol  = isSpot ? COLORS.blue : isMaxPain ? COLORS.yellow : isPutWall ? COLORS.red : isCallWall ? COLORS.green : COLORS.textDim;
            const tag       = isSpot ? " ◀ SPX" : isMaxPain ? " ◀ MAX PAIN" : isPutWall ? " ◀ PUT WALL" : isCallWall ? " ◀ CALL WALL" : "";

            return (
              <div key={row.strike} style={{ display: "flex", alignItems: "center", gap: 4,
                padding: "2px 6px", borderRadius: 3, background: rowBg,
                outline: highlight ? `1px solid ${labelCol}25` : "none" }}>
                {/* Strike label */}
                <div style={{ width: 88, textAlign: "right", flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: highlight ? 700 : 400, color: labelCol }}>
                    {row.strike}{tag}
                  </span>
                </div>
                {/* Put bar (grows left from center) */}
                <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ height: 12, width: `${putPct * 100}%`, maxWidth: "100%",
                    background: isPutWall ? COLORS.red : `${COLORS.red}55`,
                    borderRadius: "3px 0 0 3px", transition: "width .4s" }} />
                </div>
                {/* Center spine */}
                <div style={{ width: 2, height: 12, background: isSpot ? COLORS.blue : isMaxPain ? COLORS.yellow : "rgba(255,255,255,.15)", flexShrink: 0 }} />
                {/* Call bar (grows right from center) */}
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, width: `${callPct * 100}%`, maxWidth: "100%",
                    background: isCallWall ? COLORS.green : `${COLORS.green}55`,
                    borderRadius: "0 3px 3px 0", transition: "width .4s" }} />
                </div>
                {/* OI value */}
                <div style={{ width: 36, fontSize: 8, color: COLORS.textDim, textAlign: "right", flexShrink: 0 }}>
                  {((row.putOI + row.callOI) / 1000).toFixed(0)}k
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 9, color: COLORS.textDim }}>
          <span>← Puts (support below)</span>
          <span style={{ color: COLORS.blue, fontWeight: 700 }}>SPX {spot.toFixed(0)}</span>
          <span>Calls (resistance above) →</span>
        </div>
      </div>

      {/* Trade guidance summary */}
      <div style={C}>
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1,
          marginBottom: 12, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 6 }}>
          What This Means for Your Trades
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            {
              icon: "◎",
              title: "Safe zone for strikes",
              detail: `Put spread: keep short put ABOVE ${m.putWall} · Bear call: keep short call BELOW ${m.callWall} · IC: short strikes between ${m.putWall} and ${m.callWall}`,
              col: COLORS.cyan,
            },
            {
              icon: m.oiPcr > 1.2 ? "✓" : m.oiPcr < 0.8 ? "⚠" : "~",
              title: `Put/Call Ratio: ${m.oiPcr?.toFixed(2) ?? "N/A"} — ${m.oiPcr > 1.5 ? "Heavy put buying (contrarian bullish)" : m.oiPcr > 1.2 ? "Moderate put bias (slight support)" : m.oiPcr < 0.8 ? "Call-heavy (complacency warning)" : "Balanced positioning"}`,
              detail: m.oiPcr > 1.2 ? "More puts than calls — institutions are hedging. Historically contrarian bullish. Favor put spreads over call spreads." : m.oiPcr < 0.8 ? "More calls than puts — complacency. Watch for reversal. Favor iron condors over naked calls." : "Balanced market. No directional bias from options positioning.",
              col: m.oiPcr > 1.2 ? COLORS.green : m.oiPcr < 0.8 ? COLORS.yellow : COLORS.text,
            },
            {
              icon: m.skewProxy === "steep" ? "✓" : "~",
              title: `IV Skew: ${m.skewProxy} — ${m.skewProxy === "steep" ? "Puts cost more than calls" : m.skewProxy === "flat" ? "Unusual — calls and puts similar cost" : "Normal skew"}`,
              detail: m.skewProxy === "steep" ? "Put IV > Call IV. Selling puts (bull put spreads, CSPs) collects better premium than calls. Favor selling the put side." : m.skewProxy === "flat" ? "Skew is flat — unusual. Check for squeeze risk or event. IC premiums may be less attractive." : "Normal skew. Premium is balanced between puts and calls.",
              col: m.skewProxy === "steep" ? COLORS.green : COLORS.yellow,
            },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "10px 12px",
              background: `${r.col}06`, border: `1px solid ${r.col}20`, borderRadius: 6 }}>
              <div style={{ fontSize: 16, color: r.col, flexShrink: 0, lineHeight: 1 }}>{r.icon}</div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: r.col, marginBottom: 3 }}>{r.title}</div>
                <div style={{ fontSize: 10, color: COLORS.textMuted, lineHeight: 1.6 }}>{r.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TRADES TAB
// ══════════════════════════════════════════════════════════════
function TradesTab({ activeTrades, setActiveTrades, trades, setTrades, saveTrades }) {
  const typeColors = { neutral: COLORS.cyan, bullish: COLORS.green, bearish: COLORS.red, volatility: COLORS.purple, calendar: COLORS.yellow };

  const closeOne = (tradeId, outcome) => {
    const t = activeTrades.find(t => t.id === tradeId); if (!t) return;
    const pnl = outcome === "win" ? t.riskDollar * (t.credit ? 0.5 : 1) : -t.riskDollar * 0.6;
    const newActive = activeTrades.filter(t => t.id !== tradeId);
    const newTrades = [...trades, { ...t, action: outcome === "win" ? "Closed WIN" : "Closed LOSS", pnl, closeTime: new Date().toISOString() }];
    setActiveTrades(newActive); setTrades(newTrades); saveTrades(newTrades, newActive);
  };

  const closed   = trades.filter(t => t.action && t.action !== "Opened");
  const wins     = closed.filter(t => t.action === "Closed WIN").length;
  const losses   = closed.filter(t => t.action === "Closed LOSS").length;
  const dailyPnl = closed.reduce((s, t) => s + (t.pnl || 0), 0);
  const wr       = (wins + losses) > 0 ? (wins / (wins + losses) * 100).toFixed(0) + "%" : "—";

  const thStyle = { fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1,
    padding: "6px 10px", textAlign: "left", borderBottom: `1px solid ${COLORS.border}` };
  const tdStyle = { padding: "8px 10px", borderBottom: `1px solid rgba(255,255,255,.03)`, fontSize: 11 };

  return (
    <div>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
        {[
          { label: "Daily P&L",      val: `${dailyPnl >= 0 ? "+" : ""}$${Math.abs(dailyPnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, col: dailyPnl >= 0 ? COLORS.green : COLORS.red },
          { label: "Open Positions", val: String(activeTrades.length), col: COLORS.cyan },
          { label: "Total Trades",   val: String(trades.length),       col: COLORS.text },
          { label: "Win Rate",       val: wr,                          col: wins >= losses ? COLORS.green : COLORS.red },
        ].map(({ label, val, col }) => (
          <div key={label} style={C}>
            <div style={{ fontSize: 9, color: COLORS.textDark, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: col }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Open trades */}
      <div style={{ ...C, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 12, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Open Positions</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => { const ids = [...activeTrades.map(t => t.id)]; ids.forEach(id => closeOne(id, "win")); }}
              style={{ padding: "4px 10px", background: "rgba(0,230,118,.08)", border: `1px solid ${COLORS.greenDim}`,
                color: COLORS.green, fontFamily: mono, fontSize: 10, cursor: "pointer", borderRadius: 4 }}>✓ Win All</button>
            <button onClick={() => { const ids = [...activeTrades.map(t => t.id)]; ids.forEach(id => closeOne(id, "loss")); }}
              style={{ padding: "4px 10px", background: "rgba(255,82,82,.08)", border: `1px solid ${COLORS.redDim}`,
                color: COLORS.red, fontFamily: mono, fontSize: 10, cursor: "pointer", borderRadius: 4 }}>✗ Loss All</button>
          </div>
        </div>
        {activeTrades.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: COLORS.textDim, fontSize: 12 }}>
            No open positions. Take trades from the Alerts tab.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["Strategy","Type","SPX Entry","VIX","POP","Theta/day","Vega","Risk $","Actions"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {activeTrades.map(t => {
                  const col = typeColors[t.type] ?? COLORS.text;
                  const g   = t.greeksAtEntry;
                  return (
                    <tr key={t.id}>
                      <td style={tdStyle}><span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 3,
                        border: `1px solid ${col}40`, color: col, background: `${col}10` }}>{t.name}</span></td>
                      <td style={{ ...tdStyle, color: col }}>{t.type}</td>
                      <td style={{ ...tdStyle, fontFamily: mono }}>{t.spxEntry?.toFixed(2)}</td>
                      <td style={{ ...tdStyle, color: COLORS.yellow, fontFamily: mono }}>{t.vixEntry?.toFixed(1)}</td>
                      <td style={{ ...tdStyle, color: COLORS.green, fontFamily: mono }}>{t.prob?.toFixed(0)}%</td>
                      <td style={{ ...tdStyle, color: g?.theta >= 0 ? COLORS.green : COLORS.red, fontFamily: mono }}>
                        {g?.theta != null ? `${g.theta >= 0 ? "+" : ""}$${g.theta.toFixed(0)}` : "—"}
                      </td>
                      <td style={{ ...tdStyle, color: g?.vega < 0 ? COLORS.red : COLORS.green, fontFamily: mono }}>
                        {g?.vega != null ? `${g.vega >= 0 ? "+" : ""}$${g.vega.toFixed(0)}` : "—"}
                      </td>
                      <td style={{ ...tdStyle, color: COLORS.red, fontFamily: mono }}>${t.riskDollar?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td style={tdStyle}>
                        <button onClick={() => closeOne(t.id, "win")} style={{ padding: "3px 8px", background: "rgba(0,230,118,.08)",
                          border: `1px solid ${COLORS.greenDim}`, color: COLORS.green, fontFamily: mono, fontSize: 10, cursor: "pointer", borderRadius: 3, marginRight: 4 }}>WIN</button>
                        <button onClick={() => closeOne(t.id, "loss")} style={{ padding: "3px 8px", background: "rgba(255,82,82,.08)",
                          border: `1px solid ${COLORS.redDim}`, color: COLORS.red, fontFamily: mono, fontSize: 10, cursor: "pointer", borderRadius: 3 }}>LOSS</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trade log */}
      <div style={C}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 12, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>Trade Log</span>
          <button onClick={() => { setTrades([]); setActiveTrades([]); saveTrades([], []); }}
            style={{ padding: "4px 10px", background: "transparent", border: `1px solid ${COLORS.border}`,
              color: COLORS.textDim, fontFamily: mono, fontSize: 10, cursor: "pointer", borderRadius: 4 }}>🗑 Clear</button>
        </div>
        {closed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px", color: COLORS.textDim, fontSize: 12 }}>No trade history yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>{["Date","Strategy","Outcome","SPX Entry","POP","P&L"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {[...closed].reverse().map((t, i) => {
                  const col = t.action === "Closed WIN" ? COLORS.green : COLORS.red;
                  return (
                    <tr key={i}>
                      <td style={{ ...tdStyle, color: COLORS.textDim }}>{new Date(t.entryTime).toLocaleDateString()}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{t.name}</td>
                      <td style={{ ...tdStyle, color: col, fontWeight: 700 }}>{t.action}</td>
                      <td style={{ ...tdStyle, fontFamily: mono }}>{t.spxEntry?.toFixed(2)}</td>
                      <td style={{ ...tdStyle, color: COLORS.green, fontFamily: mono }}>{t.prob?.toFixed(0)}%</td>
                      <td style={{ ...tdStyle, color: (t.pnl || 0) >= 0 ? COLORS.green : COLORS.red, fontWeight: 700, fontFamily: mono }}>
                        {(t.pnl || 0) >= 0 ? "+" : ""}${Math.abs(t.pnl || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SHARED HELPERS
// ══════════════════════════════════════════════════════════════
function LoadingState() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 24px",
      color: COLORS.textDim, fontFamily: mono, fontSize: 12 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 12, animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</div>
        <div>Fetching live data from Yahoo Finance...</div>
      </div>
    </div>
  );
}

function processData(json) {
  return {
    spx:          json.spx_price,
    prevClose:    json.spx_prev_close,
    changePct:    json.spx_change_pct,
    high52:       json.spx_high_52w,
    low52:        json.spx_low_52w,
    vix:          json.vix,
    vix9d:        json.vix9d,
    vix3m:        json.vix3m,
    tnx:          json.tnx,
    vvix:         json.vvix,
    rv5d:         json.rv5d,
    rv20d:        json.rv20d,
    ivEdge:       json.iv_edge_20d,
    rvRank:       json.rv_rank,
    vrpPct:       json.vrp_pct,
    termStructure: json.term_structure,
    termSlope:    json.term_slope,
    regime:       json.regime,
    sma20:        json.sma20,
    bbUpper:      json.bb_upper,
    bbLower:      json.bb_lower,
    ema8:         json.ema8,
    ema21:        json.ema21,
    sigma1day:    json.sigma1day,
    trendScore:   json.trend_score,
    maxPain:      json.max_pain,
    putWall:      json.put_wall,
    callWall:     json.call_wall,
    netGex:       json.net_gex,
    gexRegime:    json.gex_regime,
    oiPcr:        json.oi_pcr,
    skewProxy:    json.skew_proxy,
    chain:        json.chain ?? [],
    streamHealth: json.stream_health ?? {},
    chartData:    json.chart_data ?? [],
    ts:           json.timestamp,
  };
}
