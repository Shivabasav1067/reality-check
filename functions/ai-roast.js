exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { name, goal, reason, intensity } = body;

    const prompt = `
You are a brutally honest desi Indian motivator.
Roast ${name} brutally in Hinglish.
Goal: ${goal}
Excuse: ${reason}
Intensity: ${intensity}
Be savage but motivating.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: prompt }] }
          ]
        })
      }
    );

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: data.candidates[0].content.parts[0].text
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
