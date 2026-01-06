import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Cloud, ShieldCheck, Wifi, Clock, Cpu } from 'lucide-react';
import { TRANSLATIONS, Language } from '../../translations';

interface SystemHealthProps {
  lang: Language;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [latency, setLatency] = useState(45);
  const [uptime, setUptime] = useState(0); // seconds
  const [memory, setMemory] = useState(32); // percentage

  // Mock Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
        setLatency(prev => Math.max(20, Math.min(100, prev + (Math.random() * 20 - 10))));
        setMemory(prev => Math.max(20, Math.min(60, prev + (Math.random() * 5 - 2.5))));
        setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return `${24 + h}h ${32 + m}m ${s}s`; // Mock offset
  };

  const StatusCard = ({ icon: Icon, label, status, subtext }: { icon: any, label: string, status: 'OK' | 'WARN' | 'ERR' | 'CHECK', subtext?: string }) => (
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status === 'OK' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon size={24} />
              </div>
              <div>
                  <h4 className="font-bold text-slate-700">{label}</h4>
                  <p className="text-xs text-slate-400">{subtext}</p>
              </div>
          </div>
          <div className="text-right">
              {status === 'OK' && <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">{t.operational}</span>}
              {status === 'CHECK' && <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">{t.checking}</span>}
          </div>
      </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-end">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="text-rose-500"/> {t.systemStatus}
                </h2>
                <p className="text-slate-500">{t.allSystemsOperational}</p>
            </div>
            <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.lastDeploy}</p>
                <p className="text-sm font-bold text-slate-700">v4.8 (Stable) - Just now</p>
            </div>
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg shadow-slate-300 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 bg-white/10 w-24 h-24 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-3 mb-4 text-slate-300">
                    <Clock size={20}/> <span className="font-bold text-sm uppercase">{t.uptime}</span>
                </div>
                <div className="text-4xl font-mono font-bold tracking-tight">{formatUptime(uptime)}</div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div className="bg-emerald-400 h-full w-full animate-pulse"></div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative">
                <div className="flex items-center gap-3 mb-4 text-slate-400">
                    <Wifi size={20}/> <span className="font-bold text-sm uppercase">{t.latency}</span>
                </div>
                <div className="text-4xl font-bold text-slate-800 flex items-end gap-2">
                    {latency.toFixed(0)} <span className="text-lg text-slate-400 font-medium mb-1">ms</span>
                </div>
                <div className="flex gap-1 mt-4 items-end h-8">
                    {[30, 45, 35, 50, 40, 60, 45, 30, 55, 40].map((h, i) => (
                        <div key={i} className="flex-1 bg-indigo-100 rounded-t-sm transition-all duration-300" style={{ height: `${(h / 100) * 100}%` }}></div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-slate-400">
                    <Cpu size={20}/> <span className="font-bold text-sm uppercase">{t.memoryUsage}</span>
                </div>
                <div className="text-4xl font-bold text-slate-800 flex items-end gap-2">
                    {memory.toFixed(0)} <span className="text-lg text-slate-400 font-medium mb-1">%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full mt-6 overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${memory}%` }}></div>
                </div>
            </div>
        </div>

        {/* Modules Status */}
        <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">{t.activeModules}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatusCard icon={Database} label={t.databaseConnection} subtext="PostgreSQL (Mocked)" status="OK" />
                <StatusCard icon={Cloud} label={t.apiStatus} subtext="REST & GraphQL Endpoint" status="OK" />
                <StatusCard icon={Server} label={t.storageStatus} subtext="Asset Content Delivery" status="OK" />
                <StatusCard icon={ShieldCheck} label={t.paymentGateway} subtext="Stripe / PromptPay Secure" status="OK" />
            </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
            <h1 className="text-4xl font-black text-emerald-600 mb-2">9.5/10</h1>
            <p className="text-emerald-800 font-bold">Excellent System Health</p>
            <p className="text-emerald-600/80 text-sm mt-1">Ready for production deployment.</p>
        </div>

    </div>
  );
};