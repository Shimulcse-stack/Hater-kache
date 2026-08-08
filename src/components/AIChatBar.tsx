import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, Bot, CornerDownLeft, RefreshCw, MessageSquare } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function AIChatBar() {
  const { t, isBn } = useLanguage();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('hk_ai_messages');
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState<string | null>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('hk_ai_messages', JSON.stringify(messages));
    if (messages.length > 0 && chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const activeText = textToSend || query;
    if (!activeText.trim()) return;

    setError(null);
    setIsLoading(true);
    if (!textToSend) setQuery('');

    const timestamp = new Date().toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    const userMessage: Message = {
      role: 'user',
      content: activeText,
      timestamp,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: activeText }),
      });

      if (!response.ok) {
        throw new Error(t('নেটওয়ার্ক ত্রুটি অথবা এপিআই কি অনুপলব্ধ।', 'Network error or API key unavailable.'));
      }

      const data = await response.json();
      const botMessage: Message = {
        role: 'assistant',
        content: data.text || t('দুঃখিত, কোনো উত্তর পাওয়া যায়নি।', 'Sorry, no response received.'),
        timestamp: new Date().toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error(err);
      setError(t('Gemini AI-এর সাথে সংযোগ করা যাচ্ছে না। অনুগ্রহ করে পরে আবার চেষ্টা করুন।', 'Cannot connect to Gemini AI. Please try again later.'));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const samplePrompts = [
    { text: t('আজকের দিনের জন্য ১টি প্রোডাক্টিভিটি টিপস দাও', 'Give me 1 productivity tip for today'), icon: '⚡' },
    { text: t('৫ মিনিটে ফোকাস বাড়াতে কী করতে পারি?', 'What can I do to improve focus in 5 minutes?'), icon: '🎯' },
    { text: t('পোমোডোরো টেকনিক কীভাবে ব্যবহার করব?', 'How to manage time using Pomodoro?'), icon: '⏱️' },
  ];

  return (
    <div className="rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-slate-900/30 p-5 backdrop-blur-md shadow-xl flex flex-col h-full min-h-[380px]">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-sky-500 to-indigo-500 p-1.5 rounded-xl text-white">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Embedded Assistant</span>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {t('এআই কমান্ড সেন্টার', 'AI Command Centre')}
            </h3>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-xs text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            {t('মুছে ফেলুন', 'Clear')}
          </button>
        )}
      </div>

      {/* Messages Window */}
      <div ref={chatScrollContainerRef} className="flex-1 overflow-y-auto max-h-[220px] mb-3 space-y-3 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <Bot className="w-10 h-10 text-slate-400 dark:text-slate-600 mb-2 animate-bounce-slow" />
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs font-bengali">
              {t('আমি হাতের কাছের কৃত্রিম বুদ্ধিমত্তা সম্পন্ন সহকারী। কীভাবে সাহায্য করতে পারি?', 'I am your smart assistant. How can I help you today?')}
            </p>
            
            {/* Quick Prompts Grid */}
            <div className="grid grid-cols-1 gap-2 mt-4 w-full">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.text)}
                  className="text-left text-xs bg-slate-100 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-sky-500/10 border border-slate-200/50 dark:border-white/5 rounded-xl p-2.5 transition-all text-slate-700 dark:text-slate-300 flex items-start gap-2 group cursor-pointer"
                >
                  <span className="group-hover:scale-125 transition-transform">{p.icon}</span>
                  <span className="flex-1 truncate font-medium">{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-sky-500 text-white rounded-br-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-white/5 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span
                    className={`block text-[9px] mt-1 ${
                      msg.role === 'user' ? 'text-sky-100 text-right' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2.5 items-center text-slate-400 dark:text-slate-500 text-xs pl-1">
                <Bot className="w-4 h-4 text-sky-500 animate-spin" />
                <span>{t('এআই চিন্তা করছে...', 'AI is thinking...')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input controls */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          placeholder={t('যে কোনো কিছু জিজ্ঞাসা করুন...', 'Ask anything...')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 rounded-xl pl-3.5 pr-10 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500/50 text-slate-800 dark:text-slate-100 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 p-1.5 rounded-lg bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-40 transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

