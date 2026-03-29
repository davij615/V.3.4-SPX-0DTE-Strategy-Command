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
      // ── Grok via xAI API (OpenAI-compatible endpoint) ──────────────
      const apiKey = process.env.GROK_API_KEY;
      if (!apiKey) return Response.json({ error: "GROK_API_KEY not configured in Vercel env vars" }, { status: 500 });

      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-3",
          messages: [
            {
              role: "system",
              content: "You are an expert SPX options strategist. Return ONLY valid JSON, no markdown, no explanation."
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 1500,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return Response.json({ error: data.error?.message || `Grok API error ${res.status}` }, { status: res.status });
      }
      const text = data.choices?.[0]?.message?.content || "";
      return Response.json({ text });

    } else if (provider === "openai") {
      // ── OpenAI GPT-4o ───────────────────────────────────────────────
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) return Response.json({ error: "OPENAI_API_KEY not configured in Vercel env vars" }, { status: 500 });

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert SPX options strategist. Return ONLY valid JSON, no markdown, no explanation."
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 1500,
          response_format: { type: "json_object" },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return Response.json({ error: data.error?.message || `OpenAI API error ${res.status}` }, { status: res.status });
      }
      const text = data.choices?.[0]?.message?.content || "";
      return Response.json({ text });

    } else {
      return Response.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }

  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
