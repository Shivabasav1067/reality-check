export default async (req) => {
  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const { name, goal, reason, intensity } = await req.json();

    if (!name || !goal || !reason) {
      return new Response(
        JSON.stringify({ reply: "Tu input bhi dhang se nahi bhar paya." }),
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ reply: "API key missing. System bhi thak gaya." }),
        { status: 500 }
      );
    }

    // 🔥 DESI ROASTER PROMPT
const systemPrompt = `
Tu ek savage Indian desi roaster hai.
Language: Hindi written in English (Hinglish).
Tone: Merciless, personal, uncomfortable truth.
No politeness.
No motivation quotes.
Attack excuses directly.
Make user feel exposed.
2–4 short hard-hitting lines.
End with brutal reality check.

If intensity = hard, be 10x more savage.
`;


    const userPrompt = `
Naam: ${name}
Goal: ${goal}
Excuse: ${reason}

Ab is bande ko roast kar.
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
      "Aaj AI bhi tera excuse sunn ke chup ho gaya.";

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({
        reply:
          "System crash nahi hua, par tera discipline pehle hi crash ho chuka hai."
      }),
      { status: 500 }
    );
  }
};
