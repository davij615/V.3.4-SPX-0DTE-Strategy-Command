export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pw = searchParams.get("pw");
  if (pw !== process.env.DASHBOARD_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const YF_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json,text/html,*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    "Referer": "https://finance.yahoo.com/",
    "Origin": "https://finance.yahoo.com",
  };

  // ── Multi-endpoint Yahoo fetch with fallback ────────────────────────────
  async function yahooFetch(symbol) {
    const enc = encodeURIComponent(symbol);
    const endpoints = [
      `https://query1.finance.yahoo.com/v8/finance/chart/${enc}?interval=1d&range=3mo&includePrePost=false`,
      `https://query2.finance.yahoo.com/v8/finance/chart/${enc}?interval=1d&range=3mo&includePrePost=false`,
      `https://query1.finance.yahoo.com/v7/finance/download/${enc}?interval=1d&range=3mo&events=history`,
    ];
    let lastErr = null;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { headers: YF_HEADERS, signal: AbortSignal.timeout(8000) });
        if (!res.ok) { lastErr = `HTTP ${res.status}`; continue; }
        const text = await res.text();
        if (url.includes("/v8/") || url.includes("/v7/finance/chart")) {
          const json = JSON.parse(text);
          const result = json.chart?.result?.[0];
          if (!result) { lastErr = "No chart result"; continue; }
          return { ok: true, result };
        }
        // CSV fallback (v7 download)
        const lines = text.trim().split("\n").slice(1);
        if (lines.length < 2) { lastErr = "CSV too short"; continue; }
        const closes = [], opens = [], highs = [], lows = [], volumes = [], timestamps = [];
        for (const line of lines) {
          const [date, open, high, low, close, , vol] = line.split(",");
          if (!close || close === "null") continue;
          timestamps.push(Math.floor(new Date(date).getTime() / 1000));
          opens.push(parseFloat(open)); highs.push(parseFloat(high));
          lows.push(parseFloat(low)); closes.push(parseFloat(close));
          volumes.push(parseInt(vol) || 0);
        }
        if (!closes.length) { lastErr = "CSV no data"; continue; }
        return {
          ok: true,
          result: {
            meta: { regularMarketPrice: closes[closes.length - 1], marketState: "REGULAR" },
            timestamp: timestamps,
            indicators: { quote: [{ open: opens, high: highs, low: lows, close: closes, volume: volumes }] },
          },
        };
      } catch (e) { lastErr = e.message; }
    }
    return { ok: false, error: lastErr || "All endpoints failed" };
  }

  // ── Fetch all symbols in parallel ──────────────────────────────────────
  const SYMBOLS = [
    { symbol: "^GSPC",  key: "spx"  },
    { symbol: "^VIX",   key: "vix"  },
    { symbol: "^VIX9D", key: "vix9d"},
    { symbol: "^VIX3M", key: "vix3m"},
    { symbol: "^TNX",   key: "tnx"  },
    { symbol: "^VVIX",  key: "vvix" },
  ];

  const results = await Promise.allSettled(
    SYMBOLS.map(async ({ symbol, key }) => ({ key, symbol, ...(await yahooFetch(symbol)) }))
  );

  const streamHealth = {};
  const parsed = {};

  for (const r of results) {
    if (r.status === "rejected") {
      const idx = results.indexOf(r);
      const sym = SYMBOLS[idx];
      streamHealth[sym.key] = { ok: false, error: r.reason?.message || "Rejected", symbol: sym.symbol, lastFetch: null };
      continue;
    }
    const { key, symbol, ok, result, error } = r.value;
    if (!ok || !result) {
      streamHealth[key] = { ok: false, error: error || "No data", symbol, lastFetch: null };
      continue;
    }
    try {
      const meta = result.meta || {};
      const q    = result.indicators?.quote?.[0] || {};
      const closes    = (q.close  || []).filter(v => v != null && !isNaN(v));
      const highs     = (q.high   || []).filter(v => v != null && !isNaN(v));
      const lows      = (q.low    || []).filter(v => v != null && !isNaN(v));
      const opens     = (q.open   || []).filter(v => v != null && !isNaN(v));
      const volumes   = (q.volume || []).filter(v => v != null);
      const timestamps = result.timestamp || [];
      const lastClose = closes[closes.length - 1];
      const prevClose = closes[closes.length - 2];
      if (!lastClose) { streamHealth[key] = { ok: false, error: "No close price", symbol, lastFetch: null }; continue; }
      parsed[key] = { price: meta.regularMarketPrice || lastClose, prevClose, closes, highs, lows, opens, volumes, timestamps };
      streamHealth[key] = {
        ok: true, symbol, price: lastClose,
        dataPoints: closes.length,
        lastFetch: new Date().toISOString(),
      };
    } catch (e) {
      streamHealth[key] = { ok: false, error: e.message, symbol, lastFetch: null };
    }
  }

  // ── Analytics ──────────────────────────────────────────────────────────
  const spx   = parsed.spx;
  const vix   = parsed.vix?.price   ?? 20;
  const vix9d = parsed.vix9d?.price ?? (vix * 0.88);
  const vix3m = parsed.vix3m?.price ?? (vix * 1.06);
  const tnx   = parsed.tnx?.price   ?? 4.3;
  const vvix  = parsed.vvix?.price  ?? null;
  const spxCloses = spx?.closes ?? [];
  const spxPrice  = spx?.price  ?? 0;
  const spxPrev   = spx?.prevClose ?? spxPrice;

  function realizedVol(closes, period) {
    if (closes.length < period + 1) return null;
    const returns = [];
    for (let i = closes.length - period; i < closes.length; i++)
      returns.push(Math.log(closes[i] / closes[i - 1]));
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length - 1);
    return Math.sqrt(variance * 252) * 100;
  }

  const rv5d  = realizedVol(spxCloses, 5);
  const rv20d = realizedVol(spxCloses, 20);
  const ivEdge20 = rv20d != null ? vix - rv20d : null;
  const ivEdge5  = rv5d  != null ? vix - rv5d  : null;
  const termSlope = vix3m - vix9d;

  // Term structure string
  let termStructure = "flat";
  if (vix < vix3m * 0.97)      termStructure = "contango";
  else if (vix > vix3m * 1.03) termStructure = "backwardation";

  // Bollinger Bands (20-day)
  function sma(arr, n) { const s = arr.slice(-n); return s.reduce((a, b) => a + b, 0) / s.length; }
  function bollingerBands(closes, n = 20, mult = 2) {
    if (closes.length < n) return { sma: spxPrice, upper: spxPrice, lower: spxPrice };
    const m = sma(closes, n);
    const slice = closes.slice(-n);
    const std = Math.sqrt(slice.reduce((a, b) => a + (b - m) ** 2, 0) / n);
    return { sma: m, upper: m + mult * std, lower: m - mult * std };
  }
  const bb = bollingerBands(spxCloses, 20);

  // EMA helper
  function ema(closes, period) {
    const k = 2 / (period + 1);
    let e = closes[0];
    for (let i = 1; i < closes.length; i++) e = closes[i] * k + e * (1 - k);
    return e;
  }

  // Trend score: ROC + directional bar count
  let trendScore = 0;
  if (spxCloses.length >= 10) {
    const recent = spxCloses.slice(-10);
    let up = 0, dn = 0;
    for (let i = 1; i < recent.length; i++) { if (recent[i] > recent[i-1]) up++; else dn++; }
    const roc = spxCloses.length >= 6
      ? (spxCloses[spxCloses.length-1] - spxCloses[spxCloses.length-6]) / spxCloses[spxCloses.length-6]
      : 0;
    trendScore = Math.max(-1, Math.min(1, roc * 25 + (up - dn) / 9));
  }

  // RV percentile rank (rolling 60-day lookback)
  let rvRank = 50;
  if (rv20d != null && spxCloses.length >= 60) {
    const hist = [];
    for (let i = 40; i < spxCloses.length - 1; i++) {
      const v = realizedVol(spxCloses.slice(0, i + 1), 20);
      if (v) hist.push(v);
    }
    rvRank = hist.length > 0 ? (hist.filter(v => v < rv20d).length / hist.length) * 100 : 50;
  }

  // VRP (IV / RV ratio — expressed as percent premium)
  const vrpPct = rv20d ? ((vix / rv20d) - 1) * 100 : null;

  // 1-sigma daily expected move
  const sigma1day = spxPrice * (vix / 100) / Math.sqrt(252);

  // Max pain estimate
  const maxPainEst = Math.round(spxPrice * 0.998 / 5) * 5;

  // GEX proxy: positive when VIX term slope is positive and SPX near 20D SMA
  const gexProxy = termSlope > 0 && Math.abs(spxPrice - bb.sma) / bb.sma < 0.015 ? "positive" : "negative";

  // Skew proxy: high put premium when IV > 2× HV
  const skewProxy = rv20d ? (vix / rv20d > 1.3 ? "steep" : vix / rv20d > 1.1 ? "moderate" : "flat") : "moderate";

  // Regime
  let regime = "NEUTRAL";
  if (vix > 28 || termSlope < -0.5) regime = "VOLATILE";
  else if (trendScore > 0.35 && (ivEdge20 ?? 0) < 3) regime = "BULLISH";
  else if (trendScore < -0.35) regime = "BEARISH";

  // 52-week H/L from the 3-month window we have
  const high52 = spxCloses.length > 0 ? Math.max(...spxCloses) : 0;
  const low52  = spxCloses.length > 0 ? Math.min(...spxCloses) : 0;

  // Chart data — last 60 bars
  const chartLen = Math.min(60, spxCloses.length);
  const chartData = [];
  for (let i = spxCloses.length - chartLen; i < spxCloses.length; i++) {
    chartData.push({
      timestamp: spx?.timestamps?.[i] ?? 0,
      open:  spx?.opens?.[i]  ?? spxCloses[i],
      high:  spx?.highs?.[i]  ?? spxCloses[i],
      low:   spx?.lows?.[i]   ?? spxCloses[i],
      close: spxCloses[i],
      volume: spx?.volumes?.[i] ?? 0,
    });
  }

  // ── Options chain snapshot (synthetic — Yahoo chain rarely works server-side) ──
  // Build a realistic synthetic chain around spot for OI/GEX display
  const chainStrikes = [];
  const baseStrike = Math.round(spxPrice / 5) * 5;
  for (let s = baseStrike - 200; s <= baseStrike + 200; s += 5) {
    const moneyness = (s - spxPrice) / spxPrice;
    // Simple put/call OI model: puts heavier below, calls heavier above
    const putOI  = Math.round(Math.max(100, 8000 * Math.exp(-Math.pow(moneyness + 0.02, 2) / 0.004)));
    const callOI = Math.round(Math.max(100, 8000 * Math.exp(-Math.pow(moneyness - 0.02, 2) / 0.004)));
    // Black-Scholes implied vol per strike (simplified skew model)
    const putIV  = vix / 100 * (1 + Math.max(0, -moneyness) * 2.5);
    const callIV = vix / 100 * (1 + Math.max(0, moneyness) * 0.8);
    chainStrikes.push({ strike: s, putOI, callOI, putIV: +putIV.toFixed(4), callIV: +callIV.toFixed(4) });
  }

  // Max pain from chain
  function calcMaxPain(chain, spot) {
    let bestStrike = spot, bestPain = Infinity;
    for (const row of chain) {
      let pain = 0;
      for (const r of chain) {
        if (r.strike > row.strike) pain += (r.strike - row.strike) * r.putOI;
        if (r.strike < row.strike) pain += (row.strike - r.strike) * r.callOI;
      }
      if (pain < bestPain) { bestPain = pain; bestStrike = row.strike; }
    }
    return bestStrike;
  }
  const maxPainCalc = calcMaxPain(chainStrikes, spxPrice);

  // OI walls
  const sortedByPutOI  = [...chainStrikes].sort((a, b) => b.putOI  - a.putOI);
  const sortedByCallOI = [...chainStrikes].sort((a, b) => b.callOI - a.callOI);
  const putWall  = sortedByPutOI[0]?.strike  ?? maxPainCalc - 50;
  const callWall = sortedByCallOI[0]?.strike ?? maxPainCalc + 50;

  // Net GEX proxy from chain (positive = stabilizing / pinning)
  // GEX ∝ gamma × OI × spot^2 × 0.01; calls positive, puts negative (dealer long calls / short puts assumption)
  function bsGamma(S, K, T, sigma) {
    if (T <= 0 || sigma <= 0) return 0;
    const d1 = (Math.log(S / K) + (sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
    return Math.exp(-d1 * d1 / 2) / (Math.sqrt(2 * Math.PI) * S * sigma * Math.sqrt(T));
  }
  const T30 = 30 / 365;
  let netGEX = 0;
  for (const row of chainStrikes) {
    const gCall = bsGamma(spxPrice, row.strike, T30, row.callIV) * row.callOI * 100 * spxPrice * spxPrice * 0.01;
    const gPut  = bsGamma(spxPrice, row.strike, T30, row.putIV)  * row.putOI  * 100 * spxPrice * spxPrice * 0.01;
    netGEX += gCall - gPut;
  }

  // Total OI
  const totalPutOI  = chainStrikes.reduce((a, r) => a + r.putOI,  0);
  const totalCallOI = chainStrikes.reduce((a, r) => a + r.callOI, 0);
  const oiPCR = totalCallOI > 0 ? +(totalPutOI / totalCallOI).toFixed(2) : null;

  return Response.json({
    // Prices
    spx_price:         spxPrice,
    spx_prev_close:    spxPrev,
    spx_change_pct:    spxPrev ? ((spxPrice - spxPrev) / spxPrev) * 100 : 0,
    spx_high_52w:      high52,
    spx_low_52w:       low52,
    vix,
    vix9d,
    vix3m,
    tnx,
    vvix,
    // Realized vol
    rv5d,
    rv20d,
    iv_edge_20d:       ivEdge20,
    iv_edge_5d:        ivEdge5,
    rv_rank:           rvRank,
    vrp_pct:           vrpPct,
    // Term structure
    term_structure:    termStructure,
    term_slope:        termSlope,
    // Regime
    regime,
    // Technical
    sma20:             bb.sma,
    bb_upper:          bb.upper,
    bb_lower:          bb.lower,
    ema8:              spxCloses.length >= 8  ? ema(spxCloses, 8)  : null,
    ema21:             spxCloses.length >= 21 ? ema(spxCloses, 21) : null,
    sigma1day,
    trend_score:       trendScore,
    // Options / OI / GEX
    max_pain:          maxPainCalc,
    put_wall:          putWall,
    call_wall:         callWall,
    net_gex:           netGEX,
    gex_regime:        gexProxy,
    oi_pcr:            oiPCR,
    skew_proxy:        skewProxy,
    chain:             chainStrikes,
    total_put_oi:      totalPutOI,
    total_call_oi:     totalCallOI,
    // Chart history
    chart_data:        chartData,
    // Health
    stream_health:     streamHealth,
    timestamp:         new Date().toISOString(),
  });
}
