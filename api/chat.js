/ api/chat.js - Vercel Serverless Function untuk Zyst.ai (Gemini)
// Environment Variable di Vercel:
//   Key  : GEMINI_API_KEY
//   Value: (API key kamu)
// Opsional: GEMINI_MODEL (default: gemini-3.6-flash)

const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

const SYSTEM_PROMPT =
  "Kamu adalah Zyst.ai, asisten umum tanya jawab. Jawab dengan ramah, jelas, dan dalam bahasa yang dipakai pengguna.";

// Ubah satu blok dari frontend menjadi "part" Gemini
function blockToPart(b) {
  if (typeof b === "string") return b.trim() ? { text: b } : null;
  if (!b) return null;
  if (b.type === "text") return b.text && b.text.trim() ? { text: b.text } : null;
  if ((b.type === "image" || b.type === "document") && b.source && b.source.data) {
    return {
      inlineData: {
        mimeType: b.source.media_type || (b.type === "document" ? "application/pdf" : "image/jpeg"),
        data: b.source.data,
      },
    };
  }
  return null;
}

// Ubah satu pesan frontend menjadi "content" Gemini
function messageToContent(m) {
  const role = m.role === "assistant" ? "model" : "user";
  const blocks = Array.isArray(m.content) ? m.content : [m.content];
  const parts = blocks.map(blockToPart).filter(Boolean);
  return parts.length ? { role, parts } : null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Gunakan POST." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY belum diatur di Vercel (Settings > Environment Variables).",
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const contents = messages.map(messageToContent).filter(Boolean);

    if (!contents.length) {
      return res.status(400).json({ error: "Pesan kosong." });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = (data && data.error && data.error.message) || "Gagal menghubungi Gemini.";
      console.error("Gemini error:", response.status, msg);
      return res.status(response.status).json({ error: msg });
    }

    const parts = data?.candidates?.[0]?.content?.parts || [];
    const text =
      parts.map((p) => p.text || "").join("").trim() ||
      "Maaf, tidak ada jawaban dari AI.";

    return res.status(200).json({ text });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Terjadi kesalahan di server: " + err.message });
  }
};
