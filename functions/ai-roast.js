export default async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const { name, goal, reason, message, mode, intensity = "normal", context, avoidDuplicate, conversationHistory } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ reply: "API key missing." }), { status: 500 });
    }

    // Determine the actual mode to use
    let actualMode = mode;
    if (!actualMode) {
      actualMode = "roast"; // Default to roast if no mode specified
    }

    let systemPrompt = "";

    if (actualMode === "roast") {
      if (intensity === "hard") {
        systemPrompt = `
Tu ek brutal Indian roaster hai.
Hinglish only (Hindi written in English).
Extremely harsh, no mercy.
3–4 lines.
Direct attack on character and discipline.
No motivational ending.
Make it personal and painful.
Avoid repetition. Never say the same thing twice.
Previous roast to avoid: ${avoidDuplicate || "none"}
Context: ${context || "first roast"}
`;
      } else {
        systemPrompt = `
Tu ek Indian desi roaster hai.
Hinglish only (Hindi written in English).
No repetition.
2–4 lines.
Har baar naya roast.
Attack excuses, comfort zone, fear.
End with harsh reality.
Previous roast to avoid: ${avoidDuplicate || "none"}
Context: ${context || "first roast"}
`;
      }
    }

    if (actualMode === "solution") {
      systemPrompt = `
Tu ek strict Indian mentor hai.
Hinglish only.
No roasting now.
Clear practical steps.
No motivation quotes.
Simple actionable advice.
Be specific to their goal: ${goal}
`;
    }

    if (actualMode === "chat") {
      systemPrompt = `
Tu ek honest Indian guide hai.
Hinglish only.
Friendly but direct.
Short replies.
Answer user's question properly.
Previous conversation: ${conversationHistory ? JSON.stringify(conversationHistory.slice(-3)) : "none"}
`;
    }

    // Build user prompt based on mode
    let userPrompt = "";
    
    if (actualMode === "roast" || actualMode === "solution") {
      userPrompt = `
Naam: ${name}
Goal: ${goal}
Excuse/Reason: ${reason}

${actualMode === "solution" ? "Give me a practical solution to achieve this goal:" : "Roast me about this:"}
`;
    } else if (actualMode === "chat") {
      userPrompt = `
User details:
Naam: ${name}
Goal: ${goal}
Reason: ${reason}

User message: ${message || "Start conversation"}
`;
    }

    // Add conversation history for chat mode
    if (actualMode === "chat" && conversationHistory && conversationHistory.length > 0) {
      const historyText = conversationHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'You'}: ${msg.content}`
      ).join('\n');
      
      systemPrompt += `\n\nConversation history:\n${historyText}`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: systemPrompt + "\n\n" + userPrompt }]
            }
          ],
          generationConfig: {
            temperature: actualMode === "hard" ? 0.9 : 0.7,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 300
          }
        })
      }
    );

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI chup ho gaya. Soch kyun.";

    // Clean up the reply
    const cleanedReply = reply.trim().replace(/^\*+/g, '').replace(/\*+$/g, '').trim();

    return new Response(JSON.stringify({ reply: cleanedReply }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("Function error:", err);
    return new Response(
      JSON.stringify({ reply: "System error. Par excuses tera hai." }),
      { status: 500 }
    );
  }
};