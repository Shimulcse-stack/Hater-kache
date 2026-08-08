/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, Moon, Sparkles, Clock, Compass, Settings, ShieldAlert, Cpu, Image as ImageIcon, 
  Check, Sliders, X, Upload, Palette, Globe, ChevronLeft, ChevronRight, Phone, Mail, 
  MapPin, Play, CheckCircle2, Star, Quote, Send, ExternalLink, ArrowRight, Calendar, MessageSquare, Users, ShieldCheck
} from 'lucide-react';

// Import subcomponents
import StartNavbar from './components/StartNavbar';
import WeatherWidget from './components/WeatherWidget';
import AIChatBar from './components/AIChatBar';
import Converters from './components/Converters';
import AppHub from './components/AppHub';
import ProductivityStation from './components/ProductivityStation';
import Scratchpad from './components/Scratchpad';
import WebBuilder from './components/WebBuilder';
import LoginScreen from './components/LoginScreen';

import natureBgImage from './assets/images/nature_mountain_bg_1786045136486.jpg';
import { useLanguage } from './LanguageContext';
import { UserProfile } from './types';
import { auth, formatFirebaseUser, logoutFirebase } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Bengali digit conversion helper
const toBengaliNumerals = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => bnDigits[parseInt(d)]);
};

export default function App() {
  const { language, setLanguage, t, isBn } = useLanguage();

  // User auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('haterkache_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('haterkache_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    logoutFirebase();
    setCurrentUser(null);
    localStorage.removeItem('haterkache_user');
  };

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = formatFirebaseUser(firebaseUser);
        handleLoginSuccess(userProfile);
      }
    });
    return () => unsubscribe();
  }, []);

  // Theme state (Dark Mode by default)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('hk_theme');
    return saved ? saved === 'dark' : true;
  });

  // Background Wallpaper state (default to 'nature' as requested)
  const [bgType, setBgType] = useState<'nature' | 'none' | 'custom'>(() => {
    const saved = localStorage.getItem('hk_bg_type');
    return (saved as any) || 'nature';
  });

  const [customBgUrl, setCustomBgUrl] = useState<string>(() => {
    return localStorage.getItem('hk_bg_url') || '';
  });

  const [bgDimming, setBgDimming] = useState<number>(() => {
    const saved = localStorage.getItem('hk_bg_dimming');
    return saved ? parseInt(saved) : 40; // 40% dim tint overlay
  });

  const [showBgModal, setShowBgModal] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<string>('start');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Time & Greeting states
  const [time, setTime] = useState(new Date());

  // Ensure application starts at the top of Start page on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync theme with document class list
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('hk_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('hk_theme', 'light');
    }
  }, [isDarkMode]);

  // Persist background settings
  useEffect(() => {
    localStorage.setItem('hk_bg_type', bgType);
    localStorage.setItem('hk_bg_url', customBgUrl);
    localStorage.setItem('hk_bg_dimming', bgDimming.toString());
  }, [bgType, customBgUrl, bgDimming]);

  // Handle local file upload for background
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomBgUrl(reader.result);
          setBgType('custom');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = time.getHours();
    if (hour >= 5 && hour < 12) {
      return { bn: 'শুভ সকাল', en: 'Good Morning' };
    } else if (hour >= 12 && hour < 17) {
      return { bn: 'শুভ দুপুর', en: 'Good Afternoon' };
    } else if (hour >= 17 && hour < 21) {
      return { bn: 'শুভ সন্ধ্যা', en: 'Good Evening' };
    } else {
      return { bn: 'শুভ রাত্রি', en: 'Good Night' };
    }
  };

  const greeting = getGreeting();

  // Formatted date and time strings
  const enTimeStr = time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const bnTimeStr = time.toLocaleTimeString('bn-BD', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStrBn = time.toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const dateStrEn = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Get active background image source
  const currentBgSrc = bgType === 'nature' ? natureBgImage : bgType === 'custom' ? customBgUrl : null;

  // Active slide and vertical feature tab state
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [activeFeatureTab, setActiveFeatureTab] = useState<number>(0);

  const heroSlides = [
    {
      titleBn: "হাতের কাছে সকল প্রয়োজনীয় অ্যাপস ও ডিজিটাল সার্ভিস",
      titleEn: "PICK THE BEST SERVICES & DIGITAL TOOLS FOR YOU",
      subtitleBn: "জাতীয় পরিচয়পত্র, ই-পাসপোর্ট, পাসপোর্ট সাইজ ছবি মেকার, সরকারি চাকরি ও রূপান্তরকারী টুলস একসাথে বুকমার্ক করুন।",
      subtitleEn: "Bookmark all NID, e-Passport, photo studio tools, government job circulars and converters in one place.",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&auto=format&fit=crop&q=80",
      badgeBn: "✈️ হাতের কাছে স্মার্ট ডিজিটাল পোর্টাল",
      badgeEn: "✈️ HaterKache Smart Portal"
    },
    {
      titleBn: "অফিসিয়াল পাসপোর্ট ছবি মেকার ও স্টুডিও প্রসেসিং",
      titleEn: "OFFICIAL PASSPORT PHOTO MAKER & STUDIO TOOLKIT",
      subtitleBn: "অনলাইনে ১ ক্লিকে পাসপোর্ট ও স্ট্যাম্প সাইজ ছবি ক্রপ ও প্রিন্ট লেআউট রেডি করুন সহজেই।",
      subtitleEn: "Crop passport & stamp photos online in 1-click and prepare print layouts effortlessly.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
      badgeBn: "📸 অনলাইন ফটো স্টুডিও টুলস",
      badgeEn: "📸 Online Photo Studio Tools"
    },
    {
      titleBn: "এআই কোড স্যান্ডবক্স ও ওয়েব অ্যাপ বিল্ডার",
      titleEn: "AI CODE SANDBOX & INSTANT WEB APP BUILDER",
      subtitleBn: "প্রোডাক্টিভিটি বৃদ্ধি করতে আমাদের এআই স্যান্ডবক্সে রিয়েলটাইম ওয়েব কোড এক্সিকিউট ও রান করুন।",
      subtitleEn: "Boost productivity with our live AI code sandbox and runner station.",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80",
      badgeBn: "⚡ এআই কোড বিল্ডার স্টোর",
      badgeEn: "⚡ AI Code Builder Station"
    }
  ];

  const featureTabs = [
    {
      id: 0,
      titleBn: "জরুরি ও সরকারি সেবা",
      titleEn: "Emergency & Govt",
      icon: ShieldAlert,
      descBn: "জাতীয় পরিচয়পত্র এনআইডি পোর্টাল, ই-পাসপোর্ট আবেদন, জন্ম নিবন্ধন যাচাই ও সরকারি ভাতা তথ্য।",
      descEn: "NID portal, e-Passport status, birth registration verification and government services.",
      img: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 1,
      titleBn: "ই-সার্ভিস ও পাসপোর্ট",
      titleEn: "E-Services & Passport",
      icon: Compass,
      descBn: "অনলাইন চালান, ট্যাক্স ই-রিটার্ন, ড্রাইভিং লাইসেন্স বিআরটিএ সেবা ও বিদ্যুৎ বিল প্রদান।",
      descEn: "Online challan, e-Tax return, BRTA driving license status and utility bill portals.",
      img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 2,
      titleBn: "শিক্ষা ও ই-বুক রিডার",
      titleEn: "Education & E-Books",
      icon: Sparkles,
      descBn: "এনসিটিবি পাঠ্যপুস্তক ডাউনলোড, জাতীয় বিশ্ববিদ্যালয় রেজাল্ট ও ই-লার্নিং প্লাটফর্ম।",
      descEn: "NCTB textbook library, National University results, admission and e-learning hubs.",
      img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80"
    },
    {
      id: 3,
      titleBn: "ড্রাইভিং ও ফটো স্টুডিও",
      titleEn: "Tools & Photo Studio",
      icon: ImageIcon,
      descBn: "পাসপোর্ট ও স্ট্যাম্প ফটো মেকার, পিএনজি কনভার্টার, ইউনিপ্রুফ কিবোর্ড ও কনভার্টারস।",
      descEn: "Passport photo background remover, PNG converters, Bijoy-Unicode and studio tools.",
      img: "https://images.unsplash.com/photo-1542744094-3a3172720449?w=800&auto=format&fit=crop&q=80"
    }
  ];

  const popularServices = [
    {
      titleBn: "এনআইডি পোর্টাল ও পাসপোর্ট আবেদন",
      titleEn: "NID Portal & e-Passport Apply",
      categoryBn: "সরকারি ই-সেবা",
      categoryEn: "Govt E-Services",
      rating: "4.9",
      img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
      descBn: "সহজে এনআইডি ডাটা আপডেট, নতুন ভোটার রেজিস্ট্রেশন ও অনলাইন পাসপোর্ট ট্র্যাকিং করুন।",
      descEn: "Easily update NID details, new voter registration and track passport status.",
      badge: "পপুলার"
    },
    {
      titleBn: "অনলাইন পাসপোর্ট ফটো মেকার",
      titleEn: "Passport Photo Studio Tool",
      categoryBn: "স্টুডিও ও ছবি মেকার",
      categoryEn: "Studio & Photo Tools",
      rating: "5.0",
      img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
      descBn: "অফিসিয়াল ৩.৫ x ৪.৫ সেমি পাসপোর্ট সাইজ ফটো অটোমেশন ও প্রিন্ট পেপার তৈরি করুন।",
      descEn: "Official 3.5x4.5 cm passport size photo maker with custom printable margins.",
      badge: "ফ্রি টুল"
    },
    {
      titleBn: "স্মার্ট সরকারি ও বেসরকারি চাকরি",
      titleEn: "Smart Job Circular Hub",
      categoryBn: "চাকরি ও ক্যারিয়ার",
      categoryEn: "Jobs & Careers",
      rating: "4.8",
      img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
      descBn: "বিসিএস, ব্যাংক, সরকারি অফিস ও প্রাইভেট কোম্পানির সাম্প্রতিক সকল নিয়োগ বিজ্ঞপ্তি।",
      descEn: "All latest BCS, Bank, Non-cadre and government job circular notifications.",
      badge: "আপডেট"
    }
  ];

  const testimonials = [
    {
      name: "সাইদুল ইসলাম",
      titleBn: "কম্পিউটার স্টুডিও উদ্যোক্তা",
      titleEn: "Computer Studio Owner",
      reviewBn: "হাতের কাছে পোর্টালে একই সাথে পাসপোর্ট সাইজ ছবি তৈরি, কনভার্টার ও সরকারি লিঙ্কগুলো বুকমার্ক পেয়ে আমার কাজের গতি দ্বিগুণ বেড়েছে!",
      reviewEn: "Having passport photo creation, converters, and government links bookmarked in one place doubled my studio workflow speed!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      rating: 5
    },
    {
      name: "শাহনেওয়াজ শাকিল",
      titleBn: "ডিজিটাল সার্ভিস প্রোভাইডার",
      titleEn: "Digital Service Provider",
      reviewBn: "এরকম থিম ও আধুনিক লেআউটে সব প্রয়োজনীয় ই-সার্ভিস এক জায়গায় দেখতে সত্যিই অসাধারণ অভিজ্ঞতা!",
      reviewEn: "Seeing all required e-services in such a clean theme and modern layout is truly an extraordinary experience!",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      rating: 5
    },
    {
      name: "মলি রবিনসন",
      titleBn: "অনলাইন ফ্রিল্যান্সার",
      titleEn: "Online Freelancer",
      reviewBn: "এআই ওয়েব বিল্ডার এবং কনভার্টার টুলস ব্যবহারের ক্ষেত্রে এত ফাস্ট রেসপন্স আগে কখনো পাইনি।",
      reviewEn: "The AI web builder and conversion tools respond lightning fast. Simply amazing!",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      rating: 5
    }
  ];

  const newsArticles = [
    {
      categoryBn: "জরুরি নোটিশ",
      categoryEn: "Important Notice",
      dateBn: "১৫ আগস্ট, ২০২৬",
      dateEn: "15 Aug, 2026",
      titleBn: "ই-পাসপোর্ট ফি ও নতুন অনলাইন আবেদন পোর্টাল হালনাগাদ সংক্রান্ত তথ্য",
      titleEn: "e-Passport Fees & Online Application Portal Update Notice",
      comments: 14
    },
    {
      categoryBn: "সিস্টেম আপডেট",
      categoryEn: "System Update",
      dateBn: "১২ আগস্ট, ২০২৬",
      dateEn: "12 Aug, 2026",
      titleBn: "হাতের কাছে পোর্টালে নতুন এআই কোড বিল্ডার ও অটোমেটিক ব্যাকআপ সিস্টেম চালুকরণ",
      titleEn: "New AI Code Builder & Automated Backup System Integrated in Portal",
      comments: 28
    },
    {
      categoryBn: "নতুন ফিচার",
      categoryEn: "New Feature",
      dateBn: "১০ আগস্ট, ২০২৬",
      dateEn: "10 Aug, 2026",
      titleBn: "অনলাইন চালান ও ই-ট্যাক্স রিটার্ন দাখিলের সুবিধা যুক্ত করা হয়েছে",
      titleEn: "Online e-Challan & Tax Return Submission Features Added",
      comments: 9
    }
  ];

  // Render Login Gate Screen if not logged in
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen transition-colors duration-500 bg-[#f4f7fc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 relative overflow-x-hidden font-sans">
      
      {/* Start.me Style Top Navbar */}
      <StartNavbar
        onOpenWallpaper={() => setShowBgModal(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activePage={activePage}
        setActivePage={setActivePage}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Fullscreen Wallpaper Background Layer */}
      {currentBgSrc && (
        <div className="fixed inset-0 z-0 pointer-events-none transition-all duration-700 overflow-hidden">
          <img
            src={currentBgSrc}
            alt="App Wallpaper Background"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center scale-105 filter brightness-95 opacity-20"
          />
        </div>
      )}

      {/* Dynamic background ambient blur circles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-80 h-80 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-[120px] transition-opacity duration-500" />
        <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] bg-slate-800/5 dark:bg-slate-800/10 rounded-full blur-[140px] transition-opacity duration-500" />
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 relative z-10 space-y-8">

        {/* Wallpaper Picker Modal Popover */}
        <AnimatePresence>
          {showBgModal && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-4 top-20 z-50 w-80 sm:w-96 p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#ff5e14]" />
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white">
                    {t('ব্যাকগ্রাউন্ড ও ওয়ালপেপার সেটিংস', 'Background & Wallpaper Settings')}
                  </h3>
                </div>
                <button
                  onClick={() => setShowBgModal(false)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setBgType('nature')}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      bgType === 'nature'
                        ? 'border-[#ff5e14] bg-orange-500/10 text-orange-600 dark:text-orange-300 font-bold'
                        : 'border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-12 h-9 rounded-lg overflow-hidden border border-slate-300 dark:border-white/10 shrink-0">
                      <img src={natureBgImage} alt="Nature wallpaper" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{t('সবুজ পাহাড় ও প্রকৃতির দৃশ্য', 'Green Mountain Nature View')}</p>
                      <p className="text-[9px] text-slate-400 font-medium">Lush Mountain Landscape</p>
                    </div>
                    {bgType === 'nature' && <Check className="w-4 h-4 text-[#ff5e14] shrink-0" />}
                  </button>

                  <button
                    onClick={() => setBgType('none')}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      bgType === 'none'
                        ? 'border-[#ff5e14] bg-orange-500/10 text-orange-600 dark:text-orange-300 font-bold'
                        : 'border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-300 dark:border-white/10 shrink-0 flex items-center justify-center">
                      <span className="text-[10px] text-slate-400 font-mono">Bahon</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{t('ডিফল্ট বাহন থিম', 'Default Theme Color')}</p>
                      <p className="text-[9px] text-slate-400 font-medium">Standard Theme</p>
                    </div>
                    {bgType === 'none' && <Check className="w-4 h-4 text-[#ff5e14] shrink-0" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 1: BAHON HERO CAROUSEL BANNER */}
        <div className="relative rounded-3xl overflow-hidden bg-[#0a192f] text-white shadow-2xl border border-slate-800 group">
          {/* Background image overlay with slider transition */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroSlides[currentSlide].image}
              alt="Hero Slide Background"
              className="w-full h-full object-cover opacity-30 filter brightness-90 transition-all duration-700 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#071325] via-[#071325]/90 to-transparent" />
          </div>

          {/* Slider Content */}
          <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 md:py-20 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 bg-[#ff5e14]/20 border border-[#ff5e14]/40 text-[#ff5e14] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <span>{isBn ? heroSlides[currentSlide].badgeBn : heroSlides[currentSlide].badgeEn}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase font-sans">
              {isBn ? heroSlides[currentSlide].titleBn : heroSlides[currentSlide].titleEn}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal max-w-2xl">
              {isBn ? heroSlides[currentSlide].subtitleBn : heroSlides[currentSlide].subtitleEn}
            </p>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-4">
              <button
                onClick={() => {
                  const el = document.getElementById('app-hub-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#ff5e14] hover:bg-[#ea4d05] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-xl shadow-orange-500/30 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <span>{t('অ্যাপস এক্সপ্লোর করুন', 'EXPLORE NOW')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('productivity-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 font-extrabold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 active:scale-95 backdrop-blur-md"
              >
                <span>{t('পোর্টালে বিস্তারিত', 'MORE INFO')}</span>
              </button>
            </div>
          </div>

          {/* Left / Right Carousel Arrow Controls */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-[#ff5e14] border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-90"
            title="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-[#ff5e14] border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-90"
            title="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Carousel Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-8 bg-[#ff5e14]' : 'w-2 bg-white/40 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>

        {/* SECTION 2: VERTICAL FEATURE TABS ("ABOUT US / কী কী পাবেন পোর্টালে") */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[#ff5e14] text-xs font-black uppercase tracking-widest">{t('পোর্টালে কি কি পাবেন', 'PORTAL FEATURES')}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {t('হাতের কাছে স্মার্ট পোর্টালে আপনার সব ই-সেবা', 'All Your Essential Digital Services In One Platform')}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Vertical Tab Menu */}
            <div className="lg:col-span-5 space-y-2">
              {featureTabs.map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeFeatureTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFeatureTab(tab.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isActive
                        ? 'bg-[#ff5e14] text-white border-[#ff5e14] shadow-lg shadow-orange-500/20 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/5 hover:border-orange-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${isActive ? 'bg-white/20 text-white' : 'bg-orange-500/10 text-[#ff5e14]'}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold uppercase tracking-wide">{isBn ? tab.titleBn : tab.titleEn}</p>
                        <p className={`text-xs ${isActive ? 'text-orange-100' : 'text-slate-500 dark:text-slate-400'}`}>
                          {isBn ? tab.descBn.slice(0, 35) + '...' : tab.descEn.slice(0, 35) + '...'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform ${isActive ? 'translate-x-1 text-white' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>

            {/* Right Feature Card Box */}
            <div className="lg:col-span-7 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between min-h-[320px]">
              <div className="absolute inset-0 z-0 opacity-40">
                <img
                  src={featureTabs[activeFeatureTab].img}
                  alt="Feature Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#ff5e14] text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-full">
                  <span>{isBn ? featureTabs[activeFeatureTab].titleBn : featureTabs[activeFeatureTab].titleEn}</span>
                </div>

                <h3 className="text-2xl font-black leading-tight text-white">
                  {isBn ? featureTabs[activeFeatureTab].descBn : featureTabs[activeFeatureTab].descEn}
                </h3>

                <ul className="space-y-2 text-xs text-slate-300 font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#ff5e14]" />
                    <span>{t('১-ক্লিকে সরাসরি অফিশিয়াল পোর্টালে প্রবেশ', 'Direct 1-click access to official portal')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#ff5e14]" />
                    <span>{t('১০০% নিরাপদ ও বিজ্ঞাপনবিহীন দ্রুত লোডিং', '100% secure, ad-free lightning fast loading')}</span>
                  </li>
                </ul>
              </div>

              <div className="relative z-10 pt-6">
                <button
                  onClick={() => {
                    const el = document.getElementById('app-hub-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#ff5e14] hover:bg-[#ea4d05] text-white font-black text-xs uppercase px-5 py-3 rounded-xl shadow-lg shadow-orange-500/20 cursor-pointer flex items-center gap-2 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{t('সেবা গ্রহণ করুন', 'ACCESS SERVICE')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: POPULAR SERVICES GRID ("POPULAR TOUR") */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-[#ff5e14] text-xs font-black uppercase tracking-widest">{t('জনপ্রিয় সেবা', 'POPULAR SERVICES')}</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {t('সবচেয়ে ব্যবহৃত ডিজিটাল সেবা সমূহ', 'Most Used Digital Services')}
              </h2>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('app-hub-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-bold text-[#ff5e14] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{t('সবগুলো সার্ভিস দেখুন', 'View All Services')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularServices.map((srv, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 shadow-lg hover:shadow-2xl transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 relative overflow-hidden">
                    <img
                      src={srv.img}
                      alt={srv.titleBn}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <span className="absolute top-3 left-3 bg-[#ff5e14] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow">
                      {srv.badge}
                    </span>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                      <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px]">
                        {isBn ? srv.categoryBn : srv.categoryEn}
                      </span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{srv.rating}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#ff5e14] transition-colors">
                      {isBn ? srv.titleBn : srv.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {isBn ? srv.descBn : srv.descEn}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={() => {
                      const el = document.getElementById('app-hub-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-[#ff5e14] hover:text-white text-slate-800 dark:text-slate-200 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{t('বিস্তারিত দেখুন', 'READ MORE')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: VIBRANT ORANGE STAT COUNTER BANNER */}
        <div className="bg-gradient-to-r from-[#ff5e14] via-[#f97316] to-[#ea4d05] text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden my-8">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div className="max-w-xl space-y-2">
              <span className="bg-white/20 text-white font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                {t('স্মার্ট পোটাল তথ্য', 'SMART PORTAL STATS')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                {t('হাতের কাছে স্মার্ট পোর্টালে স্বাগতম', 'Welcome To HaterKache Smart Portal')}
              </h2>
              <p className="text-orange-100 text-xs sm:text-sm font-medium">
                {t('আপনার সময় ও শ্রম বাঁচাতে আমাদের সকল ফ্রী ডিজিটাল লিঙ্ক ও টুলস ব্যবহার করুন।', 'Save time and efforts using all our free digital links & tools.')}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full lg:w-auto">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                <p className="text-2xl sm:text-3xl font-black font-mono">৫০+</p>
                <p className="text-[10px] font-extrabold uppercase mt-1 text-orange-100">{t('ডিজিটাল সেবা', 'Services')}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                <p className="text-2xl sm:text-3xl font-black font-mono">১২+</p>
                <p className="text-[10px] font-extrabold uppercase mt-1 text-orange-100">{t('ক্যাটাগরি', 'Categories')}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                <p className="text-2xl sm:text-3xl font-black font-mono">১০০%</p>
                <p className="text-[10px] font-extrabold uppercase mt-1 text-orange-100">{t('ফ্রি সুবিধা', 'Free Access')}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                <p className="text-2xl sm:text-3xl font-black font-mono">২৪/৭</p>
                <p className="text-[10px] font-extrabold uppercase mt-1 text-orange-100">{t('অনলাইন গাইড', 'Support')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: CORE FUNCTIONAL APP WIDGETS (AppHub, Weather, Productivity, Scratchpad, AI Chat, Converters, WebBuilder) */}
        <div className="space-y-8 pt-4">
          
          {/* Main Bookmarks App Hub */}
          <div id="app-hub-section" className="scroll-mt-20">
            <AppHub externalSearchQuery={searchQuery} />
          </div>

          {/* Grid for Productivity, Scratchpad, Weather */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div id="productivity-section" className="lg:col-span-8 scroll-mt-20">
              <ProductivityStation />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <WeatherWidget />
              <Scratchpad />
            </div>
          </div>

          {/* AI Chat Bar & Converters Widget */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 scroll-mt-20">
              <AIChatBar />
            </div>
            <div className="lg:col-span-6 scroll-mt-20">
              <Converters />
            </div>
          </div>

          {/* Web Sandbox App Builder */}
          <div id="web-builder-section" className="scroll-mt-20">
            <WebBuilder />
          </div>
        </div>

        {/* SECTION 6: USER TESTIMONIALS ("WHAT TRAVELLERS SAY ABOUT US") */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-white/10 shadow-xl space-y-6 my-10">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[#ff5e14] text-xs font-black uppercase tracking-widest">{t('ব্যবহারকারীদের মতামত', 'TESTIMONIALS')}</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {t('আমাদের গ্রাহক ও ব্যবহারকারীরা যা বলছেন', 'What Our Users Say About Us')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((tst, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <Quote className="w-8 h-8 text-[#ff5e14] opacity-80" />
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    "{isBn ? tst.reviewBn : tst.reviewEn}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-200 dark:border-white/5">
                  <img src={tst.avatar} alt={tst.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-[#ff5e14]" />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{tst.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{isBn ? tst.titleBn : tst.titleEn}</p>
                    <div className="flex items-center text-amber-400 gap-0.5 mt-0.5">
                      {[...Array(tst.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 7: NOTICE BOARD & NEWS ("THE BEST VALUE UNDER THE SUN") */}
        <div className="space-y-4 pb-12">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[#ff5e14] text-xs font-black uppercase tracking-widest">{t('নোটিশ বোর্ড', 'NOTICE BOARD')}</span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {t('সাম্প্রতিক নোটিশ ও গুরুত্বপূর্ণ খবর', 'Recent Notices & Important Updates')}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsArticles.map((art, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 shadow-lg space-y-3 flex flex-col justify-between hover:border-[#ff5e14] transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="bg-orange-500/10 text-[#ff5e14] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      {isBn ? art.categoryBn : art.categoryEn}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-[#ff5e14]" />
                      <span>{isBn ? art.dateBn : art.dateEn}</span>
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                    {isBn ? art.titleBn : art.titleEn}
                  </h3>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-[#ff5e14]">
                  <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{art.comments} Comments</span>
                  </span>
                  <button className="hover:underline flex items-center gap-1 cursor-pointer">
                    <span>{t('পড়ুন', 'Read More')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECTION 8: COMPREHENSIVE 4-COLUMN BAHON THEME FOOTER */}
      <footer className="w-full bg-[#071325] text-slate-300 border-t border-slate-800 pt-12 pb-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Col 1: Get In Touch */}
            <div className="space-y-4">
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff5e14]"></span>
                <span>{t('যোগাযোগ (GET IN TOUCH)', 'GET IN TOUCH')}</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t('হাতের কাছে পোর্টাল — আপনার সকল সরকারি, শিক্ষা ও প্র্যাকটিক্যাল ডিজিটাল সেবা এক প্ল্যাটফর্মে।', 'HaterKache Portal — all your essential government, education and studio services in one platform.')}
              </p>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#ff5e14] shrink-0" />
                  <span>ঢাকা, বাংলাদেশ</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#ff5e14] shrink-0" />
                  <span className="font-mono">+880 1700-000000</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#ff5e14] shrink-0" />
                  <span>info@haterkache.com</span>
                </li>
              </ul>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-4">
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff5e14]"></span>
                <span>{t('দ্রুত লিংক (QUICK LINKS)', 'QUICK LINKS')}</span>
              </h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#app-hub-section" className="hover:text-[#ff5e14] transition-colors">এনআইডি ও ই-পাসপোর্ট সেবা</a></li>
                <li><a href="#app-hub-section" className="hover:text-[#ff5e14] transition-colors">অনলাইন ফটো স্টুডিও মেকার</a></li>
                <li><a href="#productivity-section" className="hover:text-[#ff5e14] transition-colors">প্রোডাক্টিভিটি ও টাস্ক লিস্ট</a></li>
                <li><a href="#web-builder-section" className="hover:text-[#ff5e14] transition-colors">এআই কোড স্যান্ডবক্স বিল্ডার</a></li>
                <li><a href="#app-hub-section" className="hover:text-[#ff5e14] transition-colors">অনলাইন ইউনিট ও কারেন্সি কনভার্টার</a></li>
              </ul>
            </div>

            {/* Col 3: Follow Us */}
            <div className="space-y-4">
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff5e14]"></span>
                <span>{t('সোশ্যাল মিডিয়া (FOLLOW US)', 'FOLLOW US')}</span>
              </h4>
              <p className="text-xs text-slate-400">
                {t('আমাদের সাথে ফেসবুকে যুক্ত থাকুন এবং আপডেট পান।', 'Follow us on social media for regular updates.')}
              </p>
              <div className="flex items-center gap-2">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#ff5e14] text-white flex items-center justify-center text-xs font-bold transition-all">FB</a>
                <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#ff5e14] text-white flex items-center justify-center text-xs font-bold transition-all">TW</a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#ff5e14] text-white flex items-center justify-center text-xs font-bold transition-all">YT</a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#ff5e14] text-white flex items-center justify-center text-xs font-bold transition-all">IG</a>
              </div>
            </div>

            {/* Col 4: Subscribe Newsletter */}
            <div className="space-y-4">
              <h4 className="text-white font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff5e14]"></span>
                <span>{t('সাবস্ক্রাইব (SUBSCRIBE)', 'SUBSCRIBE')}</span>
              </h4>
              <p className="text-xs text-slate-400">
                {t('নতুন ই-সেবা ও খবরের আপডেট ইমেইলে পেতে সাবস্ক্রাইব করুন।', 'Subscribe to receive news & service updates.')}
              </p>
              <div className="flex gap-1.5">
                <input
                  type="email"
                  placeholder={t('আপনার ইমেইল ঠিকানা...', 'Enter email...')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ff5e14]"
                />
                <button
                  onClick={() => alert(t('ধন্যবাদ! আপনার ইমেইল যুক্ত করা হয়েছে।', 'Subscribed successfully!'))}
                  className="bg-[#ff5e14] hover:bg-[#ea4d05] text-white px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  title="Subscribe"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Copyright Bottom Bar */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <p>© 2026 HaterKache Smart Portal. All Rights Reserved.</p>
            <div className="flex items-center gap-4 text-[11px]">
              <a href="#privacy" className="hover:text-white">Terms & Condition</a>
              <span>•</span>
              <a href="#privacy" className="hover:text-white">Privacy Policy</a>
              <span>•</span>
              <a href="#support" className="hover:text-white">Support</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}

