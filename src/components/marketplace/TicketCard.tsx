import React from 'react';
import { Ticket } from '../../types';
import { TRANSLATIONS, Language } from '../../translations';
import { MapPin, Calendar, User, ShieldCheck, Ticket as TicketIcon } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  lang: Language;
  onBuy: (ticket: Ticket) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, lang, onBuy }) => {
  const t = TRANSLATIONS[lang];
  const savePercentage = Math.round(((ticket.originalPrice - ticket.resalePrice) / ticket.originalPrice) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden flex flex-col md:flex-row relative group hover:shadow-xl transition-all">
      {/* Dashed line effect for ticket stub */}
      <div className="absolute top-1/2 left-0 w-4 h-8 bg-slate-50 border-r border-slate-200 rounded-r-full -translate-y-1/2 md:hidden"></div>
      <div className="absolute top-1/2 right-0 w-4 h-8 bg-slate-50 border-l border-slate-200 rounded-l-full -translate-y-1/2 md:hidden"></div>
      <div className="absolute top-0 right-[30%] w-8 h-4 bg-slate-50 border-b border-slate-200 rounded-b-full -translate-x-1/2 hidden md:block"></div>
      <div className="absolute bottom-0 right-[30%] w-8 h-4 bg-slate-50 border-t border-slate-200 rounded-t-full -translate-x-1/2 hidden md:block"></div>
      
      {/* Image Section */}
      <div className="md:w-48 h-40 md:h-auto bg-slate-100 relative shrink-0">
        <img src={ticket.image} className="w-full h-full object-cover" alt={ticket.eventName} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-3 text-white">
            <p className="text-xs font-medium opacity-80">{t.date}</p>
            <p className="font-bold">{ticket.date}</p>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 p-5 flex flex-col justify-between border-r-0 md:border-r border-slate-200 border-dashed">
        <div>
            <h3 className="font-bold text-lg text-slate-800 mb-1">{ticket.eventName}</h3>
            <div className="flex items-center text-xs text-slate-500 mb-3 gap-3">
                <span className="flex items-center gap-1"><MapPin size={12}/> {ticket.location}</span>
                <span className="flex items-center gap-1"><TicketIcon size={12}/> {t.zone}: {ticket.zone}</span>
            </div>
            
            <div className="flex gap-2">
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold border border-indigo-100">
                    {t.seat}: {ticket.seatNumber}
                </span>
                {ticket.isVerified && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold border border-emerald-100 flex items-center gap-1">
                        <ShieldCheck size={10} /> {t.verifiedSeller}
                    </span>
                )}
            </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <User size={12} /> {t.verifiedSeller}: {ticket.sellerName}
        </div>
      </div>

      {/* Price Section */}
      <div className="p-5 md:w-48 bg-slate-50 flex flex-col justify-center items-center text-center border-t md:border-t-0 border-slate-200 border-dashed">
        {savePercentage > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
                {t.save} {savePercentage}%
            </span>
        )}
        <div className="mb-1">
            <p className="text-xs text-slate-400 line-through">฿{ticket.originalPrice.toLocaleString()}</p>
            <p className="text-2xl font-bold text-rose-600">฿{ticket.resalePrice.toLocaleString()}</p>
        </div>
        
        {ticket.status === 'AVAILABLE' ? (
            <button 
                onClick={() => onBuy(ticket)}
                className="w-full bg-slate-900 text-white py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-colors mt-2"
            >
                {t.buyNow}
            </button>
        ) : (
             <button disabled className="w-full bg-slate-200 text-slate-400 py-2 rounded-xl font-bold text-sm mt-2 cursor-not-allowed">
                {t.sold}
            </button>
        )}
      </div>
    </div>
  );
};