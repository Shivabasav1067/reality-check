let lastAIReply = "";

// =========================
// QUOTES
// =========================
const quotes = [
  "Discipline beats motivation.",
  "Comfort zones kill futures.",
  "Excuses age badly.",
  "One day or day one.",
  "You know what to do."
];
document.getElementById("quoteText").innerText =
  quotes[Math.floor(Math.random() * quotes.length)];

// =========================
// ELEMENTS
// =========================
const chat = document.getElementById("chatScreen");
const sideActions = document.getElementById("sideActions");
const roastBtn = document.getElementById("roastBtn");
const harderBtn = document.getElementById("harderBtn");
const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("nameInput");
const goalInput = document.getElementById("goalInput");
const reasonInput = document.getElementById("reasonInput");

// =========================
// CHAT INPUT ELEMENTS
// =========================
const chatInput = document.getElementById("chatInput");
const userMessage = document.getElementById("userMessage");
const sendBtn = document.getElementById("sendBtn");

// =========================
// IMPROVED AI ROAST FUNCTION WITH DUPLICATE PREVENTION
// =========================
async function getUniqueAIResponse(name, goal, reason, mode = "normal", context = null) {
  try {
    const res = await fetch("/.netlify/functions/ai-roast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        goal,
        reason,
        intensity: mode,
        mode: "roast",
        context: context || `Previous reply was: ${lastAIReply.substring(0, 100)}...`,
        avoidDuplicate: lastAIReply.substring(0, 50)
      })
    });

    const data = await res.json();
    let reply = data.reply || "Aaj AI bhi disappoint ho gaya 💀";
    
    // If reply is similar to last one, generate fallback
    if (reply === lastAIReply || reply.includes(lastAIReply.substring(0, 30))) {
      reply = generateFallbackRoast(name, goal, reason, mode);
    }
    
    lastAIReply = reply;
    return reply;
  } catch (err) {
    console.error("AI error:", err);
    return generateFallbackRoast(name, goal, reason, mode);
  }
}

// =========================
// FALLBACK ROAST GENERATOR
// =========================
function generateFallbackRoast(name, goal, reason, mode) {
  const roasts = {
    normal: [
      `${name}, ${goal} ka sapna rahega sapna agar bas baatein karte rahe. "${reason}" bahana hai, irada nahi.`,
      `${name}, tumhara "${reason}" excuse hai ya epitaph? ${goal} karne se pehle hi surrender?`,
      `${name}, ${goal} ke liye time nahi? Par 2 min pehle tak Instagram scroll kar rahe the!`,
      "Agar motivation ka wait kar rahe ho, toh pata hai motivation bhi tumse bore ho gaya hai?",
      "Tumhare plans future perfect hain, present tense me to bas excuses perfect hain.",
      "Kal karte hain? Kal aayega aur tum phir wahi ke wahi reh jaoge.",
      "Jab tak tum soch rahe ho 'kya karna hai', koi aur kar chuka hota hai.",
      "Excuses ke bina toh tumhari personality incomplete hai, shayad?"
    ],
    hard: [
      `${name}, tumhare ${goal} ka sapna? Bhul jaao. Tumhara work ethic dekh ke lagta hai tum bas sapna dekh sakte ho, poora nahi kar sakte.`,
      `"${reason}"? Seriously? Duniya me log 4 jobs karte hain, tum ek ${goal} bhi nahi kar pa rahe?`,
      `${name}, tumhara problem yeh nahi ki tum ${goal} nahi kar pa rahe. Problem yeh hai ki tum karne ki koshish bhi nahi kar rahe.`,
      "Tumhe lagta hai tum special ho? Nahin. Tum bas ek aur average person ho jo excuses collect karta hai.",
      "Jab tak tum soch rahe ho 'kal se', koi aur aaj se shuru kar chuka hai aur tumhare sapne chheen lega.",
      "Tumhari discipline ka level itna low hai ki alarm bhi tumhe ignore karta hoga.",
      "Tumhare excuses sunke lagta hai creativity ki kami nahi, bas execution ki kami hai.",
      "Agar excuses Olympics hoti, tum gold medalist hote. Par real life me tum participation certificate bhi nahi deserve karte."
    ]
  };
  
  const selectedRoasts = roasts[mode] || roasts.normal;
  const randomRoast = selectedRoasts[Math.floor(Math.random() * selectedRoasts.length)];
  
  // If still same as last reply, add timestamp
  if (randomRoast === lastAIReply) {
    return randomRoast + ` (Yeh ${new Date().getSeconds()} second pe aaya hai, tumhare excuses pehle se stale hain)`;
  }
  
  return randomRoast;
}

// =========================
// SEND TO AI FUNCTION
// =========================
async function sendToAI(message, mode = "chat") {
  try {
    const name = nameInput.value.trim();
    const goal = goalInput.value.trim();
    const reason = reasonInput.value.trim();
    
    const res = await fetch("/.netlify/functions/ai-roast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        goal,
        reason,
        message,
        mode,
        intensity: mode === "hard" ? "hard" : "normal",
        conversationHistory: getConversationHistory()
      })
    });

    const data = await res.json();
    const reply = data.reply || "Aaj AI bhi disappoint ho gaya 💀";
    lastAIReply = reply;
    return reply;
  } catch (err) {
    console.error("AI error:", err);
    return generateFallbackRoast(nameInput.value || "Tu", goalInput.value || "kuch kar", reasonInput.value || "excuses", "normal");
  }
}

// =========================
// GET CONVERSATION HISTORY
// =========================
function getConversationHistory() {
  const messages = document.querySelectorAll('.msg');
  const history = [];
  
  messages.forEach(msg => {
    const text = msg.innerText.replace(/[\n\r]+|[\s]{2,}/g, ' ').trim();
    const isAI = msg.classList.contains('ai');
    // Remove reaction buttons text
    const cleanText = text.replace(/🔥😭💀/g, '').trim();
    if (cleanText && cleanText !== "Typing...") {
      history.push({
        role: isAI ? 'assistant' : 'user',
        content: cleanText.substring(0, 200)
      });
    }
  });
  
  return history.slice(-6);
}

// =========================
// ROAST ME BUTTON
// =========================
roastBtn.onclick = async () => {
  const name = nameInput.value.trim();
  const goal = goalInput.value.trim();
  const reason = reasonInput.value.trim();
  if (!name || !goal || !reason) return alert("Fill everything.");

  document.getElementById("inputSection").remove();
  document.getElementById("header").remove();
  chat.classList.remove("hidden");

  addUser(`${name} wants to ${goal} but avoids it because "${reason}"`);

  // AI reply with delay
  setTimeout(async () => {
    // Get unique AI response
    const reply = await getUniqueAIResponse(name, goal, reason, "normal");
    typeAI(reply);

    // Show chat input after roast
    setTimeout(() => {
      chatInput.classList.remove("hidden");
      userMessage.focus();
      
      // Auto ask for solution after 2 seconds
      setTimeout(async () => {
        const solution = await sendToAI("Ab solution bata", "solution");
        typeAI(solution);
      }, 2000);
    }, 1000);
    
  }, 700);

  sideActions.classList.remove("hidden");
};

// =========================
// SIDE BUTTONS
// =========================
harderBtn.onclick = async () => {
  const name = nameInput.value.trim() || "Tu";
  const reply = await getUniqueAIResponse(name, "discipline", "tu fir bhi excuses dhoondh raha hai", "hard");
  addAI(reply);
};

startBtn.onclick = async () => {
  const name = nameInput.value.trim() || "Tu";
  const reply = await getUniqueAIResponse(name, "start", "abhi bhi soch raha hai", "normal");
  addAI(reply);
};

// =========================
// CHAT FUNCTIONS
// =========================
function addUser(text) {
  const d = document.createElement("div");
  d.className = "msg user";
  d.innerText = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

function addAI(text) {
  const d = document.createElement("div");
  d.className = "msg ai";
  d.innerText = text;

  // REACTIONS (no reply buttons, just emoji reactions)
  const reacts = document.createElement("div");
  reacts.className = "reactions";
  reacts.innerHTML = `
    <span class="react" data-type="fire">🔥</span>
    <span class="react" data-type="cry">😭</span>
    <span class="react" data-type="dead">💀</span>
  `;
  d.appendChild(reacts);
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

// =========================
// REACTION HANDLER (visual only, no action)
// =========================
chat.addEventListener("click", (e) => {
  if (!e.target.classList.contains("react")) return;
  
  // Just visual feedback, no action
  const react = e.target;
  react.style.transform = 'scale(1.3)';
  react.style.transition = 'transform 0.2s';
  
  setTimeout(() => {
    react.style.transform = 'scale(1)';
  }, 200);
});

// =========================
// TYPING EFFECT FOR AI
// =========================
function typeAI(text) {
  const d = document.createElement("div");
  d.className = "msg ai";
  chat.appendChild(d);

  let i = 0;
  const speed = 25;

  const interval = setInterval(() => {
    d.innerText += text.charAt(i);
    i++;
    chat.scrollTop = chat.scrollHeight;
    if (i >= text.length) {
      clearInterval(interval);

      // reactions after typing done
      const reacts = document.createElement("div");
      reacts.className = "reactions";
      reacts.innerHTML = `
        <span class="react" data-type="fire">🔥</span>
        <span class="react" data-type="cry">😭</span>
        <span class="react" data-type="dead">💀</span>
      `;
      d.appendChild(reacts);
      chat.scrollTop = chat.scrollHeight;
    }
  }, speed);
}

// =========================
// USER CHAT HANDLER
// =========================
sendBtn.onclick = async () => {
  const msg = userMessage.value.trim();
  if (!msg) return;

  addUser(msg);
  userMessage.value = "";
  
  // Show typing indicator
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "msg ai typing";
  typingIndicator.innerText = "Typing...";
  chat.appendChild(typingIndicator);
  chat.scrollTop = chat.scrollHeight;
  
  // Get AI response
  const aiReply = await sendToAI(msg, "chat");
  
  // Remove typing indicator
  typingIndicator.remove();
  
  // Show AI response
  typeAI(aiReply);
};

// Enter key support for chat input
userMessage.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});

// =========================
// INITIALIZE
// =========================
// Focus on name input on load
window.addEventListener('DOMContentLoaded', () => {
  if (nameInput) {
    nameInput.focus();
  }
});

// Prevent form submission
document.addEventListener('submit', (e) => {
  e.preventDefault();
});

// =========================
// UTILITY FUNCTIONS (for backward compatibility)
// =========================
async function aiRoast(name, goal, reason, intensity = "normal") {
  return await getUniqueAIResponse(name, goal, reason, intensity);
}

function brutalRoast(name, goal, reason) {
  const roasts = [
    `${name}, ${goal} bolna easy hai. "${reason}" sirf ek kahani hai jo tu khud ko sunata hai. Sapne heavyweight, actions featherweight.`,
    `${name}, ${goal} karne ka time nahi? Par reels dekhne ka 2 ghanta hai? Priority check kar.`,
    `${name}, tumhara "${reason}" excuse purana ho gaya hai. Naya excuse socho ya phir kaam shuru karo.`
  ];
  return roasts[Math.floor(Math.random() * roasts.length)];
}