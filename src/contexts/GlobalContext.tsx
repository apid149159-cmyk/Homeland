import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { TRANSLATIONS, Language } from '../translations';
import { authService } from '../services/auth';
import { Loader2 } from 'lucide-react';

interface GlobalContextType {
  // Language
  lang: Language;
  toggleLanguage: () => void;
  t: typeof TRANSLATIONS['EN'];
  
  // Auth
  user: UserProfile | null;
  login: (email: string) => Promise<void>;
  socialLogin: (provider: 'GOOGLE' | 'FACEBOOK' | 'LINE') => Promise<void>;
  logout: () => Promise<void>;
  isAuthLoading: boolean;
  
  // UI Modes
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
  showPosterDesigner: boolean;
  setShowPosterDesigner: (show: boolean) => void;
  showMarketplace: boolean;
  setShowMarketplace: (show: boolean) => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- Language State ---
  const [lang, setLang] = useState<Language>('EN');
  
  // --- Auth State ---
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  // --- UI State ---
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPosterDesigner, setShowPosterDesigner] = useState(false);
  const [showMarketplace, setShowMarketplace] = useState(false);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      // Load Language
      const savedLang = localStorage.getItem('eventLang') as Language;
      if (savedLang) setLang(savedLang);

      // Check Session via Service
      try {
        const sessionUser = await authService.getSession();
        if (sessionUser) setUser(sessionUser);
      } catch (error) {
        console.error("Session check failed", error);
      } finally {
        setIsAuthLoading(false);
      }
    };
    init();
  }, []);

  // Save Language Preference
  useEffect(() => {
    localStorage.setItem('eventLang', lang);
  }, [lang]);

  const toggleLanguage = () => setLang(prev => prev === 'EN' ? 'TH' : 'EN');
  
  const login = async (email: string) => {
    try {
      const newUser = await authService.login(email);
      setUser(newUser);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const socialLogin = async (provider: 'GOOGLE' | 'FACEBOOK' | 'LINE') => {
    try {
      const newUser = await authService.socialLogin(provider);
      setUser(newUser);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };
  
  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAdminMode(false);
  };

  const value = {
    lang,
    toggleLanguage,
    t: TRANSLATIONS[lang],
    user,
    login,
    socialLogin,
    logout,
    isAuthLoading,
    isAdminMode,
    setIsAdminMode,
    showPosterDesigner,
    setShowPosterDesigner,
    showMarketplace,
    setShowMarketplace
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FFF5F5] flex flex-col items-center justify-center">
        <Loader2 size={48} className="text-rose-500 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse">Homeland Event</p>
        <p className="text-xs text-slate-400 mt-2">Loading resources...</p>
      </div>
    );
  }

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) throw new Error('useGlobal must be used within a GlobalProvider');
  return context;
};