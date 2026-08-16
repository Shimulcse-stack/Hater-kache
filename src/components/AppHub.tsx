import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  ShoppingBag, 
  Share2, 
  Wrench, 
  X, 
  Link, 
  Camera, 
  Calculator, 
  MessageSquare, 
  Printer, 
  FileText, 
  Image as ImageIcon, 
  UserCheck, 
  FileSpreadsheet, 
  Grid, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Monitor,
  Search,
  CheckCircle2,
  FolderOpen,
  Upload,
  Edit2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { Bookmark } from '../types';
import { dispatchAppNotification } from '../utils/notificationSystem';
import { useLanguage } from '../LanguageContext';
import { 
  subscribeUserBookmarks, 
  saveUserBookmarkToFirestore, 
  deleteUserBookmarkFromFirestore 
} from '../lib/firebase';

export interface ServiceApp {
  id: string;
  titleBn: string;
  titleEn: string;
  category: string;
  iconType: 'photo' | 'calc' | 'convert' | 'whatsapp' | 'ad' | 'studio' | 'autofill' | 'nid' | 'print' | 'joint';
  url?: string;
  badge?: string;
  description?: string;
  bgColor: string;
  accentColor: string;
}

export const PRESET_SERVICES: ServiceApp[] = [
  {
    id: 's1',
    titleBn: 'ফাইন্ড ফটো',
    titleEn: 'Find Photo',
    category: 'ছবি ও স্টুডিও',
    iconType: 'photo',
    url: 'https://images.google.com',
    bgColor: 'from-emerald-500/20 to-teal-500/20',
    accentColor: 'text-emerald-400',
    description: 'সহজে আপনার যেকোনো ছবি খুঁজুন ও প্রস্তুত করুন'
  },
  {
    id: 's2',
    titleBn: 'আইটি হিসাব',
    titleEn: 'IT Calculator',
    category: 'হিসাব-নিকাশ',
    iconType: 'calc',
    url: '#converters',
    bgColor: 'from-rose-500/20 to-pink-500/20',
    accentColor: 'text-rose-400',
    description: 'ব্যবসায়িক ও ব্যাক্তিগত দ্রুত আইটি ও বাজেট হিসাব'
  },
  {
    id: 's3',
    titleBn: 'ইমো ফটো কনভার্ট',
    titleEn: 'IMO Photo Convert',
    category: 'ছবি ও স্টুডিও',
    iconType: 'convert',
    url: 'https://tinypng.com',
    bgColor: 'from-sky-500/20 to-blue-500/20',
    accentColor: 'text-sky-400',
    description: 'লো-রেজোলিউশনের ছবিকে HD কোয়ালিটিতে কনভার্ট করুন'
  },
  {
    id: 's4',
    titleBn: 'হোয়াটস্ অ্যাপ',
    titleEn: 'WhatsApp Direct',
    category: 'যোগাযোগ',
    iconType: 'whatsapp',
    url: 'https://web.whatsapp.com',
    bgColor: 'from-emerald-600/20 to-green-500/20',
    accentColor: 'text-emerald-400',
    description: 'নম্বর সেভ না করেই সরাসরি হোয়াটসঅ্যাপে মেসেজ দিন'
  },
  {
    id: 's5',
    titleBn: 'আমার বিজ্ঞাপন',
    titleEn: 'My Ads',
    category: 'মার্কেটিং',
    iconType: 'ad',
    url: 'https://facebook.com/adsmanager',
    bgColor: 'from-amber-500/20 to-orange-500/20',
    accentColor: 'text-amber-400',
    description: 'সোশ্যাল মিডিয়া ও গুগল এডভার্টাইজিং ব্যানার'
  },
  {
    id: 's6',
    titleBn: 'ফটো স্টুডিও Pro',
    titleEn: 'Photo Studio',
    category: 'ছবি ও স্টুডিও',
    iconType: 'studio',
    url: 'https://pixlr.com',
    bgColor: 'from-cyan-500/20 to-blue-600/20',
    accentColor: 'text-cyan-400',
    description: 'ব্যাকগ্রাউন্ড রিমুভ ও ছবি অটো এডিটিং টুল'
  },
  {
    id: 's7',
    titleBn: 'টেলিটক জবস্ অটো ফিল',
    titleEn: 'Teletalk Jobs Auto Fill',
    category: 'চাকরি ও আবেদন',
    iconType: 'autofill',
    url: 'http://alljobs.teletalk.com.bd',
    bgColor: 'from-teal-500/20 to-emerald-600/20',
    accentColor: 'text-teal-400',
    description: 'সরকারি চাকরির ফরম এক ক্লিকে অটোমেটিক ফিল-আপ'
  },
  {
    id: 's8',
    titleBn: 'NID প্রিন্ট রেডি',
    titleEn: 'NID Print Ready',
    category: 'প্রিন্ট ও ডকুমেন্ট',
    iconType: 'nid',
    url: 'https://services.nidw.gov.bd',
    bgColor: 'from-indigo-500/20 to-purple-500/20',
    accentColor: 'text-indigo-400',
    description: 'এনআইডি কার্ড লেমিনেটিং সাইজে অটো ফিট প্রিন্টিং'
  },
  {
    id: 's9',
    titleBn: 'A4 প্রিন্ট রেডি',
    titleEn: 'A4 Print Layout',
    category: 'প্রিন্ট ও ডকুমেন্ট',
    iconType: 'print',
    url: 'https://docs.google.com',
    bgColor: 'from-emerald-500/20 to-green-600/20',
    accentColor: 'text-emerald-400',
    description: 'ডকুমেন্ট ও সার্টিফিকেট A4 পেপারে নিখুঁত সাজানো'
  },
  {
    id: 's10',
    titleBn: 'যৌথ ছবি মেকার',
    titleEn: 'Joint Photo Maker',
    category: 'ছবি ও স্টুডিও',
    iconType: 'joint',
    url: 'https://canva.com',
    bgColor: 'from-purple-500/20 to-pink-500/20',
    accentColor: 'text-purple-400',
    description: 'দুই বা ততোধিক ছবি একসাথে যুক্ত করার সহজ টুল'
  }
];

export const BASE_CATEGORY_TABS = [
  { id: 'all', labelBn: 'সব সেবা ও টুলস', labelEn: 'All Services & Tools' },
  { id: 'চাকরি ও আবেদন', labelBn: 'সরকারি-বেসরকারি চাকরি', labelEn: 'Jobs & Applications' },
  { id: 'ছবি ও স্টুডিও', labelBn: 'ছবি ও ফটো স্টুডিও', labelEn: 'Photo & Studio' },
  { id: 'প্রিন্ট ও ডকুমেন্ট', labelBn: 'সিভি ও প্রিন্টিং সেবা', labelEn: 'Print & Documents' },
  { id: 'হিসাব-নিকাশ', labelBn: 'আইটি ও হিসাব-নিকাশ', labelEn: 'IT & Calculations' },
  { id: 'যোগাযোগ', labelBn: 'মেসেজিং ও সোশ্যাল', labelEn: 'Messaging & Social' },
  { id: 'মার্কেটিং', labelBn: 'মার্কেটিং ও বিজ্ঞাপন', labelEn: 'Marketing & Ads' },
  { id: 'শিক্ষা', labelBn: 'শিক্ষা ও ক্যারিয়ার', labelEn: 'Education & Career' },
  { id: 'ব্যক্তিগত', labelBn: 'ব্যক্তিগত বুকমার্কস', labelEn: 'Personal Bookmarks' },
];

export const getHubStats = () => {
  try {
    const saved = localStorage.getItem('hk_bookmarks');
    const custom: Bookmark[] = saved ? JSON.parse(saved) : [];
    const baseCatIds = BASE_CATEGORY_TABS.filter(t => t.id !== 'all').map(t => t.id);
    const customCats = custom.map(c => c.category).filter(Boolean);
    const uniqueCategories = new Set([...baseCatIds, ...customCats]);
    return {
      servicesCount: PRESET_SERVICES.length + custom.length,
      categoriesCount: uniqueCategories.size
    };
  } catch {
    return {
      servicesCount: PRESET_SERVICES.length,
      categoriesCount: BASE_CATEGORY_TABS.length - 1
    };
  }
};

interface AppHubProps {
  externalSearchQuery?: string;
  userId?: string;
}

export default function AppHub({ externalSearchQuery, userId }: AppHubProps = {}) {
  const { t, isBn } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchTerm(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  useEffect(() => {
    const handleCategorySelect = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setSelectedCategory(customEvent.detail);
        const el = document.getElementById('app-hub-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('hk_select_category', handleCategorySelect);
    return () => window.removeEventListener('hk_select_category', handleCategorySelect);
  }, []);
  
  const storageKey = userId ? `hk_bookmarks_${userId}` : 'hk_bookmarks';

  const [customBookmarks, setCustomBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  // Real-time Firestore sync for bookmarks
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeUserBookmarks(userId, (remoteBookmarks) => {
      if (remoteBookmarks && remoteBookmarks.length >= 0) {
        setCustomBookmarks(remoteBookmarks);
        localStorage.setItem(storageKey, JSON.stringify(remoteBookmarks));
        window.dispatchEvent(new CustomEvent('hk_bookmarks_updated'));
      }
    });
    return () => unsubscribe();
  }, [userId, storageKey]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [newCategory, setNewCategory] = useState('চাকরি ও আবেদন');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [iconFitMode, setIconFitMode] = useState<'cover' | 'contain'>('cover');
  const [isWrapCategories, setIsWrapCategories] = useState(false);
  const categoryContainerRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryContainerRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      categoryContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Persist custom bookmarks and notify other components (e.g., StartNavbar)
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(customBookmarks));
      window.dispatchEvent(new CustomEvent('hk_bookmarks_updated'));
    } catch (e) {
      console.error(e);
    }
  }, [customBookmarks, storageKey]);

  // Sync with changes from other browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setCustomBookmarks((prev) =>
            JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev
          );
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [storageKey]);

  const getNormalizedUrl = (url?: string) => {
    if (!url) return '#';
    if (url.startsWith('#') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setNewIcon(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    setEditingBookmarkId(null);
    setNewTitle('');
    setNewUrl('');
    setNewIcon('');
    setNewCategory('চাকরি ও আবেদন');
    setCustomCategoryInput('');
    setIconFitMode('cover');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: Bookmark) => {
    setEditingBookmarkId(book.id);
    setNewTitle(book.title);
    setNewUrl(book.url);
    setNewIcon(book.icon || '');
    if (['চাকরি ও আবেদন', 'ছবি ও স্টুডিও', 'প্রিন্ট ও ডকুমেন্ট', 'হিসাব-নিকাশ', 'যোগাযোগ', 'মার্কেটিং', 'শিক্ষা', 'ব্যক্তিগত'].includes(book.category)) {
      setNewCategory(book.category);
      setCustomCategoryInput('');
    } else {
      setNewCategory('custom');
      setCustomCategoryInput(book.category);
    }
    setIsModalOpen(true);
  };

  const handleSaveBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    let formattedUrl = newUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const finalCategory = newCategory === 'custom' ? (customCategoryInput.trim() || 'অন্যান্য') : newCategory;

    if (editingBookmarkId) {
      const updatedList = customBookmarks.map((b) =>
        b.id === editingBookmarkId
          ? {
              ...b,
              title: newTitle.trim(),
              url: formattedUrl,
              category: finalCategory,
              icon: newIcon.trim() || undefined,
            }
          : b
      );
      setCustomBookmarks(updatedList);
      if (userId) {
        saveUserBookmarkToFirestore(userId, {
          id: editingBookmarkId,
          title: newTitle.trim(),
          url: formattedUrl,
          category: finalCategory,
          icon: newIcon.trim() || undefined,
        });
      }
      dispatchAppNotification({
        titleBn: '✏️ অ্যাপ বুকমার্ক আপডেট হয়েছে',
        titleEn: '✏️ App Bookmark Updated',
        messageBn: `অ্যাপ: "${newTitle.trim()}"`,
        messageEn: `App: "${newTitle.trim()}"`,
        type: 'info'
      });
    } else {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        title: newTitle.trim(),
        url: formattedUrl,
        category: finalCategory,
        icon: newIcon.trim() || undefined,
      };

      setCustomBookmarks((prev) => [...prev, newBookmark]);
      if (userId) {
        saveUserBookmarkToFirestore(userId, newBookmark);
      }
      dispatchAppNotification({
        titleBn: '📌 নতুন অ্যাপ বুকমার্ক যুক্ত হয়েছে',
        titleEn: '📌 New App Bookmark Added',
        messageBn: `অ্যাপ: "${newTitle.trim()}"`,
        messageEn: `App: "${newTitle.trim()}"`,
        type: 'info'
      });
    }

    setEditingBookmarkId(null);
    setNewTitle('');
    setNewUrl('');
    setNewIcon('');
    setNewCategory('চাকরি ও আবেদন');
    setCustomCategoryInput('');
    setIsModalOpen(false);
  };

  const handleDeleteBookmark = (id: string) => {
    const target = customBookmarks.find(b => b.id === id);
    if (target) {
      if (userId) {
        deleteUserBookmarkFromFirestore(userId, id);
      }
      dispatchAppNotification({
        titleBn: '🗑️ বুকমার্ক মুছে ফেলা হয়েছে',
        titleEn: '🗑️ Bookmark Removed',
        messageBn: `বুকমার্ক: "${target.title}"`,
        messageEn: `Bookmark: "${target.title}"`,
        type: 'info'
      });
    }
    setCustomBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  // Extract any unique extra categories from custom bookmarks
  const extraCategories = Array.from(
    new Set(customBookmarks.map(b => b.category).filter(cat => cat && !BASE_CATEGORY_TABS.some(t => t.id === cat)))
  );

  const CATEGORY_TABS = [
    ...BASE_CATEGORY_TABS,
    ...extraCategories.map(cat => ({ id: cat, labelBn: cat, labelEn: cat }))
  ];

  // Filter preset services
  const filteredServices = PRESET_SERVICES.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.titleBn.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filter custom bookmarks
  const filteredCustomBookmarks = customBookmarks.filter((book) => {
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (book.category && book.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Render icon inside the mock visual window box
  const renderCardIcon = (iconType: ServiceApp['iconType']) => {
    switch (iconType) {
      case 'photo':
        return (
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">{t('ডাউনলোড', 'Download')}</span>
          </div>
        );
      case 'calc':
        return (
          <div className="w-full h-full flex flex-col justify-between p-1.5 bg-slate-900/70 rounded-lg border border-rose-500/30">
            <div className="bg-rose-500/20 px-1.5 py-0.5 rounded text-[8px] font-mono text-rose-300 flex justify-between">
              <span>00</span>
              <span>00</span>
            </div>
            <div className="space-y-1">
              <div className="h-1 bg-emerald-400/80 rounded w-full"></div>
              <div className="h-1 bg-sky-400/80 rounded w-3/4"></div>
            </div>
            <div className="bg-rose-500 text-white text-[8px] font-bold rounded text-center py-0.5 truncate">
              {t('হিসাব যুক্ত করুন', 'Add Calc')}
            </div>
          </div>
        );
      case 'convert':
        return (
          <div className="flex items-center justify-center gap-1.5 text-sky-400">
            <div className="w-7 h-7 rounded border border-slate-600 bg-slate-800 flex items-center justify-center shrink-0">
              <ImageIcon className="w-3.5 h-3.5 opacity-60" />
            </div>
            <span className="text-xs font-bold text-sky-400">➔</span>
            <div className="w-7 h-7 rounded border border-sky-400 bg-sky-500/20 flex items-center justify-center shadow-sm shrink-0">
              <span className="text-[9px] font-black text-emerald-300">HD</span>
            </div>
          </div>
        );
      case 'whatsapp':
        return (
          <div className="flex flex-col items-center justify-center gap-1 text-emerald-400">
            <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[9px] font-mono">
              <MessageSquare className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp</span>
            </div>
            <span className="text-[8px] font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">{t('মেসেজ পাঠান', 'Send Msg')}</span>
          </div>
        );
      case 'ad':
        return (
          <div className="w-full h-full flex flex-col justify-between p-1.5 bg-slate-900/80 rounded-lg border border-amber-500/30">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <div className="h-1 bg-slate-600 rounded w-10"></div>
            </div>
            <div className="h-4 bg-amber-500/20 border border-amber-500/40 rounded flex items-center justify-center">
              <span className="text-[8px] font-bold text-amber-300">{t('আমার বিজ্ঞাপন', 'My Ad')}</span>
            </div>
            <div className="flex justify-end">
              <span className="text-[7px] bg-amber-500 text-slate-950 px-1.5 rounded font-bold">{t('ডাউনলোড ➔', 'Download ➔')}</span>
            </div>
          </div>
        );
      case 'studio':
        return (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/30 to-blue-500/30 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-inner">
            <Camera className="w-4 h-4" />
          </div>
        );
      case 'autofill':
        return (
          <div className="flex flex-col items-center justify-center gap-1">
            <FileText className="w-6 h-6 text-teal-400" />
            <span className="text-[8px] font-black tracking-widest bg-teal-500 text-slate-950 px-1.5 py-0.5 rounded font-mono">AUTO FILL</span>
          </div>
        );
      case 'nid':
        return (
          <div className="w-9 h-8 rounded border border-dashed border-indigo-400 bg-indigo-500/10 flex flex-col items-center justify-center text-indigo-300">
            <Printer className="w-4 h-4" />
          </div>
        );
      case 'print':
        return (
          <div className="w-8 h-9 bg-white/10 border border-emerald-400/40 rounded flex flex-col items-center justify-center text-emerald-400 shadow-md">
            <Printer className="w-4 h-4" />
          </div>
        );
      case 'joint':
        return (
          <div className="flex items-center justify-center text-purple-400 gap-0.5">
            <div className="w-6 h-7 rounded bg-purple-500/30 border border-purple-400/50 flex items-center justify-center">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <div className="w-6 h-7 rounded bg-pink-500/30 border border-pink-400/50 flex items-center justify-center -ml-1.5">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
        );
      default:
        return <Wrench className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-white/5 bg-white/70 dark:bg-slate-900/40 p-5 backdrop-blur-md shadow-lg flex flex-col gap-5">
      
      {/* Top Banner Row: Categories Pills like the screenshot */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-sky-500/20 text-sky-400 p-2 rounded-xl border border-sky-500/30">
              <Grid className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                {t('অ্যাপ হাব ও সার্ভিস পোর্টাল', 'App Hub & Service Portal')} <span className="bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] px-2 py-0.5 rounded-full font-sans font-bold">App Grid</span>
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {t('প্রয়োজনীয় সব সার্ভিস ও অ্যাপস এক ক্লিকে হাতের কাছে', 'All essential web services and tools in one structured portal')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('খুঁজুন...', 'Search...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 w-32 sm:w-40"
              />
            </div>

            <button
              onClick={handleOpenAddModal}
              className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('লিংক যুক্ত করুন', 'Add App Link')}
            </button>
          </div>
        </div>

        {/* Pill category selection tabs with Left/Right Arrows and Expand/Wrap toggle */}
        <div className="relative flex items-center gap-1.5 w-full">
          {/* Scroll Left Button */}
          {!isWrapCategories && (
            <button
              onClick={() => scrollCategories('left')}
              className="p-1.5 text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400 bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-white/10 transition-all shadow-xs shrink-0 cursor-pointer hidden sm:flex items-center justify-center"
              title={t('বামে স্ক্রোল করুন', 'Scroll Left')}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Category Tabs Container */}
          <div
            ref={categoryContainerRef}
            className={`flex items-center gap-2 overflow-x-auto pb-1 scroll-smooth custom-scrollbar flex-1 transition-all ${
              isWrapCategories ? 'flex-wrap overflow-x-visible' : 'overflow-x-auto scrollbar-none'
            }`}
          >
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all border whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedCategory === tab.id
                    ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/20 scale-105 font-extrabold'
                    : 'bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/5 hover:bg-slate-200/80 dark:hover:bg-slate-700'
                }`}
              >
                {t(tab.labelBn, tab.labelEn)}
              </button>
            ))}
          </div>

          {/* Scroll Right Button */}
          {!isWrapCategories && (
            <button
              onClick={() => scrollCategories('right')}
              className="p-1.5 text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400 bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-white/10 transition-all shadow-xs shrink-0 cursor-pointer hidden sm:flex items-center justify-center"
              title={t('ডানে স্ক্রোল করুন', 'Scroll Right')}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Toggle All Categories Multi-line / Wrap View */}
          <button
            onClick={() => setIsWrapCategories((prev) => !prev)}
            className={`p-1.5 text-xs rounded-xl border transition-all shrink-0 cursor-pointer flex items-center gap-1 font-bold ${
              isWrapCategories
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title={isWrapCategories ? t('এক সারিতে দেখুন', 'Show Single Row') : t('সব ক্যাটাগরি এক সাথে দেখুন', 'Show All Categories (Wrap)')}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">
              {isWrapCategories ? t('সংক্ষিপ্ত', 'Compact') : t('সবগুলো', 'All View')}
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid View of Cards matching the screenshot */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
        {filteredServices.map((service) => (
          <a
            key={service.id}
            href={getNormalizedUrl(service.url)}
            target={service.url?.startsWith('#') ? '_self' : '_blank'}
            rel="noopener noreferrer"
            onClick={(e) => {
              dispatchAppNotification({
                titleBn: `🚀 অ্যাপ ব্যবহৃৎ: ${service.titleBn}`,
                titleEn: `🚀 App Opened: ${service.titleEn}`,
                messageBn: `আপনি "${service.titleBn}" ব্যবহার শুরু করেছেন।`,
                messageEn: `You opened "${service.titleEn}".`,
                type: 'app'
              });
              const url = service.url || '';
              if (url.startsWith('#')) {
                e.preventDefault();
                const el = document.querySelector(url);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="group relative flex flex-col items-center justify-between p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-850 hover:border-sky-500/50 dark:hover:border-sky-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden min-h-[140px]"
          >
            {/* Top window card frame with 3 dots like user's screenshot */}
            <div className="w-full bg-slate-200/60 dark:bg-slate-950/80 border border-slate-300/40 dark:border-white/5 rounded-xl p-2 flex flex-col items-center justify-center h-24 relative overflow-hidden group-hover:border-sky-500/30 transition-colors">
              
              {/* Top window controls (Red, Yellow, Green dots) */}
              <div className="absolute top-1.5 right-2 flex items-center gap-1 z-10 bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded-full border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              </div>

              {/* Dynamic Icon Artwork */}
              {renderCardIcon(service.iconType)}
            </div>

            {/* Bottom Title Label */}
            <div className="mt-2 text-center w-full px-1">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors truncate">
                {t(service.titleBn, service.titleEn)}
              </h4>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-sans truncate mt-0.5">
                {service.titleEn}
              </p>
            </div>
          </a>
        ))}

        {/* User Added Custom Bookmarks (Rendered in same card style with FULL SPACE logo image) */}
        {filteredCustomBookmarks.map((book) => (
          <div
            key={book.id}
            className="group relative flex flex-col items-center justify-between p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-850 hover:border-sky-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden min-h-[140px]"
          >
            {/* Quick Actions (Edit & Delete) */}
            <div className="absolute top-1.5 right-1.5 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditModal(book);
                }}
                className="p-1 text-slate-300 hover:text-sky-400 bg-slate-900/80 backdrop-blur-sm rounded-full border border-white/10 hover:border-sky-500/50 transition-all cursor-pointer"
                title={t('এডিট', 'Edit')}
              >
                <Edit2 className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBookmark(book.id);
                }}
                className="p-1 text-slate-300 hover:text-rose-500 bg-slate-900/80 backdrop-blur-sm rounded-full border border-white/10 hover:border-rose-500/50 transition-all cursor-pointer"
                title={t('মুছুন', 'Delete')}
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>

            <a
              href={getNormalizedUrl(book.url)}
              target={book.url?.startsWith('#') ? '_self' : '_blank'}
              rel="noopener noreferrer"
              onClick={(e) => {
                dispatchAppNotification({
                  titleBn: `🌐 বুকমার্ক খোলা হয়েছে: ${book.title}`,
                  titleEn: `🌐 Opened Bookmark: ${book.title}`,
                  messageBn: `আপনি "${book.title}" বুকমার্কটি ভিজিট করেছেন।`,
                  messageEn: `You opened "${book.title}".`,
                  type: 'app'
                });
                const url = book.url || '';
                if (url.startsWith('#')) {
                  e.preventDefault();
                  const el = document.querySelector(url);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full h-full flex flex-col items-center justify-between"
            >
              {/* Top window card frame with FULL SPACE logo image */}
              <div className="w-full bg-slate-200/60 dark:bg-slate-950/80 border border-slate-300/40 dark:border-white/5 rounded-xl flex flex-col items-center justify-center h-24 relative overflow-hidden group-hover:border-sky-500/30 transition-colors">
                
                {/* Window control dots in glass pill */}
                <div className="absolute top-1.5 left-2 flex items-center gap-1 z-10 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/10 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                </div>

                {book.icon ? (
                  <div className="w-full h-full relative overflow-hidden rounded-xl bg-slate-950">
                    <img
                      src={book.icon}
                      alt={book.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-sky-500/20 via-sky-600/10 to-indigo-500/20 border border-sky-400/20 flex flex-col items-center justify-center text-sky-400 font-extrabold text-lg uppercase shadow-inner">
                    <span className="text-xl font-black">{book.title.charAt(0)}</span>
                  </div>
                )}
              </div>

              {/* Bottom Title Label */}
              <div className="mt-2 text-center w-full px-1">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-sky-400 transition-colors truncate">
                  {book.title}
                </h4>
                <p className="text-[9px] text-sky-500/80 dark:text-sky-400/80 font-sans font-semibold truncate mt-0.5">
                  {book.category || 'Custom Link'}
                </p>
              </div>
            </a>
          </div>
        ))}
      </div>

      {/* Custom Add/Edit Bookmark Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-2xl max-w-md w-full my-auto max-h-[92vh] flex flex-col animate-scaleIn">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-white/5 shrink-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Link className="w-4 h-4 text-sky-500" />
                {editingBookmarkId 
                  ? t('অ্যাপ বা সার্ভিস লিংক এডিট করুন', 'Edit App or Service Link') 
                  : t('নতুন অ্যাপ বা সার্ভিস লিংক যুক্ত করুন', 'Add New App or Service Link')}
              </h4>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingBookmarkId(null);
                  setNewIcon('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBookmark} className="space-y-3.5 pt-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  {t('ক্যাটাগরি নির্বাচন করুন', 'Select Category')}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 dark:text-white font-medium cursor-pointer"
                >
                  <option value="চাকরি ও আবেদন">{t('সরকারি-বেসরকারি চাকরি (Jobs)', 'Jobs & Applications')}</option>
                  <option value="ছবি ও স্টুডিও">{t('ছবি ও ফটো স্টুডিও (Photo)', 'Photo & Studio')}</option>
                  <option value="প্রিন্ট ও ডকুমেন্ট">{t('সিভি ও প্রিন্টিং সেবা (Print)', 'Print & Documents')}</option>
                  <option value="হিসাব-নিকাশ">{t('আইটি ও হিসাব-নিকাশ (IT)', 'IT & Calculations')}</option>
                  <option value="যোগাযোগ">{t('মেসেজিং ও সোশ্যাল (Social)', 'Messaging & Social')}</option>
                  <option value="মার্কেটিং">{t('মার্কেটিং ও বিজ্ঞাপন (Ads)', 'Marketing & Ads')}</option>
                  <option value="শিক্ষা">{t('শিক্ষা ও ক্যারিয়ার (Education)', 'Education')}</option>
                  <option value="ব্যক্তিগত">{t('ব্যক্তিগত (Personal)', 'Personal')}</option>
                  <option value="custom">{t('+ নতুন ক্যাটাগরি তৈরি করুন (New Category)', '+ Add New Custom Category')}</option>
                </select>
              </div>

              {newCategory === 'custom' && (
                <div>
                  <label className="block text-[10px] font-bold text-sky-500 mb-1 uppercase tracking-wider">
                    {t('নতুন ক্যাটাগরির নাম লিখুন', 'Custom Category Name')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('যেমন: বিনোদন, ই-কমার্স...', 'e.g. Entertainment, E-commerce...')}
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    className="w-full bg-sky-50/50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-700/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 dark:text-white font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  {t('অ্যাপ বা সার্ভিসের নাম (Title)', 'App or Service Name')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('যেমন: পাসপোর্ট পোর্টাল', 'e.g., Passport Portal')}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  {t('ইউআরএল (Web URL)', 'Web URL')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://passport.gov.bd"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 dark:text-white font-mono"
                />
              </div>

              {/* App Image / Logo Upload Section with Full-Space Card Preview */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-white/10 space-y-2.5">
                <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-sky-500" /> {t('অ্যাপ লোগো / কার্ড ইমেজ (সম্পূর্ণ স্পেস)', 'App Logo / Card Image (Full Space)')}
                  </span>
                  {newIcon && (
                    <button
                      type="button"
                      onClick={() => setNewIcon('')}
                      className="text-[9px] text-rose-500 hover:underline cursor-pointer normal-case"
                    >
                      {t('ছবি রিমুভ', 'Remove Image')}
                    </button>
                  )}
                </label>

                {newIcon ? (
                  <div className="space-y-2">
                    {/* Live Card Full Space Preview Box */}
                    <div className="relative w-full h-24 rounded-xl border border-sky-500/40 bg-slate-950 overflow-hidden shadow-inner flex items-center justify-center">
                      <img
                        src={newIcon}
                        alt="Full Card Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {/* Window dots indicator */}
                      <div className="absolute top-1.5 left-2 flex items-center gap-1 z-10 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/10 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      </div>
                      <div className="absolute bottom-1 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[9px] text-emerald-400 font-bold font-mono">
                        {t('কার্ডে ফুল স্পেস কভার', 'Full Space Cover')}
                      </div>
                    </div>

                    <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>{t('লোগোটি কার্ডের পুরো জায়গা জুড়ে নিখুঁতভাবে দেখাবে', 'Logo will display across the full card space seamlessly')}</span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="flex items-center justify-center gap-1.5 p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/10 hover:border-sky-500 dark:hover:border-sky-500 cursor-pointer bg-white dark:bg-slate-900 transition-colors text-xs text-slate-600 dark:text-slate-300">
                      <Upload className="w-4 h-4 text-sky-500" />
                      <span className="font-semibold">{t('ডিভাইস থেকে ফটো / লোগো আপলোড করুন', 'Upload photo / logo from device')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconUpload}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="url"
                      placeholder={t('অথবা ইমেজ / লোগো URL পেস্ট করুন...', 'Or paste image / logo URL...')}
                      value={newIcon}
                      onChange={(e) => setNewIcon(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                )}
              </div>

              {/* Bottom Actions - Always visible and pinned at bottom */}
              <div className="flex justify-end items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-white/5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBookmarkId(null);
                    setNewIcon('');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer font-semibold"
                >
                  {t('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md hover:shadow-sky-500/25 font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{editingBookmarkId ? t('আপডেট করুন', 'Update Link') : t('সংরক্ষণ করুন', 'Save Link')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
