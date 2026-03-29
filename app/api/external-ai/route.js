export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const pw       = searchParams.get("pw");
  const provider = searchParams.get("provider"); // "grok" or "openai"

  if (pw !== process.env.DASHBOARD_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prompt } = await request.json();
    if (!prompt) return Response.json({ error: "Missing prompt" }, { status: 400 });

    if (provider === "grok") {
      // Env var: XAI_API_KEY (NOT GROK_API_KEY)
      // Model: grok-4 (reasoning model — uses max_completion_tokens, not max_tokens)
      // Timeout: 120s (reasoning models are slow)
      const apiKey = process.env.XAI_API_KEY;
      if (!apiKey) {
        return Response.json({
          error: "XAI_API_KEY is not set. Vercel → Settings → Environment Variables → add XAI_API_KEY."
        }, { status: 500 });
      }

      let res, data;
      try {
        res = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "grok-4",
            messages: [
              { role: "system", content: "You are an expert SPX options strategist. Return ONLY valid JSON, no markdown, no preamble." },
              { role: "user",   content: prompt },
            ],
            max_completion_tokens: 1500,
          }),
          signal: AbortSignal.timeout(120000),
        });
        data = await res.json();
      } catch (fetchErr) {
        const msg = fetchErr.name === "AbortError"
          ? "Grok timed out (120s). Reasoning model is slow — try again."
          : `Network error calling xAI: ${fetchErr.message}`;
        return Response.json({ error: msg }, { status: 504 });
      }

      if (!res.ok) {
        const errMsg = data?.error?.message
          || (typeof data?.error === "string" ? data.error : null)
          || JSON.stringify(data)
          || `xAI returned HTTP ${res.status}`;
        return Response.json({ error: `Grok: ${errMsg}` }, { status: res.status });
      }

      const text = data.choices?.[0]?.message?.content || "";
      if (!text) return Response.json({ error: "Grok returned empty response. Check xAI billing/quota at console.x.ai." }, { status: 500 });
      return Response.json({ text });

    } else if (provider === "openai") {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return Response.json({
          error: "OPENAI_API_KEY is not set. Vercel → Settings → Environment Variables → add OPENAI_API_KEY."
        }, { status: 500 });
      }

      let res, data;
      try {
        res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are an expert SPX options strategist. Return ONLY valid JSON, no markdown, no preamble." },
              { role: "user",   content: prompt },
            ],
            temperature: 0.2,
            max_tokens: 1500,
            response_format: { type: "json_object" },
          }),
          signal: AbortSignal.timeout(60000),
        });
        data = await res.json();
      } catch (fetchErr) {
        const msg = fetchErr.name === "AbortError"
          ? "OpenAI timed out (60s)."
          : `Network error calling OpenAI: ${fetchErr.message}`;
        return Response.json({ error: msg }, { status: 504 });
      }

      if (!res.ok) {
        const errMsg = data?.error?.message
          || (typeof data?.error === "string" ? data.error : null)
          || JSON.stringify(data)
          || `OpenAI returned HTTP ${res.status}`;
        return Response.json({ error: `OpenAI: ${errMsg}` }, { status: res.status });
      }

      const text = data.choices?.[0]?.message?.content || "";
      if (!text) return Response.json({ error: "OpenAI returned empty response." }, { status: 500 });
      return Response.json({ text });

    } else {
      return Response.json({ error: `Unknown provider: "${provider}". Use "grok" or "openai".` }, { status: 400 });
    }

  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
