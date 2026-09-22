export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, provider, model, messages } = req.body;

  try {
    let url, options;

    if (provider === "gemini") {

      const contents = messages
        ? messages.map(m => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
          }))
        : [{ parts: [{ text: prompt }] }];

      url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_KEY}`;
      options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents })
      };

    } else if (provider === "openrouter") {

      url = "https://openrouter.ai/api/v1/chat/completions";
      options = {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.OPENROUTER_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: messages || [{ role: "user", content: prompt }]
        })
      };

    } else {
      return res.status(400).json({ error: "Provider not supported" });
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "API Error" });
    }

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
