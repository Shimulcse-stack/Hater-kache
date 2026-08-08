import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'bn' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (bn: string, en: string) => string;
  isBn: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'bn',
  setLanguage: () => {},
  t: (bn, en) => bn,
  isBn: true,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('hk_language');
    return (saved as Language) || 'bn';
  });

  useEffect(() => {
    localStorage.setItem('hk_language', language);
  }, [language]);

  const t = (bn: string, en: string) => (language === 'en' ? en : bn);
  const isBn = language === 'bn';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isBn }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
