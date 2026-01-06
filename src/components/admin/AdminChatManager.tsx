import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Search, User, CheckCheck, Circle } from 'lucide-react';
import { ChatMessage, UserProfile } from '../../types';
import { TRANSLATIONS, Language } from '../../translations';

interface AdminChatManagerProps {
  lang: Language;
}

interface Conversation {
  userId: string;
  userName: string;
  userRole: string;
  lastMessage: string;
  lastTimestamp: number;
  unreadCount: number;
}

export const AdminChatManager: React.FC<AdminChatManagerProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load and Group Messages
  const loadMessages = () => {
      const stored = localStorage.getItem('event_chat_storage');
      if (stored) {
          setMessages(JSON.parse(stored));
      }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  // Derive Conversations from messages
  const conversations: Conversation[] = React.useMemo(() => {
    const map = new Map<string, Conversation>();

    messages.forEach(msg => {
        // We want to group by the "Other" person (User or Vendor)
        const otherId = msg.senderId === 'ADMIN' ? msg.receiverId : msg.senderId;
        const otherName = msg.senderId === 'ADMIN' ? 'User' : msg.senderName; // Simplify naming if Admin sent first (rare)
        const otherRole = msg.senderRole === 'ADMIN' ? 'USER' : msg.senderRole; // Fallback

        if (!map.has(otherId)) {
            map.set(otherId, {
                userId: otherId,
                userName: otherName,
                userRole: otherRole as string,
                lastMessage: '',
                lastTimestamp: 0,
                unreadCount: 0
            });
        }

        const conv = map.get(otherId)!;
        if (msg.timestamp > conv.lastTimestamp) {
            conv.lastMessage = msg.text;
            conv.lastTimestamp = msg.timestamp;
            // Update name in case it changed or was captured better
            if (msg.senderId !== 'ADMIN') {
                conv.userName = msg.senderName;
                conv.userRole = msg.senderRole;
            }
        }
        if (!msg.isRead && msg.receiverId === 'ADMIN') {
            conv.unreadCount++;
        }
    });

    return Array.from(map.values()).sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  }, [messages]);

  // Handle Selection & Mark as Read
  const handleSelectChat = (userId: string) => {
      setSelectedUserId(userId);
      // Mark as read in local storage
      const updatedMessages = messages.map(m => {
          if (m.senderId === userId && m.receiverId === 'ADMIN') {
              return { ...m, isRead: true };
          }
          return m;
      });
      localStorage.setItem('event_chat_storage', JSON.stringify(updatedMessages));
      setMessages(updatedMessages);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSend = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputText.trim() || !selectedUserId) return;

      const newMessage: ChatMessage = {
          id: Date.now().toString(),
          senderId: 'ADMIN',
          senderName: t.adminName,
          senderRole: 'ADMIN',
          receiverId: selectedUserId,
          text: inputText,
          timestamp: Date.now(),
          isRead: false
      };

      const updated = [...messages, newMessage];
      localStorage.setItem('event_chat_storage', JSON.stringify(updated));
      setMessages(updated);
      setInputText('');
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const activeMessages = messages.filter(
      m => (m.senderId === selectedUserId && m.receiverId === 'ADMIN') || 
           (m.senderId === 'ADMIN' && m.receiverId === selectedUserId)
  ).sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50">
            <div className="p-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-4">{t.recentChats}</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                    <input type="text" placeholder="Search..." className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-rose-300"/>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.map(conv => (
                    <button
                        key={conv.userId}
                        onClick={() => handleSelectChat(conv.userId)}
                        className={`w-full p-4 flex items-center gap-3 hover:bg-white transition-colors border-b border-slate-100 text-left relative ${selectedUserId === conv.userId ? 'bg-white border-l-4 border-l-rose-500 shadow-sm' : ''}`}
                    >
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg overflow-hidden">
                                {conv.userName.charAt(0)}
                            </div>
                            {conv.unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                    {conv.unreadCount}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-slate-800 truncate">{conv.userName}</h3>
                                <span className="text-[10px] text-slate-400 shrink-0">{new Date(conv.lastTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                                {conv.lastMessage}
                            </p>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-300 mt-1 block">{conv.userRole}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
            {selectedUserId ? (
                <>
                    {/* Header */}
                    <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                            {conversations.find(c => c.userId === selectedUserId)?.userName.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">{conversations.find(c => c.userId === selectedUserId)?.userName}</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                <span className="text-xs text-slate-500">Active Now</span>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                        {activeMessages.map(msg => {
                            const isMe = msg.senderId === 'ADMIN';
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-4 rounded-2xl text-sm ${isMe ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm'}`}>
                                        <p>{msg.text}</p>
                                        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-slate-400' : 'text-slate-300'}`}>
                                            <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            {isMe && <CheckCheck size={12} className="opacity-70" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-3 bg-white">
                        <input 
                            type="text" 
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-rose-300 transition-colors"
                            placeholder={t.chatPlaceholder}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <button type="submit" className="bg-rose-500 hover:bg-rose-600 text-white p-3 rounded-xl transition-colors shadow-lg shadow-rose-200">
                            <Send size={20} />
                        </button>
                    </form>
                </>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <MessageSquare size={64} className="mb-4 opacity-20" />
                    <p className="font-bold text-lg">{t.selectChat}</p>
                </div>
            )}
        </div>
    </div>
  );
};