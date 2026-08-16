import React, { useState, useEffect, useRef } from 'react';
import { Copy, Trash, Check, Sparkles, FileText, CheckCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { dispatchAppNotification } from '../utils/notificationSystem';
import { subscribeUserScratchpad, saveUserScratchpadToFirestore } from '../lib/firebase';

interface ScratchpadProps {
  className?: string;
  userId?: string;
}

export default function Scratchpad({ className = '', userId }: ScratchpadProps) {
  const { t } = useLanguage();
  const storageKey = userId ? `hk_scratchpad_${userId}` : 'hk_scratchpad';

  const [note, setNote] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved || '';
  });
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isRemoteUpdate = useRef(false);

  // Real-time Firestore sync
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeUserScratchpad(userId, (remoteContent) => {
      isRemoteUpdate.current = true;
      setNote(remoteContent);
      localStorage.setItem(storageKey, remoteContent);
      setTimeout(() => {
        isRemoteUpdate.current = false;
      }, 100);
    });
    return () => unsubscribe();
  }, [userId, storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, note);
    if (!isRemoteUpdate.current && userId) {
      setIsSaving(true);
      const timeout = setTimeout(() => {
        saveUserScratchpadToFirestore(userId, note);
        setIsSaving(false);
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [note, userId, storageKey]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note);
      setCopied(true);
      dispatchAppNotification({
        titleBn: '📋 টেক্সট কপি করা হয়েছে',
        titleEn: '📋 Text Copied',
        messageBn: 'স্ক্র্যাচপ্যাডের টেক্সট ক্লিফবোর্ডে কপি করা হয়েছে।',
        messageEn: 'Scratchpad note content copied to clipboard.',
        type: 'info'
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleClear = () => {
    if (window.confirm(t('আপনি কি নিশ্চিত যে আপনি স্ক্র্যাচপ্যাডটি সাফ করতে চান?', 'Are you sure you want to clear the scratchpad?'))) {
      setNote('');
      dispatchAppNotification({
        titleBn: '🧹 স্ক্র্যাচপ্যাড সাফ করা হয়েছে',
        titleEn: '🧹 Scratchpad Cleared',
        messageBn: 'স্ক্র্যাচপ্যাডের সকল টেক্সট সফলভাবে মুছে দেওয়া হয়েছে।',
        messageEn: 'All scratchpad notes cleared.',
        type: 'info'
      });
    }
  };

  const getWordCount = () => {
    const clean = note.trim();
    if (!clean) return 0;
    return clean.split(/\s+/).length;
  };

  const getCharCount = () => {
    return note.length;
  };

  return (
    <div className={`rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-slate-900/30 p-5 backdrop-blur-md shadow-xl flex flex-col justify-between h-full min-h-[300px] flex-1 ${className}`}>
      
      {/* Header */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-500" />
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Quick Memo</span>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {t('স্ক্র্যাচপ্যাড নোটস', 'Scratchpad Notes')}
              </h3>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              disabled={!note.trim()}
              title={t('কপি করুন', 'Copy notes')}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-800 text-slate-500 hover:text-sky-500 hover:border-sky-500/30 dark:hover:text-sky-400 disabled:opacity-40 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleClear}
              disabled={!note.trim()}
              title={t('মুছে ফেলুন', 'Clear notes')}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-800 text-slate-500 hover:text-rose-500 hover:border-rose-500/30 dark:hover:text-rose-400 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Trash className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Space */}
      <div className="flex-1 my-3 bg-slate-50/50 dark:bg-slate-800/10 rounded-xl border border-slate-100 dark:border-white/5 p-3 flex flex-col">
        <textarea
          placeholder={t(
            'এখানে আপনার গুরুত্বপূর্ণ নোটস বা লিংকগুলো তাৎক্ষণিকভাবে টুকে রাখুন। এটি নিজে নিজেই ব্রাউজারে সংরক্ষিত থাকবে...',
            'Type your quick notes or links here. They will automatically save in your browser...'
          )}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="flex-1 w-full bg-transparent resize-none border-none focus:outline-none text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 leading-relaxed font-sans"
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium pt-1 border-t border-slate-100 dark:border-white/5">
        <span className="flex items-center gap-1">
          <CheckCircle className={`w-3.5 h-3.5 ${isSaving ? 'text-amber-500 animate-spin' : 'text-emerald-500'}`} />
          {isSaving ? t('সংরক্ষণ হচ্ছে...', 'Saving...') : t('সংরক্ষিত (Autosaved)', 'Autosaved')}
        </span>
        <div className="flex gap-2.5">
          <span>{t('শব্দ:', 'Words:')} {getWordCount()}</span>
          <span>{t('অক্ষর:', 'Chars:')} {getCharCount()}</span>
        </div>
      </div>
    </div>
  );
}

