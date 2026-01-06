import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Minimize2, User, Sparkles, Bot, MessageCircle, ThumbsUp, AlertTriangle } from 'lucide-react';
import { UserProfile, ChatMessage } from '../../types';
import { TRANSLATIONS, Language } from '../../translations';
import { GoogleGenAI } from "@google/genai";
import { useEvent } from '../../contexts/EventContext'; // Import context for RAG

interface ChatWidgetProps {
  currentUser: UserProfile;
  lang: Language;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ currentUser, lang }) => {
  const t = TRANSLATIONS[lang];
  // Access ALL project data for the Operator Persona
  const { vendors, tickets, eventConfig, cart, financials, validation, zones, booths } = useEvent(); 
  
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState<'HUMAN' | 'AI'>('AI'); // Default to AI
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]); 
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Load Messages ---
  useEffect(() => {
    // 1. Load Human Messages
    const loadHumanMessages = () => {
        const stored = localStorage.getItem('event_chat_storage');
        if (stored) {
            const allMessages: ChatMessage[] = JSON.parse(stored);
            const myMessages = allMessages.filter(
                m => m.senderId === currentUser.id || m.receiverId === currentUser.id
            );
            setMessages(myMessages);
        }
    };

    // 2. Load AI Messages
    const loadAiMessages = () => {
        const storedAi = localStorage.getItem('event_ai_chat_storage');
        if (storedAi) {
            setAiMessages(JSON.parse(storedAi));
        } else {
            // Initial Welcome Message from AI Operator
            const welcomeMsg: ChatMessage = {
                id: 'ai-welcome',
                senderId: 'AI_BOT',
                senderName: 'System Operator',
                senderRole: 'AI',
                receiverId: currentUser.id,
                text: lang === 'TH' 
                    ? 'สวัสดีครับ ผมคือผู้ดูแลระบบอัจฉริยะ (System Operator) ผมสามารถตรวจสอบความถูกต้องของแผนงาน แนะนำการแก้ปัญหา "สเปคไม่ผ่าน" หรือรับฟังข้อเสนอแนะได้ครับ มีอะไรให้ช่วยไหมครับ?'
                    : 'Hello! I am your System Operator. I can validate your event plan, troubleshoot "compatibility issues", or take your feedback. How can I assist you today?',
                timestamp: Date.now(),
                isRead: true
            };
            setAiMessages([welcomeMsg]);
            localStorage.setItem('event_ai_chat_storage', JSON.stringify([welcomeMsg]));
        }
    }

    loadHumanMessages();
    loadAiMessages();

    const interval = setInterval(loadHumanMessages, 2000);
    return () => clearInterval(interval);
  }, [currentUser.id, lang]);

  // --- Auto Scroll ---
  useEffect(() => {
      if (isOpen) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
  }, [messages, aiMessages, isOpen, chatMode, isTyping]);

  // --- Handlers ---

  const handleSend = async (e: React.FormEvent, isFeedback = false) => {
      e.preventDefault();
      // Prefix feedback for clarity
      const textToSend = isFeedback ? `[FEEDBACK_REPORT] ${inputText}` : inputText;
      
      // If user sends feedback but empty text, prompt them
      if (isFeedback && !inputText.trim()) {
          const promptMsg: ChatMessage = {
              id: Date.now().toString(),
              senderId: 'AI_BOT',
              senderName: 'System Operator',
              senderRole: 'AI',
              receiverId: currentUser.id,
              text: lang === 'TH' ? 'กรุณาพิมพ์ข้อเสนอแนะของคุณก่อนกดปุ่ม Feedback ครับ' : 'Please type your feedback before clicking the button.',
              timestamp: Date.now(),
              isRead: true
          };
          setAiMessages(prev => [...prev, promptMsg]);
          return;
      }

      if (!textToSend.trim()) return;

      const newMessage: ChatMessage = {
          id: Date.now().toString(),
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role === 'ORGANIZER' ? 'USER' : currentUser.role as 'ADMIN' | 'VENDOR',
          receiverId: chatMode === 'HUMAN' ? 'ADMIN' : 'AI_BOT',
          text: isFeedback ? inputText : textToSend, // Display clean text in UI
          timestamp: Date.now(),
          isRead: false,
          isFeedback: isFeedback
      };

      if (chatMode === 'HUMAN') {
          // --- Human Logic ---
          const stored = localStorage.getItem('event_chat_storage');
          const allMessages: ChatMessage[] = stored ? JSON.parse(stored) : [];
          const updatedMessages = [...allMessages, newMessage];
          localStorage.setItem('event_chat_storage', JSON.stringify(updatedMessages));
          setMessages(prev => [...prev, newMessage]);
      } else {
          // --- AI Operator Logic ---
          const updatedAiMessages = [...aiMessages, newMessage];
          setAiMessages(updatedAiMessages);
          localStorage.setItem('event_ai_chat_storage', JSON.stringify(updatedAiMessages));
          setIsTyping(true);

          try {
              // Call Gemini with Full Context
              await generateAIResponse(textToSend, updatedAiMessages);
          } catch (error) {
              console.error("AI Error", error);
              setIsTyping(false);
          }
      }
      setInputText('');
  };

  const generateAIResponse = async (userPrompt: string, history: ChatMessage[]) => {
      if (!process.env.API_KEY) {
          setIsTyping(false);
          // Fallback message if no key
          const errorMsg: ChatMessage = {
              id: 'ai-err-' + Date.now(),
              senderId: 'AI_BOT',
              senderName: 'System Operator',
              senderRole: 'AI',
              receiverId: currentUser.id,
              text: "System Error: API Key missing. Please contact Admin.",
              timestamp: Date.now(),
              isRead: true
          };
          setAiMessages(prev => [...prev, errorMsg]);
          return;
      }

      // --- 1. CONTEXT CONSTRUCTION (The Brain) ---
      
      // Vendor Inventory Context
      const vendorList = vendors.map(v => 
        `- ${v.name} (${v.type}): ฿${v.price}, Tags: ${v.tags.join(', ')}`
      ).join('\n');

      // User's Plan Context
      const userCartContext = cart.length > 0 
        ? cart.map(i => `${i.name} (Specs: ${JSON.stringify(i.specs)})`).join('\n')
        : "Cart is empty.";

      // Validation Context (Crucial for Operator Role)
      const validationStatus = validation.criticalErrors.length > 0
        ? `CRITICAL ERRORS (Checkout Blocked): ${validation.criticalErrors.join(', ')}`
        : "Validation Status: All Systems Green.";
      
      const warningsContext = validation.warnings.length > 0
        ? `WARNINGS: ${validation.warnings.join(', ')}`
        : "No warnings.";
      
      const spaceContext = `Space Usage: ${validation.spaceUsage.percentUsed}% (${validation.spaceUsage.totalUsed}/${eventConfig.areaSqm} sqm)`;
      const staffContext = `Staff: Have ${validation.staffStatus.current}, Need ${validation.staffStatus.needed}`;

      // Financial Context
      const financialContext = `
        Total: ฿${financials.grandTotal.toLocaleString()}
        Net Payable: ฿${financials.netPayable.toLocaleString()}
        Tax Type: ${eventConfig.taxEntity}
        WHT Deducted: ฿${financials.wht.toLocaleString()}
      `;

      // System Instruction (The Persona)
      const systemInstruction = `
        You are the "System Operator" for Homeland Event Platform.
        Your role is to guide the user, troubleshoot issues, and analyze their event plan.
        
        [REAL-TIME SYSTEM DATA]
        User Name: ${currentUser.name}
        Event Name: ${eventConfig.eventName || "Untitled Event"}
        Theme: ${eventConfig.theme}
        Guests: ${eventConfig.pax}
        
        [VALIDATION STATE - PRIORITY 1]
        ${validationStatus}
        ${warningsContext}
        ${spaceContext}
        ${staffContext}

        [FINANCIAL STATE]
        ${financialContext}

        [CURRENT CART]
        ${userCartContext}

        [AVAILABLE VENDORS DATABASE]
        ${vendorList}

        [INSTRUCTIONS]
        1. **Troubleshooting**: If the Validation State has CRITICAL ERRORS, your priority is to help the user fix them. Explain *why* it's failing (e.g., "Sound system too small for band").
        2. **Feedback Handling**: If the user message starts with [FEEDBACK_REPORT], formally acknowledge it. Say "Received. I have logged this feedback for the development team." and thank them.
        3. **Guidance**: If the user asks for recommendations, pick vendors from the [AVAILABLE VENDORS DATABASE] that match the '${eventConfig.theme}' theme.
        4. **Tone**: Professional, precise, helpful, and systematic. Like a high-end concierge or engineer.
        5. **Language**: Answer in the same language as the user (English or Thai).

        If the user asks "Why can't I checkout?", check the [VALIDATION STATE] immediately.
      `;

      const apiKey = process.env.API_KEY;
      if (!apiKey || apiKey === 'undefined' || apiKey === '') {
        const errorMsg: ChatMessage = {
          id: Date.now().toString(),
          senderId: 'AI_BOT',
          senderName: 'System',
          senderRole: 'AI',
          text: "⚠️ API Key Missing. Please set GEMINI_API_KEY in your .env file.",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMsg]);
        setAiMessages(prev => [...prev, errorMsg]);
        setIsTyping(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // 2. Call Model
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-lite-latest',
          contents: [
              { role: 'user', parts: [{ text: systemInstruction }] },
              ...history.slice(-8).map(msg => ({ 
                  role: msg.senderRole === 'AI' ? 'model' : 'user',
                  parts: [{ text: msg.text }]
              })),
              { role: 'user', parts: [{ text: userPrompt }] }
          ]
      });

      setIsTyping(false);

      // 3. Process Response
      const aiResponseText = response.text || "Operator busy. Please try again.";
      
      const aiMessage: ChatMessage = {
          id: 'ai-' + Date.now(),
          senderId: 'AI_BOT',
          senderName: 'System Operator',
          senderRole: 'AI',
          receiverId: currentUser.id,
          text: aiResponseText,
          timestamp: Date.now(),
          isRead: true
      };

      const finalMessages = [...history, aiMessage];
      setAiMessages(finalMessages);
      localStorage.setItem('event_ai_chat_storage', JSON.stringify(finalMessages));
  };

  const activeMessages = chatMode === 'HUMAN' ? messages : aiMessages;
  const hasErrors = validation.criticalErrors.length > 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-[600px] rounded-2xl shadow-2xl border border-slate-200 mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
            
            {/* Header */}
            <div className={`${chatMode === 'AI' ? (hasErrors ? 'bg-rose-600' : 'bg-slate-800') : 'bg-indigo-600'} p-4 text-white transition-colors duration-500`}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-inner ${chatMode === 'AI' ? 'bg-white/20' : 'bg-indigo-400'}`}>
                                {chatMode === 'AI' ? <Bot size={20}/> : <User size={20}/>}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${hasErrors ? 'bg-rose-400 animate-pulse' : 'bg-emerald-500'}`}></div>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">{chatMode === 'AI' ? 'System Operator' : t.adminName}</h3>
                            <p className="text-xs opacity-80 flex items-center gap-1">
                                {chatMode === 'AI' 
                                    ? (hasErrors ? <><AlertTriangle size={10}/> <span>Attention Needed</span></> : t.aiStatus) 
                                    : t.adminStatus}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded"><Minimize2 size={16}/></button>
                </div>

                {/* Mode Switcher */}
                <div className="flex bg-black/20 p-1 rounded-xl">
                    <button 
                        onClick={() => setChatMode('AI')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all ${chatMode === 'AI' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/70 hover:text-white'}`}
                    >
                        <Sparkles size={14}/> Operator AI
                    </button>
                    <button 
                        onClick={() => setChatMode('HUMAN')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all ${chatMode === 'HUMAN' ? 'bg-white text-indigo-900 shadow-sm' : 'text-white/70 hover:text-white'}`}
                    >
                        <MessageCircle size={14}/> Human Support
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 bg-slate-50 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                {activeMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <MessageSquare size={48} className="mb-2 opacity-20"/>
                        <p className="text-sm font-bold">{t.noMessages}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeMessages.map((msg) => {
                            const isMe = msg.senderId === currentUser.id;
                            const isAi = msg.senderRole === 'AI';
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm relative ${
                                        isMe ? 'bg-slate-800 text-white rounded-br-none' : 
                                        isAi ? 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-md' :
                                        'bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-bl-none'
                                    }`}>
                                        {msg.isFeedback && (
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 mb-1 border-b border-white/10 pb-1">
                                                <ThumbsUp size={10}/> FEEDBACK REPORT
                                            </div>
                                        )}
                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        <span className={`text-[9px] block mt-1 text-right ${isMe ? 'text-slate-400' : 'text-slate-300'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none flex gap-1 items-center shadow-sm">
                                    <span className="text-xs font-bold text-slate-400 mr-2">Analyzing...</span>
                                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-slate-100">
                {chatMode === 'AI' && (
                    <div className="px-4 pt-2 flex justify-between items-center bg-slate-50/50 pb-2 border-b border-slate-50">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Command Line</span>
                        <button 
                            onClick={(e) => handleSend(e as any, true)}
                            disabled={!inputText.trim() || isTyping}
                            className="text-[10px] font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white px-2 py-1 rounded border border-slate-200 hover:border-emerald-300"
                        >
                            <ThumbsUp size={10} /> {t.feedbackPrompt}
                        </button>
                    </div>
                )}
                
                <form onSubmit={(e) => handleSend(e)} className="p-3 flex gap-2">
                    <input 
                        type="text" 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={chatMode === 'AI' ? (lang === 'TH' ? "พิมพ์ปัญหา หรือสอบถามข้อมูล..." : "Ask operator or report issue...") : t.chatPlaceholder}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
                    />
                    <button 
                        type="submit" 
                        disabled={!inputText.trim() || isTyping}
                        className={`text-white p-2.5 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${chatMode === 'AI' ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 z-50 border-2 border-white ${isOpen ? 'bg-slate-700 rotate-90' : (hasErrors ? 'bg-rose-500 animate-pulse' : 'bg-slate-900')}`}
      >
          {isOpen ? <X size={24} /> : (hasErrors ? <AlertTriangle size={24}/> : <Bot size={24} />)}
      </button>
    </div>
  );
};