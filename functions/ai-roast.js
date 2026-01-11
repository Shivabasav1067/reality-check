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
Tu ek Indian desi roaster hai jo repeat bilkul nahi karta.

STRICT RULES:
- Same sentence kabhi repeat mat karna
- Same words 2 baar se zyada mat use karna
- Har reply alag angle se roast kare
- Kabhi motivation tone mat lana
- Hinglish only (Hindi written in English)
- 2–4 short lines
- Har baar naya example, naya insult, naya reality check

Intensity: ${intensity}

Agar reply repeat hua, to tu fail mana jayega.
`;
const randomSeed = Math.floor(Math.random() * 100000);

const userPrompt = `
Session ID: ${randomSeed}

Naam: ${name}
Goal: ${goal}
Excuse: ${reason}

Is bande ko ek NAYA roast de.
Repeat mat karna.
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
