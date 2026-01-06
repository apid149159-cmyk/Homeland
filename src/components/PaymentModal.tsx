import React, { useState, useEffect } from 'react';
import { X, CreditCard, QrCode, Lock, CheckCircle, Loader2, Smartphone } from 'lucide-react';
import { TRANSLATIONS, Language } from '../translations';
import { Financials } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  financials: Financials;
  lang: Language;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, financials, lang }) => {
  const [method, setMethod] = useState<'CARD' | 'QR'>('QR');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'SELECT' | 'PROCESSING' | 'SUCCESS'>('SELECT');

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
        setStep('SELECT');
        setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePay = () => {
      setIsProcessing(true);
      setStep('PROCESSING');
      
      // Simulate API Call delay
      setTimeout(() => {
          setStep('SUCCESS');
          setIsProcessing(false);
          
          // Close and trigger parent success after showing success state briefly
          setTimeout(() => {
              onSuccess();
              onClose();
          }, 1500);
      }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Lock size={18} className="text-emerald-500"/> Secure Payment
            </h3>
            {!isProcessing && step !== 'SUCCESS' && (
                <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors"><X size={20}/></button>
            )}
        </div>

        {/* Content */}
        <div className="p-6">
            
            {step === 'SELECT' && (
                <div className="space-y-6">
                    <div className="text-center mb-6">
                        <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                        <h1 className="text-4xl font-black text-slate-900">฿{financials.netPayable.toLocaleString()}</h1>
                    </div>

                    {/* Method Selector */}
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setMethod('QR')}
                            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'QR' ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-100 hover:border-rose-200 text-slate-500'}`}
                        >
                            <QrCode size={24} />
                            <span className="text-xs font-bold">PromptPay QR</span>
                        </button>
                        <button 
                            onClick={() => setMethod('CARD')}
                            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'CARD' ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-100 hover:border-indigo-200 text-slate-500'}`}
                        >
                            <CreditCard size={24} />
                            <span className="text-xs font-bold">Credit Card</span>
                        </button>
                    </div>

                    {/* QR View */}
                    {method === 'QR' && (
                        <div className="bg-slate-900 p-6 rounded-2xl text-white text-center space-y-4">
                            <div className="bg-white p-2 rounded-lg inline-block">
                                {/* Mock QR */}
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HOMELAND-PAY-${financials.netPayable}`} alt="QR" className="w-32 h-32" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">Scan to Pay</p>
                                <p className="text-xs opacity-70">Supports all banking apps</p>
                            </div>
                        </div>
                    )}

                    {/* Card View */}
                    {method === 'CARD' && (
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Card Number</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 font-mono text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Expiry</label>
                                    <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 font-mono text-sm text-center" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">CVC</label>
                                    <input type="text" placeholder="123" className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-indigo-400 font-mono text-sm text-center" />
                                </div>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={handlePay}
                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${method === 'QR' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
                    >
                        {method === 'QR' ? 'Confirm Transfer' : 'Pay Now'}
                    </button>
                </div>
            )}

            {step === 'PROCESSING' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Lock size={20} className="text-indigo-500" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">Processing Payment...</h3>
                        <p className="text-sm text-slate-500">Please do not close this window.</p>
                    </div>
                </div>
            )}

            {step === 'SUCCESS' && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle size={40} className="stroke-[3]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-2xl text-slate-800">Payment Successful!</h3>
                        <p className="text-slate-500">Redirecting to your invoice...</p>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};