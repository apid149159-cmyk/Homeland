import React from 'react';
import { LayoutDashboard, Package, CalendarDays, Settings, LogOut, ArrowLeft, Map, MessageCircle, Activity } from 'lucide-react';
import { TRANSLATIONS, Language } from '../../translations';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: 'DASHBOARD' | 'INVENTORY' | 'BOOKINGS' | 'ZONES' | 'CHAT' | 'HEALTH'; // Added HEALTH
  onTabChange: (tab: 'DASHBOARD' | 'INVENTORY' | 'BOOKINGS' | 'ZONES' | 'CHAT' | 'HEALTH') => void; // Added HEALTH
  onLogout: () => void;
  onSwitchToUser: () => void;
  lang: Language;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, activeTab, onTabChange, onLogout, onSwitchToUser, lang 
}) => {
  const t = TRANSLATIONS[lang];

  const MenuButton = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => onTabChange(id as any)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold ${
        activeTab === id 
          ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
          : 'text-slate-500 hover:bg-rose-50 hover:text-rose-500'
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-20 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
               A
            </div>
            Admin<span className="text-rose-500">Panel</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <MenuButton id="DASHBOARD" icon={LayoutDashboard} label={t.dashboard} />
          <MenuButton id="INVENTORY" icon={Package} label={t.inventory} />
          <MenuButton id="ZONES" icon={Map} label={t.zoneManager} /> 
          <MenuButton id="BOOKINGS" icon={CalendarDays} label={t.bookings} />
          <MenuButton id="CHAT" icon={MessageCircle} label={t.chatSupport} />
          <MenuButton id="HEALTH" icon={Activity} label={t.systemHealth} /> {/* New Button */}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <button 
             onClick={onSwitchToUser}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 font-bold transition-all"
          >
             <ArrowLeft size={20} /> {t.switchToUser}
          </button>
          <button 
             onClick={onLogout}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 font-bold transition-all"
          >
             <LogOut size={20} /> {t.logout}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
};