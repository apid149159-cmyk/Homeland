import React from 'react';
import { DollarSign, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import { TRANSLATIONS, Language } from '../../translations';
import { Vendor } from '../../types';

interface DashboardStatsProps {
  vendors: Vendor[];
  lang: Language;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ vendors, lang }) => {
  const t = TRANSLATIONS[lang];

  // Mock Data for Visuals
  const stats = [
    { title: t.totalRevenue, value: '฿854,000', icon: DollarSign, color: 'bg-emerald-500', trend: '+12%' },
    { title: t.bookings, value: '142', icon: ShoppingBag, color: 'bg-rose-500', trend: '+5%' },
    { title: t.activeVendors, value: vendors.length.toString(), icon: Users, color: 'bg-indigo-500', trend: '+2' },
  ];

  return (
    <div className="space-y-8">
       {/* Header */}
       <div>
         <h2 className="text-2xl font-bold text-slate-800">{t.dashboard}</h2>
         <p className="text-slate-500">Welcome back, Admin. Here is what's happening today.</p>
       </div>

       {/* Cards */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
             <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${stat.color} shadow-slate-200`}>
                    <stat.icon size={28} />
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">{stat.title}</p>
                   <div className="flex items-end gap-2">
                     <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                     <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md mb-1">{stat.trend}</span>
                   </div>
                </div>
             </div>
          ))}
       </div>

       {/* Visual Chart Placeholder */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-80 flex flex-col">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Revenue Trend</h3>
                <TrendingUp size={20} className="text-slate-300"/>
             </div>
             <div className="flex-1 flex items-end justify-between px-4 gap-2">
                {[40, 60, 45, 70, 50, 80, 65, 90, 75, 55, 85, 95].map((h, i) => (
                    <div key={i} className="w-full bg-rose-100 rounded-t-lg relative group transition-all hover:bg-rose-400" style={{ height: `${h}%` }}>
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {h * 1000}
                       </div>
                    </div>
                ))}
             </div>
             <div className="flex justify-between mt-2 text-xs text-slate-400 font-bold uppercase">
                <span>Jan</span><span>Dec</span>
             </div>
          </div>

           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-80 overflow-y-auto">
             <h3 className="font-bold text-slate-800 mb-4">Recent Transactions</h3>
             <table className="w-full text-left text-sm">
                <thead className="text-slate-400 text-xs uppercase border-b border-slate-100">
                    <tr>
                        <th className="pb-2">Event</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="text-slate-600">
                    {[1,2,3,4,5].map((_, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="py-3 font-medium">Corporate Gala #{202400 + i}</td>
                            <td className="py-3"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold">Paid</span></td>
                            <td className="py-3 text-right">฿{Math.floor(Math.random() * 50000).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};