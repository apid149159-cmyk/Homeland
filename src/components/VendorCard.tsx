import React from 'react';
import { Check, Info } from 'lucide-react';
import { Vendor } from '../types';
import { useGlobal } from '../contexts/GlobalContext';
import { useEvent } from '../contexts/EventContext';
import { Language } from '../translations';

interface VendorCardProps {
  vendor: Vendor;
  isSelected?: boolean;
  isThemeMatch?: boolean;
  onToggle?: (vendor: Vendor) => void;
  lang?: Language;
}

export const VendorCard: React.FC<VendorCardProps> = ({ vendor, isSelected: propIsSelected, isThemeMatch: propIsThemeMatch, onToggle, lang: propLang }) => {
  const { t, lang: contextLang } = useGlobal();
  const { cart, toggleVendor, eventConfig } = useEvent();
  
  const lang = propLang || contextLang;

  const isSelected = propIsSelected !== undefined ? propIsSelected : !!cart.find(i => i.id === vendor.id);
  const isThemeMatch = propIsThemeMatch !== undefined ? propIsThemeMatch : vendor.tags.includes(eventConfig.theme);
  
  const displayName = lang === 'TH' ? (vendor.name_th || vendor.name) : vendor.name;
  const displayDesc = lang === 'TH' ? (vendor.description_th || vendor.description) : vendor.description;
  
  const handleClick = () => {
      if (onToggle) {
          onToggle(vendor);
      } else {
          toggleVendor(vendor);
      }
  };

  return (
    <div 
      onClick={handleClick}
      className={`
        relative group border-0 rounded-3xl p-4 cursor-pointer transition-all duration-300 ease-in-out
        ${isSelected 
          ? 'bg-rose-50 ring-2 ring-rose-400 shadow-lg shadow-rose-100/50 transform scale-[1.02]' 
          : 'bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1'}
      `}
    >
      {isThemeMatch && (
        <span className="absolute -top-2.5 right-4 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm border border-emerald-200 z-10">
          <Check size={14} className="mr-1 stroke-[3]"/> {t.perfectMatch}
        </span>
      )}

      <div className="flex gap-4">
        {/* Image Container */}
        <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden shadow-sm bg-slate-100">
          <img 
            src={vendor.image} 
            alt={displayName} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="mb-1">
            <h3 className="font-bold text-slate-800 truncate text-lg leading-tight">{displayName}</h3>
            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">{vendor.type}</p>
          </div>
          
          <div className="flex flex-wrap gap-1.5 mb-2">
            {vendor.tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                {tag}
              </span>
            ))}
          </div>

          <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {displayDesc}
          </p>

          <div className="flex items-end justify-between mt-auto pt-2 border-t border-dashed border-slate-100">
            <div className="flex items-center gap-1 text-xs text-slate-400">
                 <Info size={12} /> 
                 <span className="truncate max-w-[120px]">
                    {Object.entries(vendor.specs)
                    .filter(([key]) => key !== 'support')
                    .map(([key, val]) => `${key}:${val}`)
                    .join(' ')}
                 </span>
            </div>
            <div className="text-right">
              <span className="block text-rose-500 font-bold text-lg">฿{vendor.price.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};