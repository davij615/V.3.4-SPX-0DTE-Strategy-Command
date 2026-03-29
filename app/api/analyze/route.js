export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const pw = searchParams.get("pw");
  if (pw !== process.env.DASHBOARD_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { prompt, systemPrompt } = await request.json();
    if (!prompt) return Response.json({ error: "Missing prompt" }, { status: 400 });
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: systemPrompt || "You are an expert SPX options strategist. Return only valid JSON.",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    if (!res.ok) return Response.json({ error: data.error?.message || `Anthropic API ${res.status}` }, { status: res.status });
    const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "";
    return Response.json({ text });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
