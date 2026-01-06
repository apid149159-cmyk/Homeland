import React from 'react';
import { Sparkles, MapPin, Users, CheckCircle, Calendar, Type, Plus, Trash2 } from 'lucide-react';
import { THEMES, MOCK_VENUES, SEASONAL_THEMES } from '../constants';
import { useGlobal } from '../contexts/GlobalContext';
import { useEvent } from '../contexts/EventContext';
import { Venue } from '../types';

export const ConfigPanel: React.FC = () => {
  const { t, lang } = useGlobal();
  const { eventConfig, setEventConfig } = useEvent();
  
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate active month for seasonal themes
  const primaryDate = eventConfig.dates && eventConfig.dates.length > 0 ? new Date(eventConfig.dates[0]) : new Date();
  const currentMonth = primaryDate.getMonth(); // 0-11
  const seasonalThemes = SEASONAL_THEMES[currentMonth] || [];

  const handleVenueSelect = (venue: Venue) => {
    setEventConfig({
      ...eventConfig,
      areaSqm: venue.areaSqm,
      selectedVenueId: venue.id
    });
  };

  const handleAddDate = () => {
      const newDates = [...(eventConfig.dates || []), today];
      setEventConfig({...eventConfig, dates: newDates});
  };

  const handleRemoveDate = (index: number) => {
      const newDates = eventConfig.dates.filter((_, i) => i !== index);
      setEventConfig({...eventConfig, dates: newDates});
  };

  const handleDateChange = (index: number, value: string) => {
      const newDates = [...eventConfig.dates];
      newDates[index] = value;
      newDates.sort();
      setEventConfig({...eventConfig, dates: newDates});
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border-0 overflow-hidden">
      
      {/* Header */}
      <div className="bg-rose-50 p-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl text-rose-500 shadow-sm">
            <Sparkles size={20} />
          </div>
          1. {t.eventEssentials}
        </h2>
        <p className="text-sm text-slate-500 mt-2 ml-12">{t.eventEssentialsDesc}</p>
      </div>
      
      <div className="p-6 space-y-8">
        
        {/* Event Name */}
        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 flex items-center gap-2 pl-1">
              <Type size={16} className="text-rose-400" /> {t.eventName}
            </label>
            <input 
              type="text" 
              className="bg-slate-50 hover:bg-white border-2 border-transparent hover:border-rose-200 focus:border-rose-400 text-slate-900 text-base rounded-2xl block w-full p-4 transition-all placeholder:text-slate-300 outline-none"
              value={eventConfig.eventName || ''}
              onChange={(e) => setEventConfig({...eventConfig, eventName: e.target.value})}
              placeholder={t.eventNamePlaceholder}
            />
        </div>

        {/* Basic Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 pl-1">{t.themeConcept}</label>
            <div className="relative group">
              <select 
                className="w-full bg-slate-50 hover:bg-white border-2 border-transparent hover:border-rose-200 focus:border-rose-400 text-slate-900 text-base rounded-2xl block p-4 transition-all cursor-pointer outline-none appearance-none"
                value={eventConfig.theme}
                onChange={(e) => setEventConfig({...eventConfig, theme: e.target.value})}
              >
                {/* Seasonal Themes */}
                {seasonalThemes.length > 0 && (
                    <optgroup label={t.seasonalThemes}>
                        {seasonalThemes.map(theme => (
                            <option key={theme} value={theme}>
                                {(t[theme as keyof typeof t] as string) || theme}
                            </option>
                        ))}
                    </optgroup>
                )}

                {/* Standard Themes */}
                <optgroup label={t.standardThemes}>
                    {THEMES.map(theme => (
                    <option key={theme} value={theme}>{theme}</option>
                    ))}
                </optgroup>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 flex items-center gap-2 pl-1">
              <Users size={16} className="text-rose-400" /> {t.expectedGuests}
            </label>
            <input 
              type="number" 
              min="10"
              className="bg-slate-50 hover:bg-white border-2 border-transparent hover:border-rose-200 focus:border-rose-400 text-slate-900 text-base rounded-2xl block w-full p-4 transition-all outline-none"
              value={eventConfig.pax || ''}
              onChange={(e) => setEventConfig({...eventConfig, pax: Math.max(0, parseInt(e.target.value) || 0)})}
              placeholder="100"
            />
          </div>
        </div>

        {/* Date Selection (Multiple) */}
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-600 flex items-center gap-2 pl-1">
                    <Calendar size={16} className="text-rose-400" /> {t.eventDates}
                </label>
                <button 
                    onClick={handleAddDate}
                    className="text-xs font-bold bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-rose-200 transition-colors"
                >
                    <Plus size={14}/> {t.addDate}
                </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {eventConfig.dates && eventConfig.dates.map((date, idx) => (
                    <div key={idx} className="flex gap-2">
                        <input 
                            type="date" 
                            min={today}
                            className="bg-slate-50 hover:bg-white border-2 border-transparent hover:border-rose-200 focus:border-rose-400 text-slate-900 text-sm rounded-xl block w-full p-3 transition-all outline-none"
                            value={date}
                            onChange={(e) => handleDateChange(idx, e.target.value)}
                        />
                        {eventConfig.dates.length > 1 && (
                            <button 
                                onClick={() => handleRemoveDate(idx)}
                                className="bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 p-3 rounded-xl transition-colors"
                            >
                                <Trash2 size={18}/>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Venue Selection */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-slate-600 flex items-center justify-between pl-1">
            <span className="flex items-center gap-2"><MapPin size={16} className="text-rose-400"/> {t.selectVenue}</span>
            {eventConfig.selectedVenueId && <span className="text-emerald-500 text-xs font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg"><CheckCircle size={14}/> {t.venueSelected}</span>}
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_VENUES.map((venue) => {
              const isSelected = eventConfig.selectedVenueId === venue.id;
              const isTooSmall = venue.capacityMax < eventConfig.pax;
              const displayName = lang === 'TH' ? (venue.name_th || venue.name) : venue.name;
              
              return (
                <div 
                  key={venue.id}
                  onClick={() => handleVenueSelect(venue)}
                  className={`
                    relative rounded-3xl p-3 cursor-pointer transition-all duration-300 flex flex-col gap-3 group overflow-hidden
                    ${isSelected 
                      ? 'bg-rose-50 ring-2 ring-rose-400 shadow-lg' 
                      : 'bg-white border border-slate-100 hover:shadow-xl hover:-translate-y-1'}
                    ${isTooSmall && !isSelected ? 'opacity-50 grayscale' : ''}
                  `}
                >
                  <div className="h-32 rounded-2xl overflow-hidden relative">
                     <img src={venue.image} alt={displayName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                     <span className="absolute bottom-2 left-2 text-white text-xs font-bold">{venue.type}</span>
                  </div>
                  
                  <div className="px-1">
                    <h3 className={`font-bold text-sm leading-tight ${isSelected ? 'text-rose-900' : 'text-slate-700'}`}>
                      {displayName}
                    </h3>
                  </div>

                  <div className="mt-auto flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>{venue.areaSqm} m²</span>
                    <span className={`${isTooSmall ? 'text-rose-500 font-bold' : ''}`}>{t.maxPax} {venue.capacityMax}</span>
                  </div>
                  
                  {isTooSmall && (
                    <div className="absolute top-2 right-2 text-[10px] font-bold text-white bg-rose-500 px-2 py-1 rounded-full shadow-sm">
                      {t.tooSmall}
                    </div>
                  )}
                  
                  <div className={`text-sm font-bold mt-1 px-1 ${isSelected ? 'text-rose-600' : 'text-slate-800'}`}>
                    ฿{venue.price.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};