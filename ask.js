export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, provider, model } = req.body;

  try {
    let url, options;

    if (provider === "gemini") {
      url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_KEY}`;
      options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      };
    } else if (provider === "openrouter") {
      url = "https://openrouter.ai/api/v1/chat/completions";
      options = {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.OPENROUTER_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] })
      };
    } else {
      return res.status(400).json({ error: "Provider not supported" });
    }

    const response = await fetch(url, options);
    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}