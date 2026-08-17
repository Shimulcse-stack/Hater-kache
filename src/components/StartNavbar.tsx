import React, { useState, useRef, useEffect } from 'react';
import logoImg from '../assets/images/hater_kache_logo_1786217179987.jpg';
import { dispatchAppNotification } from '../utils/notificationSystem';
import { 
  Menu, 
  Share2, 
  Plus, 
  Pencil, 
  Search, 
  Bell, 
  Sparkles, 
  Sun, 
  Moon, 
  Globe, 
  ImageIcon, 
  Check, 
  Copy, 
  X, 
  ExternalLink,
  Layers,
  Crown,
  User,
  Settings,
  ShieldCheck,
  ChevronDown,
  LogOut,
  AppWindow,
  Code2,
  Zap,
  Home,
  CheckCheck,
  Trash2,
  Info,
  AlertCircle,
  FolderOpen,
  Camera,
  Calculator,
  MessageSquare,
  ShoppingBag,
  Briefcase,
  Printer,
  Bookmark as BookmarkIcon,
  Phone,
  Mail
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { UserProfile, Bookmark } from '../types';
import { PRESET_SERVICES, ServiceApp } from './AppHub';
import { CustomNotificationPayload } from '../utils/notificationSystem';

interface StartNavbarProps {
  onOpenWallpaper: () => void;
  onOpenAddLink?: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activePage: string;
  setActivePage: (page: string) => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

interface AppNotification {
  id: string;
  titleBn: string;
  titleEn: string;
  messageBn: string;
  messageEn: string;
  timeBn: string;
  timeEn: string;
  read: boolean;
  type: 'info' | 'update' | 'alert' | 'app' | 'timer';
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    titleBn: 'স্বাগতম হাতের কাছে পোর্টালে!',
    titleEn: 'Welcome to Hater Kache Portal!',
    messageBn: 'আপনার সকল প্রয়োজনীয় সরকারি-বেসরকারি সেবা, চাকরি ও ফটো স্টুডিও টুলস এক ক্লিকে বুকমার্ক করুন।',
    messageEn: 'Bookmark all essential tools, jobs, studio apps and services with 1-click.',
    timeBn: 'এখনই',
    timeEn: 'Just now',
    read: false,
    type: 'info'
  },
  {
    id: 'n2',
    titleBn: 'নতুন এআই ওয়েব বিল্ডার যুক্ত হয়েছে',
    titleEn: 'New AI Web Builder Added',
    messageBn: 'প্রোডাক্টিভিটি স্টেশন ও এআই কোড বিল্ডার ব্যবহারে সহজে ওয়েব স্যান্ডবক্স তৈরি করুন।',
    messageEn: 'Create instant web sandboxes with our AI code maker station.',
    timeBn: '১০ মিনিট আগে',
    timeEn: '10m ago',
    read: false,
    type: 'update'
  },
  {
    id: 'n3',
    titleBn: 'সিস্টেম আপডেট সফল',
    titleEn: 'System Update Completed',
    messageBn: 'আপনার পোর্টালে দ্রুত নেভিগেশন ও সরাসরি লাইভ সার্চ সূচক সক্রিয় করা হয়েছে।',
    messageEn: 'Fast navigation and live search indexing activated.',
    timeBn: '১ ঘণ্টা আগে',
    timeEn: '1h ago',
    read: true,
    type: 'alert'
  }
];

export default function StartNavbar({
  onOpenWallpaper,
  onOpenAddLink,
  isDarkMode,
  setIsDarkMode,
  searchQuery,
  setSearchQuery,
  activePage,
  setActivePage,
  currentUser,
  onLogout,
}: StartNavbarProps) {
  const { language, setLanguage, t, isBn } = useLanguage();

  const [showPagesDropdown, setShowPagesDropdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('hk_notifications');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all');
  const [latestToast, setLatestToast] = useState<AppNotification | null>(null);

  // Listen for real-time notifications dispatched anywhere in the app
  useEffect(() => {
    const handleCustomNotification = (e: Event) => {
      const customEvent = e as CustomEvent<CustomNotificationPayload>;
      const detail = customEvent.detail;
      if (!detail) return;

      const now = new Date();
      const timeBn = now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
      const timeEn = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const newNotif: AppNotification = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        titleBn: detail.titleBn,
        titleEn: detail.titleEn,
        messageBn: detail.messageBn,
        messageEn: detail.messageEn,
        timeBn: timeBn,
        timeEn: timeEn,
        read: false,
        type: detail.type || 'info',
      };

      setNotifications(prev => [newNotif, ...prev]);
      setLatestToast(newNotif);

      // Play subtle chime alert sound for incoming live notifications
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(783.99, ctx.currentTime); // G5 note
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        }
      } catch (err) {}

      // Auto dismiss live toast popup after 5 seconds
      setTimeout(() => {
        setLatestToast(curr => (curr?.id === newNotif.id ? null : curr));
      }, 5000);
    };

    window.addEventListener('hk_notification_dispatch', handleCustomNotification);
    return () => {
      window.removeEventListener('hk_notification_dispatch', handleCustomNotification);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('hk_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleToggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleDeleteNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customBookmarks, setCustomBookmarks] = useState<Bookmark[]>([]);

  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const pagesDropdownRef = useRef<HTMLDivElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load custom bookmarks from localStorage with instant sync listeners
  useEffect(() => {
    const syncBookmarks = () => {
      try {
        const saved = localStorage.getItem('hk_bookmarks');
        if (saved) {
          setCustomBookmarks(JSON.parse(saved));
        } else {
          setCustomBookmarks([]);
        }
      } catch (e) {
        console.error(e);
      }
    };

    syncBookmarks();

    window.addEventListener('storage', syncBookmarks);
    window.addEventListener('hk_bookmarks_updated', syncBookmarks);

    return () => {
      window.removeEventListener('storage', syncBookmarks);
      window.removeEventListener('hk_bookmarks_updated', syncBookmarks);
    };
  }, []);

  // Group PRESET_SERVICES and customBookmarks into unified categories
  const categoryGroups = React.useMemo(() => {
    const groups: Record<string, { id: string; titleBn: string; titleEn: string; url?: string; isCustom?: boolean }[]> = {};
    
    // 1. Add Preset services
    PRESET_SERVICES.forEach(s => {
      const cat = s.category || 'অন্যান্য';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({
        id: s.id,
        titleBn: s.titleBn,
        titleEn: s.titleEn,
        url: s.url,
        isCustom: false
      });
    });

    // 2. Add Custom bookmarks into their respective exact categories
    customBookmarks.forEach(b => {
      const cat = b.category || 'অন্যান্য';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({
        id: b.id,
        titleBn: b.title,
        titleEn: b.title,
        url: b.url,
        isCustom: true
      });
    });

    return groups;
  }, [customBookmarks]);

  const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    'ছবি ও স্টুডিও': <Camera className="w-3.5 h-3.5 text-emerald-500" />,
    'হিসাব-নিকাশ': <Calculator className="w-3.5 h-3.5 text-rose-500" />,
    'যোগাযোগ': <MessageSquare className="w-3.5 h-3.5 text-sky-500" />,
    'মার্কেটিং': <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />,
    'চাকরি ও আবেদন': <Briefcase className="w-3.5 h-3.5 text-teal-500" />,
    'প্রিন্ট ও ডকুমেন্ট': <Printer className="w-3.5 h-3.5 text-indigo-500" />,
    'শিক্ষা': <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
    'ব্যক্তিগত': <User className="w-3.5 h-3.5 text-pink-400" />,
    'কাস্টম বুকমার্কস': <BookmarkIcon className="w-3.5 h-3.5 text-purple-500" />
  };

  const CATEGORY_NAMES_EN: Record<string, string> = {
    'ছবি ও স্টুডিও': 'Photo & Studio',
    'হিসাব-নিকাশ': 'Calculators & IT',
    'যোগাযোগ': 'Communication',
    'মার্কেটিং': 'Marketing & Ads',
    'চাকরি ও আবেদন': 'Jobs & Applications',
    'প্রিন্ট ও ডকুমেন্ট': 'Print & Documents',
    'শিক্ষা': 'Education & Career',
    'ব্যক্তিগত': 'Personal',
    'কাস্টম বুকমার্কস': 'Custom Bookmarks'
  };

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pagesDropdownRef.current && !pagesDropdownRef.current.contains(event.target as Node)) {
        setShowPagesDropdown(false);
      }
      if (categoriesDropdownRef.current && !categoriesDropdownRef.current.contains(event.target as Node)) {
        setShowCategoriesDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileModal(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setShowNotificationModal(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter matching search results across preset services and custom bookmarks
  const searchResults = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const matchedServices = PRESET_SERVICES.filter(s =>
      s.titleBn.toLowerCase().includes(query) ||
      s.titleEn.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query) ||
      (s.description && s.description.toLowerCase().includes(query))
    ).map(s => ({
      id: s.id,
      title: isBn ? s.titleBn : s.titleEn,
      category: s.category,
      url: s.url || '#app-hub-section',
      isPreset: true,
      icon: null
    }));

    const matchedCustom = customBookmarks.filter(b =>
      b.title.toLowerCase().includes(query) ||
      b.url.toLowerCase().includes(query) ||
      (b.category && b.category.toLowerCase().includes(query))
    ).map(b => ({
      id: b.id,
      title: b.title,
      category: b.category || (isBn ? 'কাস্টম' : 'Custom'),
      url: b.url,
      isPreset: false,
      icon: b.icon
    }));

    return [...matchedServices, ...matchedCustom];
  }, [searchQuery, customBookmarks, isBn]);

  const getNormalizedUrl = (url?: string) => {
    if (!url) return '#app-hub-section';
    if (url.startsWith('#') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const handleResultClick = (url: string) => {
    setIsSearchFocused(false);
    if (url.startsWith('#')) {
      const el = document.querySelector(url);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const href = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        handleResultClick(searchResults[0].url);
      } else if (searchQuery.trim()) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
        setIsSearchFocused(false);
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };

  const pages = [
    { id: 'start', nameBn: 'হোম পেজ (Home)', nameEn: 'Home Page', icon: <Home className="w-4 h-4 text-sky-400" /> },
    { id: 'apps', nameBn: 'সার্ভিসেস ও বুকমার্কস', nameEn: 'Services & Bookmarks', icon: <AppWindow className="w-4 h-4 text-emerald-400" /> },
    { id: 'productivity', nameBn: 'টুলস ও প্রোডাক্টিভিটি', nameEn: 'Tools & Productivity', icon: <Zap className="w-4 h-4 text-amber-400" /> },
    { id: 'webbuilder', nameBn: 'এআই কোড বিল্ডার', nameEn: 'AI Web Sandbox', icon: <Code2 className="w-4 h-4 text-purple-400" /> },
  ];

  const currentPageObj = pages.find(p => p.id === activePage) || pages[0];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleSelectPage = (pageId: string) => {
    // Normalize aliases
    let target = pageId;
    if (pageId === 'home') target = 'start';
    if (pageId === 'services') target = 'apps';
    if (pageId === 'focus' || pageId === 'tools') target = 'productivity';
    if (pageId === 'builder') target = 'webbuilder';

    setActivePage(target);
    setShowPagesDropdown(false);
    setMobileMenuOpen(false);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryFilter = (catName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowCategoriesDropdown(false);
    setActivePage('apps');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('hk_select_category', { detail: catName }));
    }, 100);
    dispatchAppNotification({
      titleBn: `📁 ক্যাটাগরি ফিল্টার: ${catName}`,
      titleEn: `📁 Filtered Category: ${catName}`,
      messageBn: `অ্যাপ হাবে "${catName}" ক্যাটাগরির সেবাগুলো ফিল্টার করা হয়েছে।`,
      messageEn: `Filtered services for "${catName}" category.`,
      type: 'info'
    });
  };

  const handleLinkItemClick = (item: { id: string; titleBn: string; titleEn: string; url?: string }, e: React.MouseEvent) => {
    e.preventDefault();

    dispatchAppNotification({
      titleBn: `🌐 বুকমার্ক খোলা হয়েছে: ${item.titleBn}`,
      titleEn: `🌐 Opened Link: ${item.titleEn}`,
      messageBn: `আপনি "${item.titleBn}" ভিজিট করেছেন।`,
      messageEn: `You opened "${item.titleEn}".`,
      type: 'app'
    });

    setShowCategoriesDropdown(false);

    const rawUrl = item.url || '#app-hub-section';
    const isHash = rawUrl.startsWith('#');

    if (isHash) {
      if (rawUrl.includes('productivity') || rawUrl.includes('scratchpad') || rawUrl.includes('converter')) {
        setActivePage('productivity');
      } else if (rawUrl.includes('builder')) {
        setActivePage('webbuilder');
      } else {
        setActivePage('apps');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const finalUrl = getNormalizedUrl(rawUrl);
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      {/* Bahon Theme Top Header Contact & Utility Bar with Mobile Safe Area */}
      <div className="w-full bg-[#060d1a] border-b border-slate-800/80 text-slate-300 text-[11px] pt-[max(env(safe-area-inset-top,0px),0.375rem)] pb-1.5 px-3 sm:px-6 flex flex-wrap items-center justify-between gap-2 z-50">
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1.5 hover:text-orange-400 transition-colors cursor-pointer">
            <Phone className="w-3 h-3 text-[#ff5e14]" />
            <span className="font-mono text-[11px]">+880 1619-184281</span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5 hover:text-orange-400 transition-colors cursor-pointer">
            <Mail className="w-3 h-3 text-[#ff5e14]" />
            <span>info@haterkache.com</span>
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto text-slate-300">
          {/* Language Switch */}
          <button 
            onClick={() => setLanguage(isBn ? 'en' : 'bn')}
            className="flex items-center gap-1 hover:text-orange-400 font-medium transition-colors cursor-pointer"
          >
            <Globe className="w-3 h-3 text-[#ff5e14]" />
            <span>{isBn ? 'Eng' : 'বাংলা'}</span>
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => {
              if (currentUser) {
                onLogout?.();
              }
            }}
            className="hover:text-orange-400 font-semibold transition-colors cursor-pointer flex items-center gap-1"
          >
            <User className="w-3 h-3 text-[#ff5e14]" />
            <span>{currentUser ? (isBn ? 'লগআউট' : 'Sign Out') : (isBn ? 'সাইন ইন | রেজিস্ট্রেশন' : 'Sign In | Register')}</span>
          </button>
        </div>
      </div>

      <nav className="w-full bg-[#0a192f] border-b border-slate-800 text-white px-2 sm:px-4 md:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-xl transition-all">
        
        {/* Left Section: Brand Logo & Desktop Navigation Links */}
        <div className="flex items-center gap-2 sm:gap-6 shrink-0 min-w-0">
          
          {/* Main Brand Logo */}
          <div 
            className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group shrink-0" 
            onClick={() => {
              handleSelectPage('start');
            }}
            title={t('হোমে ফিরে যান', 'Go to Home')}
          >
            <div className="h-8 sm:h-9 px-1.5 bg-white rounded-xl border border-orange-300/60 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
              <img 
                src={logoImg} 
                alt="হাতের কাছে Logo" 
                referrerPolicy="no-referrer"
                className="h-full w-auto object-contain" 
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-black text-xs sm:text-sm tracking-tight text-white flex items-center gap-1 font-sans truncate">
                হাতের <span className="text-[#ff5e14]"> কাছে </span>
              </span>
              <span className="hidden xs:block text-[8px] sm:text-[9px] text-orange-400 font-mono tracking-wider -mt-0.5 truncate uppercase">
                PORTAL
              </span>
            </div>
          </div>

          {/* Nav items menu links */}
          <div className="hidden md:flex items-center gap-3 lg:gap-5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <button 
              onClick={() => handleSelectPage('start')}
              className={`hover:text-[#ff5e14] transition-colors cursor-pointer py-1 ${activePage === 'start' ? 'text-[#ff5e14] border-b-2 border-[#ff5e14]' : ''}`}
            >
              {t('হোম', 'HOME')}
            </button>
            <button 
              onClick={() => handleSelectPage('apps')}
              className={`hover:text-[#ff5e14] transition-colors cursor-pointer py-1 ${activePage === 'apps' ? 'text-[#ff5e14] border-b-2 border-[#ff5e14]' : ''}`}
            >
              {t('সার্ভিসেস', 'SERVICES')}
            </button>
            <button 
              onClick={() => handleSelectPage('productivity')}
              className={`hover:text-[#ff5e14] transition-colors cursor-pointer py-1 ${activePage === 'productivity' ? 'text-[#ff5e14] border-b-2 border-[#ff5e14]' : ''}`}
            >
              {t('টুলস', 'TOOLS')}
            </button>
            <button 
              onClick={() => handleSelectPage('webbuilder')}
              className={`hover:text-[#ff5e14] transition-colors cursor-pointer py-1 ${activePage === 'webbuilder' ? 'text-[#ff5e14] border-b-2 border-[#ff5e14]' : ''}`}
            >
              {t('বিল্ডার', 'BUILDER')}
            </button>
          </div>
        </div>

        {/* Right Section: Controls, Hamburger Menu (Mobile/Tablet), Search, Bell, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          


          {/* Search Box (Desktop & Tablet) */}
          <div className="relative hidden md:block w-36 lg:w-64" ref={searchContainerRef}>
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder={t('বুকমার্ক ও সার্ভিস খুঁজুন...', 'Search bookmarks & tools...')}
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                onKeyDown={handleSearchKeyDown}
                className="w-full bg-slate-950/90 border border-slate-800 focus:border-sky-500/80 rounded-full pl-9 pr-7 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchFocused(false);
                  }}
                  className="absolute right-2.5 text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-white/10 cursor-pointer"
                  title={t('মুছে ফেলুন', 'Clear search')}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Instant Live Search Results Popup Dropdown */}
            {isSearchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900/95 border border-slate-700 text-white rounded-2xl shadow-2xl p-2 z-[9999] pointer-events-auto backdrop-blur-2xl animate-scaleIn max-h-80 overflow-y-auto">
                {/* Search on Google option */}
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsSearchFocused(false)}
                  className="w-full text-left px-3 py-2 text-xs text-sky-400 hover:bg-sky-500/10 rounded-xl flex items-center gap-2 font-medium transition-colors border-b border-white/5 mb-1 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">
                    {t('গুগলে খুঁজুন:', 'Search Google:')} <span className="font-bold underline text-white">"{searchQuery}"</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-sky-400/70 ml-auto shrink-0" />
                </a>

                {searchResults.length > 0 ? (
                  <div className="space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {searchResults.length} {t('টি ম্যাচিং আইটেম', 'matching items')}
                    </div>
                    {searchResults.map((item) => (
                      <a
                        key={item.id}
                        href={getNormalizedUrl(item.url)}
                        target={item.url.startsWith('#') ? '_self' : '_blank'}
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (item.url.startsWith('#')) {
                            e.preventDefault();
                            const el = document.querySelector(item.url);
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }
                          setIsSearchFocused(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-slate-800 flex items-center justify-between transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.icon ? (
                            <img src={item.icon} alt="" className="w-4 h-4 rounded object-cover shrink-0" />
                          ) : (
                            <Layers className="w-4 h-4 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
                          )}
                          <span className="font-bold text-slate-100 group-hover:text-sky-300 truncate">
                            {item.title}
                          </span>
                        </div>
                        <span className="text-[10px] bg-slate-800 text-slate-300 group-hover:bg-sky-500/20 group-hover:text-sky-300 px-2 py-0.5 rounded-full shrink-0 font-medium ml-2 border border-white/5">
                          {item.category}
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-3 text-xs text-slate-400 text-center">
                    {t('কোনো বুকমার্ক পাওয়া যায়নি। Enter চেপে গুগলে খুঁজুন।', 'No local bookmarks found. Press Enter to search Google.')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-1.5 sm:p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-all cursor-pointer active:scale-95"
            title={t('খুঁজুন', 'Search')}
          >
            <Search className="w-4 h-4 text-sky-400" />
          </button>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-1.5 sm:p-2 bg-slate-800/90 hover:bg-slate-700 text-sky-400 rounded-xl border border-slate-700 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
            title={t('মেনু', 'Menu')}
          >
            <Menu className="w-4 h-4 text-sky-400" />
          </button>



          {/* Notifications Icon with Badge */}
          <div className="relative shrink-0" ref={notificationDropdownRef}>
            <button
              onClick={() => setShowNotificationModal(!showNotificationModal)}
              className="p-1.5 sm:p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-all cursor-pointer active:scale-95 relative"
              title={t('নোটিফিকেশন', 'Notifications')}
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-slate-900 animate-pulse shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotificationModal && (
              <div className="fixed sm:absolute top-14 sm:top-full right-2 sm:right-0 mt-1 sm:mt-2 w-[calc(100vw-1rem)] sm:w-96 bg-slate-900/98 border border-slate-700 text-white rounded-2xl shadow-2xl p-3.5 sm:p-4 z-50 backdrop-blur-2xl animate-scaleIn max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center pb-2.5 mb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-extrabold text-white">
                      {t('নোটিফিকেশনসমূহ', 'Notifications')}
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-400/30">
                        {unreadCount} {t('নতুন', 'new')}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowNotificationModal(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Action Buttons & Filters */}
                <div className="flex items-center justify-between gap-2 mb-3 text-[11px]">
                  <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-white/10">
                    <button
                      onClick={() => setNotificationFilter('all')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        notificationFilter === 'all' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t('সব', 'All')} ({notifications.length})
                    </button>
                    <button
                      onClick={() => setNotificationFilter('unread')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        notificationFilter === 'unread' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t('অপঠিত', 'Unread')} ({unreadCount})
                    </button>
                  </div>

                  {notifications.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                          title={t('সব পঠিত হিসেবে চিহ্নিত করুন', 'Mark all as read')}
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{t('সব পড়া', 'Read all')}</span>
                        </button>
                      )}
                      <button
                        onClick={handleClearAllNotifications}
                        className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 hover:underline cursor-pointer ml-1"
                        title={t('সব নোটিফিকেশন মুছুন', 'Clear all notifications')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t('মুছুন', 'Clear')}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Notifications List */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.filter(n => notificationFilter === 'all' || !n.read).length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                      <p>{t('কোনো নোটিফিকেশন নেই', 'No notifications found')}</p>
                    </div>
                  ) : (
                    notifications
                      .filter(n => notificationFilter === 'all' || !n.read)
                      .map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleToggleRead(n.id)}
                          className={`p-3 rounded-xl border text-xs transition-all cursor-pointer relative group ${
                            !n.read
                              ? 'bg-sky-500/10 border-sky-500/30 text-slate-100 shadow-sm'
                              : 'bg-slate-950/60 border-white/5 text-slate-300 hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 min-w-0">
                              <span className="mt-0.5 shrink-0">
                                {n.type === 'update' ? (
                                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                ) : n.type === 'alert' ? (
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                ) : (
                                  <Info className="w-3.5 h-3.5 text-sky-400" />
                                )}
                              </span>
                              <div className="min-w-0">
                                <p className={`font-bold flex items-center gap-1.5 ${!n.read ? 'text-sky-200' : 'text-slate-300'}`}>
                                  {isBn ? n.titleBn : n.titleEn}
                                  {!n.read && (
                                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 inline-block"></span>
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                                  {isBn ? n.messageBn : n.messageEn}
                                </p>
                                <span className="text-[9px] text-slate-400 block mt-1.5 font-mono">
                                  {isBn ? n.timeBn : n.timeEn}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={(e) => handleDeleteNotification(n.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded transition-all cursor-pointer shrink-0"
                              title={t('মুছুন', 'Delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Button */}
          <div className="relative shrink-0" ref={profileDropdownRef}>
            <button
              onClick={() => setShowProfileModal(!showProfileModal)}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 border border-orange-500/50 hover:border-orange-400 flex items-center justify-center text-orange-400 cursor-pointer transition-all shadow-md relative shrink-0"
              title={t('প্রোফাইল সেটিং', 'Profile Settings')}
            >
              <User className="w-4 h-4" />
              <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full border border-slate-900"></span>
            </button>

            {/* Profile Dropdown */}
            {showProfileModal && (
              <div className="fixed sm:absolute top-14 sm:top-full right-2 sm:right-0 mt-1 sm:mt-2 w-72 sm:w-80 max-w-[calc(100vw-1rem)] bg-slate-900/98 border border-slate-700 text-white rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-2xl animate-scaleIn">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{currentUser?.name || 'User'}</h4>
                    <p className="text-[10px] text-sky-400 font-medium truncate max-w-[130px]">{currentUser?.email || 'user@example.com'}</p>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold inline-block mt-0.5">
                      {currentUser?.isPro ? 'PRO Member' : 'Free Member'}
                    </span>
                  </div>
                </div>

                <div className="py-2 space-y-1.5 border-b border-white/10">
                  {/* Language Selector */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-sky-400" />
                      {t('ভাষা (Language)', 'Language')}
                    </span>
                    <div className="flex bg-slate-800 rounded-lg p-0.5">
                      <button
                        onClick={() => setLanguage('bn')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${isBn ? 'bg-sky-500 text-white' : 'text-slate-400'}`}
                      >
                        BN
                      </button>
                      <button
                        onClick={() => setLanguage('en')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${!isBn ? 'bg-sky-500 text-white' : 'text-slate-400'}`}
                      >
                        EN
                      </button>
                    </div>
                  </div>

                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      {isDarkMode ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                      {t('থিম (Theme)', 'Theme')}
                    </span>
                    <button
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-slate-200 transition-colors"
                    >
                      {isDarkMode ? 'Dark' : 'Light'}
                    </button>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => {
                      onOpenWallpaper();
                      setShowProfileModal(false);
                    }}
                    className="w-full text-left text-xs text-slate-300 hover:text-sky-400 py-1 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                    <span>{t('ওয়ালপেপার কাস্টমাইজ', 'Customize Wallpaper')}</span>
                  </button>

                  {onLogout && (
                    <button
                      onClick={() => {
                        setShowProfileModal(false);
                        onLogout();
                      }}
                      className="w-full text-left text-xs text-rose-400 hover:text-rose-300 py-1 flex items-center gap-2 cursor-pointer transition-colors pt-2 border-t border-white/10"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>{t('লগ আউট করুন', 'Log Out')}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>


        </div>
      </nav>

      {/* Mobile Search Overlay Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-slate-900/98 border-b border-slate-800 px-3 py-2.5 shadow-2xl animate-fadeIn z-30 sticky top-[52px]">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder={t('বুকমার্ক ও সার্ভিস খুঁজুন...', 'Search bookmarks & tools...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchKeyDown(e);
                  setMobileSearchOpen(false);
                }
              }}
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 rounded-full pl-9 pr-20 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-14 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setMobileSearchOpen(false);
              }}
              className="absolute right-2 text-[11px] font-bold text-sky-400 hover:text-sky-300 px-1.5 py-0.5 rounded cursor-pointer"
            >
              {t('বন্ধ', 'Close')}
            </button>
          </div>
          
          {/* Live Search Results inside Mobile Bar */}
          {searchQuery.trim().length > 0 && (
            <div className="mt-2 bg-slate-950 border border-slate-800 rounded-2xl p-2 max-h-64 overflow-y-auto">
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileSearchOpen(false)}
                className="w-full text-left px-2.5 py-2 text-xs text-sky-400 hover:bg-sky-500/10 rounded-xl flex items-center gap-2 font-medium border-b border-slate-800 mb-1 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">
                  {t('গুগলে খুঁজুন:', 'Google Search:')} <span className="font-bold underline text-white">"{searchQuery}"</span>
                </span>
              </a>
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <a
                    key={item.id}
                    href={getNormalizedUrl(item.url)}
                    target={item.url.startsWith('#') ? '_self' : '_blank'}
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (item.url.startsWith('#')) {
                        e.preventDefault();
                        const el = document.querySelector(item.url);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                      setMobileSearchOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 text-xs rounded-xl hover:bg-slate-800 flex items-center justify-between text-slate-200 cursor-pointer"
                  >
                    <span className="font-bold truncate">{item.title}</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">{item.category}</span>
                  </a>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-slate-400 text-center">
                  {t('কোনো লোকাল ফলাফল নেই। গুগলে ব্রাউজ করতে ওপরের লিংকে ট্যাপ করুন।', 'No local results. Tap above to search Google.')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-2xl max-w-md w-full animate-scaleIn text-white">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Share2 className="w-4 h-4 text-sky-400" />
                {t('আপনার পেজ শেয়ার করুন', 'Share your Start Page')}
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              {t(
                'এই লিংকটি যেকোনো ব্রাউজারে বা বন্ধুর সাথে শেয়ার করে আপনার কাস্টম ড্যাশবোর্ড এক্সেস করুন:',
                'Share this custom dashboard URL to open your personal start page anywhere:'
              )}
            </p>

            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-white/10 mb-4">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="bg-transparent text-xs text-slate-200 flex-1 focus:outline-none font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    {t('কপি হয়েছে', 'Copied')}
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    {t('কপি', 'Copy')}
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                {t('বন্ধ করুন', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade VIP Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl max-w-md w-full animate-scaleIn text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
              <h3 className="text-base font-extrabold flex items-center gap-2 text-emerald-400">
                <Crown className="w-5 h-5 fill-emerald-400" />
                {t('PRO সুবিধা ও আনলিমিটেড টুলস', 'PRO Membership Benefits')}
              </h3>
              <button onClick={() => setShowUpgradeModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t('আনলিমিটেড বুকমার্ক ও কাস্টম ক্যাটাগরি ফোল্ডার', 'Unlimited bookmarks & custom category folders')}</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t('স্মার্ট Gemini AI অ্যাসিস্ট্যান্ট প্রিমিয়াম অ্যাক্সেস', 'Premium priority Gemini AI assistant response')}</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-200">
                <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t('HD 4K ডায়নামিক ব্যাকগ্রাউন্ড ওয়ালপেপার', 'HD 4K dynamic background wallpapers')}</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert(t('আপনার একাউন্টে প্রিমিয়াম সুবিধা চালু আছে!', 'PRO Features active on your account!'));
                setShowUpgradeModal(false);
              }}
              className="w-full bg-gradient-to-r from-emerald-400 to-sky-500 hover:from-emerald-500 hover:to-sky-600 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-lg transition-all cursor-pointer active:scale-95 text-center"
            >
              {t('একটিভ প্রিমিয়াম (Active)', 'PRO Activated')}
            </button>
          </div>
        </div>
      )}

      {/* Real-time Floating Toast Notification Banner */}
      {latestToast && (
        <div className="fixed top-16 right-4 sm:right-6 z-50 max-w-sm w-full animate-bounceIn">
          <div className="bg-slate-900/95 border border-sky-400/50 shadow-2xl rounded-2xl p-3.5 backdrop-blur-xl text-white flex items-start justify-between gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-sky-400 via-emerald-400 to-indigo-500" />
            <div className="flex items-start gap-2.5 min-w-0 pl-1">
              <div className="p-1.5 rounded-xl bg-sky-500/20 text-sky-400 shrink-0 mt-0.5">
                <Bell className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h5 className="font-extrabold text-xs text-sky-200 truncate">
                  {isBn ? latestToast.titleBn : latestToast.titleEn}
                </h5>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  {isBn ? latestToast.messageBn : latestToast.messageEn}
                </p>
                <span className="text-[9px] text-slate-400 font-mono block mt-1">
                  {isBn ? latestToast.timeBn : latestToast.timeEn}
                </span>
              </div>
            </div>
            <button
              onClick={() => setLatestToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Slide-over Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex justify-end animate-fadeIn md:hidden">
          <div className="w-80 max-w-[85vw] bg-slate-900 border-l border-slate-700 text-white h-full flex flex-col justify-between shadow-2xl animate-slideLeft overflow-y-auto">
            
            {/* Drawer Header with Mobile Top Safe-Area */}
            <div className="pt-[max(env(safe-area-inset-top,0px),1rem)] p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/98 backdrop-blur z-10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 px-1.5 bg-white rounded-xl border border-orange-300/60 flex items-center justify-center shadow">
                  <img src={logoImg} alt="Logo" className="h-full w-auto object-contain" />
                </div>
                <div>
                  <h4 className="font-black text-xs text-white">হাতের কাছে</h4>
                  <span className="text-[9px] text-orange-400 font-mono tracking-wider uppercase">PORTAL MENU</span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body: Navigation & Categories */}
            <div className="p-4 space-y-4">
              {/* Main Pages Navigation */}
              <div>
                <div className="text-[10px] uppercase font-extrabold text-orange-400 tracking-wider mb-2">
                  {t('মেনু নেভিগেশন', 'Navigation Menu')}
                </div>
                <div className="space-y-1.5">
                  {pages.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        handleSelectPage(p.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3 transition-all ${
                        activePage === p.id 
                          ? 'text-white bg-gradient-to-r from-orange-500 to-amber-600 shadow-lg' 
                          : 'text-slate-200 bg-slate-800/50 hover:bg-slate-800 hover:text-orange-400'
                      }`}
                    >
                      {p.icon}
                      <span>{isBn ? p.nameBn : p.nameEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories & Bookmarks Accordions */}
              <div>
                <div className="text-[10px] uppercase font-extrabold text-sky-400 tracking-wider mb-2 flex items-center justify-between">
                  <span>{t('ক্যাটাগরি ও সার্ভিসেস', 'Categories & Services')}</span>
                  <span className="bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded text-[9px]">
                    {PRESET_SERVICES.length + customBookmarks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {Object.entries(categoryGroups).map(([catName, servicesList]) => {
                    const items = servicesList as { id: string; titleBn: string; titleEn: string; url?: string; isCustom?: boolean }[];
                    const isExpanded = expandedCategory === catName;
                    const catIcon = CATEGORY_ICONS[catName] || <FolderOpen className="w-3.5 h-3.5 text-sky-400" />;
                    const catNameEn = CATEGORY_NAMES_EN[catName] || catName;

                    return (
                      <div key={catName} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-800/30">
                        <div className="w-full px-3 py-2 text-xs font-bold flex items-center justify-between bg-slate-800/60">
                          <button
                            onClick={(e) => {
                              handleCategoryFilter(catName, e);
                              setMobileMenuOpen(false);
                            }}
                            className="flex items-center gap-2 text-slate-200 hover:text-orange-400 transition-colors text-left"
                          >
                            {catIcon}
                            <span className="font-extrabold">{isBn ? catName : catNameEn}</span>
                          </button>
                          <button
                            onClick={() => setExpandedCategory(isExpanded ? null : catName)}
                            className="flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-700 hover:text-white"
                          >
                            <span>{items.length}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="p-2 space-y-1 bg-slate-950/80 border-t border-slate-800">
                            {items.map(item => (
                              <a
                                key={item.id}
                                href={getNormalizedUrl(item.url)}
                                target={item.url?.startsWith('#') ? '_self' : '_blank'}
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                  handleLinkItemClick(item, e);
                                  setMobileMenuOpen(false);
                                }}
                                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 transition-colors group"
                              >
                                <span className="truncate font-medium flex items-center gap-1.5">
                                  {item.isCustom && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />}
                                  {isBn ? item.titleBn : item.titleEn}
                                </span>
                                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-400 shrink-0 ml-1" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer Utilities with Safe Area */}
            <div className="p-4 pb-[max(env(safe-area-inset-bottom,0px),1.25rem)] border-t border-slate-800 bg-slate-950/80 space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setLanguage(isBn ? 'en' : 'bn')}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-orange-400 font-bold text-xs px-3 py-2 rounded-xl border border-orange-500/30"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{isBn ? 'English (EN)' : 'বাংলা (BN)'}</span>
                </button>
              </div>
              {currentUser ? (
                <button
                  onClick={() => {
                    onLogout?.();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('লগআউট', 'Sign Out')}</span>
                </button>
              ) : (
                <div className="text-center text-xs text-slate-400">
                  {t('লগইন করা নেই', 'Not logged in')}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
