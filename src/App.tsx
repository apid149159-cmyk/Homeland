import React, { useState, useMemo } from 'react';
import { GlobalProvider, useGlobal } from './contexts/GlobalContext';
import { EventProvider, useEvent } from './contexts/EventContext';
import { ConfigPanel } from './components/ConfigPanel';
import { VendorCard } from './components/VendorCard';
import { SummaryPanel } from './components/SummaryPanel';
import { InvoiceModal } from './components/InvoiceModal';
import { PaymentModal } from './components/PaymentModal'; // Import PaymentModal
import { LoginScreen } from './components/LoginScreen';
import { AdminLayout } from './components/admin/AdminLayout';
import { DashboardStats } from './components/admin/DashboardStats';
import { VendorManager } from './components/admin/VendorManager';
import { ZoneManager } from './components/admin/ZoneManager';
import { AdminChatManager } from './components/admin/AdminChatManager';
import { SystemHealth } from './components/admin/SystemHealth';
import { PosterDesigner } from './components/PosterDesigner';
import { VendorRegistration } from './components/VendorRegistration';
import { TicketMarketplace } from './components/marketplace/TicketMarketplace';
import { ChatWidget } from './components/chat/ChatWidget';
import { LayoutGrid, Music, Utensils, Users, Filter, RotateCcw, Globe, Search, ArrowUpDown, Shirt, LogOut, ChevronRight, ShoppingCart, X, Settings, Palette, Ticket as TicketIcon } from 'lucide-react';

// Inner Component to consume contexts
const HomelandApp = () => {
  const { 
    user, lang, t, toggleLanguage, logout, login,
    isAdminMode, setIsAdminMode, 
    showPosterDesigner, setShowPosterDesigner, 
    showMarketplace, setShowMarketplace 
  } = useGlobal();

  const { 
    vendors, setVendors, tickets, setTickets, zones, setZones, booths, setBooths,
    eventConfig, setEventConfig, cart, toggleVendor, resetEvent,
    financials, validation
  } = useEvent();

  const [adminTab, setAdminTab] = useState<'DASHBOARD' | 'INVENTORY' | 'BOOKINGS' | 'ZONES' | 'CHAT' | 'HEALTH'>('DASHBOARD');
  const [isRegisteringVendor, setIsRegisteringVendor] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'RECOMMENDED' | 'PRICE_ASC' | 'PRICE_DESC'>('RECOMMENDED');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'MUSIC' | 'FOOD' | 'STAFF' | 'FASHION'>('MUSIC');
  
  // Modal States
  const [showInvoice, setShowInvoice] = useState(false);
  const [showPayment, setShowPayment] = useState(false); // Payment Modal State
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // --- Handlers ---
  const handleReset = () => {
    if(confirm(t.resetConfirm)) resetEvent();
  }

  const handleRegisterVendor = (newVendor: any) => {
      setVendors(prev => [...prev, newVendor]);
      // Update localstorage handled by context
  };

  const handleListTicket = (newTicket: any) => {
      setTickets(prev => [newTicket, ...prev]);
      alert(t.listingSuccess);
  };

  const handleBuyTicket = (ticket: any) => {
      if (confirm(`Buy ticket for ${ticket.eventName}?`)) {
          setTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'SOLD' } : t));
          alert(t.buySuccess);
      }
  };

  const handleCheckoutClick = () => {
      setShowPayment(true);
      setIsMobileCartOpen(false);
  };

  const handlePaymentSuccess = () => {
      setShowInvoice(true);
      // Optional: Clear cart or save booking to DB here
  };

  // --- Render Logic ---
  if (isRegisteringVendor) {
      return (
        <>
            <VendorRegistration 
                onRegister={handleRegisterVendor}
                onBack={() => setIsRegisteringVendor(false)}
                lang={lang}
            />
            <ChatWidget currentUser={{ id: 'guest-' + Date.now(), name: 'Guest', email: '', role: 'VENDOR' }} lang={lang} />
        </>
      );
  }

  if (!user) {
      return (
        <LoginScreen 
            onLogin={login} 
            onRegisterClick={() => setIsRegisteringVendor(true)}
            lang={lang}
            onToggleLanguage={toggleLanguage}
        />
      );
  }

  if (showMarketplace) {
      return (
          <TicketMarketplace 
            tickets={tickets}
            onListTicket={handleListTicket}
            onBuyTicket={handleBuyTicket}
            onBack={() => setShowMarketplace(false)}
            lang={lang}
          />
      );
  }

  if (isAdminMode) {
      return (
        <AdminLayout 
            activeTab={adminTab} 
            onTabChange={setAdminTab} 
            onLogout={logout}
            onSwitchToUser={() => setIsAdminMode(false)}
            lang={lang}
        >
            {adminTab === 'DASHBOARD' && <DashboardStats vendors={vendors} lang={lang} />}
            {adminTab === 'INVENTORY' && <VendorManager vendors={vendors} setVendors={setVendors} lang={lang} />}
            {adminTab === 'ZONES' && <ZoneManager zones={zones} booths={booths} vendors={vendors} setZones={setZones} setBooths={setBooths} lang={lang} />}
            {adminTab === 'CHAT' && <AdminChatManager lang={lang} />} 
            {adminTab === 'HEALTH' && <SystemHealth lang={lang} />} 
            {adminTab === 'BOOKINGS' && <div className="text-center py-20 text-slate-400">Booking Management (Coming Soon)</div>}
        </AdminLayout>
      );
  }

  // --- User Mode Filter Logic ---
  const displayVendors = vendors.filter(v => {
      let matchesCategory = false;
      if (activeCategory === 'ALL') matchesCategory = true;
      else if (activeCategory === 'MUSIC') matchesCategory = v.type === 'BAND' || v.type === 'SOUND';
      else if (activeCategory === 'FOOD') matchesCategory = v.type === 'FOOD' || v.type === 'FOOD_TRUCK';
      else matchesCategory = v.type === activeCategory;

      if (!matchesCategory) return false;

      if (searchQuery) {
        const lowerQuery = searchQuery.toLowerCase();
        return v.name.toLowerCase().includes(lowerQuery) || 
               (v.name_th && v.name_th.toLowerCase().includes(lowerQuery)) ||
               v.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      }
      return true;
  }).sort((a, b) => {
      if (sortBy === 'RECOMMENDED') {
        const aMatch = a.tags.includes(eventConfig.theme);
        const bMatch = b.tags.includes(eventConfig.theme);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      }
      if (sortBy === 'PRICE_ASC') return a.price - b.price;
      if (sortBy === 'PRICE_DESC') return b.price - a.price;
      return 0;
  });

  return (
    <div className="min-h-screen bg-[#FFF5F5] text-slate-800 font-sans pb-24 lg:pb-12">
      <ChatWidget currentUser={user} lang={lang} />
      
      {/* Modals */}
      <PaymentModal 
        isOpen={showPayment} 
        onClose={() => setShowPayment(false)} 
        onSuccess={handlePaymentSuccess}
        financials={financials}
        lang={lang}
      />
      <InvoiceModal 
        isOpen={showInvoice} 
        onClose={() => setShowInvoice(false)} 
        config={eventConfig} 
        cart={cart} 
        financials={financials} 
        lang={lang} 
      />
      <PosterDesigner isOpen={showPosterDesigner} onClose={() => setShowPosterDesigner(false)} config={eventConfig} cart={cart} lang={lang} />

      {/* Navbar */}
      <header className="fixed top-4 left-4 right-4 z-30 max-w-5xl mx-auto">
        <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-full shadow-lg shadow-rose-100/50 px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-rose-500 text-white p-2 rounded-full shadow-md shadow-rose-200"><span className="font-bold text-xs">HE</span></div>
            <span className="text-lg font-bold text-slate-800 tracking-tight hidden sm:inline">Homeland<span className="text-rose-500">Event</span></span>
            <span className="sm:hidden font-bold text-rose-500">HE</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-sm font-bold text-slate-500">
             <button onClick={() => setShowMarketplace(true)} className="hidden md:flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors shadow-sm border border-indigo-100">
                <TicketIcon size={14} /> <span>{t.marketTitle}</span>
             </button>
             <button onClick={() => setShowPosterDesigner(true)} className="hidden md:flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors shadow-sm border border-orange-100" title={t.designPoster}>
                <Palette size={14} /> <span>{t.designPoster}</span>
             </button>
             {/* Admin Button Removed from Header */}
             <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full pl-1 pr-4 py-1">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-rose-100 border-2 border-white shadow-sm"><img src={user.avatar} alt="User" className="w-full h-full object-cover" /></div>
                  <span className="text-xs text-slate-600 hidden md:inline-block capitalize">{t.welcomeUser} {user.name}</span>
             </div>
             <button onClick={toggleLanguage} className="flex items-center gap-1.5 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-full transition-colors text-slate-600 font-bold border border-slate-100 shadow-sm"><Globe size={14} /><span>{lang}</span></button>
             <button onClick={handleReset} className="p-2 hover:bg-rose-50 rounded-full transition-colors text-slate-400 hover:text-rose-500" title={t.reset}><RotateCcw size={18}/></button>
             <button onClick={logout} className="p-2 hover:bg-red-50 rounded-full transition-colors text-slate-400 hover:text-red-500" title={t.logout}><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      {/* Stepper (Desktop) */}
      <div className="pt-24 pb-4 hidden md:block">
          <div className="max-w-xl mx-auto flex items-center justify-center gap-4 text-sm bg-white/60 backdrop-blur-sm rounded-full py-2 px-6 shadow-sm border border-white/50">
            <div className="flex items-center gap-2 text-rose-500 font-bold"><span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs shadow-sm">1</span>{t.step1}</div>
            <ChevronRight size={14} className="text-slate-300"/>
            <div className={`flex items-center gap-2 font-bold ${cart.length > 0 ? 'text-rose-500' : 'text-slate-400'}`}><span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${cart.length > 0 ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>2</span>{t.step2}</div>
            <ChevronRight size={14} className="text-slate-300"/>
            <div className="flex items-center gap-2 text-slate-400 font-bold"><span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs">3</span>{t.step3}</div>
          </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 mt-16 md:mt-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <ConfigPanel /> {/* No Props! */}
            
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                   <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Filter size={20} className="text-rose-500" />{t.selectServices}</h2>
                   <span className="text-xs font-bold text-slate-400 mt-1 block pl-7">{t.showingOptions} {displayVendors.length} {t.options}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors"/>
                        <input type="text" placeholder={t.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-3 text-sm bg-white border-0 shadow-sm shadow-slate-100 rounded-full focus:ring-2 focus:ring-rose-200 focus:outline-none transition-all w-48 sm:w-64"/>
                    </div>
                    <div className="relative">
                        <ArrowUpDown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="pl-10 pr-8 py-3 text-sm bg-white border-0 shadow-sm shadow-slate-100 rounded-full focus:ring-2 focus:ring-rose-200 focus:outline-none transition-all appearance-none cursor-pointer hover:bg-slate-50 font-bold text-slate-600">
                            <option value="RECOMMENDED">{t.sortRecommended}</option>
                            <option value="PRICE_ASC">{t.sortPriceLowHigh}</option>
                            <option value="PRICE_DESC">{t.sortPriceHighLow}</option>
                        </select>
                    </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-3 mb-8 overflow-x-auto pb-4 scrollbar-hide px-1">
                <button onClick={() => setActiveCategory('MUSIC')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeCategory === 'MUSIC' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 transform scale-105' : 'bg-white text-slate-500 shadow-sm hover:bg-slate-50'}`}><Music size={16} /> {t.tabMusic}</button>
                <button onClick={() => setActiveCategory('FOOD')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeCategory === 'FOOD' ? 'bg-orange-400 text-white shadow-lg shadow-orange-200 transform scale-105' : 'bg-white text-slate-500 shadow-sm hover:bg-slate-50'}`}><Utensils size={16} /> {t.tabFood}</button>
                <button onClick={() => setActiveCategory('STAFF')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeCategory === 'STAFF' ? 'bg-sky-400 text-white shadow-lg shadow-sky-200 transform scale-105' : 'bg-white text-slate-500 shadow-sm hover:bg-slate-50'}`}><Users size={16} /> {t.tabStaff}</button>
                <button onClick={() => setActiveCategory('FASHION')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeCategory === 'FASHION' ? 'bg-purple-400 text-white shadow-lg shadow-purple-200 transform scale-105' : 'bg-white text-slate-500 shadow-sm hover:bg-slate-50'}`}><Shirt size={16} /> {t.tabFashion}</button>
                <button onClick={() => setActiveCategory('ALL')} className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${activeCategory === 'ALL' ? 'bg-slate-800 text-white shadow-lg shadow-slate-300' : 'bg-white text-slate-500 shadow-sm hover:bg-slate-50'}`}>{t.tabAll}</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {displayVendors.length > 0 ? (
                    displayVendors.map(vendor => (
                    <VendorCard key={vendor.id} vendor={vendor} /> /* No Props! */
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center text-slate-400 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
                        <Search size={48} className="mx-auto mb-4 opacity-20 text-rose-300"/>
                        <p className="font-bold text-lg">{t.noResults}</p>
                    </div>
                )}
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-4 space-y-6">
            <SummaryPanel onCheckout={handleCheckoutClick} />
          </div>
        </div>
      </main>

      {/* Footer with Admin Access */}
      <footer className="max-w-7xl mx-auto px-6 py-8 mt-12 mb-20 lg:mb-0 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400">
          <p>© 2024 Homeland Event. All rights reserved.</p>
          <div className="flex items-center gap-6">
              <button onClick={() => setIsAdminMode(true)} className="flex items-center gap-2 hover:text-rose-500 transition-colors">
                  <Settings size={14}/> {t.switchToAdmin}
              </button>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>v4.8</span>
          </div>
      </footer>

      {/* Mobile Sticky Bar & Drawer */}
      <div className="fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md border border-white/50 p-4 lg:hidden z-40 flex items-center justify-between shadow-2xl rounded-3xl pb-safe">
         <div>
            <div className="text-xs font-bold text-slate-400 mb-0.5 uppercase tracking-wide">{t.total} ({cart.length})</div>
            <div className="font-extrabold text-2xl text-rose-500">฿{financials.netPayable.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
         </div>
         <div className="flex gap-2">
             <button onClick={() => setShowPosterDesigner(true)} className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm border border-indigo-100"><Palette size={20} /></button>
             <button onClick={() => setIsMobileCartOpen(true)} className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-slate-300 flex items-center gap-2 transform active:scale-95 transition-transform"><ShoppingCart size={18}/> {t.viewCart}</button>
         </div>
      </div>

      {isMobileCartOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileCartOpen(false)}></div>
            <div className="absolute inset-x-0 bottom-0 bg-[#FFF5F5] rounded-t-[2.5rem] max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col shadow-2xl">
                <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 p-5 border-b border-rose-100 flex items-center justify-between">
                    <h2 className="font-bold text-xl text-slate-800">{t.bookingSummary}</h2>
                    <button onClick={() => setIsMobileCartOpen(false)} className="p-2 bg-rose-50 rounded-full text-rose-400 hover:bg-rose-100 transition-colors"><X size={20}/></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <SummaryPanel onCheckout={handleCheckoutClick} />
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <GlobalProvider>
      <EventProvider>
        <HomelandApp />
      </EventProvider>
    </GlobalProvider>
  );
}