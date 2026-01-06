import React, { useState } from 'react';
import { Ticket } from '../../types';
import { TRANSLATIONS, Language } from '../../translations';
import { TicketCard } from './TicketCard';
import { SellTicketModal } from './SellTicketModal';
import { Ticket as TicketIcon, Plus, ArrowLeft } from 'lucide-react';

interface TicketMarketplaceProps {
  tickets: Ticket[];
  onListTicket: (ticket: Ticket) => void;
  onBuyTicket: (ticket: Ticket) => void;
  onBack: () => void;
  lang: Language;
}

export const TicketMarketplace: React.FC<TicketMarketplaceProps> = ({ tickets, onListTicket, onBuyTicket, onBack, lang }) => {
  const t = TRANSLATIONS[lang];
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFF5F5] pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white py-12 px-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] rotate-12 bg-white/20 rounded-full"></div>
          </div>
          <div className="max-w-5xl mx-auto relative z-10">
              <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white font-bold mb-6 transition-colors">
                 <ArrowLeft size={18} /> {t.backToPlanner}
              </button>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
                       <TicketIcon className="text-rose-400" size={32}/> {t.marketTitle}
                    </h1>
                    <p className="text-slate-400 font-medium">{t.marketSubtitle}</p>
                </div>
                <button 
                    onClick={() => setIsSellModalOpen(true)}
                    className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-rose-900/50 transition-all transform active:scale-95"
                >
                    <Plus size={20}/> {t.sellTicket}
                </button>
              </div>
          </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
         <div className="space-y-4">
             {tickets.map(ticket => (
                 <TicketCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    lang={lang} 
                    onBuy={onBuyTicket} 
                 />
             ))}
         </div>
         
         {tickets.length === 0 && (
             <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                 <TicketIcon size={48} className="mx-auto text-slate-200 mb-4" />
                 <p className="text-slate-400 font-bold">No tickets available right now.</p>
             </div>
         )}
      </div>

      <SellTicketModal 
        isOpen={isSellModalOpen} 
        onClose={() => setIsSellModalOpen(false)}
        onListTicket={onListTicket}
        lang={lang}
      />
    </div>
  );
};