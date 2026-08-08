import React, { useState } from 'react';
import { Search, Globe, ArrowRightLeft, Cpu } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { dispatchAppNotification } from '../utils/notificationSystem';

export interface CurrencyOption {
  code: string;
  nameEn: string;
  nameBn: string;
  symbol: string;
  ratePerUSD: number; // rate relative to 1 USD
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'USD', nameEn: 'US Dollar', nameBn: 'মার্কিন ডলার', symbol: '$', ratePerUSD: 1.0 },
  { code: 'BDT', nameEn: 'Bangladeshi Taka', nameBn: 'বাংলাদেশী টাকা', symbol: '৳', ratePerUSD: 118.45 },
  { code: 'EUR', nameEn: 'Euro', nameBn: 'ইউরো', symbol: '€', ratePerUSD: 0.92 },
  { code: 'GBP', nameEn: 'British Pound', nameBn: 'ব্রিটিশ পাউন্ড', symbol: '£', ratePerUSD: 0.79 },
  { code: 'INR', nameEn: 'Indian Rupee', nameBn: 'ভারতীয় রুপি', symbol: '₹', ratePerUSD: 83.85 },
  { code: 'SAR', nameEn: 'Saudi Riyal', nameBn: 'সৌদি রিয়াল', symbol: '﷼', ratePerUSD: 3.75 },
  { code: 'AED', nameEn: 'UAE Dirham', nameBn: 'ইউএই দেরহাম', symbol: 'د.إ', ratePerUSD: 3.67 },
  { code: 'CAD', nameEn: 'Canadian Dollar', nameBn: 'কানাডিয়ান ডলার', symbol: 'CA$', ratePerUSD: 1.37 },
  { code: 'AUD', nameEn: 'Australian Dollar', nameBn: 'অস্ট্রেলিয়ান ডলার', symbol: 'A$', ratePerUSD: 1.52 },
  { code: 'SGD', nameEn: 'Singapore Dollar', nameBn: 'সিঙ্গাপুর ডলার', symbol: 'S$', ratePerUSD: 1.34 },
  { code: 'MYR', nameEn: 'Malaysian Ringgit', nameBn: 'মালয়েশিয়ান রিঙ্গিত', symbol: 'RM', ratePerUSD: 4.45 },
];

export default function Converters() {
  const { t, isBn } = useLanguage();
  const [activeTab, setActiveTab] = useState<'currency' | 'unit'>('currency');
  const [searchQuery, setSearchQuery] = useState('');

  // Currency Converter states
  const [fromCode, setFromCode] = useState<string>('USD');
  const [toCode, setToCode] = useState<string>('BDT');
  const [fromVal, setFromVal] = useState<string>('1');
  const [toVal, setToVal] = useState<string>('118.45');

  // Unit Converter states
  const [pxVal, setPxVal] = useState('16');
  const [remVal, setRemVal] = useState('1');
  const basePxRem = 16;

  // Google Search Handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setSearchQuery('');
  };

  // Helper calculation for currencies
  const calculateConversion = (amountStr: string, fromC: string, toC: string): string => {
    if (amountStr === '' || isNaN(parseFloat(amountStr))) return '';
    const amt = parseFloat(amountStr);
    const fromObj = CURRENCIES.find(c => c.code === fromC) || CURRENCIES[0];
    const toObj = CURRENCIES.find(c => c.code === toC) || CURRENCIES[1];
    
    // Amount in USD = amt / fromObj.ratePerUSD
    // Amount in Target = (amt / fromObj.ratePerUSD) * toObj.ratePerUSD
    const converted = (amt / fromObj.ratePerUSD) * toObj.ratePerUSD;
    return converted < 0.01 ? converted.toFixed(4) : converted.toFixed(2);
  };

  const handleFromAmountChange = (val: string) => {
    setFromVal(val);
    const result = calculateConversion(val, fromCode, toCode);
    setToVal(result);
  };

  const handleToAmountChange = (val: string) => {
    setToVal(val);
    const result = calculateConversion(val, toCode, fromCode);
    setFromVal(result);
  };

  const handleFromCodeChange = (newCode: string) => {
    setFromCode(newCode);
    const result = calculateConversion(fromVal, newCode, toCode);
    setToVal(result);
  };

  const handleToCodeChange = (newCode: string) => {
    setToCode(newCode);
    const result = calculateConversion(fromVal, fromCode, newCode);
    setToVal(result);
  };

  const handleSwapCurrencies = () => {
    const tempCode = fromCode;
    const tempVal = fromVal;
    setFromCode(toCode);
    setToCode(tempCode);
    setFromVal(toVal);
    setToVal(tempVal);

    dispatchAppNotification({
      titleBn: '💱 মুদ্রা অদলবদল করা হয়েছে',
      titleEn: '💱 Currencies Swapped',
      messageBn: `${toCode} ↔️ ${tempCode}`,
      messageEn: `${toCode} ↔️ ${tempCode}`,
      type: 'info'
    });
  };

  // Instant Unit Conversions
  const handlePxChange = (val: string) => {
    setPxVal(val);
    if (val === '') {
      setRemVal('');
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setRemVal((num / basePxRem).toFixed(4));
    }
  };

  const handleRemChange = (val: string) => {
    setRemVal(val);
    if (val === '') {
      setPxVal('');
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setPxVal((num * basePxRem).toFixed(2));
    }
  };

  const fromCurrObj = CURRENCIES.find(c => c.code === fromCode) || CURRENCIES[0];
  const toCurrObj = CURRENCIES.find(c => c.code === toCode) || CURRENCIES[1];
  const unitRate = ((1 / fromCurrObj.ratePerUSD) * toCurrObj.ratePerUSD).toFixed(2);

  return (
    <div className="rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-slate-900/30 p-5 backdrop-blur-md shadow-xl flex flex-col justify-between h-full min-h-[420px]">
      
      {/* Universal Google Search */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-sky-500" />
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">Global Finder</span>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {t('সার্বজনীন অনুসন্ধান', 'Universal Search')}
            </h3>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full mb-5">
          <input
            type="text"
            placeholder={t('গুগল অনুসন্ধান করুন...', 'Search Google...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 rounded-xl pl-4 pr-10 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500/50 text-slate-800 dark:text-slate-100"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors cursor-pointer">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Converter Hub Section */}
      <div className="flex-1 flex flex-col justify-end">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-sky-500" />
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('কনভার্টার হাব', 'Converter Hub')}
            </h4>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-white/5">
            <button
              onClick={() => setActiveTab('currency')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                activeTab === 'currency'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('মুদ্রা', 'Currency')}
            </button>
            <button
              onClick={() => setActiveTab('unit')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                activeTab === 'unit'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t('ইউনিট', 'Units')}
            </button>
          </div>
        </div>

        {/* Tab 1: Multi-Currency Converter */}
        {activeTab === 'currency' && (
          <div className="space-y-3 animate-fadeIn">
            {/* From Currency Block */}
            <div className="bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('থেকে (From)', 'From')}
                </span>
                <select
                  value={fromCode}
                  onChange={(e) => handleFromCodeChange(e.target.value)}
                  className="bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-bold px-2 py-1 rounded-lg border border-slate-300 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                >
                  {CURRENCIES.map((c) => (
                    <option key={'from_' + c.code} value={c.code} className="bg-slate-800 text-white">
                      {c.code} - {isBn ? c.nameBn : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-extrabold text-sky-500">{fromCurrObj.symbol}</span>
                <input
                  type="number"
                  value={fromVal}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent border-none text-base font-extrabold text-right focus:outline-none w-full text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Swap Button Divider */}
            <div className="flex justify-center -my-1">
              <button
                onClick={handleSwapCurrencies}
                className="p-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-md transition-all hover:scale-110 cursor-pointer"
                title={t('মুদ্রা অদলবদল করুন', 'Swap Currencies')}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* To Currency Block */}
            <div className="bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('প্রতি (To)', 'To')}
                </span>
                <select
                  value={toCode}
                  onChange={(e) => handleToCodeChange(e.target.value)}
                  className="bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-bold px-2 py-1 rounded-lg border border-slate-300 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
                >
                  {CURRENCIES.map((c) => (
                    <option key={'to_' + c.code} value={c.code} className="bg-slate-800 text-white">
                      {c.code} - {isBn ? c.nameBn : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-extrabold text-emerald-500">{toCurrObj.symbol}</span>
                <input
                  type="number"
                  value={toVal}
                  onChange={(e) => handleToAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent border-none text-base font-extrabold text-right focus:outline-none w-full text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Live Exchange Rate Display */}
            <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 dark:text-slate-400 px-1 pt-0.5">
              <span>{t('লাইভ বিনিময় হার', 'Live Exchange Rate')}</span>
              <span className="font-bold text-sky-400">
                1 {fromCode} ≈ {unitRate} {toCode}
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Unit Converter */}
        {activeTab === 'unit' && (
          <div className="space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold">{t('PX (পিক্সেল)', 'PX (Pixels)')}</span>
                <input
                  type="number"
                  value={pxVal}
                  onChange={(e) => handlePxChange(e.target.value)}
                  placeholder="0"
                  className="bg-transparent border-none text-sm font-semibold focus:outline-none w-24 text-slate-800 dark:text-white mt-1"
                />
              </div>
              <div className="text-slate-400 dark:text-slate-500">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold">REM</span>
                <input
                  type="number"
                  value={remVal}
                  onChange={(e) => handleRemChange(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent border-none text-sm font-semibold focus:outline-none w-24 text-right text-slate-800 dark:text-white mt-1"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-1">
              <span>{t('রুট ফন্ট সাইজ', 'Root Font Size')}</span>
              <span>1 REM = {basePxRem} PX</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


