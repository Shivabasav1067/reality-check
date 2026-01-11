export default async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const { name, goal, reason, message, mode } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ reply: "API key missing." }), { status: 500 });
    }

    let systemPrompt = "";

    if (mode === "roast") {
      systemPrompt = `
Tu ek Indian desi roaster hai.
Hinglish only (Hindi written in English).
No repetition.
2–4 lines.
Har baar naya roast.
Attack excuses, comfort zone, fear.
End with harsh reality.
`;
    }

    if (mode === "solution") {
      systemPrompt = `
Tu ek strict Indian mentor hai.
No roasting now.
Clear practical steps.
No motivation quotes.
Simple actionable advice.
`;
    }

    if (mode === "chat") {
      systemPrompt = `
Tu ek honest Indian guide hai.
Friendly but direct.
Short replies.
Answer user's question properly.
`;
    }

    const userPrompt = `
Naam: ${name}
Goal: ${goal}
Excuse: ${reason}

User says:
${message || "Start"}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt + "\n" + userPrompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI chup ho gaya. Soch kyun.";

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ reply: "System error. Par excuses tera hai." }),
      { status: 500 }
    );
  }
};
