import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Pre-built interactive templates for instant offline fallback
const FALLBACK_APPS: Record<string, { html: string; css: string; js: string }> = {
  unit_converter: {
    html: `<div class="converter-card">
  <div class="header">
    <div class="icon">🔄</div>
    <h2>স্মার্ট ইউনিট কনভার্টার</h2>
    <p>Unit & Measurement Converter</p>
  </div>

  <div class="category-tabs">
    <button class="cat-btn active" onclick="setCategory('length')">📏 দৈর্ঘ্য (Length)</button>
    <button class="cat-btn" onclick="setCategory('weight')">⚖️ ওজন (Weight)</button>
    <button class="cat-btn" onclick="setCategory('temp')">🌡️ তাপমাত্রা (Temp)</button>
    <button class="cat-btn" onclick="setCategory('data')">💾 ডিজিটাল ডেটা</button>
  </div>

  <div class="convert-grid">
    <div class="input-group">
      <label id="from-label">ইনপুট মান (From):</label>
      <input type="number" id="from-val" value="1" oninput="convert()" placeholder="সংখ্যা লিখুন..." />
      <select id="from-unit" onchange="convert()"></select>
    </div>

    <button class="swap-btn" onclick="swapUnits()" title="Swap">⇄</button>

    <div class="input-group">
      <label id="to-label">ফলাফল (To):</label>
      <input type="number" id="to-val" readonly placeholder="ফলাফল..." />
      <select id="to-unit" onchange="convert()"></select>
    </div>
  </div>

  <div class="result-box">
    <span class="formula-label">কনভার্সন সূত্র / Calculation:</span>
    <div class="formula" id="formula-text">1 Meter = 100 Centimeter</div>
    <button class="copy-btn" onclick="copyResult()">📋 ফলাফল কপি করুন</button>
  </div>
</div>`,
    css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #090d16 0%, #111a2e 50%, #0a1124 100%);
  color: #f1f5f9;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
.converter-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 520px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.1);
}
.header { text-align: center; margin-bottom: 24px; }
.header .icon { font-size: 32px; margin-bottom: 8px; }
.header h2 { font-size: 22px; font-weight: 800; color: #38bdf8; }
.header p { font-size: 12px; color: #94a3b8; margin-top: 4px; }

.category-tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}
.cat-btn {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.cat-btn:hover { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
.cat-btn.active {
  background: #0284c7;
  color: white;
  border-color: #38bdf8;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
}

.convert-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}
.input-group label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 6px;
}
.input-group input {
  width: 100%;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px 12px 0 0;
  color: #f8fafc;
  font-size: 20px;
  font-weight: 700;
  padding: 12px 16px;
  outline: none;
  transition: border-color 0.2s;
}
.input-group input:focus { border-color: #38bdf8; }
.input-group select {
  width: 100%;
  background: #1e293b;
  border: 1px solid #334155;
  border-top: none;
  border-radius: 0 0 12px 12px;
  color: #38bdf8;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 14px;
  outline: none;
  cursor: pointer;
}

.swap-btn {
  align-self: center;
  background: #334155;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}
.swap-btn:hover { background: #0284c7; transform: rotate(180deg); }

.result-box {
  margin-top: 24px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 14px;
  padding: 16px;
  text-align: center;
}
.formula-label { font-size: 11px; color: #64748b; }
.formula { font-size: 15px; font-weight: 700; color: #38bdf8; margin: 6px 0 12px; word-break: break-all; }
.copy-btn {
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.copy-btn:hover { background: #38bdf8; color: #0f172a; }`,
    js: `const UNITS = {
  length: {
    m: { name: 'মিটার (Meters)', factor: 1 },
    km: { name: 'কিলোমিটার (Kilometers)', factor: 1000 },
    cm: { name: 'সেন্টিমিটার (Centimeters)', factor: 0.01 },
    mm: { name: 'মিলিমিটার (Millimeters)', factor: 0.001 },
    inch: { name: 'ইঞ্চি (Inches)', factor: 0.0254 },
    ft: { name: 'ফুট (Feet)', factor: 0.3048 },
    mile: { name: 'মাইল (Miles)', factor: 1609.34 }
  },
  weight: {
    kg: { name: 'কিলোগ্রাম (Kilograms)', factor: 1 },
    g: { name: 'গ্রাম (Grams)', factor: 0.001 },
    mg: { name: 'মিলিগ্রাম (Milligrams)', factor: 0.000001 },
    lb: { name: 'পাউন্ড (Pounds)', factor: 0.453592 },
    oz: { name: 'আউন্স (Ounces)', factor: 0.0283495 }
  },
  temp: {
    c: { name: 'সেলসিয়াস (°C)' },
    f: { name: 'ফারেনহাইট (°F)' },
    k: { name: 'কেলভিন (K)' }
  },
  data: {
    mb: { name: 'মেগাবাইট (MB)', factor: 1 },
    kb: { name: 'কিলোবাইট (KB)', factor: 0.0009765625 },
    gb: { name: 'গিগাবাইট (GB)', factor: 1024 },
    tb: { name: 'টেরাবাইট (TB)', factor: 1048576 },
    bytes: { name: 'বাইট (Bytes)', factor: 0.00000095367431640625 }
  }
};

let currentCategory = 'length';

function populateUnits() {
  const fromSelect = document.getElementById('from-unit');
  const toSelect = document.getElementById('to-unit');
  const units = UNITS[currentCategory];
  
  fromSelect.innerHTML = '';
  toSelect.innerHTML = '';
  
  const keys = Object.keys(units);
  keys.forEach((key, idx) => {
    const opt1 = new Option(units[key].name, key);
    const opt2 = new Option(units[key].name, key);
    fromSelect.add(opt1);
    toSelect.add(opt2);
  });
  
  if (keys.length > 1) {
    toSelect.selectedIndex = 1;
  }
}

function setCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  populateUnits();
  convert();
}

function convert() {
  const fromVal = parseFloat(document.getElementById('from-val').value) || 0;
  const fromUnit = document.getElementById('from-unit').value;
  const toUnit = document.getElementById('to-unit').value;
  const toInput = document.getElementById('to-val');
  const formulaEl = document.getElementById('formula-text');

  if (currentCategory === 'temp') {
    let result = 0;
    // Celsius as base
    let inC = fromVal;
    if (fromUnit === 'f') inC = (fromVal - 32) * (5 / 9);
    if (fromUnit === 'k') inC = fromVal - 273.15;

    if (toUnit === 'c') result = inC;
    if (toUnit === 'f') result = (inC * 9 / 5) + 32;
    if (toUnit === 'k') result = inC + 273.15;

    toInput.value = parseFloat(result.toFixed(4));
    formulaEl.textContent = \`\${fromVal} \${UNITS.temp[fromUnit].name} = \${toInput.value} \${UNITS.temp[toUnit].name}\`;
    return;
  }

  const categoryUnits = UNITS[currentCategory];
  if (!categoryUnits[fromUnit] || !categoryUnits[toUnit]) return;

  const baseValue = fromVal * categoryUnits[fromUnit].factor;
  const converted = baseValue / categoryUnits[toUnit].factor;

  const rounded = parseFloat(converted.toFixed(6));
  toInput.value = rounded;
  formulaEl.textContent = \`\${fromVal} \${categoryUnits[fromUnit].name} = \${rounded} \${categoryUnits[toUnit].name}\`;
}

function swapUnits() {
  const fromSelect = document.getElementById('from-unit');
  const toSelect = document.getElementById('to-unit');
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
  convert();
}

function copyResult() {
  const val = document.getElementById('to-val').value;
  const formula = document.getElementById('formula-text').textContent;
  navigator.clipboard.writeText(formula || val);
  alert('ফলাফল কপি করা হয়েছে: ' + formula);
}

// Initialize on page load
populateUnits();
convert();`
  },
  todo: {
    html: `<div class="todo-app">
  <header>
    <h2>📝 স্মার্ট টাস্ক প্ল্যানার</h2>
    <p id="date-display"></p>
  </header>

  <div class="input-box">
    <input type="text" id="task-input" placeholder="নতুন কাজ লিখুন..." onkeypress="handleKey(event)" />
    <button onclick="addTask()">+ যোগ করুন</button>
  </div>

  <div class="filters">
    <button class="filter-btn active" onclick="setFilter('all')">সব কাজ</button>
    <button class="filter-btn" onclick="setFilter('active')">চলতি</button>
    <button class="filter-btn" onclick="setFilter('completed')">সম্পন্ন</button>
  </div>

  <ul id="task-list" class="task-list"></ul>

  <div class="footer">
    <span id="counter">০টি কাজ বাকি</span>
    <button onclick="clearCompleted()">সম্পন্নগুলো মুছুন</button>
  </div>
</div>`,
    css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: system-ui, sans-serif;
  background: #0b0f19;
  color: #e2e8f0;
  display: flex;
  justify-content: center;
  padding: 30px 15px;
  min-height: 100vh;
}
.todo-app {
  background: #161f30;
  width: 100%;
  max-width: 440px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.08);
  padding: 24px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.5);
  height: fit-content;
}
header { margin-bottom: 20px; text-align: center; }
header h2 { color: #38bdf8; font-size: 22px; font-weight: bold; }
header p { color: #64748b; font-size: 12px; margin-top: 4px; }
.input-box { display: flex; gap: 8px; margin-bottom: 16px; }
.input-box input {
  flex: 1;
  background: #0b0f19;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 12px 14px;
  color: white;
  font-size: 14px;
  outline: none;
}
.input-box input:focus { border-color: #38bdf8; }
.input-box button {
  background: #0284c7;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0 16px;
  font-weight: bold;
  cursor: pointer;
}
.filters { display: flex; gap: 6px; margin-bottom: 16px; background: #0b0f19; padding: 4px; border-radius: 10px; }
.filter-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 6px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
}
.filter-btn.active { background: #334155; color: #38bdf8; font-weight: bold; }
.task-list { list-style: none; display: flex; flex-direction: column; gap: 8px; max-height: 350px; overflow-y: auto; }
.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0b0f19;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.03);
}
.task-item.done span { text-decoration: line-through; color: #64748b; }
.task-left { display: flex; align-items: center; gap: 10px; flex: 1; }
.task-left input { width: 18px; height: 18px; cursor: pointer; accent-color: #0284c7; }
.del-btn { background: none; border: none; color: #ef4444; font-size: 16px; cursor: pointer; }
.footer { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; font-size: 12px; color: #64748b; border-top: 1px solid #334155; padding-top: 14px; }
.footer button { background: none; border: none; color: #94a3b8; cursor: pointer; }
.footer button:hover { color: #f43f5e; }`,
    js: `let tasks = [
  { id: 1, text: 'দৈনিক পরিকল্পনা সম্পন্ন করা', done: false },
  { id: 2, text: 'হাতের কাছে ড্যাশবোর্ড আপডেট করা', done: true }
];
let currentFilter = 'all';

document.getElementById('date-display').textContent = new Date().toLocaleDateString('bn-BD', { weekday: 'long', month: 'long', day: 'numeric' });

function render() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';
  
  const filtered = tasks.filter(t => {
    if (currentFilter === 'active') return !t.done;
    if (currentFilter === 'completed') return t.done;
    return true;
  });

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');
    li.innerHTML = \`
      <div class="task-left">
        <input type="checkbox" \${task.done ? 'checked' : ''} onchange="toggleTask(\${task.id})" />
        <span>\${task.text}</span>
      </div>
      <button class="del-btn" onclick="deleteTask(\${task.id})">✕</button>
    \`;
    list.appendChild(li);
  });

  const remaining = tasks.filter(t => !t.done).length;
  document.getElementById('counter').textContent = remaining + 'টি কাজ বাকি';
}

function addTask() {
  const input = document.getElementById('task-input');
  if (!input.value.trim()) return;
  tasks.unshift({ id: Date.now(), text: input.value.trim(), done: false });
  input.value = '';
  render();
}

function handleKey(e) {
  if (e.key === 'Enter') addTask();
}

function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  render();
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.done);
  render();
}

function setFilter(f) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  render();
}

render();`
  }
};

function getFallbackApp(promptText: string) {
  const p = (promptText || "").toLowerCase();
  if (p.includes('unit') || p.includes('convert') || p.includes('কনভার্টার') || p.includes('পরিমাপ')) {
    return FALLBACK_APPS.unit_converter;
  }
  if (p.includes('todo') || p.includes('task') || p.includes('লিস্ট') || p.includes('টাস্ক')) {
    return FALLBACK_APPS.todo;
  }
  return FALLBACK_APPS.unit_converter;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for Web App Builder (Code Pilot)
  app.post("/api/generate-app", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isPlaceholderKey = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("YOUR_API_KEY") || apiKey.trim() === "";

    if (isPlaceholderKey) {
      const fallback = getFallbackApp(prompt);
      return res.json(fallback);
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `You are an expert full-stack web designer and frontend developer.
Create a complete, modern, aesthetically impressive and 100% functional single-view HTML/CSS/JS application based on this idea: "${prompt}".

Requirements:
1. "html": Provide semantic markup for inside the <body> (do NOT include <html>, <head>, or <body> outer tags). Include all buttons, inputs, headers, and UI elements.
2. "css": Write comprehensive, beautiful CSS styling using rich gradients, modern dark/clean contrast, backdrop-blur or clean cards, responsive padding, typography, hover & active states.
3. "js": Write complete vanilla JavaScript with active event listeners so all buttons, calculators, converters, animations, or interactive controls work immediately.

Output MUST be a valid JSON object with keys "html", "css", and "js".`,
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text || "";
      let parsedJson: any = null;
      try {
        let cleanText = responseText.trim();
        if (cleanText.startsWith("```json")) cleanText = cleanText.substring(7);
        if (cleanText.startsWith("```")) cleanText = cleanText.substring(3);
        if (cleanText.endsWith("```")) cleanText = cleanText.substring(0, cleanText.length - 3);
        parsedJson = JSON.parse(cleanText.trim());
      } catch (e) {
        console.warn("Could not parse JSON from Gemini, falling back gracefully", e);
      }

      if (parsedJson && parsedJson.html && parsedJson.css && parsedJson.js) {
        return res.json(parsedJson);
      }

      const fallback = getFallbackApp(prompt);
      return res.json(fallback);
    } catch (err: any) {
      console.warn("Gemini generate-app error, using dynamic fallback:", err?.message || err);
      const fallback = getFallbackApp(prompt);
      return res.json(fallback);
    }
  });

  // API route for real-time assistant response
  app.post("/api/chat-assistant", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const isPlaceholderKey = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("YOUR_API_KEY") || apiKey.trim() === "";

      if (isPlaceholderKey) {
        return res.json({ 
          text: "হাতে থাকা সহকারী (Hater Kache Assistant): আমি হাতের কাছে প্রোডাক্টিভিটি হাবের কৃত্রিম বুদ্ধিমত্তা। আপনি আপনার দৈনন্দিন কাজ, লক্ষ্য এবং সময়ের হিসাব এখানে রাখতে পারেন! আপনার আজকের কাজের পরিকল্পনা শুরু করতে প্রস্তুত?" 
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: `You are the primary artificial intelligence assistant embedded in "হাতের কাছে" (Hater Kache) All-in-One Personal Productivity Hub.
"হাতের কাছে" (meaning "at hand" or "within reach" in Bengali) is an elegant, premium, minimalist Bengali/English dashboard.
Answer the user's queries in a helpful, friendly, and concise manner (at most 3-4 sentences/paragraphs).
You should reply in Bengali if the query is in Bengali, or English if it's in English (or match their code-switching/Banglish).
Be very motivating and productivity-focused. Keep responses extremely neat and readable.`,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.log("Assistant endpoint handled fallback gracefully: " + (error?.message || "unknown"));
      return res.json({
        text: "হাতে থাকা সহকারী (Hater Kache Assistant): আপনার প্রশ্নটির জন্য ধন্যবাদ! প্রোডাক্টিভিটি বাড়াতে আজকের কাজগুলো ড্যাশবোর্ডে সাজিয়ে নিন এবং পোমোডোরো সেশন দিয়ে মনোযোগ ধরে রাখুন।"
      });
    }
  });

  // Serve static/vite assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
