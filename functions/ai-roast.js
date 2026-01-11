exports.handler = async (event) => {
  try {

    if (!event.body) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          status: "AI Roast function is alive 🔥"
        })
      };
    }

    const { name, goal, reason, intensity } = JSON.parse(event.body);

    const prompt = `
You are a brutally honest desi Indian motivator.
Roast ${name} brutally in Hinglish.
Goal: ${goal}
Excuse: ${reason}
Reason for avoiding: ${reason}
Intensity: ${intensity}
Be savage but motivating.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "No roast today, you're lucky 😏"
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
