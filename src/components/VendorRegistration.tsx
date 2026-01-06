import React, { useState } from 'react';
import { Shirt, Truck, Utensils, Music, Check, ArrowRight, ArrowLeft, Upload, Store, User, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Vendor, VendorType } from '../types';
import { TRANSLATIONS, Language } from '../translations';
import { VendorCard } from './VendorCard';

interface VendorRegistrationProps {
  onRegister: (vendor: Vendor) => void;
  onBack: () => void;
  lang: Language;
}

export const VendorRegistration: React.FC<VendorRegistrationProps> = ({ onRegister, onBack, lang }) => {
  const t = TRANSLATIONS[lang];
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Vendor>>({
     type: 'FASHION',
     name: '',
     name_th: '',
     description: '',
     description_th: '',
     price: 0,
     image: '',
     tags: [],
     specs: { area: 0, power: 0, width: 2, depth: 2 },
     sponsor: '' // New Sponsor Field
  });

  // Calculate area automatically from w x d
  const updateArea = (w: number, d: number) => {
      setFormData(prev => ({
          ...prev,
          specs: { ...prev.specs, width: w, depth: d, area: w * d }
      }));
  };

  const handleImageUpload = (file: File) => {
    if (file) {
        if (file.size > 2 * 1024 * 1024) { // 2MB Limit
            alert("File is too large. Max size is 2MB.");
            return;
        }
        
        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, image: reader.result as string }));
            setIsUploading(false);
        };
        reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleImageUpload(file);
  };

  const categories = [
      { id: 'FASHION', label: t.catFashion, icon: Shirt, color: 'bg-purple-100 text-purple-600', tags: ['Fashion', 'Retail'] },
      { id: 'FOOD', label: t.catFood, icon: Utensils, color: 'bg-orange-100 text-orange-600', tags: ['Food', 'Stall'] },
      { id: 'FOOD_TRUCK', label: t.catFoodTruck, icon: Truck, color: 'bg-emerald-100 text-emerald-600', tags: ['Food', 'Truck', 'Street'] },
      { id: 'BAND', label: t.catBand, icon: Music, color: 'bg-rose-100 text-rose-600', tags: ['Music', 'Live'] },
  ];

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Auto-assign tags based on category
      const selectedCat = categories.find(c => c.id === formData.type);
      const autoTags = selectedCat ? selectedCat.tags : [];
      
      const newVendor: Vendor = {
          id: Date.now(),
          type: formData.type as VendorType,
          name: formData.name || 'Untitled Shop',
          name_th: formData.name_th,
          description: formData.description,
          description_th: formData.description_th,
          price: Number(formData.price),
          image: formData.image || 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=400',
          tags: [...autoTags],
          specs: {
              ...formData.specs,
              area: (formData.specs?.width || 0) * (formData.specs?.depth || 0)
          },
          sponsor: formData.sponsor // Add sponsor
      };
      
      onRegister(newVendor);
      setSuccess(true);
  };

  if (success) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
              <div className="text-center bg-white p-12 rounded-[2.5rem] shadow-xl max-w-md w-full animate-in zoom-in-95">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check size={40} className="stroke-[3]"/>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{t.registerSuccess}</h2>
                  <p className="text-slate-500 mb-8">{t.registerSuccessDesc}</p>
                  <button onClick={onBack} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors">
                      {t.backToLogin}
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        
        {/* Left: Progress & Info */}
        <div className="w-full md:w-1/3 bg-white p-8 md:p-12 border-r border-slate-100 flex flex-col">
            <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold mb-8 transition-colors">
                <ArrowLeft size={18}/> {t.backToLogin}
            </button>
            
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{t.vendorRegistration}</h1>
            <p className="text-slate-500 mb-10">{t.joinPlatform}</p>

            <div className="space-y-6">
                {[t.stepCategory, t.stepDetails, t.stepSpecs, t.stepReview].map((label, idx) => (
                    <div key={idx} className={`flex items-center gap-4 ${step === idx + 1 ? 'opacity-100' : 'opacity-40'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 ${step === idx + 1 ? 'border-rose-500 text-rose-500 bg-rose-50' : step > idx + 1 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-slate-300'}`}>
                            {step > idx + 1 ? <Check size={18}/> : idx + 1}
                        </div>
                        <span className={`font-bold ${step === idx + 1 ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-8">
                 <p className="text-xs text-slate-300">© 2024 Homeland Event Platform.</p>
            </div>
        </div>

        {/* Right: Form Area */}
        <div className="w-full md:w-2/3 p-8 md:p-12 overflow-y-auto">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Step 1: Category */}
                {step === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">{t.stepCategory}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setFormData({...formData, type: cat.id as VendorType})}
                                    className={`p-6 rounded-3xl border-2 text-left transition-all ${formData.type === cat.id ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-200' : 'border-slate-100 hover:border-rose-200 bg-white'}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${cat.color}`}>
                                        <cat.icon size={24}/>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800">{cat.label}</h3>
                                    <div className="flex gap-2 mt-2">
                                        {cat.tags.map(tag => (
                                            <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{tag}</span>
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Details */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">{t.stepDetails}</h2>
                        
                        {/* Image Upload */}
                        <div 
                            className={`
                                relative border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer group
                                ${isDragging ? 'border-rose-500 bg-rose-50' : 'border-slate-200 hover:border-rose-300 hover:bg-slate-50'}
                            `}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                        >
                            <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/png, image/jpeg"
                                onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                            />
                            {formData.image ? (
                                <div className="relative w-48 h-32 mx-auto rounded-xl overflow-hidden shadow-lg">
                                    <img src={formData.image} className="w-full h-full object-cover"/>
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-xs font-bold">{t.uploadImage}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        {isUploading ? <Loader2 size={32} className="animate-spin"/> : <Upload size={32}/>}
                                    </div>
                                    <p className="font-bold text-slate-700">{t.uploadImage}</p>
                                    <p className="text-sm text-slate-400">{t.dragDrop}</p>
                                    <p className="text-xs text-slate-300 mt-2">{t.maxSize}</p>
                                </div>
                            )}
                        </div>

                        {/* Name Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t.shopName}</label>
                                <input required type="text" className="w-full p-3 bg-slate-50 border-2 border-transparent hover:border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-300 transition-all outline-none font-bold"
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t.shopNameTh}</label>
                                <input type="text" className="w-full p-3 bg-slate-50 border-2 border-transparent hover:border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-300 transition-all outline-none"
                                    value={formData.name_th} onChange={e => setFormData({...formData, name_th: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Description Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t.description}</label>
                                <textarea rows={3} className="w-full p-3 bg-slate-50 border-2 border-transparent hover:border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-300 transition-all outline-none text-sm"
                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t.descriptionTh}</label>
                                <textarea rows={3} className="w-full p-3 bg-slate-50 border-2 border-transparent hover:border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-300 transition-all outline-none text-sm"
                                    value={formData.description_th} onChange={e => setFormData({...formData, description_th: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Price & Sponsor */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t.basePrice}</label>
                                <input required type="number" className="w-full p-3 bg-slate-50 border-2 border-transparent hover:border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-300 transition-all outline-none font-bold text-rose-500"
                                    value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})}
                                />
                            </div>
                            
                            {/* Sponsor Code Input (New) */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">{t.sponsorName}</label>
                                <div className="relative group">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                                    <input 
                                        type="text" 
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-transparent hover:border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-300 transition-all outline-none font-bold"
                                        placeholder="Optional"
                                        value={formData.sponsor || ''}
                                        onChange={e => setFormData({...formData, sponsor: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Technical Specs */}
                {step === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">{t.stepSpecs}</h2>
                        
                        {/* Dimension Inputs */}
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2"><Store size={18}/> {t.specDimensions}</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-slate-500 uppercase font-bold">{t.width} (m)</span>
                                    <input type="number" className="w-full p-3 mt-1 bg-white rounded-xl border border-slate-200 outline-none focus:border-rose-300"
                                        value={formData.specs?.width} 
                                        onChange={e => updateArea(parseFloat(e.target.value) || 0, formData.specs?.depth || 0)}
                                    />
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 uppercase font-bold">{t.depth} (m)</span>
                                    <input type="number" className="w-full p-3 mt-1 bg-white rounded-xl border border-slate-200 outline-none focus:border-rose-300"
                                        value={formData.specs?.depth} 
                                        onChange={e => updateArea(formData.specs?.width || 0, parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <span className="text-sm font-bold text-slate-500">Total Area: </span>
                                <span className="text-xl font-bold text-rose-500">{formData.specs?.area?.toFixed(2)} m²</span>
                            </div>
                        </div>

                         {/* Power Input */}
                         <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">{t.powerReq}</label>
                            <input type="number" className="w-full p-3 bg-slate-50 border-2 border-transparent hover:border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-300 transition-all outline-none"
                                value={formData.specs?.power} onChange={e => setFormData({...formData, specs: {...formData.specs, power: parseInt(e.target.value)}})}
                            />
                        </div>

                    </div>
                )}

                {/* Step 4: Review */}
                {step === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">{t.stepReview}</h2>
                        
                        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm">
                             {/* Preview Card */}
                             <div className="pointer-events-none mb-6">
                                <VendorCard 
                                    vendor={formData as Vendor} 
                                    lang={lang}
                                    isSelected={false}
                                    isThemeMatch={true}
                                />
                             </div>

                             <div className="space-y-4">
                                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                     <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Store size={16}/> {t.stepDetails}</h3>
                                     <div className="grid grid-cols-2 gap-4 text-sm">
                                         <div>
                                             <span className="block text-slate-400 text-xs uppercase">{t.width}</span>
                                             <span className="font-bold">{formData.specs?.width}m</span>
                                         </div>
                                         <div>
                                             <span className="block text-slate-400 text-xs uppercase">{t.depth}</span>
                                             <span className="font-bold">{formData.specs?.depth}m</span>
                                         </div>
                                          <div>
                                             <span className="block text-slate-400 text-xs uppercase">Power</span>
                                             <span className="font-bold">{formData.specs?.power}W</span>
                                         </div>
                                     </div>
                                     {formData.sponsor && (
                                        <div className="flex justify-between text-sm pt-2 border-t border-slate-200 mt-2">
                                            <span className="text-slate-500">{t.sponsorName}</span>
                                            <span className="font-bold text-slate-700">{formData.sponsor}</span>
                                        </div>
                                     )}
                                 </div>
                             </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-4 border-t border-slate-100">
                    {step > 1 && (
                        <button type="button" onClick={() => setStep(step - 1)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                            Back
                        </button>
                    )}
                    {step < 4 ? (
                        <button type="button" onClick={() => setStep(step + 1)} className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                            Next Step <ArrowRight size={18}/>
                        </button>
                    ) : (
                        <button type="submit" className="flex-1 py-4 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-200">
                            {t.submitApplication} <Check size={18}/>
                        </button>
                    )}
                </div>

            </form>
        </div>
    </div>
  );
};