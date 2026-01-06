import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Type, Layout, Palette, Music, Sparkles, Loader2, Wand2, Calendar, MapPin, Briefcase, Plus, Trash2 } from 'lucide-react';
import { EventConfig, Vendor } from '../types';
import { MOCK_VENUES } from '../constants';
import { TRANSLATIONS, Language } from '../translations';
import html2canvas from 'html2canvas';
import { GoogleGenAI } from "@google/genai";

interface PosterDesignerProps {
  isOpen: boolean;
  onClose: () => void;
  config: EventConfig;
  cart: Vendor[];
  lang: Language;
}

type TemplateType = 'MODERN' | 'RETRO' | 'LUXURY';

// Mock Sponsor Logos for quick addition
const PRESET_SPONSORS = [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/368px-Google_2015_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/603px-Amazon_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/799px-Netflix_2015_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/264px-Instagram_logo_2016.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/800px-Meta_Platforms_Inc._logo.svg.png'
];

export const PosterDesigner: React.FC<PosterDesignerProps> = ({ isOpen, onClose, config, cart, lang }) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[lang];
  
  const [template, setTemplate] = useState<TemplateType>('MODERN');
  
  // Content State
  const [headline, setHeadline] = useState(config.eventName || 'LIVE EVENT');
  const [posterLocation, setPosterLocation] = useState('');
  const [posterDateTime, setPosterDateTime] = useState('TBA');
  const [showLineup, setShowLineup] = useState(true);
  
  // Sponsors State
  const [sponsors, setSponsors] = useState<string[]>([]);
  const [customSponsorUrl, setCustomSponsorUrl] = useState('');

  const [isDownloading, setIsDownloading] = useState(false);
  
  // AI State
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiBackground, setAiBackground] = useState<string | null>(null);

  const posterRef = useRef<HTMLDivElement>(null);
  const venue = MOCK_VENUES.find(v => v.id === config.selectedVenueId);
  const bands = cart.filter(v => v.type === 'BAND' || v.type === 'SOUND');

  // Initialize fields
  useEffect(() => {
    if (config.eventName) setHeadline(config.eventName);
    if (venue) setPosterLocation(lang === 'TH' ? venue.name_th || venue.name : venue.name);
    if (config.dates && config.dates.length > 0) {
        setPosterDateTime(config.dates.sort().join(' & '));
    }
  }, [config.eventName, config.dates, venue, lang]);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setIsDownloading(true);
    try {
        const canvas = await html2canvas(posterRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: null
        });
        const link = document.createElement('a');
        link.download = `poster-${headline.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error("Poster generation failed", err);
    } finally {
        setIsDownloading(false);
    }
  };

  const handleAddSponsor = (url: string) => {
      if (url && !sponsors.includes(url)) {
          setSponsors([...sponsors, url]);
      }
      setCustomSponsorUrl('');
  };

  const handleRemoveSponsor = (index: number) => {
      setSponsors(sponsors.filter((_, i) => i !== index));
  };

  const handleGenerateAI = async () => {
    if (!process.env.API_KEY) {
        alert("API Key not configured");
        return;
    }
    
    setIsGeneratingAI(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `Design a high-quality, professional event poster background art for a '${config.theme}' themed event named '${headline}'. 
        Style: Cinematic, ${config.theme} aesthetic, artistic, high contrast, suitable for overlay text. 
        Abstract or scenic elements that represent the theme. 
        Do NOT include any text, letters, or words in the image. 
        Aspect ratio 9:16 (vertical).`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: { aspectRatio: "9:16" } 
            }
        });

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    setAiBackground(`data:image/png;base64,${part.inlineData.data}`);
                    break;
                }
            }
        }
    } catch (e) {
        console.error("AI Generation Failed:", e);
        alert(t.aiError);
    } finally {
        setIsGeneratingAI(false);
    }
  };

  const TemplatePreview = ({ type, label }: { type: TemplateType, label: string }) => (
    <button 
        onClick={() => setTemplate(type)}
        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${template === type ? 'border-rose-500 bg-rose-50' : 'border-slate-100 hover:border-rose-200'}`}
    >
        <div className={`w-full h-16 rounded-lg shadow-sm ${
            type === 'MODERN' ? 'bg-white border border-slate-200' : 
            type === 'RETRO' ? 'bg-[#FDF6E3] border border-amber-200' : 'bg-slate-900'
        }`}></div>
        <span className={`text-xs font-bold ${template === type ? 'text-rose-600' : 'text-slate-500'}`}>{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-7xl h-[90vh] rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Left Sidebar: Controls */}
        <div className="w-full md:w-[28rem] bg-slate-50 border-r border-slate-200 flex flex-col h-full">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Palette className="text-rose-500" /> {t.posterStudio}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                    <X size={20} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                {/* 1. Templates */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Layout size={14}/> {t.selectTemplate}
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        <TemplatePreview type="MODERN" label={t.modern} />
                        <TemplatePreview type="RETRO" label={t.retro} />
                        <TemplatePreview type="LUXURY" label={t.luxury} />
                    </div>
                </div>

                {/* 2. Main Content */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                        <Type size={14}/> {t.customize}
                    </h3>
                    
                    {/* Headline */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">{t.customHeadline}</label>
                        <input 
                            type="text" 
                            value={headline} 
                            onChange={(e) => setHeadline(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-rose-200 outline-none font-bold text-sm"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase flex items-center gap-1"><MapPin size={10}/> {t.posterLocation}</label>
                        <input 
                            type="text" 
                            value={posterLocation} 
                            onChange={(e) => setPosterLocation(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-rose-200 outline-none text-sm"
                        />
                    </div>

                    {/* Date/Time */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase flex items-center gap-1"><Calendar size={10}/> {t.posterDateTime}</label>
                        <input 
                            type="text" 
                            value={posterDateTime} 
                            onChange={(e) => setPosterDateTime(e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-rose-200 outline-none text-sm"
                        />
                    </div>

                    <label className="flex items-center gap-3 pt-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={showLineup} 
                            onChange={(e) => setShowLineup(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-rose-500 focus:ring-rose-200"
                        />
                        <span className="text-sm font-bold text-slate-700">{t.showLineup}</span>
                    </label>
                </div>

                {/* 3. Sponsors Management (NEW) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                        <Briefcase size={14}/> {t.sponsors}
                    </h3>
                    
                    {/* Add URL */}
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder={t.sponsorUrl}
                            value={customSponsorUrl}
                            onChange={(e) => setCustomSponsorUrl(e.target.value)}
                            className="flex-1 p-2 rounded-lg border border-slate-200 text-xs"
                        />
                        <button 
                            onClick={() => handleAddSponsor(customSponsorUrl)}
                            className="bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-500 p-2 rounded-lg transition-colors"
                        >
                            <Plus size={16}/>
                        </button>
                    </div>

                    {/* Presets */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {PRESET_SPONSORS.map((url, idx) => (
                            <button key={idx} onClick={() => handleAddSponsor(url)} className="w-10 h-10 shrink-0 border border-slate-100 rounded-lg p-1 hover:border-rose-300 bg-white">
                                <img src={url} className="w-full h-full object-contain" alt="preset" />
                            </button>
                        ))}
                    </div>

                    {/* Active List */}
                    {sponsors.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                            {sponsors.map((url, idx) => (
                                <div key={idx} className="relative group bg-slate-50 rounded-lg p-2 border border-slate-100 h-12 flex items-center justify-center">
                                    <img src={url} className="w-full h-full object-contain mix-blend-multiply" alt="sponsor" />
                                    <button 
                                        onClick={() => handleRemoveSponsor(idx)}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={10}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 4. AI Magic */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-2xl shadow-lg text-white">
                    <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Sparkles size={14}/> {t.aiMagic}
                    </h3>
                    <button 
                        onClick={handleGenerateAI}
                        disabled={isGeneratingAI}
                        className="w-full bg-white/20 hover:bg-white/30 border border-white/20 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-bold backdrop-blur-sm transition-all disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isGeneratingAI ? (
                            <><Loader2 size={18} className="animate-spin" /> {t.generating}</>
                        ) : (
                            <><Wand2 size={18} /> {t.generateAI}</>
                        )}
                    </button>
                    {aiBackground && (
                        <button 
                            onClick={() => setAiBackground(null)} 
                            className="text-[10px] text-white/80 font-bold mt-2 hover:text-white text-center w-full underline decoration-white/30"
                        >
                            {t.reset} Background
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6 border-t border-slate-200 bg-white">
                <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                    {t.downloadPoster}
                </button>
            </div>
        </div>

        {/* Right Area: Canvas Preview */}
        <div className="flex-1 bg-slate-200 overflow-auto flex items-center justify-center p-8 relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            {/* --- ACTUAL POSTER CANVAS --- */}
            <div 
                ref={posterRef}
                className="w-[500px] h-[889px] shadow-2xl transition-all duration-500 relative flex flex-col overflow-hidden shrink-0"
                style={{
                    backgroundColor: template === 'LUXURY' ? '#0f172a' : template === 'RETRO' ? '#FDF6E3' : '#FFFFFF',
                    color: template === 'LUXURY' ? '#FFFFFF' : '#1e293b',
                    fontFamily: template === 'RETRO' ? '"Courier New", Courier, monospace' : 'inherit'
                }}
            >
                {/* Background Image (Venue or AI) */}
                <div className={`absolute inset-0 z-0 ${aiBackground ? 'opacity-100' : 'opacity-40'} transition-opacity duration-500`}>
                    <img 
                        src={aiBackground || venue?.image || ''} 
                        className={`w-full h-full object-cover ${!aiBackground && template === 'RETRO' ? 'sepia contrast-125' : ''} ${!aiBackground && template === 'LUXURY' ? 'brightness-50 grayscale' : ''}`} 
                        alt="Poster Background"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 ${
                        template === 'MODERN' ? 'bg-gradient-to-t from-white via-white/40 to-transparent' : 
                        template === 'LUXURY' ? 'bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent' : 
                        'bg-[#FDF6E3]/60'
                    }`}></div>
                </div>

                {/* Content Layer */}
                <div className="relative z-10 flex-1 flex flex-col p-8 items-center text-center">
                    
                    {/* Header */}
                    <div className="mt-16 mb-auto">
                        <p className={`text-sm tracking-[0.3em] font-bold mb-4 uppercase ${
                            template === 'MODERN' ? 'text-rose-500' :
                            template === 'RETRO' ? 'text-amber-900 border-b-2 border-amber-900 inline-block pb-1' :
                            'text-emerald-400'
                        }`}>
                            {t.posterGenerated}
                        </p>
                        <h1 className={`leading-none uppercase break-words max-w-md mx-auto ${
                            template === 'MODERN' ? 'text-6xl font-black tracking-tighter' :
                            template === 'RETRO' ? 'text-5xl font-bold tracking-tight' :
                            'text-6xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                        }`}>
                            {headline}
                        </h1>
                    </div>

                    {/* Middle: Lineup */}
                    {showLineup && (
                        <div className="w-full my-12 space-y-4">
                            {bands.length > 0 ? (
                                <>
                                    <div className="flex flex-wrap justify-center gap-6 items-center">
                                        {bands.slice(0, 1).map((b) => (
                                            <div key={b.id} className={`${template === 'LUXURY' ? 'text-3xl' : 'text-4xl'} font-bold`}>
                                                {lang === 'TH' ? (b.name_th || b.name) : b.name}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-8">
                                        {bands.slice(1).map((b) => (
                                            <div key={b.id} className={`${template === 'LUXURY' ? 'text-slate-300' : 'text-slate-700'} font-bold text-lg`}>
                                                {lang === 'TH' ? (b.name_th || b.name) : b.name}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="border-2 border-dashed border-slate-300/50 rounded-xl p-8 opacity-50">
                                    <Music className="mx-auto mb-2" />
                                    <p className="text-sm font-bold">Artist Lineup Area</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer: Details & Sponsors */}
                    <div className="w-full mt-auto space-y-6">
                        {/* Event Details */}
                        <div className={`w-full border-t pt-6 flex justify-between items-end text-left ${
                            template === 'MODERN' ? 'border-slate-900/10' :
                            template === 'LUXURY' ? 'border-slate-700 text-slate-400' :
                            'border-amber-900/20 text-amber-900'
                        }`}>
                            <div>
                                <p className="font-bold text-xl">{posterDateTime}</p>
                                <p className="text-sm opacity-80 font-medium">{posterLocation || 'VENUE TBA'}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold opacity-60 mb-1 tracking-widest">TICKETS AVAILABLE AT</p>
                                <p className="text-sm font-bold">HOMELAND-EVENT.COM</p>
                            </div>
                        </div>

                        {/* Sponsors Bar */}
                        {sponsors.length > 0 && (
                            <div className={`w-full pt-4 border-t flex justify-center items-center gap-6 flex-wrap ${
                                template === 'MODERN' ? 'border-slate-900/5' :
                                template === 'LUXURY' ? 'border-slate-800' :
                                'border-amber-900/10'
                            }`}>
                                {sponsors.map((url, idx) => (
                                    <img 
                                        key={idx} 
                                        src={url} 
                                        alt="sponsor" 
                                        className={`h-8 object-contain ${template === 'LUXURY' ? 'brightness-0 invert opacity-70' : 'mix-blend-multiply opacity-80'}`} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Decorative Elements */}
                    {template === 'RETRO' && (
                        <div className="absolute inset-0 border-[12px] border-double border-amber-900/10 pointer-events-none"></div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};