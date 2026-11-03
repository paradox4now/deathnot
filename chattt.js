const QUESTIONS = [
  { key: "age", text: "How old are you?", min: 18, max: 100 },
  { key: "sex", text: "What is your sex?", options: [["Male", 1], ["Female", 0]] },
  { key: "cp", text: "Which best describes any chest pain you experience?",
    options: [["Typical angina", 0], ["Atypical angina", 1], ["Non-anginal pain", 2], ["No symptoms", 3]] },
  { key: "trestbps", text: "What is your resting blood pressure (systolic, in mm Hg)?", min: 80, max: 220 },
  { key: "chol", text: "What is your cholesterol level (mg/dl)?", min: 100, max: 600 },
  { key: "fbs", text: "Is your fasting blood sugar above 120 mg/dl?", options: [["Yes", 1], ["No", 0]] },
  { key: "restecg", text: "What was your resting ECG result?",
    options: [["Normal", 0], ["ST-T abnormality", 1], ["LV hypertrophy", 2]] },
  { key: "thalach", text: "What is your maximum heart rate achieved during exercise?", min: 60, max: 220 },
  { key: "exang", text: "Do you get chest pain during exercise?", options: [["Yes", 1], ["No", 0]] },
  { key: "oldpeak", text: "What is your ST depression value (oldpeak) from a stress test? Enter 0 if unsure.", min: 0, max: 7 },
  { key: "slope", text: "What is the slope of your peak exercise ST segment?",
    options: [["Upsloping", 0], ["Flat", 1], ["Downsloping", 2]] },
];

const msgs = document.getElementById("messages");
const optionsBox = document.getElementById("options");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

let step = 0;
let answers = {};

function addMsg(text, who) {
  const d = document.createElement("div");
  d.className = "msg " + who;
  d.textContent = text;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
  return d;
}

function setInputEnabled(on) {
  input.disabled = !on;
  sendBtn.disabled = !on;
  if (on) input.focus();
}

function ask() {
  optionsBox.innerHTML = "";
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
  if (step < QUESTIONS.length) ask();
  else getPrediction();
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
    addMsg(`Please enter a number between ${q.min} and ${q.max}.`, "bot");
    return;
  }
  answers[q.key] = num;
  step++;
  if (step < QUESTIONS.length) ask();
  else getPrediction();
}

async function getPrediction() {
  setInputEnabled(false);
  const typing = addMsg("Analysing your answers...", "bot typing");
  try {
    const res = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    });
    const data = await res.json();
    typing.remove();
    if (!res.ok) throw new Error(data.error || "Server error");

    const r = data.risk;
    const level = r < 30 ? "LOW" : r < 60 ? "MODERATE" : "HIGH";
    addMsg(`Estimated risk: ${r}% (${level})`, "bot result " + level.toLowerCase());
    addMsg("This is a statistical estimate from a small dataset, not a diagnosis. " +
           "Please consult a doctor for a proper check-up. Staying active, not smoking, " +
           "eating a balanced diet, and managing blood pressure all help heart health.", "bot");
  } catch (err) {
    typing.remove();
    addMsg("Sorry, something went wrong: " + err.message, "bot");
  }
  const again = document.createElement("button");
  again.textContent = "Start over";
  again.onclick = restart;
  optionsBox.appendChild(again);
}

function restart() {
  step = 0;
  answers = {};
  msgs.innerHTML = "";
  optionsBox.innerHTML = "";
  start();
}

function start() {
  addMsg("Hi! I'll ask you a few health questions to estimate your heart disease risk. " +
         "Your answers aren't stored.", "bot");
  ask();
}

sendBtn.onclick = handleTyped;
input.addEventListener("keydown", (e) => { if (e.key === "Enter") handleTyped(); });
start();