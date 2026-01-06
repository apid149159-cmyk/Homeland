import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Vendor, VendorType } from '../../types';
import { TRANSLATIONS, Language } from '../../translations';

interface VendorManagerProps {
  vendors: Vendor[];
  setVendors: (vendors: Vendor[]) => void;
  lang: Language;
}

export const VendorManager: React.FC<VendorManagerProps> = ({ vendors, setVendors, lang }) => {
  const t = TRANSLATIONS[lang];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Vendor>>({
     type: 'BAND',
     name: '',
     price: 0,
     image: '',
     tags: [],
     specs: {}
  });

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData(vendor);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
        setVendors(vendors.filter(v => v.id !== id));
    }
  };

  const handleAddNew = () => {
    setEditingVendor(null);
    setFormData({
        type: 'BAND',
        name: '',
        price: 0,
        image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=400',
        tags: ['New'],
        specs: { area: 0 }
    });
    setIsModalOpen(true);
  }

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

  const handleSave = () => {
     if (!formData.name || !formData.price) return;

     if (editingVendor) {
        // Update
        setVendors(vendors.map(v => v.id === editingVendor.id ? { ...v, ...formData } as Vendor : v));
     } else {
        // Create
        const newId = Math.max(...vendors.map(v => v.id)) + 1;
        setVendors([...vendors, { ...formData, id: newId } as Vendor]);
     }
     setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                 <h2 className="text-2xl font-bold text-slate-800">{t.inventory}</h2>
                 <p className="text-slate-500">Manage your services and products here.</p>
            </div>
            <button 
                onClick={handleAddNew}
                className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-rose-200 transition-all"
            >
                <Plus size={18} /> {t.addNewVendor}
            </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase">
                    <tr>
                        <th className="p-4">ID</th>
                        <th className="p-4">Info</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {vendors.map(vendor => (
                        <tr key={vendor.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 text-slate-400 font-mono text-xs">#{vendor.id}</td>
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <img src={vendor.image} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                                    <div>
                                        <div className="font-bold text-slate-800">{vendor.name}</div>
                                        <div className="text-xs text-slate-400">{vendor.tags.join(', ')}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-bold">{vendor.type}</span>
                            </td>
                            <td className="p-4 font-bold text-slate-800">฿{vendor.price.toLocaleString()}</td>
                            <td className="p-4 text-right space-x-2">
                                <button onClick={() => handleEdit(vendor)} className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-500 rounded-lg transition-colors">
                                    <Edit size={16}/>
                                </button>
                                <button onClick={() => handleDelete(vendor.id)} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors">
                                    <Trash2 size={16}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Edit Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-lg">{editingVendor ? t.edit : t.addNewVendor}</h3>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20}/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.name}</label>
                            <input 
                                type="text" 
                                className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none transition-all font-bold"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.category}</label>
                                <select 
                                    className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none transition-all font-bold"
                                    value={formData.type}
                                    onChange={e => setFormData({...formData, type: e.target.value as VendorType})}
                                >
                                    <option value="BAND">BAND</option>
                                    <option value="SOUND">SOUND</option>
                                    <option value="FOOD">FOOD</option>
                                    <option value="STAFF">STAFF</option>
                                    <option value="FASHION">FASHION</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.price}</label>
                                <input 
                                    type="number" 
                                    className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none transition-all font-bold"
                                    value={formData.price}
                                    onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t.imageLink}</label>
                            <div className="flex gap-2 items-start">
                                <div className="flex-1">
                                    <label className="flex items-center gap-2 w-full p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 hover:border-rose-400 hover:bg-rose-50 cursor-pointer transition-colors group">
                                        {isUploading ? <Loader2 size={16} className="animate-spin text-slate-400"/> : <ImageIcon size={16} className="text-slate-400 group-hover:text-rose-500"/>}
                                        <span className="text-sm font-medium text-slate-500 group-hover:text-rose-600">{t.uploadImage}</span>
                                        <input 
                                            type="file" 
                                            accept="image/png, image/jpeg" 
                                            className="hidden"
                                            onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                                        />
                                    </label>
                                    <p className="text-[10px] text-slate-400 mt-1 ml-1">Max 2MB (JPG/PNG)</p>
                                </div>
                                <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200 relative group">
                                    {formData.image ? (
                                        <>
                                            <img src={formData.image} className="w-full h-full object-cover" />
                                            <button 
                                                onClick={() => setFormData({...formData, image: ''})}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ImageIcon size={20} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                         <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500 font-bold hover:bg-white rounded-xl transition-colors">{t.cancel}</button>
                         <button onClick={handleSave} className="px-6 py-2 bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-200 hover:bg-rose-600 transition-colors">{t.saveChanges}</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};