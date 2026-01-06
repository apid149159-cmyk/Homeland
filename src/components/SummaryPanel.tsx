import React from 'react';
import { AlertCircle, Calculator, ShieldAlert, Trash2, Map, Users, Building2, User } from 'lucide-react';
import { useGlobal } from '../contexts/GlobalContext';
import { useEvent } from '../contexts/EventContext';

interface SummaryPanelProps {
  onCheckout: () => void;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ onCheckout }) => {
  const { t, lang } = useGlobal();
  const { cart, financials, validation, toggleVendor, eventConfig, setEventConfig } = useEvent();
  
  const hasCriticalErrors = validation.criticalErrors.length > 0;
  const { spaceUsage, staffStatus } = validation;

  // Calculate Progress Bar Color for Space
  let progressColor = 'bg-emerald-400';
  if (spaceUsage.status === 'WARNING') progressColor = 'bg-amber-400';
  if (spaceUsage.status === 'OVERCROWDED') progressColor = 'bg-rose-500';

  return (
    <div className="space-y-6 sticky top-28">
      
      {/* 1. Space Utilization */}
      <div className="bg-white rounded-3xl border-0 p-6 shadow-lg shadow-slate-200/50">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-500"><Map size={16}/></div> 
                {t.venueSpaceUsage}
            </h3>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${spaceUsage.status === 'OK' ? 'bg-emerald-100 text-emerald-700' : spaceUsage.status === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                {spaceUsage.percentUsed.toFixed(0)}% {t.full}
            </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
            <div 
                className={`h-3 rounded-full transition-all duration-500 ${progressColor}`} 
                style={{ width: `${Math.min(spaceUsage.percentUsed, 100)}%` }}
            ></div>
        </div>
        <div className="flex justify-between text-xs font-bold text-slate-400">
            <span>{t.used}: {spaceUsage.totalUsed.toFixed(0)} m²</span>
            <span>{t.capacity}</span>
        </div>
        {spaceUsage.status === 'OVERCROWDED' && (
            <p className="text-xs text-rose-500 mt-3 font-bold bg-rose-50 p-2 rounded-xl border border-rose-100 text-center">
                ⚠️ {t.reduceGuestsWarning}
            </p>
        )}
      </div>

      {/* 2. Staff Requirement */}
      <div className="bg-white rounded-3xl border-0 p-6 shadow-lg shadow-slate-200/50">
        <div className="flex justify-between items-center mb-3">
             <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <div className="bg-sky-50 p-1.5 rounded-lg text-sky-500"><Users size={16}/></div> 
                {t.staffRequirement}
            </h3>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${staffStatus.status === 'OK' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {staffStatus.current} / {staffStatus.needed}
            </span>
        </div>
        <p className="text-xs text-slate-500 font-medium">
            {t.staffAnalysis(staffStatus.current, staffStatus.needed)}
        </p>
      </div>

      {/* 3. Validation Status */}
      {(hasCriticalErrors || validation.warnings.length > 0) && (
        <div className={`rounded-3xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 ${hasCriticalErrors ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'}`}>
            <div className={`p-4 border-b flex items-center gap-2 font-bold text-sm ${hasCriticalErrors ? 'border-rose-100 text-rose-600' : 'border-amber-100 text-amber-600'}`}>
            {hasCriticalErrors ? <ShieldAlert size={18} /> : <AlertCircle size={18} />}
            {hasCriticalErrors ? t.criticalIssues : t.suggestions}
            </div>
            <div className="p-4">
                <ul className="space-y-2">
                {validation.criticalErrors.map((err, idx) => (
                    <li key={`crit-${idx}`} className="flex items-start gap-2 text-xs font-medium text-rose-600 bg-white/80 p-3 rounded-xl border border-rose-100 shadow-sm">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{err}</span>
                    </li>
                ))}
                {validation.warnings.map((warn, idx) => (
                    <li key={`warn-${idx}`} className="flex items-start gap-2 text-xs font-medium text-amber-600 bg-white/80 p-3 rounded-xl border border-amber-100 shadow-sm">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{warn}</span>
                    </li>
                ))}
                </ul>
            </div>
        </div>
      )}

      {/* 4. Cart & Financials */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-indigo-100/50 border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 to-orange-400"></div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <div className="bg-slate-900 text-white p-2 rounded-xl">
                    <Calculator size={18} />
                </div>
                {t.bookingSummary}
            </h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
               {cart.length} {t.items}
            </span>
          </div>
          
          {/* Tax Entity Toggle */}
          <div className="mb-4 bg-slate-50 p-1.5 rounded-xl flex gap-1">
             <button 
                onClick={() => setEventConfig({...eventConfig, taxEntity: 'INDIVIDUAL'})}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${eventConfig.taxEntity === 'INDIVIDUAL' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
                <User size={14}/> {t.individual}
             </button>
             <button 
                onClick={() => setEventConfig({...eventConfig, taxEntity: 'CORPORATE'})}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${eventConfig.taxEntity === 'CORPORATE' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
                <Building2 size={14}/> {t.corporate}
             </button>
          </div>
          
          {cart.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-sm font-bold">{t.cartEmpty}</p>
              <p className="text-xs mt-1 text-slate-300">{t.selectToEstimate}</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                {cart.map((item) => {
                  const displayName = lang === 'TH' ? (item.name_th || item.name) : item.name;
                  return (
                    <div key={item.id} className="flex justify-between items-center text-sm group bg-slate-50 p-3 rounded-2xl border border-transparent hover:border-rose-100 transition-colors">
                      <div className="flex items-center gap-3 text-slate-700 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white shrink-0 overflow-hidden border border-slate-100">
                            <img src={item.image} className="w-full h-full object-cover" />
                        </div>
                        <span className="truncate font-bold">{displayName}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-slate-900 font-bold">฿{item.price.toLocaleString()}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleVendor(item); }}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-dashed border-slate-200 pt-5 space-y-3">
                <div className="flex justify-between text-slate-500 text-sm font-medium">
                  <span>{t.subtotal}</span>
                  <span>{financials.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-sm font-medium">
                  <span>{t.platformFee}</span>
                  <span>{financials.platformFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-sm font-medium">
                  <span>{t.vat}</span>
                  <span>{financials.vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {financials.wht > 0 && (
                   <div className="flex justify-between text-rose-500 text-sm font-bold bg-rose-50 p-2 rounded-lg">
                      <span>{t.wht}</span>
                      <span>-{financials.wht.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                   </div>
                )}
              </div>

              <div className="bg-slate-900 rounded-2xl p-4 mt-6 text-white shadow-lg shadow-slate-300">
                <div className="flex justify-between items-end">
                   <span className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">{t.netPayable}</span>
                   <span className="text-2xl font-extrabold text-rose-400">฿{financials.netPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <button 
                disabled={hasCriticalErrors || cart.length === 0}
                className={`
                  w-full py-4 rounded-2xl font-bold mt-4 text-base transition-all transform active:scale-95
                  ${hasCriticalErrors || cart.length === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-200'}
                `}
                onClick={onCheckout}
              >
                {hasCriticalErrors ? t.fixIssues : t.checkout}
              </button>
            </>
          )}
        </div>
      </div>
      
    </div>
  );
};