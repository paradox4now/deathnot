const QUESTIONS = [
  { key: "age", text: "How old are you?", min: 18, max: 100 },
  { key: "sex", text: "What is your biological sex?", options: [["Male", 1], ["Female", 0]] },
  { key: "cp", text: "Which best describes any chest discomfort you experience?",
    options: [["Typical angina", 0], ["Atypical angina", 1], ["Non-anginal pain", 2], ["No symptoms", 3]] },
  { key: "trestbps", text: "What is your resting systolic blood pressure (mm Hg)? Normal is ~120.", min: 80, max: 220 },
  { key: "chol", text: "What is your serum cholesterol level (mg/dl)? Normal is under 200.", min: 100, max: 600 },
  { key: "fbs", text: "Is your fasting blood sugar greater than 120 mg/dl?", options: [["Yes", 1], ["No", 0]] },
  { key: "restecg", text: "What was your resting electrocardiogram (ECG) result?",
    options: [["Normal", 0], ["ST-T abnormality", 1], ["LV hypertrophy", 2]] },
  { key: "thalach", text: "What is your maximum heart rate achieved during exercise?", min: 60, max: 220 },
  { key: "exang", text: "Do you experience chest pain or tightness during exercise?", options: [["Yes", 1], ["No", 0]] },
  { key: "oldpeak", text: "What is your ST depression value (oldpeak)? Enter 0 if unsure.", min: 0, max: 7 },
  { key: "slope", text: "What is the slope of your peak exercise ST segment?",
    options: [["Upsloping", 0], ["Flat", 1], ["Downsloping", 2]] },
];

const msgs = document.getElementById("messages");
const optionsBox = document.getElementById("options");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const resetBtn = document.getElementById("reset-btn");

let step = 0;
let answers = {};

function updateProgress() {
  const label = document.getElementById("progress-label");
  const percent = document.getElementById("progress-percent");
  const bar = document.getElementById("progress-bar");
  if (!label || !percent || !bar) return;

  const current = Math.min(step + 1, QUESTIONS.length);
  const pct = Math.round((step / QUESTIONS.length) * 100);

  label.textContent = step < QUESTIONS.length ? `Question ${current} of ${QUESTIONS.length}` : "Checkup Complete";
  percent.textContent = `${pct}%`;
  bar.style.width = `${pct}%`;
}

function addMsg(content, who, isHtml = false) {
  const row = document.createElement("div");
  row.className = `msg-row ${who}`;

  if (who.includes("bot")) {
    const avatar = document.createElement("div");
    avatar.className = "msg-avatar";
    avatar.textContent = "❤️";
    row.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = "msg-bubble";

  if (isHtml) {
    bubble.innerHTML = content;
  } else {
    bubble.textContent = content;
  }

  row.appendChild(bubble);
  msgs.appendChild(row);
  msgs.scrollTop = msgs.scrollHeight;
  return row;
}

function showTyping() {
  const row = document.createElement("div");
  row.className = "msg-row bot typing-row";
  row.innerHTML = `
    <div class="msg-avatar">❤️</div>
    <div class="msg-bubble">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  msgs.appendChild(row);
  msgs.scrollTop = msgs.scrollHeight;
  return row;
}

function setInputEnabled(on) {
  input.disabled = !on;
  sendBtn.disabled = !on;
  if (on) {
    input.placeholder = "Type your answer and press Enter...";
    input.focus();
  } else {
    input.placeholder = "Choose an option above 👆";
  }
}

function ask() {
  optionsBox.innerHTML = "";
  updateProgress();
  const q = QUESTIONS[step];
  addMsg(q.text, "bot");

  if (q.options) {
    setInputEnabled(false);
    q.options.forEach(([label, value]) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.onclick = () => submitAnswer(label, value);
      optionsBox.appendChild(b);
    });
  } else {
    setInputEnabled(true);
  }
}

function submitAnswer(label, value) {
  const q = QUESTIONS[step];
  addMsg(label, "user");
  answers[q.key] = value;
  optionsBox.innerHTML = "";
  step++;
  if (step < QUESTIONS.length) {
    ask();
  } else {
    getPrediction();
  }
}

function handleTyped() {
  const q = QUESTIONS[step];
  if (!q || q.options) return;
  const raw = input.value.trim();
  if (!raw) return;
  input.value = "";
  const num = parseFloat(raw);
  addMsg(raw, "user");

  if (isNaN(num) || num < q.min || num > q.max) {
    addMsg(`Please enter a valid number between ${q.min} and ${q.max}.`, "bot");
    return;
  }

  answers[q.key] = num;
  step++;
  if (step < QUESTIONS.length) {
    ask();
  } else {
    getPrediction();
  }
}

async function getPrediction() {
  setInputEnabled(false);
  updateProgress();
  const typing = showTyping();

  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    });
    const data = await res.json();
    typing.remove();

    if (!res.ok) throw new Error(data.error || "Server calculation error");

    const r = data.risk;
    const level = r < 30 ? "LOW" : r < 60 ? "MODERATE" : "HIGH";
    const icon = r < 30 ? "💚" : r < 60 ? "💛" : "❤️";

    const tip = level === "LOW"
      ? "You fall in the low statistical risk category! Keep active, eat balanced meals, and avoid smoking."
      : level === "MODERATE"
      ? "You have moderate risk factors. Focus on aerobic exercise, managing dietary sodium, and checking your BP regularly."
      : "You show several high risk markers. We strongly encourage scheduling a full clinical evaluation with a cardiologist.";

    const cardHtml = `
      <div class="result-card ${level.toLowerCase()}">
        <div class="result-header">
          <span class="result-tag">${icon} ${level} RISK</span>
          <span class="result-score">${r}%</span>
        </div>
        <div class="result-tip">${tip}</div>
      </div>
    `;

    addMsg(cardHtml, "bot", true);
    addMsg("Remember: this statistical AI estimate is for educational awareness and is not a medical diagnosis.", "bot");

  } catch (err) {
    typing.remove();
    addMsg("Oops! Something went wrong: " + err.message, "bot");
  }

  const again = document.createElement("button");
  again.textContent = "Start New Assessment 🔄";
  again.onclick = restart;
  optionsBox.appendChild(again);
}

function restart() {
  step = 0;
  answers = {};
  msgs.innerHTML = "";
  optionsBox.innerHTML = "";
  updateProgress();
  start();
}

function start() {
  addMsg("Hi there! I'm Hearty ❤️. I'll guide you through 11 quick health questions to calculate your heart risk score. Ready?", "bot");
  ask();
}

sendBtn.onclick = handleTyped;
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleTyped();
});
if (resetBtn) {
  resetBtn.onclick = restart;
}

start();
