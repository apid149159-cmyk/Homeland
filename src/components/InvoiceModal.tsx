import React, { useState } from 'react';
import { X, Printer, Download, CheckCircle, Calendar, MapPin, Users, Loader2 } from 'lucide-react';
import { EventConfig, Financials, Vendor, Venue } from '../types';
import { MOCK_VENUES } from '../constants';
import { TRANSLATIONS, Language } from '../translations';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: EventConfig;
  cart: Vendor[];
  financials: Financials;
  lang: Language;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, config, cart, financials, lang }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];
  const venue = MOCK_VENUES.find(v => v.id === config.selectedVenueId);
  const venueName = venue ? (lang === 'TH' ? (venue.name_th || venue.name) : venue.name) : '';
  const today = new Date().toLocaleDateString(lang === 'TH' ? 'th-TH' : 'en-GB');
  
  // Format Dates
  const displayDates = config.dates && config.dates.length > 0 
    ? config.dates.sort().join(', ') 
    : '-';

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
        const element = document.getElementById('invoice-content');
        if (!element) return;

        const canvas = await html2canvas(element, {
            scale: 2,
            logging: false,
            useCORS: true
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10; 

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`invoice-event-${config.dates?.[0] || 'draft'}.pdf`);

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF. Please try again.');
    } finally {
        setIsGenerating(false);
    }
  };

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:absolute print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col print:shadow-none print:w-full print:max-w-none print:h-auto print:rounded-none">
        
        {/* Header (No Print) */}
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-start print:hidden">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-emerald-400" size={24} />
                <h2 className="text-2xl font-bold">{t.bookingConfirmed}</h2>
            </div>
            <p className="text-indigo-100 text-sm">{t.thankYou}</p>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content - ID for Capture */}
        <div id="invoice-content" className="p-8 space-y-8 flex-1 bg-white">
          
          <div className="hidden print:block mb-8 border-b pb-4">
              <h1 className="text-2xl font-bold text-indigo-900">Homeland Event</h1>
              <p className="text-sm text-slate-500">Official Invoice / Quotation</p>
          </div>

          {config.eventName && (
              <div className="mb-2">
                   <h2 className="text-3xl font-bold text-slate-900">{config.eventName}</h2>
                   {config.taxEntity === 'CORPORATE' && (
                       <span className="text-xs font-bold text-slate-500 border border-slate-200 px-2 py-0.5 rounded">TAX ID: Corporate (WHT Included)</span>
                   )}
              </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-b border-slate-100 pb-6">
            <div>
                <span className="block text-slate-400 text-xs uppercase font-bold mb-1">{t.invoiceDate}</span>
                <span className="font-medium text-slate-900">{today}</span>
            </div>
            <div>
                <span className="block text-slate-400 text-xs uppercase font-bold mb-1 flex items-center gap-1"><Calendar size={10}/> {t.eventDates}</span>
                <span className="font-medium text-slate-900 text-xs">{displayDates}</span>
            </div>
            <div>
                <span className="block text-slate-400 text-xs uppercase font-bold mb-1 flex items-center gap-1"><Users size={10}/> {t.expectedGuests}</span>
                <span className="font-medium text-slate-900">{config.pax} Pax</span>
            </div>
             <div>
                <span className="block text-slate-400 text-xs uppercase font-bold mb-1 flex items-center gap-1"><MapPin size={10}/> {t.venue}</span>
                <span className="font-medium text-slate-900 truncate">{venueName}</span>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">{t.orderSummary}</h3>
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="py-3 px-4 rounded-tl-lg">{t.itemService}</th>
                        <th className="py-3 px-4">{t.type}</th>
                        <th className="py-3 px-4 text-right rounded-tr-lg">{t.amount}</th>
                    </tr>
                </thead>
                <tbody className="text-slate-700">
                    {venue && (
                        <tr className="border-b border-slate-50">
                            <td className="py-3 px-4 font-medium">{venueName}</td>
                            <td className="py-3 px-4 text-slate-500">Venue</td>
                            <td className="py-3 px-4 text-right">{venue.price.toLocaleString()}</td>
                        </tr>
                    )}
                    {cart.map((item, idx) => {
                       const itemName = lang === 'TH' ? (item.name_th || item.name) : item.name;
                       return (
                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-medium">{itemName}</td>
                            <td className="py-3 px-4 text-slate-500 text-xs uppercase">{item.type}</td>
                            <td className="py-3 px-4 text-right">{item.price.toLocaleString()}</td>
                        </tr>
                    )})}
                </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex flex-col items-end space-y-2 pt-2">
            <div className="flex justify-between w-full md:w-1/2 text-slate-500 text-sm">
                <span>{t.subtotal}</span>
                <span>฿{financials.subtotal.toLocaleString()}</span>
            </div>
             <div className="flex justify-between w-full md:w-1/2 text-slate-500 text-sm">
                <span>{t.platformFee}</span>
                <span>฿{financials.platformFee.toLocaleString()}</span>
            </div>
             <div className="flex justify-between w-full md:w-1/2 text-slate-500 text-sm">
                <span>{t.vat}</span>
                <span>฿{financials.vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            
             <div className="flex justify-between w-full md:w-1/2 text-slate-500 text-sm border-t border-dashed border-slate-200 pt-2">
                <span>{t.grandTotal}</span>
                <span>฿{financials.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {financials.wht > 0 && (
                <div className="flex justify-between w-full md:w-1/2 text-rose-500 font-bold text-sm bg-rose-50 px-2 py-1 rounded">
                    <span>{t.whtDeduction}</span>
                    <span>-฿{financials.wht.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            )}

            <div className="flex justify-between w-full md:w-1/2 pt-4 border-t border-slate-200">
                <span className="text-lg font-bold text-slate-900">{t.netPayment}</span>
                <span className="text-xl font-bold text-indigo-600">฿{financials.netPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
          
           <div className="mt-8 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
               <p>Homeland Event - Auto Generated Invoice</p>
           </div>

        </div>

        {/* Footer Actions (No Print) */}
        <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center rounded-b-2xl print:hidden">
            <button 
                onClick={handlePrint}
                className="text-slate-500 hover:text-slate-700 text-sm font-medium flex items-center gap-2"
            >
                <Printer size={16}/> {t.print}
            </button>
            <button 
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-wait"
            >
                {isGenerating ? <Loader2 size={16} className="animate-spin"/> : <Download size={16} />} 
                {isGenerating ? t.generatingPdf : t.download}
            </button>
        </div>

      </div>
    </div>
  );
};