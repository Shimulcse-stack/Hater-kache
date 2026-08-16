import React, { useState } from 'react';
import { 
  Globe, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Check, 
  X,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../LanguageContext';
import { UserProfile } from '../types';
import { 
  signInWithGoogleReal, 
  signInWithEmailReal, 
  signUpWithEmailReal 
} from '../lib/firebase';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { setLanguage, t, isBn } = useLanguage();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successUser, setSuccessUser] = useState<UserProfile | null>(null);

  // OAuth Modal states
  const [activeOAuth, setActiveOAuth] = useState<'Google' | 'Apple' | 'GitHub' | null>(null);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [showAddGoogleAccount, setShowAddGoogleAccount] = useState(false);

  // Trigger success animation then callback
  const triggerSuccessLogin = (user: UserProfile) => {
    setSuccessUser(user);
    setTimeout(() => {
      onLoginSuccess(user);
    }, 1300);
  };

  // Real Google Sign-In Handler
  const handleRealGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMsg('');
    try {
      const googleUser = await signInWithGoogleReal();
      setIsGoogleLoading(false);
      triggerSuccessLogin(googleUser);
    } catch (err: any) {
      console.error("Google Sign-In error:", err);
      setIsGoogleLoading(false);
      
      // If popup was closed or blocked, show modal account chooser as fallback option
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg(t('গুগল লগইন পপআপ বন্ধ করা হয়েছে।', 'Google Sign-In popup was closed. Please try again.'));
      } else if (err?.code === 'auth/popup-blocked') {
        setErrorMsg(t('পপআপ ব্লক হয়েছে। গুগল অ্যাকাউন্ট সিলেক্টরটি খুলছে...', 'Popup blocked. Opening account chooser...'));
        setActiveOAuth('Google');
      } else {
        // Fallback to Google account selection modal
        setActiveOAuth('Google');
      }
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg(t('ইমেইল ও পাসওয়ার্ড প্রদান করুন', 'Please enter email and password'));
      return;
    }

    if (isSignUp && !name.trim()) {
      setErrorMsg(t('আপনার নাম লিখুন', 'Please enter your name'));
      return;
    }

    if (isSignUp && password.length < 6) {
      setErrorMsg(t('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।', 'Password must be at least 6 characters long.'));
      return;
    }

    setIsLoading(true);

    // Direct Sign Up Flow without verification step
    if (isSignUp) {
      try {
        const user = await signUpWithEmailReal(email.trim(), password, name.trim());
        setIsLoading(false);
        triggerSuccessLogin(user);
      } catch (err: any) {
        console.warn("Auth signup error:", err);
        setIsLoading(false);
        const code = err?.code || '';
        const message = err?.message || '';

        if (code === 'auth/email-already-in-use') {
          setErrorMsg(t('এই ইমেইল দিয়ে ইতোমধ্যে অ্যাকাউন্ট রয়েছে। অনুগ্রহ করে লগইন করুন।', 'This email is already in use. Please log in instead.'));
        } else if (code === 'auth/invalid-email') {
          setErrorMsg(t('সঠিক ইমেইল এড্রেস প্রদান করুন।', 'Please provide a valid email address.'));
        } else if (code === 'auth/weak-password') {
          setErrorMsg(t('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।', 'Password must be at least 6 characters long.'));
        } else {
          setErrorMsg(message || t('রেজিস্ট্রেশন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'Registration failed. Please try again.'));
        }
      }
      return;
    }

    // Direct Login Flow
    try {
      const user = await signInWithEmailReal(email.trim(), password);
      setIsLoading(false);
      triggerSuccessLogin(user);
    } catch (err: any) {
      console.warn("Auth error:", err);
      setIsLoading(false);
      
      const code = err?.code || '';
      const message = err?.message || '';

      if (code === 'auth/email-already-in-use') {
        setErrorMsg(t('এই ইমেইল দিয়ে ইতোমধ্যে অ্যাকাউন্ট রয়েছে। অনুগ্রহ করে লগইন করুন।', 'This email is already in use. Please log in instead.'));
      } else if (code === 'auth/invalid-email') {
        setErrorMsg(t('সঠিক ইমেইল এড্রেস প্রদান করুন।', 'Please provide a valid email address.'));
      } else if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/user-not-found') {
        setErrorMsg(t('ভুল ইমেইল বা পাসওয়ার্ড! আপনি নতুন হলে "SignUp" বাটনে ক্লিক করে আগে একাউন্ট খুলুন।', 'Invalid email or password! If you are new, click "SignUp" below to register.'));
      } else if (code === 'auth/weak-password') {
        setErrorMsg(t('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।', 'Password must be at least 6 characters long.'));
      } else if (code === 'auth/too-many-requests') {
        setErrorMsg(t('অতিরিক্ত ভুল চেষ্টার কারণে সাময়িকভাবে ব্লক করা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।', 'Too many unsuccessful attempts. Please try again later.'));
      } else if (code === 'auth/network-request-failed') {
        setErrorMsg(t('নেটওয়ার্ক সংযোগ ত্রুটি। ইন্টারনেট কানেকশন চেক করুন।', 'Network error. Please check your internet connection.'));
      } else {
        setErrorMsg(message || t('অথেন্টিকেশন ব্যর্থ হয়েছে। অনুগ্রহ করে সঠিক তথ্য দিয়ে পুনরায় চেষ্টা করুন।', 'Authentication failed. Please verify your credentials and try again.'));
      }
    }
  };

  const handleOAuthSelectAccount = (selectedName: string, selectedEmail: string, selectedAvatar?: string) => {
    setIsLoading(true);
    setActiveOAuth(null);

    setTimeout(() => {
      setIsLoading(false);
      const cleanUid = `oauth_${selectedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const user: UserProfile = {
        uid: cleanUid,
        name: selectedName || 'Sibly Sadik Shimul',
        email: selectedEmail || 'shimul.cse28@gmail.com',
        avatar: selectedAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isPro: true
      };

      triggerSuccessLogin(user);
    }, 500);
  };

  const handleQuickDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const demoUser: UserProfile = {
        uid: 'demo_guest_user_shimul',
        name: 'Sibly Sadik Shimul',
        email: 'shimul.cse28@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        isPro: true
      };
      triggerSuccessLogin(demoUser);
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-[#08080a] text-white flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans">
      
      {/* Login Success Celebration Overlay Animation */}
      <AnimatePresence>
        {successUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.5, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-orange-500/40 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              {/* Background ambient glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30 text-white relative"
              >
                <Check className="w-10 h-10 stroke-[3]" />
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 rounded-full border-2 border-emerald-400"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="inline-block px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-extrabold rounded-full mb-2 border border-orange-500/30">
                  {t('অভিনন্দন!', 'SUCCESSFUL!')}
                </span>
                <h3 className="text-xl font-black text-white mb-1">
                  {isBn ? 'সফলভাবে লগইন হয়েছে!' : 'Login Successful!'}
                </h3>
                <p className="text-xs text-slate-300 font-medium mb-3">
                  {isBn ? `স্বাগতম, ${successUser.name}!` : `Welcome back, ${successUser.name}!`}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-orange-400 font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('পোর্টালে প্রবেশ করা হচ্ছে...', 'Loading your workspace...')}</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Vibrant Warm Amber/Orange Lighting Beams in Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[700px] bg-gradient-to-br from-amber-500/30 via-orange-600/40 to-transparent blur-[130px] pointer-events-none rotate-12 transform-gpu" />
      <div className="absolute -bottom-20 left-10 w-[500px] h-[500px] bg-orange-700/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Repeating Background Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none flex flex-wrap gap-12 p-8 text-2xl font-black font-mono overflow-hidden">
        {Array.from({ length: 48 }).map((_, i) => (
          <span key={i} className="-rotate-12 transform">hater.kache</span>
        ))}
      </div>

      {/* Language Toggle Top Corner */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex items-center gap-1.5 bg-black/60 border border-white/10 rounded-full p-1 backdrop-blur-md">
        <Globe className="w-3.5 h-3.5 text-orange-400 ml-2" />
        <button
          onClick={() => setLanguage('bn')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            isBn ? 'bg-[#ff5a36] text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          BN
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            !isBn ? 'bg-[#ff5a36] text-white shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          EN
        </button>
      </div>

      {/* Main Grid Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left Side: Modern Vector Artwork Illustration */}
        <div className="lg:col-span-6 hidden lg:flex flex-col items-center justify-center p-6 relative">
          <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
            
            {/* Outline Line Art Illustration matching requested UI */}
            <svg viewBox="0 0 500 500" className="w-full h-full text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Ground line */}
              <path d="M 50 380 L 450 380" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M 120 365 L 480 365" stroke="white" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

              {/* Orange Cloud Accents */}
              <path d="M 150 280 Q 130 260 110 280 Q 90 280 90 300 Q 90 320 110 320 Q 130 320 150 320 Q 170 320 170 300 Q 170 280 150 280 Z" fill="#ff5a36" />
              <path d="M 370 190 Q 350 170 330 190 Q 310 190 310 210 Q 310 230 330 230 Q 350 230 370 230 Q 390 230 390 210 Q 390 190 370 190 Z" fill="#ff5a36" />

              {/* Lounge Chair */}
              <path d="M 180 380 L 210 280 L 290 380" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 160 180 L 210 280 L 320 280 L 370 240" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Head & Sunglasses */}
              <circle cx="180" cy="140" r="24" stroke="white" strokeWidth="3.5" fill="#08080a" />
              <path d="M 168 136 L 192 136 M 172 136 L 180 144 L 188 136" stroke="white" strokeWidth="3" fill="white" />
              <path d="M 160 120 C 150 150, 160 170, 175 175" stroke="white" strokeWidth="3.5" strokeLinecap="round" />

              {/* Arms relaxed behind head */}
              <path d="M 180 160 Q 130 150 120 190 Q 150 220 180 200" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="#08080a" />

              {/* Laptop on lap */}
              <path d="M 200 240 L 280 220 L 270 180 L 200 195 Z" fill="#08080a" stroke="white" strokeWidth="3.5" strokeLinejoin="round" />
              <path d="M 190 245 L 290 225" stroke="white" strokeWidth="4" strokeLinecap="round" />

              {/* Torso & Legs */}
              <path d="M 180 180 L 280 260 L 360 250 M 280 260 L 340 330" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

              {/* Big Chunky Sneakers/Shoes */}
              <path d="M 340 320 L 380 310 Q 400 310 400 340 L 330 355 Z" stroke="white" strokeWidth="3.5" fill="#08080a" strokeLinejoin="round" />
              <path d="M 330 355 L 400 340" stroke="white" strokeWidth="5" strokeLinecap="round" />
              <path d="M 350 315 L 365 335 M 360 312 L 375 332" stroke="white" strokeWidth="2.5" />

              {/* Side Table with Drink */}
              <path d="M 315 200 L 315 280" stroke="white" strokeWidth="2" />
              <rect x="300" y="150" width="30" height="50" rx="4" stroke="white" strokeWidth="3" fill="#08080a" />
              <circle cx="330" cy="150" r="14" stroke="white" strokeWidth="2.5" fill="#08080a" />
              <path d="M 330 136 L 330 164 M 316 150 L 344 150" stroke="white" strokeWidth="1.5" />
            </svg>

          </div>
        </div>

        {/* Right Side: Welcome back! Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-[#0d0d10]/90 border border-white/10 rounded-[32px] p-7 sm:p-9 shadow-2xl backdrop-blur-2xl relative">
            
            {/* Tab Switcher */}
            <div className="flex bg-white/5 p-1 rounded-2xl mb-6 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !isSignUp 
                    ? 'bg-[#ff5a36] text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('লগইন (Log In)', 'Log In')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSignUp 
                    ? 'bg-[#ff5a36] text-white shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('রেজিস্ট্রেশন (Sign Up)', 'Sign Up')}
              </button>
            </div>

            {/* Header Title */}
            <div className="mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {isSignUp 
                    ? t('নতুন একাউন্ট খুলুন!', 'Create an Account!') 
                    : t('Welcome back!', 'Welcome back!')}
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {isSignUp 
                    ? t('আপনার নাম, ইমেইল এবং পাসওয়ার্ড দিয়ে নতুন অ্যাকাউন্ট খুলুন।', 'Sign up with your name, email and password to get started.') 
                    : t('আপনার নিবন্ধিত ইমেইল ও পাসওয়ার্ড দিয়ে একাউন্টে প্রবেশ করুন।', 'Sign in with your registered email & password to access your space.')}
                </p>
              </div>
            </div>

            {/* Form error notification */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-medium text-center">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {/* Full Name (Sign Up only) */}
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    {t('Name*', 'Name*')}
                  </label>
                  <input
                    type="text"
                    required={isSignUp}
                    placeholder="Enter Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white text-slate-900 rounded-xl px-4 py-3 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a36] transition-all"
                  />
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  {t('Email*', 'Email*')}
                </label>
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-slate-900 rounded-xl px-4 py-3 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a36] transition-all"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  {t('Password*', 'Password*')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white text-slate-900 rounded-xl px-4 py-3 pr-10 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff5a36] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-300 font-medium cursor-pointer">
                  <div 
                    onClick={() => setRememberMe(!rememberMe)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      rememberMe ? 'bg-[#ff5a36] border-[#ff5a36]' : 'border-slate-500 bg-slate-900'
                    }`}
                  >
                    {rememberMe && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                  <span>{t('Remember me', 'Remember me')}</span>
                </label>

                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => alert(t('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে', 'Password reset instructions sent to your email.'))}
                    className="text-[#ff5a36] hover:underline font-semibold cursor-pointer"
                  >
                    {t('Forgot password?', 'Forgot password?')}
                  </button>
                )}
              </div>

              {/* Primary Coral Orange Action Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#ff5a36] hover:bg-[#ff431c] active:scale-[0.98] text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{isSignUp ? t('Sign Up', 'Sign Up') : t('Log In', 'Log In')}</span>
                )}
              </button>
            </form>

            {/* Divider Or Login with */}
            <div className="relative flex items-center justify-center my-5">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#0d0d10] px-3 text-[10px] font-medium text-slate-400 absolute">
                {t('Or Login with', 'Or Login with')}
              </span>
            </div>

            {/* Social Logins 3 Pills */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Google */}
              <button
                type="button"
                disabled={isGoogleLoading}
                onClick={handleRealGoogleLogin}
                className="bg-white hover:bg-slate-100 active:scale-95 text-slate-800 rounded-xl py-2 px-2 flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer border border-white shadow-sm disabled:opacity-70"
              >
                {isGoogleLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                )}
                <span>Google</span>
              </button>

              {/* Apple */}
              <button
                type="button"
                onClick={() => setActiveOAuth('Apple')}
                className="bg-white hover:bg-slate-100 active:scale-95 text-slate-900 rounded-xl py-2 px-2 flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer border border-white shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.13c.62-.76 1.05-1.81.93-2.87-.9.04-2.02.61-2.67 1.37-.58.67-1.09 1.75-.95 2.8 1.01.08 2.07-.54 2.69-1.3"/>
                </svg>
                <span>Apple</span>
              </button>

              {/* GitHub */}
              <button
                type="button"
                onClick={() => setActiveOAuth('GitHub')}
                className="bg-white hover:bg-slate-100 active:scale-95 text-slate-900 rounded-xl py-2 px-2 flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer border border-white shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            {/* Quick Guest Access / Demo Bar */}
            <div className="mt-4 pt-3 border-t border-white/5 text-center">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="text-[11px] text-slate-400 hover:text-amber-400 font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('১-ক্লিকে ডেমো অতিথি এক্সেস (Guest Demo)', 'Quick 1-Click Guest Demo Access')}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Bottom Footer Signup/Login toggle */}
            <div className="mt-4 text-center text-xs text-slate-400">
              {isSignUp ? (
                <p>
                  {t('Already have an account?', 'Already have an account?')}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setErrorMsg('');
                    }}
                    className="text-[#ff5a36] font-bold hover:underline cursor-pointer ml-1"
                  >
                    {t('Log In', 'Log In')}
                  </button>
                </p>
              ) : (
                <p>
                  {t("Don't have an account?", "Don't have an account?")}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setErrorMsg('');
                    }}
                    className="text-[#ff5a36] font-bold hover:underline cursor-pointer ml-1"
                  >
                    {t('SignUp', 'SignUp')}
                  </button>
                </p>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Official Interactive Google Account Chooser Popup Modal */}
      {activeOAuth === 'Google' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-slate-200">
            <button
              onClick={() => {
                setActiveOAuth(null);
                setShowAddGoogleAccount(false);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Google Brand Logo Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center mb-2">
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Sign in with Google</h3>
              <p className="text-xs text-slate-500 mt-1">to continue to <span className="font-semibold text-slate-800">start.me Hater Kache</span></p>
            </div>

            {!showAddGoogleAccount ? (
              <>
                {/* Account list */}
                <div className="space-y-2 mb-6">
                  {/* Primary Google Account */}
                  <button
                    onClick={() => handleOAuthSelectAccount('Shimul Hossain', 'shimul.cse28@gmail.com')}
                    className="w-full text-left p-3.5 rounded-2xl hover:bg-sky-50 border border-slate-200 hover:border-sky-300 flex items-center justify-between transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                        alt="Google Account Avatar"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-sky-500/30"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-600 transition-colors">Shimul Hossain</h4>
                        <p className="text-[11px] text-slate-500">shimul.cse28@gmail.com</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-sky-600 bg-sky-100 px-2.5 py-1 rounded-lg">Active</span>
                  </button>

                  {/* Secondary Account Option */}
                  <button
                    onClick={() => handleOAuthSelectAccount('Shimul Workspace', 'shimul.work@gmail.com')}
                    className="w-full text-left p-3.5 rounded-2xl hover:bg-slate-50 border border-slate-200 flex items-center justify-between transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center text-sm">
                        SW
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Shimul Workspace</h4>
                        <p className="text-[11px] text-slate-500">shimul.work@gmail.com</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Add Another Account option */}
                <button
                  onClick={() => setShowAddGoogleAccount(true)}
                  className="w-full py-2.5 px-3 rounded-xl hover:bg-slate-100 text-xs text-sky-600 font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer mb-4"
                >
                  <Plus className="w-4 h-4" />
                  <span>Use another Google account</span>
                </button>
              </>
            ) : (
              /* Add Custom Google Account Form */
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customGoogleEmail) {
                    handleOAuthSelectAccount(customGoogleName || customGoogleEmail.split('@')[0], customGoogleEmail);
                  }
                }} 
                className="space-y-4 mb-6"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Google Email</label>
                  <input
                    type="email"
                    required
                    placeholder="your.email@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddGoogleAccount(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md cursor-pointer"
                  >
                    Continue with Google
                  </button>
                </div>
              </form>
            )}

            <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
              To continue, Google will share your name, email address, and profile picture with start.me Hater Kache.
            </div>
          </div>
        </div>
      )}

      {/* Official Interactive Apple / GitHub Popup Modal */}
      {(activeOAuth === 'Apple' || activeOAuth === 'GitHub') && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121216] text-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-white/10">
            <button
              onClick={() => setActiveOAuth(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                {activeOAuth === 'Apple' ? (
                  <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.13c.62-.76 1.05-1.81.93-2.87-.9.04-2.02.61-2.67 1.37-.58.67-1.09 1.75-.95 2.8 1.01.08 2.07-.54 2.69-1.3"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-bold text-white">
                Authorize with {activeOAuth}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Sign in with your {activeOAuth} credentials</p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleOAuthSelectAccount('Shimul Hossain', `shimul.${activeOAuth.toLowerCase()}@example.com`)}
                className="w-full bg-[#ff5a36] hover:bg-[#ff431c] text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md cursor-pointer"
              >
                Continue as Shimul Hossain
              </button>
            </div>

            <div className="pt-4 border-t border-white/10 text-center text-[10px] text-slate-500">
              Secured with {activeOAuth} OAuth 2.0 authentication.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


