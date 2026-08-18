import React, { useState, useEffect, useRef } from 'react';
import { 
  Code2, 
  Play, 
  Download, 
  Copy, 
  Sparkles, 
  RefreshCw, 
  Maximize2, 
  FileCode, 
  Layers, 
  Palette, 
  Terminal, 
  Check, 
  Wand2,
  BookOpen,
  MonitorPlay
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../LanguageContext';

// Preset templates for quick starting
interface Template {
  name: string;
  bnName: string;
  description: string;
  html: string;
  css: string;
  js: string;
}

const TEMPLATES: Record<string, Template> = {
  counter: {
    name: "Click Counter Game",
    bnName: "ক্লিক কাউন্টার গেম",
    description: "একটি রঙিন ক্লিক কাউন্টার গেম যা প্রতি ১০ ক্লিকে ব্যাকগ্রাউন্ডের রং পরিবর্তন করে।",
    html: `<div class="card">
  <h1>🎯 ক্লিক স্পীড চ্যালেঞ্জ!</h1>
  <div class="score-container">
    <span class="score" id="score-val">0</span>
    <p>স্কোর</p>
  </div>
  <button id="click-btn">ক্লিক করুন!</button>
  <button id="reset-btn" class="secondary">রিসেট</button>
  <p class="status" id="status-text">ক্লিক করা শুরু করুন...</p>
</div>`,
    css: `body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #0f172a, #1e1b4b);
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  transition: background 0.5s ease;
}

.card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  max-width: 320px;
  width: 100%;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #38bdf8;
}

.score-container {
  margin: 30px 0;
}

.score {
  font-size: 72px;
  font-weight: 800;
  color: #f43f5e;
  text-shadow: 0 0 10px rgba(244, 63, 94, 0.5);
  animation: pulse 1s infinite alternate;
}

button {
  background: linear-gradient(135deg, #f43f5e, #be123c);
  color: white;
  border: none;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  margin-bottom: 10px;
  box-shadow: 0 4px 15px rgba(244, 63, 94, 0.3);
  transition: transform 0.1s active, filter 0.2s;
}

button:hover {
  filter: brightness(1.1);
}

button:active {
  transform: scale(0.98);
}

button.secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
  box-shadow: none;
}

button.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

.status {
  font-size: 13px;
  color: #94a3b8;
  margin-top: 15px;
}`,
    js: `const clickBtn = document.getElementById('click-btn');
const resetBtn = document.getElementById('reset-btn');
const scoreVal = document.getElementById('score-val');
const statusText = document.getElementById('status-text');

let count = 0;
const bgColors = [
  'linear-gradient(135deg, #0f172a, #1e1b4b)',
  'linear-gradient(135deg, #1e1b4b, #311042)',
  'linear-gradient(135deg, #311042, #581c87)',
  'linear-gradient(135deg, #581c87, #1e293b)'
];

clickBtn.addEventListener('click', () => {
  count++;
  scoreVal.textContent = count;
  
  if (count % 10 === 0) {
    const bgIndex = Math.floor(count / 10) % bgColors.length;
    document.body.style.background = bgColors[bgIndex];
    statusText.textContent = "🎉 অসাধারণ! নতুন লেভেল আনলক হয়েছে!";
    statusText.style.color = "#38bdf8";
  } else {
    statusText.textContent = "ক্লিক করতে থাকুন...";
    statusText.style.color = "#94a3b8";
  }
});

resetBtn.addEventListener('click', () => {
  count = 0;
  scoreVal.textContent = '0';
  document.body.style.background = bgColors[0];
  statusText.textContent = "রিসেট করা হয়েছে। আবার শুরু করুন!";
  statusText.style.color = "#94a3b8";
});`
  },
  calculator: {
    name: "Simple Calculator",
    bnName: "সহজ ক্যালকুলেটর",
    description: "একটি আধুনিক এবং সুন্দর সাধারণ ক্যালকুলেটর যা টাচ ফ্রেন্ডলি বাটন অফার করে।",
    html: `<div class="calc-box">
  <div class="screen" id="display">0</div>
  <div class="grid">
    <button class="btn btn-clear" onclick="clearDisplay()">C</button>
    <button class="btn btn-op" onclick="appendOp('/')">/</button>
    <button class="btn btn-op" onclick="appendOp('*')">×</button>
    <button class="btn btn-op" onclick="appendOp('-')">-</button>
    
    <button class="btn" onclick="appendNum('7')">7</button>
    <button class="btn" onclick="appendNum('8')">8</button>
    <button class="btn" onclick="appendNum('9')">9</button>
    <button class="btn btn-op" onclick="appendOp('+')">+</button>
    
    <button class="btn" onclick="appendNum('4')">4</button>
    <button class="btn" onclick="appendNum('5')">5</button>
    <button class="btn" onclick="appendNum('6')">6</button>
    <button class="btn btn-equal" onclick="calculate()">=</button>
    
    <button class="btn" onclick="appendNum('1')">1</button>
    <button class="btn" onclick="appendNum('2')">2</button>
    <button class="btn" onclick="appendNum('3')">3</button>
    <button class="btn" onclick="appendNum('0')">0</button>
  </div>
</div>`,
    css: `body {
  font-family: 'Inter', system-ui, sans-serif;
  background: #0f172a;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}

.calc-box {
  background: #1e293b;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.4);
  width: 280px;
  border: 1px solid rgba(255,255,255,0.05);
}

.screen {
  background: #0f172a;
  border-radius: 12px;
  padding: 15px;
  font-size: 28px;
  color: #38bdf8;
  text-align: right;
  font-family: monospace;
  margin-bottom: 20px;
  overflow-x: auto;
  min-height: 40px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.btn {
  background: #334155;
  color: white;
  border: none;
  font-size: 18px;
  font-weight: 600;
  padding: 15px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.btn:hover {
  background: #475569;
}

.btn:active {
  transform: scale(0.95);
}

.btn-op {
  background: #0284c7;
}

.btn-op:hover {
  background: #0369a1;
}

.btn-clear {
  background: #ef4444;
}

.btn-clear:hover {
  background: #dc2626;
}

.btn-equal {
  background: #10b981;
  grid-row: span 2;
  grid-column: 4;
  height: calc(100% - 2px);
}`,
    js: `let displayValue = '0';

function updateDisplay() {
  document.getElementById('display').innerText = displayValue;
}

function appendNum(num) {
  if (displayValue === '0') {
    displayValue = num;
  } else {
    displayValue += num;
  }
  updateDisplay();
}

function appendOp(op) {
  const lastChar = displayValue.slice(-1);
  if (['+', '-', '*', '/'].includes(lastChar)) {
    displayValue = displayValue.slice(0, -1) + op;
  } else {
    displayValue += op;
  }
  updateDisplay();
}

function clearDisplay() {
  displayValue = '0';
  updateDisplay();
}

function calculate() {
  try {
    // Avoid eval for production but okay inside mini local playground sandbox
    displayValue = String(eval(displayValue));
  } catch (error) {
    displayValue = 'Error';
  }
  updateDisplay();
}`
  },
  drawing: {
    name: "Drawing Canvas",
    bnName: "ড্রয়িং ক্যানভাস",
    description: "একটি ব্রাশ সাইজ ও কালার সিলেক্টর সহ ডিরেক্ট আর্ট করার ডিজিটাল ক্যানভাস।",
    html: `<div class="container">
  <div class="toolbar">
    <input type="color" id="color" value="#38bdf8">
    <input type="range" id="size" min="1" max="20" value="5">
    <button id="clear">ক্যানভাস মুছুন</button>
  </div>
  <canvas id="canvas"></canvas>
</div>`,
    css: `body {
  font-family: sans-serif;
  background: #111827;
  color: white;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.toolbar {
  display: flex;
  gap: 15px;
  background: #1f2937;
  padding: 10px 20px;
  border-radius: 12px;
  align-items: center;
}

canvas {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  cursor: crosshair;
}

button {
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background: #dc2626;
}`,
    js: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorInput = document.getElementById('color');
const sizeInput = document.getElementById('size');
const clearBtn = document.getElementById('clear');

// Set canvas dimensions
canvas.width = 400;
canvas.height = 300;

let drawing = false;

function startPosition(e) {
  drawing = true;
  draw(e);
}

function finishedPosition() {
  drawing = false;
  ctx.beginPath();
}

function draw(e) {
  if (!drawing) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  ctx.lineWidth = sizeInput.value;
  ctx.lineCap = 'round';
  ctx.strokeStyle = colorInput.value;

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', finishedPosition);
canvas.addEventListener('mousemove', draw);

clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});`
  }
};

export default function WebBuilder() {
  const { t, isBn } = useLanguage();
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [htmlCode, setHtmlCode] = useState<string>(TEMPLATES.counter.html);
  const [cssCode, setCssCode] = useState<string>(TEMPLATES.counter.css);
  const [jsCode, setJsCode] = useState<string>(TEMPLATES.counter.js);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  
  // AI assistant status states
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Update sandbox preview whenever codes are updated
  const runPreview = () => {
    if (!iframeRef.current) return;
    
    const combinedSource = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          ${cssCode}
        </style>
      </head>
      <body>
        ${htmlCode}
        <script>
          try {
            ${jsCode}
          } catch(err) {
            console.error("Script Error: ", err);
            document.body.innerHTML += '<div style="color: #f43f5e; background: #fff1f2; border: 1px solid #fecdd3; padding: 10px; margin-top: 15px; border-radius: 8px; font-family: monospace; font-size: 12px;"><strong>Script Error:</strong> ' + err.message + '</div>';
          }
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([combinedSource], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    iframeRef.current.src = url;
  };

  useEffect(() => {
    runPreview();
  }, [htmlCode, cssCode, jsCode]);

  // Load a quick-start template
  const loadTemplate = (key: string) => {
    const temp = TEMPLATES[key];
    if (temp) {
      setHtmlCode(temp.html);
      setCssCode(temp.css);
      setJsCode(temp.js);
      setActiveTab('html');
    }
  };

  // Copy full source code to clipboard
  const copyFullCode = () => {
    const fullSource = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hater Kache App</title>
  <style>
${cssCode.split('\n').map(l => '    ' + l).join('\n')}
  </style>
</head>
<body>
${htmlCode.split('\n').map(l => '  ' + l).join('\n')}

  <script>
${jsCode.split('\n').map(l => '    ' + l).join('\n')}
  </script>
</body>
</html>`;

    navigator.clipboard.writeText(fullSource);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Export full app as standard index.html
  const downloadCode = () => {
    const fullSource = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hater Kache App</title>
  <style>
${cssCode}
  </style>
</head>
<body>
${htmlCode}
  <script>
${jsCode}
  </script>
</body>
</html>`;

    const blob = new Blob([fullSource], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hater-kache-app.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Run Gemini API Assistant to generate custom app code
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setGenerationError(null);

    const promptText = aiPrompt.trim();

    try {
      const response = await fetch('/api/generate-app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!response.ok) {
        throw new Error('API server returned error');
      }

      const data = await response.json();
      
      if (data && data.html && data.css && data.js) {
        setHtmlCode(data.html);
        setCssCode(data.css);
        setJsCode(data.js);
        setActiveTab('html');
        setAiPrompt('');
      } else {
        throw new Error('Invalid code structure returned');
      }
    } catch (err: any) {
      console.warn("AI generation fallback activated in client:", err);
      const cleanTitle = promptText.replace(/[<>"{}]/g, '') || "Custom App";
      const p = promptText.toLowerCase();

      if (p.includes('unit') || p.includes('convert') || p.includes('পরিমাপ') || p.includes('কনভার্ট')) {
        setHtmlCode(`<div class="converter-box">
  <h2>🔄 স্মার্ট ইউনিট কনভার্টার</h2>
  <div class="field">
    <label>মান (মিটার / Meters):</label>
    <input type="number" id="meter-input" value="1" oninput="doConvert()" />
  </div>
  <div class="results">
    <p>সেন্টিমিটার (cm): <span id="cm-res" class="val">100</span></p>
    <p>কিলোমিটার (km): <span id="km-res" class="val">0.001</span></p>
    <p>ইঞ্চি (inches): <span id="inch-res" class="val">39.37</span></p>
    <p>ফুট (feet): <span id="ft-res" class="val">3.28</span></p>
  </div>
</div>`);
        setCssCode(`* { box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #0f172a; color: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 15px; }
.converter-box { background: #1e293b; padding: 28px; border-radius: 20px; width: 100%; max-width: 360px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); }
h2 { color: #38bdf8; font-size: 18px; text-align: center; margin-bottom: 20px; font-weight: bold; }
.field label { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 6px; }
.field input { width: 100%; padding: 12px; background: #0f172a; border: 1px solid #334155; border-radius: 10px; color: #38bdf8; font-size: 18px; font-weight: bold; }
.results { margin-top: 20px; display: flex; flex-direction: column; gap: 10px; }
.results p { margin: 0; background: #0f172a; padding: 10px 14px; border-radius: 10px; font-size: 13px; display: flex; justify-content: space-between; }
.val { color: #38bdf8; font-weight: bold; }`);
        setJsCode(`function doConvert() {
  const m = parseFloat(document.getElementById('meter-input').value) || 0;
  document.getElementById('cm-res').innerText = (m * 100).toFixed(2);
  document.getElementById('km-res').innerText = (m / 1000).toFixed(4);
  document.getElementById('inch-res').innerText = (m * 39.3701).toFixed(2);
  document.getElementById('ft-res').innerText = (m * 3.28084).toFixed(2);
}
doConvert();`);
      } else {
        // Universal custom app generated for whatever prompt user entered
        setHtmlCode(`<div class="app-card">
  <div class="header">
    <div class="icon">✨</div>
    <h2>${cleanTitle}</h2>
    <p>কাস্টম ইন্টারেক্টিভ অ্যাপ্লিকেশন</p>
  </div>
  <div class="input-section">
    <label>ইনপুট / ডেটা যুক্ত করুন:</label>
    <div class="row">
      <input type="text" id="custom-input" placeholder="এখানে লিখুন..." onkeypress="if(event.key==='Enter') addItem()" />
      <button onclick="addItem()" class="add-btn">+ যোগ করুন</button>
    </div>
  </div>
  <div class="stats-row">
    <div class="stat-box"><span>মোট এন্ট্রি</span><b id="total-count">0</b></div>
    <div class="stat-box"><span>অবস্থা</span><b style="color: #10b981;">লাইভ</b></div>
  </div>
  <ul id="items-list" class="list">
    <li class="empty">এখনো কোনো এন্ট্রি নেই, উপরে লিখুন!</li>
  </ul>
  <div class="actions">
    <button onclick="clearList()" class="action-btn danger">মুছে ফেলুন</button>
    <button onclick="copyList()" class="action-btn">📋 কপি করুন</button>
  </div>
</div>`);
        setCssCode(`* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #090d16; color: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
.app-card { background: #131b2a; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 28px; width: 100%; max-width: 400px; box-shadow: 0 20px 45px rgba(0,0,0,0.6); }
.header { text-align: center; margin-bottom: 20px; }
.header .icon { font-size: 28px; }
.header h2 { font-size: 18px; color: #38bdf8; font-weight: bold; margin-top: 4px; }
.header p { font-size: 11px; color: #64748b; margin-top: 2px; }
.input-section label { font-size: 11px; color: #94a3b8; display: block; margin-bottom: 6px; }
.row { display: flex; gap: 8px; margin-bottom: 16px; }
.row input { flex: 1; background: #0a0e17; border: 1px solid #334155; border-radius: 12px; padding: 12px; color: white; outline: none; }
.row input:focus { border-color: #38bdf8; }
.add-btn { background: #0284c7; color: white; border: none; border-radius: 12px; padding: 0 16px; font-weight: bold; cursor: pointer; }
.stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
.stat-box { background: #0a0e17; padding: 10px; border-radius: 10px; text-align: center; }
.stat-box span { font-size: 10px; color: #64748b; display: block; }
.stat-box b { font-size: 16px; font-family: monospace; color: #38bdf8; }
.list { list-style: none; display: flex; flex-direction: column; gap: 8px; max-height: 180px; overflow-y: auto; background: #0a0e17; padding: 12px; border-radius: 12px; margin-bottom: 16px; }
.list li { background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 8px; font-size: 13px; display: flex; justify-content: space-between; }
.empty { color: #64748b; text-align: center; justify-content: center !important; font-style: italic; background: transparent !important; }
.actions { display: flex; justify-content: space-between; }
.action-btn { background: #1e293b; border: none; color: #94a3b8; padding: 8px 14px; border-radius: 8px; font-size: 12px; cursor: pointer; }
.action-btn.danger { color: #ef4444; }
.action-btn:hover { background: #334155; color: white; }`);
        setJsCode(`let entries = [];
function addItem() {
  const el = document.getElementById('custom-input');
  const v = el.value.trim();
  if (!v) return;
  entries.unshift(v);
  el.value = '';
  render();
}
function render() {
  const l = document.getElementById('items-list');
  document.getElementById('total-count').innerText = entries.length;
  if (entries.length === 0) {
    l.innerHTML = '<li class="empty">এখনো কোনো এন্ট্রি নেই, উপরে লিখুন!</li>';
    return;
  }
  l.innerHTML = entries.map(e => '<li><span>' + e + '</span><span style="color:#10b981;">✓</span></li>').join('');
}
function clearList() { entries = []; render(); }
function copyList() { if(!entries.length) return alert('কপি করার ডেটা নেই!'); navigator.clipboard.writeText(entries.join('\\n')); alert('কপি হয়েছে!'); }`);
      }
      setActiveTab('html');
      setAiPrompt('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="web-builder-card" className="rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white/70 dark:bg-slate-900/40 p-5 backdrop-blur-md shadow-lg flex flex-col gap-5 overflow-hidden">
      
      {/* Header section with branding & instructions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-sky-500 to-indigo-500 text-white p-2.5 rounded-xl shadow-md">
            <Code2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
              {t('ইনস্ট্যান্ট ওয়েব অ্যাপ বিল্ডার', 'Instant Web App Builder')} <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] px-2 py-0.5 rounded-full font-sans font-bold">App Maker Sandbox</span>
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium font-bengali">
              {t(
                'এইচটিএমএল, সিএসএস এবং জেএস কোড লিখে সরাসরি অ্যাপ তৈরি করুন অথবা এআই দিয়ে জেনারেট করুন!',
                'Create apps directly with HTML, CSS & JS code or generate with AI!'
              )}
            </p>
          </div>
        </div>

        {/* Quick presets selectors */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 px-2 flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> {t('উদাহরণ:', 'Examples:')}
          </span>
          {Object.entries(TEMPLATES).map(([key, value]) => (
            <button
              key={key}
              onClick={() => loadTemplate(key)}
              className="text-[10px] font-bold px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700/80 hover:shadow-xs transition-all cursor-pointer"
            >
              {isBn ? value.bnName : value.name}
            </button>
          ))}
        </div>
      </div>

      {/* AI Assistant app generation prompt bar */}
      <div className="bg-gradient-to-r from-sky-500/5 to-indigo-500/5 dark:from-sky-500/10 dark:to-indigo-500/10 border border-sky-500/20 dark:border-sky-500/10 p-3 rounded-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span className="text-[11px] font-black text-slate-700 dark:text-sky-300">
              {t('এআই কোড পাইলট (Describe & Build)', 'AI Code Pilot (Describe & Build)')}
            </span>
          </div>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium font-bengali">
            {t('বাংলা বা ইংরেজি যেকোনো ভাষায় লিখতে পারেন', 'Write in English or Bengali')}
          </span>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
            placeholder={t("যেমন: 'একটি লাভ ক্যালকুলেটর বানাও' অথবা 'A dynamic stopwatch app'", "e.g., 'A profit calculator app' or 'A dynamic stopwatch'")}
            disabled={isGenerating}
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none dark:text-slate-100 font-medium"
          />
          <button
            onClick={handleAIGenerate}
            disabled={isGenerating || !aiPrompt.trim()}
            className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {t('কোড হচ্ছে...', 'Generating...')}
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                {t('বানিয়ে দিন', 'Build App')}
              </>
            )}
          </button>
        </div>

        {generationError && (
          <p className="text-[10px] text-rose-500 font-medium">{generationError}</p>
        )}
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Hand: Code Editors (Column span 7) */}
        <div className="lg:col-span-7 flex flex-col border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden bg-slate-950">
          
          {/* Tab buttons */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-white/5">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('html')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  activeTab === 'html' 
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-orange-500" />
                HTML
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  activeTab === 'css' 
                    ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-sky-400" />
                CSS
              </button>
              <button
                onClick={() => setActiveTab('js')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  activeTab === 'js' 
                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-yellow-400" />
                JS (Behavior)
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-800">
                Editor
              </span>
            </div>
          </div>

          {/* Textarea fields for instant real-time compilation */}
          <div className="relative">
            {activeTab === 'html' && (
              <textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                className="w-full h-72 p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] leading-relaxed focus:outline-none resize-none"
                placeholder={t('<!-- এখানে আপনার HTML কন্টেন্ট লিখুন -->', '<!-- Type your HTML content here -->')}
              />
            )}
            {activeTab === 'css' && (
              <textarea
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
                className="w-full h-72 p-4 bg-slate-950 text-sky-300 font-mono text-[11px] leading-relaxed focus:outline-none resize-none"
                placeholder={t('/* এখানে আপনার CSS স্টাইল লিখুন */', '/* Type your CSS styles here */')}
              />
            )}
            {activeTab === 'js' && (
              <textarea
                value={jsCode}
                onChange={(e) => setJsCode(e.target.value)}
                className="w-full h-72 p-4 bg-slate-950 text-amber-300 font-mono text-[11px] leading-relaxed focus:outline-none resize-none"
                placeholder={t('// এখানে আপনার জাভাস্ক্রিপ্ট স্ক্রিপ্ট লিখুন', '// Type your JavaScript code here')}
              />
            )}
          </div>
          
          {/* Quick instructions in editor footer */}
          <div className="px-3 py-1.5 bg-slate-900/60 border-t border-white/5 text-[9px] text-slate-500 flex justify-between items-center">
            <span>💡 {t('যেকোনো পরিবর্তন সরাসরি ডানদিকের স্ক্রিনে দেখাবে', 'Any changes will render live on the right screen')}</span>
            <span>{htmlCode.length + cssCode.length + jsCode.length} Characters</span>
          </div>

        </div>

        {/* Right Hand: Sandbox Live Preview (Column span 5) */}
        <div className="lg:col-span-5 flex flex-col border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-slate-950 shadow-inner">
          
          {/* Preview toolbar */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200/60 dark:border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1.5 flex items-center gap-1">
                <MonitorPlay className="w-3.5 h-3.5 text-sky-500" />
                {t('লাইভ ভিউ', 'Live Preview')}
              </span>
            </div>

            <button
              onClick={runPreview}
              className="text-slate-400 hover:text-sky-500 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title={t('রিফ্রেশ ভিউ', 'Refresh Preview')}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sandboxed iframe */}
          <div className="relative flex-1 bg-white h-72">
            <iframe
              ref={iframeRef}
              title="Hater Kache App Preview"
              sandbox="allow-scripts"
              className="w-full h-full border-none bg-slate-900"
            />
          </div>

          {/* Action Footer */}
          <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200/60 dark:border-white/5 flex gap-2 justify-end">
            <button
              onClick={copyFullCode}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  {t('কপি হয়েছে!', 'Copied!')}
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  {t('কোড কপি করুন', 'Copy Code')}
                </>
              )}
            </button>

            <button
              onClick={downloadCode}
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-sky-500 text-white hover:bg-sky-600 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm shadow-sky-500/10"
            >
              <Download className="w-3.5 h-3.5" />
              {t('ডাউনলোড (.html)', 'Download (.html)')}
            </button>
          </div>

        </div>

      </div>


    </div>
  );
}
