import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CheckSquare, Square, Plus, Trash2, Calendar, Sparkles, Clock, CheckCircle2, GripVertical } from 'lucide-react';
import { Task } from '../types';
import { useLanguage } from '../LanguageContext';
import { dispatchAppNotification } from '../utils/notificationSystem';

export default function ProductivityStation() {
  const { t, isBn } = useLanguage();

  // --- POMODORO TIMER STATES ---
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);


  const modeTimes = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    setTimeLeft(modeTimes[timerMode]);
    setIsTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [timerMode]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          // Exactly 1 minute remaining (60 seconds) before session ends
          if (prev === 61) {
            playBeepSound();
            dispatchAppNotification({
              titleBn: '⏰ ১ মিনিট বাকি (টাইমার)',
              titleEn: '⏰ 1 Minute Left (Timer)',
              messageBn: `আপনার পোমোডোরো (${timerMode === 'pomodoro' ? 'কাজ' : 'বিরতি'}) সেশন শেষ হতে ঠিক ১ মিনিট বাকি আছে!`,
              messageEn: `1 minute remaining in your ${timerMode === 'pomodoro' ? 'work' : 'break'} session!`,
              type: 'alert'
            });
          }

          if (prev <= 1) {
            setIsTimerRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            playBeepSound();
            dispatchAppNotification({
              titleBn: '🎉 পোমোডোরো সময় সম্পূর্ণ!',
              titleEn: '🎉 Timer Session Completed!',
              messageBn: `আপনার পোমোডোরো (${timerMode === 'pomodoro' ? 'কাজ' : 'বিরতি'}) সেশন সম্পূর্ণ হয়েছে।`,
              messageEn: `Your ${timerMode} session has ended!`,
              type: 'timer'
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerMode]);

  // Synthesis alert sound using Web Audio API so it's fully self-contained!
  const playBeepSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();

      // Helper function to play a single sweet note with volume envelope
      const playNote = (frequency: number, startTime: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, startTime);

        // Gentle soft attack & smooth exponential decay to avoid clicky sounds
        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.linearRampToValueAtTime(0.18, startTime + 0.04); // subtle peak volume
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
      };

      const now = audioCtx.currentTime;

      // Beautiful harmonic upward chime: E5 (659.25 Hz) then A5 (880 Hz)
      playNote(659.25, now, 0.4);
      playNote(880.00, now + 0.15, 0.5);
    } catch (e) {
      console.warn("Audio Context not allowed by browser permissions:", e);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = () => {
    if (!isTimerRunning) {
      const mins = Math.floor(timeLeft / 60);
      dispatchAppNotification({
        titleBn: '⏱️ টাইমার শুরু হয়েছে',
        titleEn: '⏱️ Timer Started',
        messageBn: `${mins} মিনিটের টাইমার কাউন্টডাউন শুরু করা হয়েছে।`,
        messageEn: `${mins} minutes countdown timer started.`,
        type: 'timer'
      });
    } else {
      dispatchAppNotification({
        titleBn: '⏸️ টাইমার সাময়িক স্থগিত',
        titleEn: '⏸️ Timer Paused',
        messageBn: `টাইমার সেশন স্থগিত করা হয়েছে (${Math.floor(timeLeft / 60)} মিনিট বাকি)।`,
        messageEn: `Timer paused (${Math.floor(timeLeft / 60)}m left).`,
        type: 'timer'
      });
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(modeTimes[timerMode]);
    dispatchAppNotification({
      titleBn: '🔄 টাইমার রিসেট',
      titleEn: '🔄 Timer Reset',
      messageBn: `টাইমারটি পুনরায় ${Math.floor(modeTimes[timerMode] / 60)} মিনিটে রিসেট করা হয়েছে।`,
      messageEn: `Timer reset to ${Math.floor(modeTimes[timerMode] / 60)} minutes.`,
      type: 'timer'
    });
  };

  const getProgressPercentage = () => {
    const total = modeTimes[timerMode];
    return ((total - timeLeft) / total) * 100;
  };


  // --- TO-DO PLANNER STATES ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('hk_tasks');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', text: 'হাতের কাছে ড্যাশবোর্ড কাস্টমাইজ করুন', completed: false, priority: 'high', createdAt: new Date().toISOString() },
      { id: '2', text: 'একটি ২৫ মিনিটের পোমোডোরো সেশন শেষ করুন', completed: true, priority: 'medium', createdAt: new Date().toISOString() },
      { id: '3', text: 'এআই সহকারীর সাথে চ্যাট করুন', completed: false, priority: 'low', createdAt: new Date().toISOString() },
    ];
  });
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskFilter, setTaskFilter] = useState<'all' | 'active' | 'completed'>('all');

  // --- DRAG AND DROP STATES & HANDLERS ---
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId === id) return;
    setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const sourceIndex = tasks.findIndex((t) => t.id === draggedId);
    const targetIndex = tasks.findIndex((t) => t.id === targetId);

    if (sourceIndex !== -1 && targetIndex !== -1) {
      const updatedTasks = [...tasks];
      const [removed] = updatedTasks.splice(sourceIndex, 1);
      updatedTasks.splice(targetIndex, 0, removed);
      setTasks(updatedTasks);
    }

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  useEffect(() => {
    localStorage.setItem('hk_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      priority: newTaskPriority,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    dispatchAppNotification({
      titleBn: '📝 নতুন টাস্ক যুক্ত হয়েছে',
      titleEn: '📝 New Task Added',
      messageBn: `টাস্ক: "${newTaskText.trim()}"`,
      messageEn: `Task: "${newTaskText.trim()}"`,
      type: 'info'
    });
    setNewTaskText('');
    setNewTaskPriority('medium');
  };

  const toggleTaskCompleted = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.completed;
          dispatchAppNotification({
            titleBn: nextState ? '✅ টাস্ক সম্পন্ন!' : '📝 টাস্ক পুনর্নির্ধারিত',
            titleEn: nextState ? '✅ Task Completed!' : '📝 Task Reopened',
            messageBn: `টাস্ক: "${t.text}"`,
            messageEn: `Task: "${t.text}"`,
            type: 'info'
          });
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    if (taskToDelete) {
      dispatchAppNotification({
        titleBn: '🗑️ টাস্ক মুছে ফেলা হয়েছে',
        titleEn: '🗑️ Task Deleted',
        messageBn: `টাস্ক: "${taskToDelete.text}"`,
        messageEn: `Task: "${taskToDelete.text}"`,
        type: 'info'
      });
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'active') return !t.completed;
    if (taskFilter === 'completed') return t.completed;
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const taskProgress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">
      
      {/* 1. Pomodoro Timer Widget (Left 5 cols) */}
      <div className="lg:col-span-5 rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-slate-900/30 p-5 backdrop-blur-md shadow-xl flex flex-col justify-between min-h-[380px]">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-sky-500 animate-pulse" />
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Focus Tracker</span>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t('পোমোডোরো টাইমার', 'Pomodoro Timer')}</h3>
            </div>
          </div>

          {/* Mode Switchers */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-white/5 gap-1 mb-6">
            <button
              onClick={() => setTimerMode('pomodoro')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                timerMode === 'pomodoro'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('কাজ', 'Work')}
            </button>
            <button
              onClick={() => setTimerMode('shortBreak')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                timerMode === 'shortBreak'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('ছোট বিরতি', 'Short Break')}
            </button>
            <button
              onClick={() => setTimerMode('longBreak')}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                timerMode === 'longBreak'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('লম্বা বিরতি', 'Long Break')}
            </button>
          </div>
        </div>

        {/* Timer Visualization */}
        <div className="flex flex-col items-center justify-center my-2">
          <div className="relative w-40 h-40 flex items-center justify-center rounded-full border border-slate-200 dark:border-white/5 bg-slate-100/40 dark:bg-slate-800/10 shadow-inner">
            {/* SVG Arc for Progress Ring */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="74"
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="74"
                className={`${
                  timerMode === 'pomodoro'
                    ? 'stroke-sky-500'
                    : timerMode === 'shortBreak'
                    ? 'stroke-emerald-500'
                    : 'stroke-indigo-500'
                } transition-all duration-300`}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 74}
                strokeDashoffset={2 * Math.PI * 74 * (1 - getProgressPercentage() / 100)}
                strokeLinecap="round"
              />
            </svg>

            {/* Countdown string */}
            <div className="text-center z-10">
              <span className="text-3xl font-black tracking-tight text-slate-800 dark:text-white font-mono">
                {formatTime(timeLeft)}
              </span>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold mt-1">
                {isTimerRunning ? t('চলমান', 'Running') : t('স্থগিত', 'Paused')}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={resetTimer}
            title={t('পুনরায় শুরু', 'Reset')}
            className="p-2.5 rounded-full border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-800 text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 shadow transition-all hover:scale-105 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleTimer}
            className={`px-6 py-2.5 rounded-full text-xs font-semibold text-white flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer ${
              isTimerRunning
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-sky-500 hover:bg-sky-600'
            }`}
          >
            {isTimerRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-white" />
                <span>{t('থামুন', 'Pause')}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{t('শুরু', 'Start')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Task Planner Widget (Right 7 cols) */}
      <div className="lg:col-span-7 rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-slate-900/30 p-5 backdrop-blur-md shadow-xl flex flex-col justify-between min-h-[380px]">
        <div>
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-500" />
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Plan Station</span>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t('আজকের কর্মপরিকল্পনা', 'Daily Task Planner')}</h3>
              </div>
            </div>
            
            {/* Filter controls */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-white/5">
              {(['all', 'active', 'completed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTaskFilter(filter)}
                  className={`px-2.5 py-1 rounded-md text-[9px] font-semibold capitalize transition-all cursor-pointer ${
                    taskFilter === filter
                      ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {filter === 'all' ? t('সব', 'All') : filter === 'active' ? t('চলতি', 'Active') : t('সম্পন্ন', 'Done')}
                </button>
              ))}
            </div>
          </div>

          {/* Progress meter */}
          <div className="mb-4">
            <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1 font-medium">
              <span>{t('অগ্রগতি ও কাজ সাজানো (⇅)', 'Progress & Drag to Reorder (⇅)')}</span>
              <span>{taskProgress}% {t('সম্পন্ন', 'Done')}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full transition-all duration-500"
                style={{ width: `${taskProgress}%` }}
              />
            </div>
          </div>

          {/* New Task Entry */}
          <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder={t('নতুন কাজ লিখুন...', 'Add a new task...')}
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="flex-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500/50 text-slate-800 dark:text-slate-100"
            />
            
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-xl px-2 py-2 text-[10px] font-bold focus:outline-none text-slate-600 dark:text-slate-300"
            >
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Mid</option>
              <option value="low">🟢 Low</option>
            </select>

            <button
              type="submit"
              className="bg-sky-500 hover:bg-sky-600 text-white px-3.5 py-2 rounded-xl transition-colors shrink-0 flex items-center justify-center shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Tasks List */}
          <div className="space-y-2 overflow-y-auto max-h-[160px] pr-1">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 dark:border-white/5 rounded-xl">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  {t('কোনো কাজ পাওয়া যায়নি।', 'No tasks found.')}
                </span>
              </div>
            ) : (
              filteredTasks.map((tItem) => {
                const isCurrentlyDragged = draggedId === tItem.id;
                const isCurrentlyDragOver = dragOverId === tItem.id;

                return (
                  <div
                    key={tItem.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, tItem.id)}
                    onDragOver={(e) => handleDragOver(e, tItem.id)}
                    onDrop={(e) => handleDrop(e, tItem.id)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 shadow-sm select-none ${
                      isCurrentlyDragged 
                        ? 'opacity-40 border-dashed border-sky-500 bg-sky-500/5 scale-95' 
                        : isCurrentlyDragOver
                        ? 'border-sky-500 bg-sky-500/10 scale-[1.01]'
                        : 'border-slate-100 dark:border-white/5 bg-white dark:bg-slate-800/40 hover:border-slate-200 dark:hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Drag Handle */}
                      <div className="text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 cursor-grab active:cursor-grabbing p-0.5 shrink-0 transition-colors">
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>

                      <button
                        onClick={() => toggleTaskCompleted(tItem.id)}
                        className="text-slate-400 hover:text-sky-500 dark:text-slate-500 transition-colors shrink-0 cursor-pointer"
                      >
                        {tItem.completed ? (
                          <CheckSquare className="w-4 h-4 text-sky-500" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <span
                        className={`text-[11px] font-medium truncate ${
                          tItem.completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {tItem.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 ml-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          tItem.priority === 'high'
                            ? 'bg-rose-500/10 text-rose-500'
                            : tItem.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-emerald-500/10 text-emerald-500'
                        }`}
                      >
                        {tItem.priority === 'high' ? 'High' : tItem.priority === 'medium' ? 'Mid' : 'Low'}
                      </span>

                      <button
                        onClick={() => handleDeleteTask(tItem.id)}
                        className="text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium pt-2 border-t border-slate-100 dark:border-white/5">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-sky-500" />
            {t('আজ:', 'Today:')} {new Date().toLocaleDateString(isBn ? 'bn-BD' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span>{t('সম্পন্ন:', 'Done:')} {completedCount}/{totalCount}</span>
        </div>
      </div>

    </div>
  );
}
