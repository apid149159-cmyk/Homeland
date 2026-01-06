import React, { useState } from 'react';
import { Map, Plus, Lock, Unlock, Store, User, X } from 'lucide-react';
import { Zone, Booth, Vendor } from '../../types';
import { TRANSLATIONS, Language } from '../../translations';

interface ZoneManagerProps {
  zones: Zone[];
  booths: Booth[];
  vendors: Vendor[];
  setZones: (zones: Zone[]) => void;
  setBooths: (booths: Booth[]) => void;
  lang: Language;
}

export const ZoneManager: React.FC<ZoneManagerProps> = ({ 
  zones, booths, vendors, setZones, setBooths, lang 
}) => {
  const t = TRANSLATIONS[lang];
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || '');
  const [editingBooth, setEditingBooth] = useState<Booth | null>(null);

  // Filter booths for current zone
  const currentBooths = booths.filter(b => b.zoneId === selectedZoneId);
  const currentZone = zones.find(z => z.id === selectedZoneId);

  const handleUpdateBooth = (updatedBooth: Booth) => {
      setBooths(booths.map(b => b.id === updatedBooth.id ? updatedBooth : b));
      setEditingBooth(null);
  };

  const BoothModal = () => {
      if (!editingBooth) return null;
      
      const assignedVendor = vendors.find(v => v.id === editingBooth.vendorId);

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-xl shadow-sm text-slate-800 font-bold border border-slate-200">
                              {editingBooth.code}
                          </div>
                          <h3 className="font-bold text-lg text-slate-800">{t.updateBooth}</h3>
                      </div>
                      <button onClick={() => setEditingBooth(null)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20}/></button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      {/* Vendor Assignment */}
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t.assignVendor}</label>
                          <select 
                              className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none font-bold"
                              value={editingBooth.vendorId || ''}
                              onChange={(e) => {
                                  const vId = Number(e.target.value);
                                  handleUpdateBooth({
                                      ...editingBooth,
                                      vendorId: vId || undefined,
                                      status: vId ? 'OCCUPIED' : 'AVAILABLE'
                                  });
                              }}
                          >
                              <option value="">-- {t.selectVendor} --</option>
                              {vendors.map(v => (
                                  <option key={v.id} value={v.id}>{v.name} ({v.type})</option>
                              ))}
                          </select>
                      </div>

                      {/* Manual Lock/Unlock */}
                      <div className="flex gap-3">
                          <button 
                              onClick={() => handleUpdateBooth({ ...editingBooth, status: 'LOCKED', vendorId: undefined })}
                              className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 ${editingBooth.status === 'LOCKED' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}
                          >
                              <Lock size={18} /> {t.lockBooth}
                          </button>
                          <button 
                              onClick={() => handleUpdateBooth({ ...editingBooth, status: 'AVAILABLE', vendorId: undefined })}
                              className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 ${editingBooth.status === 'AVAILABLE' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}
                          >
                              <Unlock size={18} /> {t.unlockBooth}
                          </button>
                      </div>

                      {editingBooth.vendorId && (
                          <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3 border border-slate-100">
                              {assignedVendor && <img src={assignedVendor.image} className="w-10 h-10 rounded-lg object-cover" />}
                              <div>
                                  <p className="text-xs font-bold text-slate-400">Current Occupant</p>
                                  <p className="font-bold text-slate-800">{assignedVendor?.name}</p>
                              </div>
                              <button 
                                onClick={() => handleUpdateBooth({ ...editingBooth, vendorId: undefined, status: 'AVAILABLE' })}
                                className="ml-auto text-xs font-bold text-rose-500 hover:underline"
                              >
                                  {t.clearAssignment}
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6">
       {/* Left: Zone List */}
       <div className="w-64 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
           <div className="p-5 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-slate-800">{t.zones}</h3>
               <button className="p-1.5 bg-slate-100 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-colors"><Plus size={16}/></button>
           </div>
           <div className="flex-1 overflow-y-auto p-3 space-y-2">
               {zones.map(zone => (
                   <button
                       key={zone.id}
                       onClick={() => setSelectedZoneId(zone.id)}
                       className={`w-full text-left p-3 rounded-xl font-bold text-sm flex items-center justify-between transition-all ${selectedZoneId === zone.id ? 'bg-slate-900 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}
                   >
                       <span>{zone.name}</span>
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: zone.color }}></div>
                   </button>
               ))}
           </div>
       </div>

       {/* Right: Layout Grid */}
       <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-8 overflow-y-auto">
           <div className="flex justify-between items-center mb-8">
               <div>
                   <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                       <Map className="text-rose-500" /> {currentZone?.name}
                   </h2>
                   <p className="text-slate-500 text-sm">{t.manageLayout}</p>
               </div>
               <div className="flex gap-4 text-xs font-bold">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-400"></div> {t.available}</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500"></div> {t.occupied}</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-300"></div> {t.locked}</div>
               </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
               {currentBooths.map(booth => {
                   const assignedVendor = vendors.find(v => v.id === booth.vendorId);
                   return (
                       <button 
                           key={booth.id}
                           onClick={() => setEditingBooth(booth)}
                           className={`
                               h-32 rounded-2xl border-2 p-4 flex flex-col justify-between transition-all hover:scale-[1.02] hover:shadow-lg text-left relative overflow-hidden
                               ${booth.status === 'AVAILABLE' ? 'border-emerald-100 bg-emerald-50/50 hover:border-emerald-300' : ''}
                               ${booth.status === 'OCCUPIED' ? 'border-indigo-100 bg-indigo-50/50 hover:border-indigo-300' : ''}
                               ${booth.status === 'LOCKED' ? 'border-slate-100 bg-slate-100 cursor-not-allowed opacity-70' : ''}
                           `}
                       >
                           {booth.status === 'LOCKED' && (
                               <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#e2e8f0_10px,#e2e8f0_20px)] opacity-50 pointer-events-none"></div>
                           )}
                           
                           <div className="flex justify-between items-start z-10">
                               <span className={`text-sm font-black ${booth.status === 'AVAILABLE' ? 'text-emerald-600' : booth.status === 'OCCUPIED' ? 'text-indigo-600' : 'text-slate-400'}`}>
                                   {booth.code}
                               </span>
                               {booth.status === 'LOCKED' && <Lock size={14} className="text-slate-400"/>}
                           </div>

                           <div className="z-10">
                               {assignedVendor ? (
                                   <>
                                     <p className="text-xs font-bold text-slate-800 line-clamp-1">{assignedVendor.name}</p>
                                     <p className="text-[10px] text-slate-500 uppercase">{assignedVendor.type}</p>
                                   </>
                               ) : (
                                   <span className={`text-xs font-bold ${booth.status === 'LOCKED' ? 'text-slate-400' : 'text-emerald-400'}`}>
                                       {booth.status === 'LOCKED' ? 'Maintenance' : 'Empty Slot'}
                                   </span>
                               )}
                           </div>
                       </button>
                   );
               })}
               
               {/* Add Booth Button (Mock) */}
               <button className="h-32 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:text-rose-500 hover:border-rose-300 hover:bg-rose-50 transition-all gap-2">
                   <Plus size={24} />
                   <span className="text-xs font-bold">{t.addZone}</span>
               </button>
           </div>
       </div>

       <BoothModal />
    </div>
  );
};