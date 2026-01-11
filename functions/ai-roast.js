// functions/ai-roast.js
import fetch from 'node-fetch';

export async function handler(event, context) {
  try {
    const body = JSON.parse(event.body);
    const { name, goal, reason } = body;

    // Fallback brutal roast
    const fallbackRoast = `${name}, ${goal} bolna easy hai.
"${reason}" sunke lagta hai tu khud ka sabse bada obstacle hai.
Sapne heavyweight, actions featherweight.`;

    // Gemini API endpoint
    const apiKey = process.env.GEMINI_API_KEY; // Store in Netlify Environment
    const endpoint = "https://api.generativeai.google/v1beta2/models/text-bison-001:generateText";

    const prompt = `Brutally roast this person in desi style:
Name: ${name}
Goal: ${goal}
Reason for avoiding: ${reason}
Make it 3-4 lines and slightly motivating too.`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: prompt,
        temperature: 0.9,
        maxOutputTokens: 250
      })
    });

    if (!response.ok) return { statusCode: 200, body: JSON.stringify({ roast: fallbackRoast }) };

    const data = await response.json();
    const aiRoast = data?.candidates?.[0]?.content || fallbackRoast;

    return {
      statusCode: 200,
      body: JSON.stringify({ roast: aiRoast })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 200,
      body: JSON.stringify({ roast: "API failed! " + `${name}, ${goal} bolna easy hai. "${reason}" lagta hai tu khud ka obstacle hai.` })
    };
  }
}
