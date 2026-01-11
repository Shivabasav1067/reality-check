// =========================
// AUDIO
// =========================
const roastSound = document.getElementById("roastSound");
let audioUnlocked = false;

function unlockAudio() {
  if (!audioUnlocked) {
    roastSound.play().then(() => {
      roastSound.pause();
      roastSound.currentTime = 0;
      audioUnlocked = true;
    }).catch(() => {});
  }
}

function playRoastSound() {
  if (!audioUnlocked) return;
  roastSound.currentTime = 0;
  roastSound.play();
}

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
// ROAST ME BUTTON
// =========================
roastBtn.onclick = () => {
  unlockAudio();

  const name = nameInput.value.trim();
  const goal = goalInput.value.trim();
  const reason = reasonInput.value.trim();
  if (!name || !goal || !reason) return alert("Fill everything.");

  document.getElementById("inputSection").remove();
  document.getElementById("header").remove();
  chat.classList.remove("hidden");

  addUser(`${name} wants to ${goal} but avoids it because "${reason}"`);

  // AI reply with delay + sound
  setTimeout(() => {
    playRoastSound();
    addAI(brutalRoast(name, goal, reason));
  }, 700);

  sideActions.classList.remove("hidden");
};

// =========================
// SIDE BUTTONS
// =========================
harderBtn.onclick = () => {
  playRoastSound();
  addAI(
    "Aur hard sun. Motivation nahi, discipline chahiye — jo tu roz skip karta hai."
  );
};

startBtn.onclick = () => {
  playRoastSound();
  addAI("Good. Ab excuses bandh. Aaj ka kaam likh aur shuru kar.");
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

  // REACTIONS
  const reacts = document.createElement("div");
  reacts.className = "reactions";
  reacts.innerHTML = `
    <button class="react" data-type="fire">🔥</button>
    <button class="react" data-type="cry">😭</button>
    <button class="react" data-type="dead">💀</button>
  `;
  d.appendChild(reacts);
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

// =========================
// REACTION HANDLER
// =========================
chat.addEventListener("click", (e) => {
  if (!e.target.classList.contains("react")) return;
  playRoastSound();

  const type = e.target.dataset.type;
  if (type === "fire") addAI("Haan haan 🔥 lag rahi hai? Achha hai. Pain ka matlab progress ka chance.");
  if (type === "cry") addAI("Ro le 😭, par yaad rakh — aansu kuch nahi badalte, action badalta hai.");
  if (type === "dead") addAI("💀 No mercy? Theek hai. Agar tu nahi badla, average rehna hi tera ceiling hai.");
});

// =========================
// BRUTAL ROAST
// =========================
function brutalRoast(name, goal, reason) {
  return `${name}, ${goal} bolna easy hai.
"${reason}" sirf ek kahani hai jo tu khud ko sunata hai.
Sapne heavyweight, actions featherweight.`;
}
