/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, Moon, Sparkles, Clock, Compass, Settings, ShieldAlert, Cpu, Image as ImageIcon, 
  Check, Sliders, X, Upload, Palette, Globe, ChevronLeft, ChevronRight, Phone, Mail, 
  MapPin, Play, CheckCircle2, Star, Quote, Send, ExternalLink, ArrowRight, Calendar, MessageSquare, Users, ShieldCheck, Plus, Trash2, Link as LinkIcon,
  Home, Layers, Zap, Code2
} from 'lucide-react';

// Import subcomponents
import StartNavbar from './components/StartNavbar';
import WeatherWidget from './components/WeatherWidget';
import AIChatBar from './components/AIChatBar';
import Converters from './components/Converters';
import AppHub, { getHubStats } from './components/AppHub';
import ProductivityStation from './components/ProductivityStation';
import Scratchpad from './components/Scratchpad';
import WebBuilder from './components/WebBuilder';
import LoginScreen from './components/LoginScreen';
import { NoticeDetailModal, NoticeArticle } from './components/NoticeDetailModal';

import natureBgImage from './assets/images/nature_mountain_bg_1786045136486.jpg';
import logoImg from './assets/images/hater_kache_logo_1786217179987.jpg';
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
    if (!auth) return;
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

  const [customWallpapers, setCustomWallpapers] = useState<string[]>(() => {
    const saved = localStorage.getItem('hk_custom_wallpapers');
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });

  const [bgUrlInput, setBgUrlInput] = useState<string>('');

  const presetWallpapers = [
    { id: 'preset-nature', nameEn: "Nature Mountain", nameBn: "সবুজ পাহাড়", url: natureBgImage },
    { id: 'preset-cyber', nameEn: "Cyberpunk Neon", nameBn: "সাইবারপাঙ্ক নিয়ন", url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80" },
    { id: 'preset-galaxy', nameEn: "Galaxy Cosmos", nameBn: "গ্যালাক্সি মহাকাশ", url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80" },
    { id: 'preset-dark', nameEn: "Minimal Dark Glass", nameBn: "ডার্ক গ্লাস", url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80" },
    { id: 'preset-sunset', nameEn: "Sunset Horizon", nameBn: "সূর্যাস্ত দিগন্ত", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80" }
  ];

  const [bgDimming, setBgDimming] = useState<number>(() => {
    const saved = localStorage.getItem('hk_bg_dimming');
    return saved ? parseInt(saved) : 40; // 40% dim tint overlay
  });

  const [showBgModal, setShowBgModal] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<string>('start');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNotice, setSelectedNotice] = useState<NoticeArticle | null>(null);

  // Dynamic statistics synced in real-time with bookmarks & categories
  const [hubStats, setHubStats] = useState(() => getHubStats());

  useEffect(() => {
    const handleStatsUpdate = () => {
      setHubStats(getHubStats());
    };

    window.addEventListener('hk_bookmarks_updated', handleStatsUpdate);
    window.addEventListener('storage', handleStatsUpdate);
    return () => {
      window.removeEventListener('hk_bookmarks_updated', handleStatsUpdate);
      window.removeEventListener('storage', handleStatsUpdate);
    };
  }, []);

  // Time & Greeting states
  const [time, setTime] = useState(new Date());

  // App 1-second initial splash loader state
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
    localStorage.setItem('hk_custom_wallpapers', JSON.stringify(customWallpapers));
  }, [bgType, customBgUrl, bgDimming, customWallpapers]);

  // Handle adding custom wallpaper URL manually
  const handleAddCustomUrl = () => {
    if (!bgUrlInput.trim()) return;
    const url = bgUrlInput.trim();
    if (!customWallpapers.includes(url)) {
      setCustomWallpapers([url, ...customWallpapers]);
    }
    setCustomBgUrl(url);
    setBgType('custom');
    setBgUrlInput('');
  };

  // Handle deleting custom wallpaper
  const handleDeleteCustomWallpaper = (urlToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customWallpapers.filter(u => u !== urlToDelete);
    setCustomWallpapers(updated);
    if (customBgUrl === urlToDelete) {
      setBgType('nature');
      setCustomBgUrl('');
    }
  };

  // Handle local file upload for background
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const res = reader.result;
          setCustomBgUrl(res);
          setBgType('custom');
          if (!customWallpapers.includes(res)) {
            setCustomWallpapers([res, ...customWallpapers]);
          }
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
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1400&auto=format&fit=crop&q=80",
      // badgeBn: "✈️ হাতের কাছে ",
      // badgeEn: "✈️ HaterKache "
    },
    {
      titleBn: "অফিসিয়াল পাসপোর্ট ছবি মেকার ও স্টুডিও প্রসেসিং",
      titleEn: "OFFICIAL PASSPORT PHOTO MAKER & STUDIO TOOLKIT",
      subtitleBn: "অনলাইনে ১ ক্লিকে পাসপোর্ট ও স্ট্যাম্প সাইজ ছবি ক্রপ ও প্রিন্ট লেআউট রেডি করুন সহজেই।",
      subtitleEn: "Crop passport & stamp photos online in 1-click and prepare print layouts effortlessly.",
      image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1400&auto=format&fit=crop&q=80",
      // badgeBn: "📸 অনলাইন ফটো স্টুডিও টুলস",
      // badgeEn: "📸 Online Photo Studio Tools"
    },
    {
      titleBn: "এআই কোড স্যান্ডবক্স ও ওয়েব অ্যাপ বিল্ডার",
      titleEn: "AI CODE SANDBOX & INSTANT WEB APP BUILDER",
      subtitleBn: "প্রোডাক্টিভিটি বৃদ্ধি করতে আমাদের এআই স্যান্ডবক্সে রিয়েলটাইম ওয়েব কোড এক্সিকিউট ও রান করুন।",
      subtitleEn: "Boost productivity with our live AI code sandbox and runner station.",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1400&auto=format&fit=crop&q=80",
      // badgeBn: "⚡ এআই কোড বিল্ডার স্টোর",
      // badgeEn: "⚡ AI Code Builder Station"
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
      img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80"
    },
    {
      id: 1,
      titleBn: "ই-সার্ভিস ও পাসপোর্ট",
      titleEn: "E-Services & Passport",
      icon: Compass,
      descBn: "অনলাইন চালান, ট্যাক্স ই-রিটার্ন, ড্রাইভিং লাইসেন্স বিআরটিএ সেবা ও বিদ্যুৎ বিল প্রদান।",
      descEn: "Online challan, e-Tax return, BRTA driving license status and utility bill portals.",
      img: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=1200&auto=format&fit=crop&q=80"
    },
    {
      id: 2,
      titleBn: "শিক্ষা ও ই-বুক রিডার",
      titleEn: "Education & E-Books",
      icon: Sparkles,
      descBn: "এনসিটিবি পাঠ্যপুস্তক ডাউনলোড, জাতীয় বিশ্ববিদ্যালয় রেজাল্ট ও ই-লার্নিং প্লাটফর্ম।",
      descEn: "NCTB textbook library, National University results, admission and e-learning hubs.",
      img: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80"
    },
    {
      id: 3,
      titleBn: "ড্রাইভিং ও ফটো স্টুডিও",
      titleEn: "Tools & Photo Studio",
      icon: ImageIcon,
      descBn: "পাসপোর্ট ও স্ট্যাম্প ফটো মেকার, পিএনজি কনভার্টার, ইউনিপ্রুফ কিবোর্ড ও কনভার্টারস।",
      descEn: "Passport photo background remover, PNG converters, Bijoy-Unicode and studio tools.",
      img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&auto=format&fit=crop&q=80"
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

  const newsArticles: NoticeArticle[] = [
    {
      id: 1,
      categoryBn: "জরুরি নোটিশ",
      categoryEn: "Important Notice",
      dateBn: "১৫ আগস্ট, ২০২৬",
      dateEn: "15 Aug, 2026",
      titleBn: "ই-পাসপোর্ট ফি ও নতুন অনলাইন আবেদন পোর্টাল হালনাগাদ সংক্রান্ত তথ্য",
      titleEn: "e-Passport Fees & Online Application Portal Update Notice",
      authorBn: "ইমিগ্রেশন ও পাসপোর্ট হেল্পডেস্ক",
      authorEn: "Immigration & Passport Helpdesk",
      contentBn: [
        "বাংলাদেশ ই-পাসপোর্ট অনলাইন সিস্টেমে নতুন সার্ভার মাইগ্রেশন ও ফি পরিমার্জনের কাজ সফলভাবে সম্পন্ন হয়েছে। আবেদনকারীরা এখন থেকে কোনো মধ্যস্থতাকারী ছাড়াই সরাসরি হাতের কাছে পোর্টালের ই-পাসপোর্ট লিঙ্কের মাধ্যমে দ্রুত স্লট বুকিং ও ই-চালান জমা দিতে পারবেন।",
        "৪৮ পৃষ্ঠা ও ১০ বছর মেয়াদের সাধারণ আবেদন ফি ৫,৭৫০ টাকা এবং জরুরি আবেদন ফি ৮,০৫০ টাকা (১৫% ভ্যাট অন্তর্ভুক্ত)। ৬৪ পৃষ্ঠা ও ৫/১০ বছর মেয়াদের জন্য নির্ধারিত ফি সরকারি রেট অনুযায়ী প্রযোজ্য হবে।",
        "আবেদনপত্র প্রিন্ট কপি, ব্যাংক পেমেন্ট রশিদ, জাতীয় পরিচয়পত্রের মূল ও ফটোকপি সাথে নিয়ে নির্ধারিত আঞ্চলিক পাসপোর্ট অফিসে উপস্থিত হতে অনুরোধ জানানো হচ্ছে।"
      ],
      contentEn: [
        "The Bangladesh e-Passport portal has completed its scheduled system migration and payment gateway enhancement. Applicants can now book appointment dates and verify challan payments directly through HaterKache links without intermediaries.",
        "Official government fees: 48 pages (10 years) regular delivery is 5,750 BDT and express delivery is 8,050 BDT including 15% VAT.",
        "Please bring your printed application summary, online challan payment receipt, and original NID along with photocopies during your biometric enrollment date."
      ],
      initialComments: [
        {
          id: 'c1-1',
          author: 'তানভীর আহমেদ',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          role: 'ভেরিফাইড নাগরিক',
          timeAgoBn: '২ ঘন্টা আগে',
          timeAgoEn: '2 hours ago',
          textBn: 'আমি গত সপ্তাহে রি-ইস্যু আবেদন করেছিলাম, ডেলিভারি ডেট একদম যথাসময়ে পেয়েছি। হাতের কাছে পোর্টাল থেকে সরাসরি সঠিক পোর্টালে ঢুকতে পেরে অনেক সময় বেঁচেছে!',
          textEn: 'I applied for re-issue last week and received my biometric schedule on time. HaterKache portal made accessing the real site super easy!',
          likes: 12,
          isLiked: false,
          replies: [
            {
              id: 'c1-1-r1',
              author: 'অ্যাডমিন সাপোর্ট',
              avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
              role: 'হেল্পডেস্ক',
              timeAgoBn: '১ ঘন্টা আগে',
              timeAgoEn: '1 hour ago',
              textBn: 'ধন্যবাদ তানভীর ভাই! আপনার সুচিন্তিত মতামতের জন্য কৃতজ্ঞতা।',
              textEn: 'Thank you Tanvir bhai! Glad it was helpful.',
              likes: 4
            }
          ]
        },
        {
          id: 'c1-2',
          author: 'মোঃ রফিকুল ইসলাম',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
          role: 'ব্যবহারকারী',
          timeAgoBn: '৪ ঘন্টা আগে',
          timeAgoEn: '4 hours ago',
          textBn: '৪৮ পৃষ্ঠা ও ১০ বছরের মেয়াদের ফি সোনালী ই-সেবার মাধ্যমে বিকাশ দিয়ে দেওয়া যায় কি?',
          textEn: 'Can I pay the 48-page 10-year fee through bKash via Sonali e-Sheba?',
          likes: 7,
          isLiked: true,
          replies: [
            {
              id: 'c1-2-r1',
              author: 'শাহিন আলম',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
              role: 'সদস্য',
              timeAgoBn: '৩ ঘন্টা আগে',
              timeAgoEn: '3 hours ago',
              textBn: 'হ্যাঁ ভাই, বিকাশ, নগদ ও যেকোনো ব্যাংকের ভিসা/মাস্টারকার্ড দিয়ে সরাসরি সোনালী ই-সেবা ফি পরিশোধ করা যায়।',
              textEn: 'Yes brother, bKash, Nagad and all Visa/Mastercards are fully supported on Sonali e-Sheba gateway.',
              likes: 5
            }
          ]
        },
        {
          id: 'c1-3',
          author: 'Farzana Yasmin',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
          role: 'Sylhet Division',
          timeAgoBn: '৬ ঘন্টা আগে',
          timeAgoEn: '6 hours ago',
          textBn: 'খুবই সুন্দর ও পরিচ্ছন্ন নোটিশ উপস্থাপনা। বিশেষ করে ফটো মেকার টুল দিয়ে পাসপোর্ট সাইজ ছবি প্রিন্ট করে নিয়ে গেছি, কোনো ঝামেলা হয়নি।',
          textEn: 'Very clear guidelines. I also used the Photo Studio tool to crop my passport photos before visiting.',
          likes: 9,
          isLiked: false
        }
      ]
    },
    {
      id: 2,
      categoryBn: "সিস্টেম আপডেট",
      categoryEn: "System Update",
      dateBn: "১২ আগস্ট, ২০২৬",
      dateEn: "12 Aug, 2026",
      titleBn: "হাতের কাছে পোর্টালে নতুন এআই কোড বিল্ডার ও অটোমেটিক ব্যাকআপ সিস্টেম চালুকরণ",
      titleEn: "New AI Code Builder & Automated Backup System Integrated in Portal",
      authorBn: "টেক ও ইনোভেশন টিম",
      authorEn: "Tech & Innovation Team",
      contentBn: [
        "আমাদের সম্মানিত ব্যবহারকারীদের প্রোডাক্টিভিটি বহুগুণ বৃদ্ধি করতে যুক্ত করা হয়েছে লাইভ এআই স্যান্ডবক্স ও কোড বিল্ডার স্টেশন। এখন আপনি যেকোনো ওয়েব আইডিয়া, এইচটিএমএল/সিএসএস কোড বা ক্যালকুলেটর প্রম্পট দিলেই তা লাইভ প্রিভিউ সহ দেখতে ও টেস্ট করতে পারবেন।",
        "এছাড়াও কাস্টম বুকমার্ক লিঙ্ক ও সেটিংস স্বয়ংক্রিয়ভাবে লোকাল স্টোরেজে রিয়েলটাইমে সিঙ্ক ও ব্যাকআপ রাখার সুবিধা চালু হয়েছে, যাতে ব্রাউজার রিফ্রেশ বা উইন্ডো ক্লোজ হলেও আপনার কোনো ডেটা হারিয়ে না যায়।"
      ],
      contentEn: [
        "We are excited to launch the AI Code Sandbox and Web App Builder inside HaterKache portal. Users can now generate, edit and preview HTML/CSS/React widgets live in the browser.",
        "Automatic real-time local persistence has also been enabled for custom app bookmarks, scratchpad notes and personal preferences, ensuring zero data loss across sessions."
      ],
      initialComments: [
        {
          id: 'c2-1',
          author: 'সাদিকুর রহমান',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
          role: 'Web Developer',
          timeAgoBn: '১ দিন আগে',
          timeAgoEn: '1 day ago',
          textBn: 'AI Code sandbox ফিচারটা অসাধারণ কাজ করছে! সরাসরি প্রম্পট লিখে কোড জেনারেট ও সাথে সাথে রান করা যাচ্ছে। দারুণ কাজ করেছেন ডেভেলপার ভাইয়েরা।',
          textEn: 'The AI Code sandbox works smoothly! Generating and running live previews in one place is fantastic.',
          likes: 18,
          isLiked: true,
          replies: [
            {
              id: 'c2-1-r1',
              author: 'হাতের কাছে ইঞ্জিনিয়ারিং',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
              role: 'Core Team',
              timeAgoBn: '২০ ঘন্টা আগে',
              timeAgoEn: '20 hours ago',
              textBn: 'অনেক ধন্যবাদ সাদিকুর ভাই! পরবর্তীতে আরো নতুন টেমপ্লেট যুক্ত করা হবে।',
              textEn: 'Thank you! More responsive templates and widgets are coming soon.',
              likes: 6
            }
          ]
        },
        {
          id: 'c2-2',
          author: 'কামরুল হাসান',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
          role: 'পাওয়ার ইউজার',
          timeAgoBn: '১ দিন আগে',
          timeAgoEn: '1 day ago',
          textBn: 'ব্যাকআপ সিস্টেমটা চালু হওয়াতে এখন নিজের পছন্দের কাস্টম লিঙ্কগুলো নিশ্চিন্তে অ্যাড করে রাখছি।',
          textEn: 'The automated storage sync keeps my customized links perfectly preserved.',
          likes: 11,
          isLiked: false
        }
      ]
    },
    {
      id: 3,
      categoryBn: "নতুন ফিচার",
      categoryEn: "New Feature",
      dateBn: "১০ আগস্ট, ২০২৬",
      dateEn: "10 Aug, 2026",
      titleBn: "অনলাইন চালান ও ই-ট্যাক্স রিটার্ন দাখিলের সুবিধা যুক্ত করা হয়েছে",
      titleEn: "Online e-Challan & Tax Return Submission Features Added",
      authorBn: "ডিজিটাল সার্ভিস টিম",
      authorEn: "Digital Service Team",
      contentBn: [
        "জাতীয় রাজস্ব বোর্ড (NBR) এর ই-রিটার্ন এবং অর্থ বিভাগের অটোমেটেড চালান সিস্টেম (A-Challan) সরাসরি হাতের কাছে পোর্টালে যুক্ত করা হয়েছে।",
        "এর মাধ্যমে করদাতাগণ ঘরে বসেই মাত্র কয়েক মিনিটে তাদের ব্যক্তিশ্রেণির আয়কর রিটার্ন দাখিল ও একনলেজমেন্ট রিসিট ডাউনলোড করতে পারবেন। একই সাথে সরকারি ট্রেজারি চালান ও পাসপোর্ট/ড্রাইভিং ফি চালান জেনারেট করা যাবে।"
      ],
      contentEn: [
        "National Board of Revenue (NBR) e-Tax Return portal and Bangladesh Treasury Automated Challan (A-Challan) systems are now directly integrated into HaterKache.",
        "Individual taxpayers can easily prepare tax returns, submit online, and download certified tax acknowledgement slips in minutes."
      ],
      initialComments: [
        {
          id: 'c3-1',
          author: 'ইঞ্জিনিয়ার মশিউর রহমান',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
          role: 'ট্যাক্স পেয়ার',
          timeAgoBn: '২ দিন আগে',
          timeAgoEn: '2 days ago',
          textBn: 'অনলাইন চালান অপশনটি এক ক্লিকে পাওয়াটা সত্যি অনেক সহজ হয়েছে। সোনালী ব্যাংক ও মোবাইল ব্যাংকিং দিয়ে ফি পরিশোধ করেছি ঝামেলাহীনভাবে।',
          textEn: 'Having the direct A-Challan link integrated saves lots of search hassle. Paid instantly via internet banking.',
          likes: 8,
          isLiked: true
        },
        {
          id: 'c3-2',
          author: 'সাব্বির হোসাইন',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
          role: 'ইউজার',
          timeAgoBn: '৩ দিন আগে',
          timeAgoEn: '3 days ago',
          textBn: 'জিরো ট্যাক্স রিটার্ন সাবমিটের ক্ষেত্রে কি কোনো সার্ভিস চার্জ দিতে হয়?',
          textEn: 'Is there any fee for zero tax return submission?',
          likes: 4,
          isLiked: false,
          replies: [
            {
              id: 'c3-2-r1',
              author: 'ট্যাক্স হেল্পডেস্ক',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
              role: 'অফিসিয়াল সাপোর্ট',
              timeAgoBn: '২ দিন আগে',
              timeAgoEn: '2 days ago',
              textBn: 'না ভাই, সরকারি ই-রিটার্ন পোর্টালে জিরো রিটার্ন সম্পূর্ণ বিনামূল্যে দাখিল করা যায়।',
              textEn: 'No, filing zero tax return on the official NBR portal is 100% free of cost.',
              likes: 7
            }
          ]
        }
      ]
    }
  ];

  // Render 1-second initial app loading splash screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#071325] text-white select-none">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-5 p-6 text-center max-w-xs"
        >
          {/* Logo with pulsing glowing ring */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-2xl bg-gradient-to-r from-[#ff5e14] to-amber-500 opacity-75 blur-lg animate-pulse" />
            <div className="relative h-20 w-20 rounded-2xl bg-white p-2 border-2 border-orange-400 shadow-2xl flex items-center justify-center overflow-hidden">
              <img src={logoImg} alt="হাতের কাছে Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight font-sans">
              হাতের কাছে <span className="text-[#ff5e14]">স্মার্ট পোর্টাল</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              HATERKACHE 
            </p>
          </div>

          {/* Loader bar */}
          <div className="w-52 h-1.5 bg-slate-800 rounded-full overflow-hidden relative mt-2 border border-slate-700/80 shadow-inner">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              className="h-full bg-gradient-to-r from-[#ff5e14] via-amber-400 to-[#ff5e14] rounded-full"
            />
          </div>

          <p className="text-[11px] text-slate-400 font-medium animate-pulse">
            {isBn ? 'প্রসেসিং হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...' : 'Loading, please wait...'}
          </p>
        </motion.div>
      </div>
    );
  }

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

      {/* Main Container with Mobile Spacing */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-20 sm:pb-16 relative z-10 space-y-6 sm:space-y-8">

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

              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {/* Default & Preset Wallpapers */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                    {t('প্রিসেট ওয়ালপেপার', 'Preset Wallpapers')}
                  </div>

                  <button
                    onClick={() => setBgType('none')}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      bgType === 'none'
                        ? 'border-[#ff5e14] bg-orange-500/10 text-orange-600 dark:text-orange-300 font-bold'
                        : 'border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="w-10 h-7 rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-300 dark:border-white/10 shrink-0 flex items-center justify-center">
                      <span className="text-[9px] text-slate-400 font-mono">None</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{t('কোনো ওয়ালপেপার নেই (সলিড)', 'No Wallpaper (Solid)')}</p>
                    </div>
                    {bgType === 'none' && <Check className="w-4 h-4 text-[#ff5e14] shrink-0" />}
                  </button>

                  {presetWallpapers.map((p) => {
                    const isSelected = bgType === 'custom' && customBgUrl === p.url;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          setCustomBgUrl(p.url);
                          setBgType('custom');
                        }}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#ff5e14] bg-orange-500/10 text-orange-600 dark:text-orange-300 font-bold'
                            : 'border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="w-10 h-7 rounded-lg overflow-hidden border border-slate-300 dark:border-white/10 shrink-0">
                          <img src={p.url} alt={p.nameEn} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{isBn ? p.nameBn : p.nameEn}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#ff5e14] shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom User Wallpapers Section */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-2">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>{t('কাস্টম ব্যাকগ্রাউন্ড (ম্যানুয়াল)', 'Custom Backgrounds (Manual)')}</span>
                    <span className="bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded text-[9px]">
                      {customWallpapers.length}
                    </span>
                  </div>

                  {/* Add URL Input Box */}
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="url"
                        value={bgUrlInput}
                        onChange={(e) => setBgUrlInput(e.target.value)}
                        placeholder={t('ছবির ইমেজ লিংক পেস্ট করুন...', 'Paste image URL here...')}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-[#ff5e14]"
                      />
                    </div>
                    <button
                      onClick={handleAddCustomUrl}
                      className="px-3 py-1.5 bg-[#ff5e14] hover:bg-[#e05211] text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('যোগ', 'Add')}</span>
                    </button>
                  </div>

                  {/* File Upload Button */}
                  <label className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-dashed border-slate-300 dark:border-white/20 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5 text-[#ff5e14]" />
                    <span>{t('ডিভাইস থেকে ছবি আপলোড করুন', 'Upload Image from Device')}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>

                  {/* Custom Wallpapers List */}
                  {customWallpapers.length > 0 && (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {customWallpapers.map((url, idx) => {
                        const isSelected = bgType === 'custom' && customBgUrl === url;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setCustomBgUrl(url);
                              setBgType('custom');
                            }}
                            className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer group ${
                              isSelected
                                ? 'border-[#ff5e14] bg-orange-500/10 text-orange-600 dark:text-orange-300 font-bold'
                                : 'border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="w-10 h-7 rounded-lg overflow-hidden border border-slate-300 dark:border-white/10 shrink-0">
                              <img src={url} alt="Custom" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold truncate font-mono text-slate-400">{url}</p>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#ff5e14] shrink-0" />}
                            <button
                              onClick={(e) => handleDeleteCustomWallpaper(url, e)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-lg opacity-60 group-hover:opacity-100 transition-opacity"
                              title={t('মুছে ফেলুন', 'Delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DYNAMIC MULTI-PAGE ROUTING BASED ON NAVBAR LINKS */}
        <AnimatePresence mode="wait">
          {/* ========================================================================= */}
          {/* PAGE 1: HOME (স্টার্ট পেজ) */}
          {/* ========================================================================= */}
          {activePage === 'start' && (
            <motion.div
              key="page-home"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* BAHON HERO CAROUSEL BANNER */}
              <div className="relative rounded-3xl overflow-hidden bg-[#0a192f] text-white shadow-2xl border border-slate-800 group">
                {/* Background image overlay with slider transition */}
                <div className="absolute inset-0 z-0">
                  <img
                    key={currentSlide}
                    src={heroSlides[currentSlide].image}
                    alt="Hero Slide Background"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-35 filter brightness-90 transition-all duration-700 scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#071325] via-[#071325]/90 to-transparent" />
                </div>

                {/* Slider Content */}
                <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 md:py-20 max-w-3xl space-y-5">
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
                        setActivePage('apps');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-[#ff5e14] hover:bg-[#ea4d05] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-xl shadow-orange-500/30 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                    >
                      <span>{t('সার্ভিসেস এক্সপ্লোর করুন', 'EXPLORE SERVICES')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setActivePage('productivity');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 font-extrabold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 active:scale-95 backdrop-blur-md"
                    >
                      <span>{t('টুলস স্টেশন দেখুন', 'EXPLORE TOOLS')}</span>
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

              {/* VERTICAL FEATURE TABS ("PORTAL FEATURES / কী কী পাবেন পোর্টালে") */}
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
                        key={activeFeatureTab}
                        src={featureTabs[activeFeatureTab].img}
                        alt={isBn ? featureTabs[activeFeatureTab].titleBn : featureTabs[activeFeatureTab].titleEn}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-all duration-700 scale-105"
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
                          setActivePage('apps');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="bg-[#ff5e14] hover:bg-[#ea4d05] text-white font-black text-xs uppercase px-5 py-3 rounded-xl shadow-lg shadow-orange-500/20 cursor-pointer flex items-center gap-2 transition-all active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>{t('সার্ভিসেস পেজে যান', 'GO TO SERVICES')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* VIBRANT ORANGE STAT COUNTER BANNER */}
              <div className="bg-gradient-to-r from-[#ff5e14] via-[#f97316] to-[#ea4d05] text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden my-4">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
                  <div className="max-w-xl space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                      {t('হাতের কাছে স্মার্ট পোর্টালে স্বাগতম', 'Welcome To HaterKache Smart Portal')}
                    </h2>
                    <p className="text-orange-100 text-xs sm:text-sm font-medium">
                      {t('আপনার সময় ও শ্রম বাঁচাতে আমাদের সকল ফ্রী ডিজিটাল লিঙ্ক ও টুলস ব্যবহার করুন।', 'Save time and efforts using all our free digital links & tools.')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full lg:w-auto">
                    <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                      <p className="text-2xl sm:text-3xl font-black font-mono">
                        {isBn ? `${toBengaliNumerals(hubStats.servicesCount)}+` : `${hubStats.servicesCount}+`}
                      </p>
                      <p className="text-[10px] font-extrabold uppercase mt-1 text-orange-100">{t('ডিজিটাল সেবা', 'Services')}</p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                      <p className="text-2xl sm:text-3xl font-black font-mono">
                        {isBn ? `${toBengaliNumerals(hubStats.categoriesCount)}+` : `${hubStats.categoriesCount}+`}
                      </p>
                      <p className="text-[10px] font-extrabold uppercase mt-1 text-orange-100">{t('ক্যাটাগরি', 'Categories')}</p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                      <p className="text-2xl sm:text-3xl font-black font-mono"> {t('১০০%', '100%')}</p>
                      <p className="text-[10px] font-extrabold uppercase mt-1 text-orange-100">{t('ফ্রি সুবিধা', 'Free Access')}</p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
                      <p className="text-2xl sm:text-3xl font-black font-mono">{t('২৪/৭', '24/7')}</p>
                      <p className="text-[10px] font-extrabold uppercase mt-1 text-orange-100">{t('অনলাইন গাইড', 'Support')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK ACCESS PORTAL CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div 
                  onClick={() => {
                    setActivePage('apps');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-lg hover:border-[#ff5e14] hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-[#ff5e14] group-hover:bg-[#ff5e14] group-hover:text-white transition-all">
                      <Compass className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-[#ff5e14] transition-colors">
                      {t('ডিজিটাল সার্ভিসেস হাব', 'Digital Services Hub')}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t('চাকরি, ভোটার আইডি, পাসপোর্ট, ফটো স্টুডিও, ও সরকারি-বেসরকারি সকল সার্ভিস লিংক।', 'Govt services, job applications, NID, passport, and studio links in one place.')}
                    </p>
                  </div>
                  <div className="pt-4 mt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-[#ff5e14]">
                    <span>{t('সার্ভিসেস পেজ খুলুন', 'Open Services Hub')}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                <div 
                  onClick={() => {
                    setActivePage('productivity');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-lg hover:border-[#ff5e14] hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-[#ff5e14] group-hover:text-white transition-all">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-[#ff5e14] transition-colors">
                      {t('টুলস ও প্রোডাক্টিভিটি স্টেশন', 'Tools & Productivity Station')}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t('পোমোডোরো টাইমার, দ্রুত নোটবুক, আবহাওয়া আপডেট, এআই চ্যাট ও ইউনিট কনভার্টার।', 'Pomodoro focus timer, scratchpad, weather, AI assistant & conversion suite.')}
                    </p>
                  </div>
                  <div className="pt-4 mt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-[#ff5e14]">
                    <span>{t('টুলস পেজ খুলুন', 'Open Tools Suite')}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                <div 
                  onClick={() => {
                    setActivePage('webbuilder');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-lg hover:border-[#ff5e14] hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-[#ff5e14] group-hover:text-white transition-all">
                      <Cpu className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-[#ff5e14] transition-colors">
                      {t('এআই ওয়েব অ্যাপ বিল্ডার', 'AI Web App Builder')}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t('লাইভ কোড স্যান্ডবক্স, প্রিভিউ, রেডিমেড টেমপ্লেট এবং ইনস্ট্যান্ট ওয়েব অ্যাপ তৈরির সুবিধা।', 'Interactive HTML/CSS/JS sandbox, code generator, and templates playground.')}
                    </p>
                  </div>
                  <div className="pt-4 mt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-[#ff5e14]">
                    <span>{t('বিল্ডার পেজ খুলুন', 'Open Web Sandbox')}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>

              {/* USER TESTIMONIALS */}
              <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/80 dark:border-white/10 shadow-xl space-y-6 my-10">
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

              {/* NOTICE BOARD & NEWS */}
              <div className="hidden md:block space-y-4 pb-12">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[#ff5e14] text-xs font-black uppercase tracking-widest">{t('নোটিশ বোর্ড', 'NOTICE BOARD')}</span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      {t('সাম্প্রতিক নোটিশ ও গুরুত্বপূর্ণ খবর', 'Recent Notices & Important Updates')}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {newsArticles.map((art) => (
                    <div 
                      key={art.id} 
                      onClick={() => setSelectedNotice(art)}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-white/10 shadow-lg space-y-3 flex flex-col justify-between hover:border-[#ff5e14] hover:shadow-xl transition-all cursor-pointer group"
                    >
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

                        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug group-hover:text-[#ff5e14] transition-colors">
                          {isBn ? art.titleBn : art.titleEn}
                        </h3>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-[#ff5e14]">
                        <span className="flex items-center gap-1 text-slate-400 text-[11px] group-hover:text-slate-300 transition-colors">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{art.initialComments.length} {t('মন্তব্য', 'Comments')}</span>
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNotice(art);
                          }}
                          className="hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>{t('পড়ুন ও আলোচনা', 'Read More')}</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* PAGE 2: SERVICES & BOOKMARKS (সার্ভিসেস ও বুকমার্ক হাব) */}
          {/* ========================================================================= */}
          {(activePage === 'apps' || activePage === 'services') && (
            <motion.div
              key="page-services"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Services Page Header Banner */}
              <div className="bg-gradient-to-r from-[#0a192f] via-[#0d2244] to-[#0a192f] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left z-10">
                  <div className="inline-flex items-center gap-1.5 bg-[#ff5e14] text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-full">
                    <Compass className="w-3.5 h-3.5" />
                    <span>{t('ডিজিটাল সার্ভিস হাব', 'DIGITAL SERVICES HUB')}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white font-sans">
                    {t('হাতের কাছে সকল প্রয়োজনীয় সেবা ও বুকমার্কস', 'All Digital Services & Bookmarks')}
                  </h1>
                  <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-normal">
                    {t(
                      'সরকারি-বেসরকারি চাকরি আবেদন, এনআইডি, পাসপোর্ট, ফটো স্টুডিও, প্রিন্টিং ও ইউটিলিটি টুলস লিংকসমূহ।',
                      'Government and private jobs, NID, passport, studio tools, and digital bookmarks.'
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3 z-10 shrink-0">
                  <button
                    onClick={() => {
                      setActivePage('start');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{t('হোমে ফিরে যান', 'Back to Home')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setActivePage('productivity');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-[#ff5e14] hover:bg-[#ea4d05] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
                  >
                    <span>{t('টুলস পেজ', 'Tools Suite')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Main App Hub Full View */}
              <div id="app-hub-section">
                <AppHub externalSearchQuery={searchQuery} userId={currentUser?.uid} />
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* PAGE 3: TOOLS & PRODUCTIVITY (টুলস ও প্রোডাক্টিভিটি স্টেশন) */}
          {/* ========================================================================= */}
          {(activePage === 'productivity' || activePage === 'tools' || activePage === 'focus') && (
            <motion.div
              key="page-tools"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Tools Page Header Banner */}
              <div className="bg-gradient-to-r from-[#0a192f] via-[#112240] to-[#0a192f] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left z-10">
                  <div className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase px-3 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t('প্রোডাক্টিভিটি স্টেশন', 'PRODUCTIVITY STATION')}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white font-sans">
                    {t('স্মার্ট প্রোডাক্টিভিটি ও অনলাইন ইউটিলিটি টুলস', 'Smart Productivity & Utility Suite')}
                  </h1>
                  <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-normal">
                    {t(
                      'পোমোডোরো ফোকাস ট্র্যাকার, কুইক স্ক্র্যাচপ্যাড, লাইভ আবহাওয়া রিপোর্ট, এআই চ্যাট ও মাল্টি-ইউনিট কনভার্টার।',
                      'Pomodoro timer, quick scratchpad, weather forecast, AI assistant, and unit converter suite.'
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3 z-10 shrink-0">
                  <button
                    onClick={() => {
                      setActivePage('start');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{t('হোমে ফিরে যান', 'Back to Home')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setActivePage('apps');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-[#ff5e14] hover:bg-[#ea4d05] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
                  >
                    <span>{t('সার্ভিসেস পেজ', 'Services')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Grid for Productivity, Scratchpad, Weather */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div id="productivity-section" className="lg:col-span-8 scroll-mt-20">
                  <ProductivityStation userId={currentUser?.uid} />
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                  <WeatherWidget />
                  <Scratchpad className="flex-1" userId={currentUser?.uid} />
                </div>
              </div>

              {/* AI Chat Bar & Converters Widget */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div id="ai-chat-section" className="lg:col-span-6 scroll-mt-20">
                  <AIChatBar />
                </div>
                <div id="converters" className="lg:col-span-6 scroll-mt-20">
                  <Converters />
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* PAGE 4: BUILDER (এআই কোড বিল্ডার ও স্যান্ডবক্স) */}
          {/* ========================================================================= */}
          {(activePage === 'webbuilder' || activePage === 'builder') && (
            <motion.div
              key="page-builder"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Builder Page Header Banner */}
              <div className="bg-gradient-to-r from-[#0a192f] via-[#1a1438] to-[#0a192f] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left z-10">
                  <div className="inline-flex items-center gap-1.5 bg-purple-600 text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-full">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>{t('এআই স্যান্ডবক্স বিল্ডার', 'AI WEB SANDBOX')}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white font-sans">
                    {t('এআই কোড স্যান্ডবক্স ও ইনস্ট্যান্ট ওয়েব অ্যাপ বিল্ডার', 'AI Code Sandbox & Web App Builder')}
                  </h1>
                  <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-normal">
                    {t(
                      'লাইভ কোড এডিটর, রিয়েলটাইম প্রিভিউ, রেডিমেড টেমপ্লেট গ্যালারি এবং প্রম্পট ভিত্তিক কোড বিল্ডার।',
                      'Interactive HTML/CSS/JS sandbox, instant live runner, and AI coding workspace.'
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3 z-10 shrink-0">
                  <button
                    onClick={() => {
                      setActivePage('start');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{t('হোমে ফিরে যান', 'Back to Home')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setActivePage('productivity');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-[#ff5e14] hover:bg-[#ea4d05] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-orange-500/20"
                  >
                    <span>{t('টুলস দেখুন', 'Tools')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Web Sandbox App Builder Full View */}
              <div id="web-builder-section">
                <WebBuilder />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* SECTION 8: NEW POLISHED FOOTER MATCHING SCREENSHOT DESIGN WITH HATERKACHE INFO */}
      <footer id="contact" className="w-full bg-[#151414] text-slate-300 pt-12 pb-24 sm:pb-8 relative z-10 font-sans border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Row: Find us, Call us, Mail us with orange icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-[#2e2e2e]">
            
            {/* Find Us */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#ff5e14]/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-[#ff5e14]" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base tracking-wide">
                  {t('আমাদের ঠিকানা', 'Find us')}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t('ঢাকা, বাংলাদেশ - ১২০০', 'Dhaka, Bangladesh - 1200')}
                </p>
              </div>
            </div>

            {/* Call Us */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#ff5e14]/10 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-[#ff5e14]" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base tracking-wide">
                  {t('কল করুন', 'Call us')}
                </h4>
                <a href="tel:+8801619184281" className="text-xs text-slate-400 hover:text-[#ff5e14] transition-colors mt-0.5 font-mono block">
                  +880 1619-184281
                </a>
              </div>
            </div>

            {/* Mail Us */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#ff5e14]/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-[#ff5e14]" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base tracking-wide">
                  {t('মেইল করুন', 'Mail us')}
                </h4>
                <a href="mailto:info@haterkache.com" className="text-xs text-slate-400 hover:text-[#ff5e14] transition-colors mt-0.5 block">
                  info@haterkache.com
                </a>
              </div>
            </div>

          </div>

          {/* Middle Main Content: 3 Columns (Logo & About, Useful Links, Subscribe) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 py-12">
            
            {/* Column 1: Branding, Description, and Social Media (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Logo / Brand Header */}
              <div className="flex items-center gap-3">
                <img
                  src={logoImg}
                  alt="HaterKache Logo"
                  className="w-10 h-10 rounded-xl object-cover shadow-md border border-white/10"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-black text-white tracking-tight">HATER</span>
                    <span className="text-xl font-black text-[#ff5e14] tracking-tight">KACHE</span>
                  </div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    {t('স্মার্ট সার্ভিস ও স্টুডিও পোর্টাল', 'SMART PORTAL & STUDIO')}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed pr-4">
                {t(
                  'হাতের কাছে পোর্টাল — আপনার সকল সরকারি সেবা, শিক্ষা, চাকরি আবেদন, অনলাইন ইউটিলিটি এবং প্রফেশনাল ফটো স্টুডিও টুলস এক জায়গায় সমন্বিত প্ল্যাটফর্ম।',
                  'HaterKache Smart Portal — all your essential government web services, online jobs, practical digital utilities, and photo studio tools in one unified platform.'
                )}
              </p>

              {/* Follow Us */}
              <div className="space-y-3 pt-1">
                <h5 className="text-white font-bold text-sm tracking-wide">
                  {t('আমাদের সাথে যুক্ত থাকুন', 'Follow us')}
                </h5>
                <div className="flex items-center gap-3">
                  {/* Facebook */}
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full bg-[#3b5998] hover:scale-110 text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                    title="Facebook"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>

                  {/* Twitter / X */}
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full bg-[#1da1f2] hover:scale-110 text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                    title="Twitter"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/>
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:scale-110 text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
                    title="Instagram"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Useful Links 2-column layout (4 cols on lg) */}
            <div className="lg:col-span-4 space-y-4">
              <div>
                <h4 className="text-white font-bold text-base tracking-wide">
                  {t('প্রয়োজনীয় লিংক', 'Useful Links')}
                </h4>
                <div className="w-12 h-0.5 bg-[#ff5e14] mt-2 mb-4"></div>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs text-slate-400">
                <button 
                  onClick={() => { setActivePage('apps'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#ff5e14] transition-colors flex items-center gap-1.5 truncate text-left cursor-pointer"
                >
                  <span className="text-[#ff5e14] shrink-0">›</span> {t('NID ও স্মার্ট কার্ড পোর্টাল', 'NID & Smart Card')}
                </button>
                <button 
                  onClick={() => { setActivePage('apps'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#ff5e14] transition-colors flex items-center gap-1.5 truncate text-left cursor-pointer"
                >
                  <span className="text-[#ff5e14] shrink-0">›</span> {t('অনলাইন ফটো স্টুডিও', 'Photo Studio Maker')}
                </button>
                <button 
                  onClick={() => { setActivePage('apps'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#ff5e14] transition-colors flex items-center gap-1.5 truncate text-left cursor-pointer"
                >
                  <span className="text-[#ff5e14] shrink-0">›</span> {t('ই-পাসপোর্ট সেবা পোর্টাল', 'e-Passport Portal')}
                </button>
                <button 
                  onClick={() => { setActivePage('apps'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#ff5e14] transition-colors flex items-center gap-1.5 truncate text-left cursor-pointer"
                >
                  <span className="text-[#ff5e14] shrink-0">›</span> {t('NID প্রিন্ট রেডি টুল', 'NID Print Ready')}
                </button>
                <button 
                  onClick={() => { setActivePage('apps'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#ff5e14] transition-colors flex items-center gap-1.5 truncate text-left cursor-pointer"
                >
                  <span className="text-[#ff5e14] shrink-0">›</span> {t('টেলিটক জবস অটোফিল', 'Teletalk Jobs AutoFill')}
                </button>
                <button 
                  onClick={() => { setActivePage('productivity'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#ff5e14] transition-colors flex items-center gap-1.5 truncate text-left cursor-pointer"
                >
                  <span className="text-[#ff5e14] shrink-0">›</span> {t('টাস্ক ও পোমোডোরো ট্র্যাকার', 'Task & Pomodoro Tracker')}
                </button>
                <button 
                  onClick={() => { setActivePage('apps'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#ff5e14] transition-colors flex items-center gap-1.5 truncate text-left cursor-pointer"
                >
                  <span className="text-[#ff5e14] shrink-0">›</span> {t('হোয়াটসঅ্যাপ ডিরেক্ট মেসেজ', 'WhatsApp Direct Send')}
                </button>
                <button 
                  onClick={() => { setActivePage('webbuilder'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#ff5e14] transition-colors flex items-center gap-1.5 truncate text-left cursor-pointer"
                >
                  <span className="text-[#ff5e14] shrink-0">›</span> {t('এআই স্যান্ডবক্স বিল্ডার', 'AI Sandbox Builder')}
                </button>
                <button 
                  onClick={() => { setActivePage('productivity'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#ff5e14] transition-colors flex items-center gap-1.5 truncate text-left cursor-pointer"
                >
                  <span className="text-[#ff5e14] shrink-0">›</span> {t('কুইক স্ক্র্যাচপ্যাড ও নোট', 'Quick Scratchpad & Notes')}
                </button>
                <button 
                  onClick={() => { setActivePage('productivity'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-[#ff5e14] transition-colors flex items-center gap-1.5 truncate text-left cursor-pointer"
                >
                  <span className="text-[#ff5e14] shrink-0">›</span> {t('মাল্টি ইউনিট কনভার্টার', 'Multi-Unit Converter')}
                </button>
              </div>
            </div>

            {/* Column 3: Subscribe Form with Orange Action Button (3 cols on lg) */}
            <div className="lg:col-span-3 space-y-4">
              <div>
                <h4 className="text-white font-bold text-base tracking-wide">
                 <span>{t("For Any Changes", "FOR ANY CHANGES")}</span>
                </h4>
                <div className="w-12 h-0.5 bg-[#ff5e14] mt-2 mb-4"></div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {t(
                  "Feel free to send me an email",
                  "FEEL FREE TO SEND ME AN EMAIL",
                )}
              </p>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();

                  alert( t(
                        "ধন্যবাদ! আপনার ইমেইল যুক্ত করা হয়েছে।",
                        " Thank you",
                      ),)
                }}
                className="flex items-center rounded-lg overflow-hidden bg-[#2e2e2e] border border-[#3e3e3e] focus-within:border-[#ff5e14] transition-colors shadow-inner"
              >
                <input
                  type="email"
                  required
                  placeholder={t('আপনার ইমেইল অ্যাড্রেস...', 'Email Address')}
                  className="w-full bg-transparent px-3.5 py-3 text-xs text-white placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#ff5e14] hover:bg-[#ea4d05] active:scale-95 text-white px-4 py-3 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-md"
                  title="Subscribe"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-6 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <p>
              Copyright © 2026, All Right Reserved <span className="text-[#ff5e14] font-semibold">HaterKache Smart</span>
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <a href="#hero" className="hover:text-white transition-colors">{t('হোম', 'Home')}</a>
              <a href="#privacy" className="hover:text-white transition-colors">{t('শর্তাবলী', 'Terms')}</a>
              <a href="#privacy" className="hover:text-white transition-colors">{t('প্রাইভেসি', 'Privacy')}</a>
              <a href="#privacy" className="hover:text-white transition-colors">{t('পলিসি', 'Policy')}</a>
              <a href="#contact" className="hover:text-white transition-colors">{t('যোগাযোগ', 'Contact')}</a>
            </div>
          </div>

        </div>
      </footer>

      {/* ANDROID NATIVE MOBILE BOTTOM NAVIGATION BAR */}
      <nav 
        id="android-bottom-navigation"
        aria-label="Android Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#071325]/95 dark:bg-[#071325]/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-4px_24px_rgba(0,0,0,0.5)] px-2 pt-2 pb-[max(env(safe-area-inset-bottom,0px),0.625rem)] transition-all"
      >
        <div className="max-w-md mx-auto grid grid-cols-4 items-center justify-around gap-1">
          {/* Tab 1: Home */}
          <button
            id="mobile-nav-home"
            onClick={() => {
              setActivePage('start');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer select-none active:scale-95 ${
              activePage === 'start'
                ? 'text-[#ff5e14] font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`relative p-1 rounded-xl transition-all ${
              activePage === 'start' ? 'bg-[#ff5e14]/15 shadow-sm' : ''
            }`}>
              <Home className={`w-5 h-5 ${activePage === 'start' ? 'text-[#ff5e14] scale-110' : ''}`} />
              {activePage === 'start' && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#ff5e14] rounded-full" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 truncate font-bold">
              {t('হোম', 'Home')}
            </span>
          </button>

          {/* Tab 2: Services / AppHub */}
          <button
            id="mobile-nav-services"
            onClick={() => {
              setActivePage('apps');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer select-none active:scale-95 ${
              activePage === 'apps'
                ? 'text-[#ff5e14] font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`relative p-1 rounded-xl transition-all ${
              activePage === 'apps' ? 'bg-[#ff5e14]/15 shadow-sm' : ''
            }`}>
              <Layers className={`w-5 h-5 ${activePage === 'apps' ? 'text-[#ff5e14] scale-110' : ''}`} />
              {activePage === 'apps' && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#ff5e14] rounded-full" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 truncate font-bold">
              {t('সার্ভিসেস', 'Services')}
            </span>
          </button>

          {/* Tab 3: Tools / Productivity */}
          <button
            id="mobile-nav-tools"
            onClick={() => {
              setActivePage('productivity');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer select-none active:scale-95 ${
              activePage === 'productivity'
                ? 'text-[#ff5e14] font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`relative p-1 rounded-xl transition-all ${
              activePage === 'productivity' ? 'bg-[#ff5e14]/15 shadow-sm' : ''
            }`}>
              <Zap className={`w-5 h-5 ${activePage === 'productivity' ? 'text-[#ff5e14] scale-110' : ''}`} />
              {activePage === 'productivity' && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#ff5e14] rounded-full" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 truncate font-bold">
              {t('টুলস', 'Tools')}
            </span>
          </button>

          {/* Tab 4: Builder */}
          <button
            id="mobile-nav-builder"
            onClick={() => {
              setActivePage('webbuilder');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all cursor-pointer select-none active:scale-95 ${
              activePage === 'webbuilder'
                ? 'text-[#ff5e14] font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`relative p-1 rounded-xl transition-all ${
              activePage === 'webbuilder' ? 'bg-[#ff5e14]/15 shadow-sm' : ''
            }`}>
              <Code2 className={`w-5 h-5 ${activePage === 'webbuilder' ? 'text-[#ff5e14] scale-110' : ''}`} />
              {activePage === 'webbuilder' && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#ff5e14] rounded-full" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 truncate font-bold">
              {t('বিল্ডার', 'Builder')}
            </span>
          </button>
        </div>
      </nav>

      {/* SECTION 9: NOTICE DETAIL & COMMUNITY COMMENTS MODAL */}
      <NoticeDetailModal
        article={selectedNotice}
        isOpen={Boolean(selectedNotice)}
        onClose={() => setSelectedNotice(null)}
        isBn={isBn}
      />

    </div>
  );
}

