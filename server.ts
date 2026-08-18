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

function buildUniversalApp(promptText: string) {
  const p = (promptText || "").toLowerCase().trim();
  const cleanTitle = promptText.trim().replace(/[<>"{}]/g, '') || "Custom App";

  // 1. Calculator
  if (p.includes('calc') || p.includes('ক্যালকুলেটর') || p.includes('হিসাব') || p.includes('math')) {
    return {
      html: `<div class="calc-container">
  <div class="calc-header">
    <h3>স্মার্ট ক্যালকুলেটর</h3>
    <span class="badge">Standard & Fast</span>
  </div>
  <div class="calc-screen">
    <div id="calc-history" class="history"></div>
    <div id="calc-display" class="current">0</div>
  </div>
  <div class="calc-keys">
    <button class="btn fn" onclick="clearCalc()">AC</button>
    <button class="btn fn" onclick="deleteLast()">DEL</button>
    <button class="btn fn" onclick="inputOp('%')">%</button>
    <button class="btn op" onclick="inputOp('/')">÷</button>
    
    <button class="btn num" onclick="inputNum('7')">7</button>
    <button class="btn num" onclick="inputNum('8')">8</button>
    <button class="btn num" onclick="inputNum('9')">9</button>
    <button class="btn op" onclick="inputOp('*')">×</button>
    
    <button class="btn num" onclick="inputNum('4')">4</button>
    <button class="btn num" onclick="inputNum('5')">5</button>
    <button class="btn num" onclick="inputNum('6')">6</button>
    <button class="btn op" onclick="inputOp('-')">−</button>
    
    <button class="btn num" onclick="inputNum('1')">1</button>
    <button class="btn num" onclick="inputNum('2')">2</button>
    <button class="btn num" onclick="inputNum('3')">3</button>
    <button class="btn op" onclick="inputOp('+')">+</button>
    
    <button class="btn num zero" onclick="inputNum('0')">0</button>
    <button class="btn num" onclick="inputNum('.')">.</button>
    <button class="btn eq" onclick="calculate()">=</button>
  </div>
</div>`,
      css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #090d16; color: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 15px; }
.calc-container { background: #151d2f; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 24px; width: 100%; max-width: 340px; box-shadow: 0 20px 45px rgba(0,0,0,0.6); }
.calc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.calc-header h3 { font-size: 16px; color: #38bdf8; font-weight: bold; }
.badge { font-size: 10px; background: rgba(56,189,248,0.15); color: #38bdf8; padding: 4px 8px; border-radius: 6px; }
.calc-screen { background: #0a0e1a; border-radius: 16px; padding: 16px; margin-bottom: 20px; text-align: right; border: 1px solid rgba(255,255,255,0.05); }
.history { font-size: 12px; color: #64748b; min-height: 18px; font-family: monospace; }
.current { font-size: 32px; font-weight: bold; color: #f8fafc; font-family: monospace; overflow-x: auto; white-space: nowrap; }
.calc-keys { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.btn { border: none; border-radius: 14px; padding: 16px 0; font-size: 18px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
.btn:active { transform: scale(0.94); }
.num { background: #1e293b; color: #f1f5f9; }
.num:hover { background: #28374f; }
.fn { background: #334155; color: #94a3b8; }
.fn:hover { background: #475569; color: white; }
.op { background: #0284c7; color: white; }
.op:hover { background: #0369a1; }
.eq { background: #ff5a36; color: white; font-weight: bold; }
.eq:hover { background: #ea4823; }
.zero { grid-column: span 2; padding-left: 20px; text-align: left; }`,
      js: `let curr = '0', prev = '', op = null;
function update() { document.getElementById('calc-display').innerText = curr; document.getElementById('calc-history').innerText = prev + (op ? ' ' + op : ''); }
function inputNum(n) { if (curr === '0' && n !== '.') curr = n; else if (n === '.' && curr.includes('.')) return; else curr += n; update(); }
function inputOp(o) { if (op && curr !== '0') calculate(); prev = curr; op = o; curr = '0'; update(); }
function calculate() { if (!op || !prev) return; const a = parseFloat(prev), b = parseFloat(curr); let res = 0; if (op === '+') res = a + b; else if (op === '-') res = a - b; else if (op === '*') res = a * b; else if (op === '/') res = b === 0 ? 'Error' : a / b; else if (op === '%') res = (a * b) / 100; curr = String(res); prev = ''; op = null; update(); }
function clearCalc() { curr = '0'; prev = ''; op = null; update(); }
function deleteLast() { curr = curr.length > 1 ? curr.slice(0, -1) : '0'; update(); }`
    };
  }

  // 2. Stopwatch / Timer
  if (p.includes('timer') || p.includes('stopwatch') || p.includes('স্টপওয়াচ') || p.includes('সময়') || p.includes('ঘড়ি') || p.includes('clock')) {
    return {
      html: `<div class="stopwatch-card">
  <div class="header">
    <h2>⏱️ প্রো স্টপওয়াচ ও টাইমার</h2>
    <p>Precision Stopwatch & Lap Counter</p>
  </div>
  <div class="display-box">
    <div id="sw-time" class="time">00:00.00</div>
  </div>
  <div class="controls">
    <button id="sw-toggle" class="btn play" onclick="toggleSW()">▶ শুরু করুন</button>
    <button class="btn lap" onclick="lapSW()">🚩 ল্যাপ</button>
    <button class="btn reset" onclick="resetSW()">🔄 রিসেট</button>
  </div>
  <div class="laps-container">
    <h4>ল্যাপ তালিকা (Lap Records)</h4>
    <ul id="sw-laps"></ul>
  </div>
</div>`,
      css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #080c14; color: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
.stopwatch-card { background: #121824; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 28px; width: 100%; max-width: 380px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
.header h2 { color: #38bdf8; font-size: 20px; font-weight: bold; }
.header p { font-size: 11px; color: #64748b; margin-top: 4px; }
.display-box { background: #0a0e17; border-radius: 20px; padding: 30px 10px; margin: 24px 0; border: 1px solid rgba(56,189,248,0.2); }
.time { font-size: 44px; font-family: monospace; font-weight: 800; color: #38bdf8; letter-spacing: 2px; }
.controls { display: flex; gap: 10px; justify-content: center; }
.btn { border: none; padding: 12px 18px; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 13px; transition: all 0.2s; }
.play { background: #10b981; color: white; flex: 2; }
.play.pause { background: #f59e0b; }
.lap { background: #0284c7; color: white; flex: 1; }
.reset { background: #334155; color: #cbd5e1; flex: 1; }
.laps-container { margin-top: 24px; text-align: left; background: #0a0e17; padding: 14px; border-radius: 14px; max-height: 180px; overflow-y: auto; }
.laps-container h4 { font-size: 12px; color: #94a3b8; margin-bottom: 8px; }
#sw-laps { list-style: none; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 12px; }
#sw-laps li { display: flex; justify-content: space-between; padding: 4px 8px; border-radius: 6px; background: rgba(255,255,255,0.03); color: #cbd5e1; }`,
      js: `let timer = null, elapsed = 0, isRunning = false, laps = [];
function format(ms) { const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000), cs = Math.floor((ms % 1000) / 10); return (m<10?'0':'')+m+':'+(s<10?'0':'')+s+'.'+(cs<10?'0':'')+cs; }
function toggleSW() {
  const btn = document.getElementById('sw-toggle');
  if (isRunning) { clearInterval(timer); isRunning = false; btn.innerText = '▶ শুরু করুন'; btn.classList.remove('pause'); }
  else { const start = Date.now() - elapsed; timer = setInterval(() => { elapsed = Date.now() - start; document.getElementById('sw-time').innerText = format(elapsed); }, 10); isRunning = true; btn.innerText = '⏸ বিরতি'; btn.classList.add('pause'); }
}
function lapSW() { if (!isRunning) return; laps.unshift(format(elapsed)); renderLaps(); }
function resetSW() { clearInterval(timer); isRunning = false; elapsed = 0; laps = []; document.getElementById('sw-time').innerText = '00:00.00'; document.getElementById('sw-toggle').innerText = '▶ শুরু করুন'; document.getElementById('sw-toggle').classList.remove('pause'); renderLaps(); }
function renderLaps() { const el = document.getElementById('sw-laps'); el.innerHTML = laps.map((l, i) => '<li><span>ল্যাপ ' + (laps.length - i) + '</span><span>' + l + '</span></li>').join(''); }`
    };
  }

  // 3. BMI & Health Calculator
  if (p.includes('bmi') || p.includes('স্বাস্থ্য') || p.includes('health') || p.includes('ওজন')) {
    return {
      html: `<div class="bmi-card">
  <h2>🩺 বিএমআই (BMI) ক্যালকুলেটর</h2>
  <p class="desc">আপনার বডি মাস ইনডেক্স এবং স্বাস্থ্য স্কোর পরিমাপ করুন</p>
  <div class="form-row">
    <label>উচ্চতা (সেন্টিমিটার):</label>
    <input type="number" id="bmi-height" value="170" placeholder="উদা: 170" oninput="calcBMI()" />
  </div>
  <div class="form-row">
    <label>ওজন (কেজি):</label>
    <input type="number" id="bmi-weight" value="65" placeholder="উদা: 65" oninput="calcBMI()" />
  </div>
  <div class="result-box">
    <span class="label">আপনার বিএমআই স্কোর:</span>
    <div id="bmi-score" class="score">22.5</div>
    <div id="bmi-status" class="status normal">স্বাভাবিক ওজন (Healthy)</div>
  </div>
</div>`,
      css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #0c121e; color: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
.bmi-card { background: #162032; border-radius: 20px; padding: 28px; width: 100%; max-width: 360px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
h2 { color: #38bdf8; font-size: 20px; font-weight: bold; text-align: center; }
.desc { color: #64748b; font-size: 12px; text-align: center; margin: 6px 0 20px; }
.form-row { margin-bottom: 14px; }
.form-row label { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 6px; }
.form-row input { width: 100%; background: #0a0f18; border: 1px solid #334155; border-radius: 12px; padding: 12px; color: #38bdf8; font-size: 16px; font-weight: bold; outline: none; }
.result-box { margin-top: 20px; background: #0a0f18; border-radius: 16px; padding: 20px; text-align: center; border: 1px solid rgba(56,189,248,0.2); }
.result-box .label { font-size: 11px; color: #64748b; }
.score { font-size: 38px; font-weight: 800; color: #38bdf8; margin: 6px 0; font-family: monospace; }
.status { font-size: 13px; font-weight: bold; padding: 6px 12px; border-radius: 8px; display: inline-block; }
.normal { background: rgba(16,185,129,0.2); color: #10b981; }
.warning { background: rgba(245,158,11,0.2); color: #f59e0b; }
.danger { background: rgba(239,68,68,0.2); color: #ef4444; }`,
      js: `function calcBMI() {
  const h = parseFloat(document.getElementById('bmi-height').value) / 100;
  const w = parseFloat(document.getElementById('bmi-weight').value);
  if (!h || !w || h <= 0 || w <= 0) return;
  const bmi = (w / (h * h)).toFixed(1);
  document.getElementById('bmi-score').innerText = bmi;
  const st = document.getElementById('bmi-status');
  if (bmi < 18.5) { st.innerText = 'কম ওজন (Underweight)'; st.className = 'status warning'; }
  else if (bmi <= 24.9) { st.innerText = 'স্বাভাবিক ওজন (Healthy)'; st.className = 'status normal'; }
  else if (bmi <= 29.9) { st.innerText = 'অতিরিক্ত ওজন (Overweight)'; st.className = 'status warning'; }
  else { st.innerText = 'স্থূলতা (Obese)'; st.className = 'status danger'; }
}
calcBMI();`
    };
  }

  // 4. Password Generator
  if (p.includes('pass') || p.includes('পাসওয়ার্ড') || p.includes('security') || p.includes('secure')) {
    return {
      html: `<div class="pass-card">
  <h2>🔐 শক্তিশালী পাসওয়ার্ড জেনারেটর</h2>
  <div class="display">
    <span id="pass-out">Click Generate</span>
    <button onclick="copyPass()" title="কপি করুন">📋</button>
  </div>
  <div class="options">
    <div class="opt-row">
      <label>পাসওয়ার্ড দৈর্ঘ্য: <span id="len-val">16</span></label>
      <input type="range" id="len-slider" min="8" max="32" value="16" oninput="updateLen()" />
    </div>
    <label class="check-row"><input type="checkbox" id="chk-upper" checked onchange="genPass()" /> বড় হাতের অক্ষর (A-Z)</label>
    <label class="check-row"><input type="checkbox" id="chk-num" checked onchange="genPass()" /> সংখ্যা (0-9)</label>
    <label class="check-row"><input type="checkbox" id="chk-sym" checked onchange="genPass()" /> বিশেষ চিহ্ন (@#$%!)</label>
  </div>
  <button class="gen-btn" onclick="genPass()">⚡ নতুন পাসওয়ার্ড তৈরি করুন</button>
</div>`,
      css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #080c14; color: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
.pass-card { background: #131b2a; border-radius: 24px; padding: 28px; width: 100%; max-width: 380px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 20px 45px rgba(0,0,0,0.6); }
h2 { color: #38bdf8; font-size: 18px; text-align: center; margin-bottom: 20px; font-weight: bold; }
.display { background: #0a0e17; border: 1px solid #334155; border-radius: 14px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
#pass-out { font-family: monospace; font-size: 16px; font-weight: bold; color: #10b981; overflow-x: auto; }
.display button { background: #1e293b; border: none; color: white; padding: 8px 10px; border-radius: 8px; cursor: pointer; }
.options { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; background: #0a0e17; padding: 16px; border-radius: 14px; }
.opt-row label { font-size: 12px; color: #94a3b8; display: block; margin-bottom: 6px; }
.opt-row input { width: 100%; accent-color: #38bdf8; cursor: pointer; }
.check-row { font-size: 12px; color: #cbd5e1; display: flex; align-items: center; gap: 8px; cursor: pointer; }
.check-row input { accent-color: #38bdf8; width: 16px; height: 16px; }
.gen-btn { width: 100%; background: #0284c7; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: bold; font-size: 14px; cursor: pointer; transition: background 0.2s; }
.gen-btn:hover { background: #0369a1; }`,
      js: `function updateLen() { document.getElementById('len-val').innerText = document.getElementById('len-slider').value; genPass(); }
function genPass() {
  const len = parseInt(document.getElementById('len-slider').value);
  let chars = 'abcdefghijklmnopqrstuvwxyz';
  if (document.getElementById('chk-upper').checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (document.getElementById('chk-num').checked) chars += '0123456789';
  if (document.getElementById('chk-sym').checked) chars += '!@#$%^&*()_+~|}{[]:;?><,.-=';
  let res = '';
  for (let i = 0; i < len; i++) res += chars[Math.floor(Math.random() * chars.length)];
  document.getElementById('pass-out').innerText = res;
}
function copyPass() { const p = document.getElementById('pass-out').innerText; navigator.clipboard.writeText(p); alert('পাসওয়ার্ড ক্লিপবোর্ডে কপি করা হয়েছে!'); }
genPass();`
    };
  }

  // 5. Drawing / Canvas App
  if (p.includes('draw') || p.includes('canvas') || p.includes('আঁকা') || p.includes('পেইন্ট') || p.includes('sketch')) {
    return {
      html: `<div class="canvas-app">
  <div class="toolbar">
    <h3>🎨 ডিজিটাল ক্যানভাস ও ড্রয়িং</h3>
    <div class="tools">
      <input type="color" id="brush-color" value="#38bdf8" title="রঙ নির্বাচন" />
      <input type="range" id="brush-size" min="1" max="30" value="4" title="ব্রাশ সাইজ" />
      <button onclick="clearCanvas()" class="btn-clear">মুছুন</button>
      <button onclick="saveCanvas()" class="btn-save">💾 সেভ</button>
    </div>
  </div>
  <canvas id="paint-canvas" width="400" height="340"></canvas>
</div>`,
      css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #080c14; color: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 15px; }
.canvas-app { background: #131a28; border-radius: 20px; padding: 20px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; gap: 10px; flex-wrap: wrap; }
.toolbar h3 { font-size: 15px; color: #38bdf8; font-weight: bold; }
.tools { display: flex; align-items: center; gap: 8px; }
.tools input[type="color"] { width: 32px; height: 32px; border: none; border-radius: 8px; cursor: pointer; background: transparent; }
.tools input[type="range"] { width: 70px; accent-color: #38bdf8; cursor: pointer; }
.btn-clear, .btn-save { padding: 6px 12px; border-radius: 8px; border: none; font-size: 12px; font-weight: bold; cursor: pointer; }
.btn-clear { background: #ef4444; color: white; }
.btn-save { background: #10b981; color: white; }
canvas { background: #0a0d16; border: 1px solid #334155; border-radius: 14px; cursor: crosshair; touch-action: none; }`,
      js: `const canvas = document.getElementById('paint-canvas');
const ctx = canvas.getContext('2d');
let drawing = false;

function start(e) { drawing = true; draw(e); }
function stop() { drawing = false; ctx.beginPath(); }
function draw(e) {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
  const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
  ctx.lineWidth = document.getElementById('brush-size').value;
  ctx.lineCap = 'round';
  ctx.strokeStyle = document.getElementById('brush-color').value;
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

canvas.addEventListener('mousedown', start);
canvas.addEventListener('mouseup', stop);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); start(e); });
canvas.addEventListener('touchend', stop);
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });

function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }
function saveCanvas() { const a = document.createElement('a'); a.download = 'sketch.png'; a.href = canvas.toDataURL(); a.click(); }`
    };
  }

  // 6. Generic Smart Universal App (for ANY other query)
  return {
    html: `<div class="universal-app-card">
  <div class="card-header">
    <div class="icon">✨</div>
    <h2>${cleanTitle}</h2>
    <p>কাস্টম ইন্টারেক্টিভ ওয়েব অ্যাপ্লিকেশন</p>
  </div>

  <div class="input-panel">
    <label>ইনপুট বা অনুসন্ধান লিখুন:</label>
    <div class="input-row">
      <input type="text" id="app-input" placeholder="এখানে কিছু লিখুন বা হিসাব করুন..." onkeypress="if(event.key==='Enter') executeAction()" />
      <button class="primary-btn" onclick="executeAction()">প্রক্রিয়া করুন</button>
    </div>
  </div>

  <div class="metrics-grid">
    <div class="metric">
      <span class="label">মোট আইটেম / সংখ্যা</span>
      <span id="metric-count" class="value">0</span>
    </div>
    <div class="metric">
      <span class="label">স্ট্যাটাস</span>
      <span id="metric-status" class="value active">সক্রিয়</span>
    </div>
  </div>

  <div class="output-panel">
    <h4>ফলাফল ও লাইভ তালিকা:</h4>
    <ul id="action-list">
      <li class="empty-msg">এখনো কোনো ডেটা নেই, উপরে ইনপুট দিয়ে শুরু করুন।</li>
    </ul>
  </div>

  <div class="footer-actions">
    <button class="sec-btn" onclick="clearData()">মুছে ফেলুন</button>
    <button class="sec-btn" onclick="copyAll()">📋 কপি করুন</button>
  </div>
</div>`,
    css: `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #080c14; color: #f1f5f9; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
.universal-app-card { background: #131b29; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 28px; width: 100%; max-width: 440px; box-shadow: 0 20px 45px rgba(0,0,0,0.6); }
.card-header { text-align: center; margin-bottom: 20px; }
.card-header .icon { font-size: 28px; margin-bottom: 6px; }
.card-header h2 { font-size: 20px; color: #38bdf8; font-weight: 800; }
.card-header p { font-size: 12px; color: #64748b; margin-top: 4px; }
.input-panel label { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 6px; }
.input-row { display: flex; gap: 8px; margin-bottom: 18px; }
.input-row input { flex: 1; background: #0a0e17; border: 1px solid #334155; border-radius: 12px; padding: 12px 14px; color: white; font-size: 14px; outline: none; }
.input-row input:focus { border-color: #38bdf8; }
.primary-btn { background: #0284c7; color: white; border: none; border-radius: 12px; padding: 0 18px; font-weight: bold; font-size: 13px; cursor: pointer; }
.metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }
.metric { background: #0a0e17; border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 12px; text-align: center; }
.metric .label { font-size: 11px; color: #64748b; display: block; }
.metric .value { font-size: 18px; font-weight: bold; color: #f8fafc; font-family: monospace; }
.metric .value.active { color: #10b981; }
.output-panel { background: #0a0e17; border-radius: 14px; padding: 16px; border: 1px solid rgba(255,255,255,0.05); max-height: 220px; overflow-y: auto; }
.output-panel h4 { font-size: 12px; color: #94a3b8; margin-bottom: 10px; }
#action-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
#action-list li { background: rgba(255,255,255,0.03); padding: 10px 12px; border-radius: 8px; font-size: 13px; color: #cbd5e1; display: flex; justify-content: space-between; align-items: center; }
.empty-msg { color: #64748b !important; text-align: center; font-style: italic; background: transparent !important; }
.footer-actions { display: flex; justify-content: space-between; margin-top: 18px; }
.sec-btn { background: #1e293b; color: #94a3b8; border: none; padding: 8px 14px; border-radius: 8px; font-size: 12px; cursor: pointer; font-weight: 600; }
.sec-btn:hover { background: #334155; color: white; }`,
    js: `let items = [];

function executeAction() {
  const input = document.getElementById('app-input');
  const val = input.value.trim();
  if (!val) return;

  items.unshift({ text: val, time: new Date().toLocaleTimeString() });
  input.value = '';
  render();
}

function render() {
  const list = document.getElementById('action-list');
  document.getElementById('metric-count').innerText = items.length;

  if (items.length === 0) {
    list.innerHTML = '<li class="empty-msg">এখনো কোনো ডেটা নেই, উপরে ইনপুট দিয়ে শুরু করুন।</li>';
    return;
  }

  list.innerHTML = items.map((item, idx) => \`
    <li>
      <span>\${item.text}</span>
      <span style="font-size: 10px; color: #64748b;">\${item.time}</span>
    </li>
  \`).join('');
}

function clearData() {
  items = [];
  render();
}

function copyAll() {
  if (items.length === 0) return alert('কপি করার মতো ডেটা নেই!');
  const text = items.map(i => i.text).join('\\n');
  navigator.clipboard.writeText(text);
  alert('তালিকা ক্লিপবোর্ডে কপি করা হয়েছে!');
}`
  };
}

function getFallbackApp(promptText: string) {
  const p = (promptText || "").toLowerCase();
  if (p.includes('unit') || p.includes('convert') || p.includes('কনভার্টার') || p.includes('পরিমাপ')) {
    return FALLBACK_APPS.unit_converter;
  }
  if (p.includes('todo') || p.includes('task') || p.includes('লিস্ট') || p.includes('টাস্ক')) {
    return FALLBACK_APPS.todo;
  }
  return buildUniversalApp(promptText);
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

    const candidateModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    let generatedApp: any = null;

    for (const modelName of candidateModels) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const response = await ai.models.generateContent({
          model: modelName,
          contents: `You are an expert full-stack frontend engineer and creative web developer.
The user wants to create this web application: "${prompt}".

Generate a complete, fully functional, aesthetically impressive single-screen web app.
1. "html": Inner body HTML only (do NOT write <html>, <head>, or <body> tags). Provide semantic HTML containing all titles, buttons, inputs, displays, and containers.
2. "css": Modern, polished CSS styles with clean dark/contrast colors, smooth rounded corners, clean padding, typography, hover/active states.
3. "js": Complete, bug-free, interactive vanilla JavaScript with all functions, event listeners, calculations, and state logic so the app works immediately when clicked or typed in.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                html: { type: "STRING", description: "HTML inner body structure" },
                css: { type: "STRING", description: "CSS styling" },
                js: { type: "STRING", description: "Vanilla JavaScript interactivity" },
              },
              required: ["html", "css", "js"],
            },
          },
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
          // Parsing error
        }

        if (parsedJson && parsedJson.html && parsedJson.css && parsedJson.js) {
          generatedApp = parsedJson;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} temporary issue, checking next candidate:`, err?.status || err?.message || err);
      }
    }

    if (generatedApp) {
      return res.json(generatedApp);
    }

    const fallback = getFallbackApp(prompt);
    return res.json(fallback);
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

      const candidateModels = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
      let assistantText = "";

      for (const modelName of candidateModels) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              },
            },
          });

          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction: `You are the primary artificial intelligence assistant embedded in "হাতের কাছে" (Hater Kache) All-in-One Personal Productivity Hub.
"হাতের কাছে" (meaning "at hand" or "within reach" in Bengali) is an elegant, premium, minimalist Bengali/English dashboard.
Answer the user's queries in a helpful, friendly, and concise manner (at most 3-4 sentences/paragraphs).
You should reply in Bengali if the query is in Bengali, or English if it's in English (or match their code-switching/Banglish).
Be very motivating and productivity-focused. Keep responses extremely neat and readable.`,
            },
          });

          if (response.text) {
            assistantText = response.text;
            break;
          }
        } catch (err: any) {
          console.warn(`Assistant model ${modelName} temporary issue:`, err?.status || err?.message || err);
        }
      }

      if (assistantText) {
        return res.json({ text: assistantText });
      }

      return res.json({
        text: "হাতে থাকা সহকারী (Hater Kache Assistant): আপনার প্রশ্নটির জন্য ধন্যবাদ! প্রোডাক্টিভিটি বাড়াতে আজকের কাজগুলো ড্যাশবোর্ডে সাজিয়ে নিন এবং পোমোডোরো সেশন দিয়ে মনোযোগ ধরে রাখুন।"
      });
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
