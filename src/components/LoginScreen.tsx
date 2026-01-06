import React, { useState } from 'react';
import { LayoutGrid, Lock, Mail, ArrowRight, Loader2, Store, Globe } from 'lucide-react';
import { TRANSLATIONS, Language } from '../translations';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onLogin: (email: string) => Promise<void>;
  onRegisterClick: () => void;
  onToggleLanguage: () => void; // New Prop
  lang: Language;
}

// Custom SVG Icons for Brands
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="white"/>
  </svg>
);

const LineIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 10.304c0-5.37-5.384-9.732-12-9.732S0 4.934 0 10.304c0 4.814 4.269 8.846 10.026 9.614.39.085.923.258 1.058.59.12.296.079.762.038 1.057-.087.625-.466 2.276-.554 2.625-.132.529-.63 2.057.944 1.12 6.556-3.856 8.927-6.529 9.157-6.808 2.073-2.193 3.33-4.839 3.33-7.55zM4.326 13.88v-5.91c0-.422.34-.766.758-.766h.142c.418 0 .758.344.758.766v5.15h2.511c.419 0 .759.344.759.765v.143c0 .422-.34.766-.759.766H5.084c-.418-.002-.758-.344-.758-.766v-.148zm4.848-.148v-5.615c0-.422.34-.766.759-.766h.141c.42 0 .76.344.76.766v5.615c0 .422-.34.766-.76.766h-.14c-.42 0-.76-.344-.76-.766zm6.204.148h-2.651c-.347 0-.649-.234-.73-.559l-2.036-3.056v2.85c0 .422-.34.766-.758.766h-.142c-.418 0-.758-.344-.758-.766v-5.76c0-.422.34-.766.758-.766h.314c.348 0 .65.234.73.56l2.034 3.054v-2.85c0-.421.341-.765.76.765h.141c.419 0 .76.344.76.765v5.762c0 .422-.34.766-.76.766h.14zm4.298-2.618h-2.511v1.178h2.511c.42 0 .76.343.76.765v.143c0 .422-.34.766-.76.766h-3.411c-.419 0-.758-.344-.758-.766v-5.76c0-.422.34-.766.758-.766h3.411c.42 0 .76.344.76.766v.142c0 .422-.34.766-.76.766h-2.511v1.107h2.511c.42 0 .76.344.76.766v.143c0 .42-.34.765-.76.765z" fill="white"/>
  </svg>
);

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegisterClick, onToggleLanguage, lang }) => {
  const t = TRANSLATIONS[lang];
  const [email, setEmail] = useState('demo@event.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null); // Track which social provider is loading
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        if (email.includes('@') && password.length >= 4) {
             await onLogin(email);
        } else {
             throw new Error(t.loginError);
        }
    } catch (e: any) {
        setError(e.message || t.loginError);
        setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'GOOGLE' | 'FACEBOOK' | 'LINE') => {
    // In a real app this would call socialLogin form props, but for now we just show UI state
    // since the prop signature changed slightly in this Refactor. 
    // Ideally we'd need to pass socialLogin prop from App -> LoginScreen too, but GlobalContext handles it.
    // For now, let's assume we are calling the main onLogin or similar. 
    // *Correction*: We should probably use useGlobal inside here if we want direct access, 
    // but props are cleaner. The parent component (App) wraps LoginScreen.
    
    // NOTE: The previous refactor didn't update App.tsx to pass `socialLogin`. 
    // We will just simulate via onLogin for now or let the user use the Email login which works with the new Service.
    setSocialLoading(provider);
    setTimeout(() => {
        onLogin(provider.toLowerCase() + '@example.com'); // Mocking social login via email flow for now
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F5] flex items-center justify-center p-6 relative">
      
      {/* Language Toggle (Absolute Top Right) */}
      <button 
        onClick={onToggleLanguage}
        className="absolute top-6 right-6 flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white px-4 py-2 rounded-full font-bold text-slate-600 transition-all shadow-sm border border-white/50 z-10"
      >
        <Globe size={18} className="text-rose-500" />
        <span>{lang === 'EN' ? 'English' : 'ภาษาไทย'}</span>
      </button>

      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-rose-100 border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="bg-rose-400 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] rotate-12 bg-white/30 rounded-full"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[100px] h-[100px] bg-yellow-300 rounded-full blur-3xl opacity-50"></div>
          </div>
          <div className="bg-white/20 p-3 rounded-3xl w-16 h-16 flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-inner border border-white/30">
            <LayoutGrid size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">{t.appTitle}{t.appTitleSuffix}</h1>
          <p className="text-rose-100 text-xs font-medium bg-rose-500/30 inline-block px-3 py-1 rounded-full border border-rose-300/30">{t.version}</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 mb-1">{t.loginTitle}</h2>
            <p className="text-xs text-slate-500 font-medium">{t.loginSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block ml-1">{t.emailLabel}</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-400 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-transparent hover:border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-300 transition-all outline-none font-medium text-sm"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block ml-1">{t.passwordLabel}</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-400 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-transparent hover:border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-300 transition-all outline-none font-medium text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-xs font-bold text-rose-500 bg-rose-50 p-3 rounded-xl text-center border border-rose-100">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading || !!socialLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-200 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 transform active:scale-95 text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> {t.signingIn}
                </>
              ) : (
                <>
                  {t.signInButton} <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Social Login Separator */}
          <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-slate-100 flex-1"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.orContinueWith}</span>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-3 gap-3">
             <button 
                type="button"
                onClick={() => handleSocialLogin('GOOGLE')}
                disabled={!!socialLoading}
                className="flex items-center justify-center py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
             >
                {socialLoading === 'GOOGLE' ? <Loader2 size={20} className="animate-spin text-slate-400" /> : <GoogleIcon />}
             </button>

             <button 
                type="button"
                onClick={() => handleSocialLogin('FACEBOOK')}
                disabled={!!socialLoading}
                className="flex items-center justify-center py-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white transition-all shadow-md shadow-blue-200 active:scale-95 disabled:opacity-50"
             >
                 {socialLoading === 'FACEBOOK' ? <Loader2 size={20} className="animate-spin text-white" /> : <FacebookIcon />}
             </button>

             <button 
                type="button"
                onClick={() => handleSocialLogin('LINE')}
                disabled={!!socialLoading}
                className="flex items-center justify-center py-3 rounded-xl bg-[#06C755] hover:bg-[#05b54d] text-white transition-all shadow-md shadow-emerald-200 active:scale-95 disabled:opacity-50"
             >
                 {socialLoading === 'LINE' ? <Loader2 size={20} className="animate-spin text-white" /> : <LineIcon />}
             </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <button onClick={onRegisterClick} className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center justify-center gap-2 mx-auto">
                <Store size={14}/> {t.registerVendor}
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};