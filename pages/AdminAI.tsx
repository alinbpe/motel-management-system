
import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Role, AIChatMessage } from '../types';
import { GoogleGenAI } from "@google/genai";
import { 
    Send, Bot, User, Loader2, Sparkles, BrainCircuit, 
    ShieldCheck, AlertCircle, TrendingUp, ChevronLeft,
    BarChart3, MessageSquare
} from 'lucide-react';

const AdminAI: React.FC = () => {
    const { issues, cabins, logs, refreshData } = useData();
    const { currentUser, hasRole } = useAuth();
    
    const [messages, setMessages] = useState<AIChatMessage[]>([
        { id: '1', role: 'model', text: 'سلام مدیر عزیز. من دستیار هوشمند شما هستم. تمام داده‌های متل از جمله خرابی‌ها، SLA و عملکرد پرسنل را تحلیل کرده‌ام. چطور می‌توانم به شما در تصمیم‌گیری کمک کنم؟', timestamp: new Date().toISOString() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    if (!hasRole([Role.ADMIN])) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-[3rem] border-4 border-dashed border-red-100">
                <ShieldCheck className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-xl font-black text-slate-800">دسترسی محدود</h2>
                <p className="text-slate-500 font-bold">این بخش فقط مخصوص مدیریت کل جهت تحلیل داده‌های استراتژیک است.</p>
            </div>
        );
    }

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg: AIChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // ساخت کانتکست غنی از داده‌های فعلی متل
            const contextData = {
                activeIssues: issues.filter(i => i.status !== 'RESOLVED').length,
                slaBreaches: issues.filter(i => i.resolvedAt && i.slaDeadline && i.resolvedAt > i.slaDeadline).length,
                cabinsStatus: cabins.map(c => ({ name: c.name, status: c.status })),
                recentLogs: logs.slice(0, 10).map(l => l.details),
                topTroubledCabins: Array.from(new Set(issues.map(i => i.cabinId))).slice(0, 3)
            };

            const prompt = `
                شما یک مشاور ارشد مدیریت متل هستید. به داده‌های واقعی سیستم دسترسی دارید:
                داده‌های فعلی: ${JSON.stringify(contextData)}
                تاریخچه پیام‌ها: ${JSON.stringify(messages.slice(-5))}
                سوال مدیر: ${input}
                
                قوانین:
                1. پاسخ باید کاملاً فارسی، حرفه‌ای و مبتنی بر داده‌های ارائه شده باشد.
                2. اگر سوالی در مورد امنیت یا تغییر مستقیم داده پرسیده شد، مودبانه رد کنید.
                3. راهکارهای عملی (Actionable) برای بهبود SLA و کاهش خرابی ارائه دهید.
                4. از ایموجی‌های مناسب مدیریتی استفاده کنید.
            `;

            const response = await ai.models.generateContent({
                model: "gemini-3-pro-preview",
                contents: prompt,
            });

            const aiMsg: AIChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: response.text || 'متاسفانه در حال حاضر قادر به تحلیل نیستم.',
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] space-y-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-100">
                        <BrainCircuit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900">مشاور هوشمند مدیریت</h2>
                        <p className="text-[10px] text-emerald-600 font-black flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> آنلاین - در حال تحلیل داده‌های زنده
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex gap-2">
                    <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-500">
                        SLA Health: 94%
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-inner overflow-hidden flex flex-col relative">
                <div 
                    ref={scrollRef}
                    className="flex-1 p-6 overflow-y-auto space-y-6 no-scrollbar"
                >
                    {messages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2`}
                        >
                            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                                <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center shadow-md ${
                                    msg.role === 'user' ? 'bg-slate-900' : 'bg-indigo-600'
                                }`}>
                                    {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                                </div>
                                <div className={`p-5 rounded-[2rem] text-sm leading-relaxed font-bold shadow-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-slate-50 text-slate-800 rounded-tr-none border border-slate-100' 
                                        : 'bg-indigo-50 text-indigo-900 rounded-tl-none border border-indigo-100'
                                }`}>
                                    {msg.text}
                                    <div className="text-[8px] mt-2 opacity-40 text-left font-mono">
                                        {new Date(msg.timestamp).toLocaleTimeString('fa-IR')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-end animate-pulse">
                            <div className="bg-indigo-50 px-6 py-3 rounded-full flex items-center gap-2 text-indigo-600 font-black text-xs border border-indigo-100">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                در حال تحلیل داده‌ها...
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <div className="relative group">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="مثلاً: وضعیت SLA کلبه‌های فنی چطوره؟"
                            className="w-full pr-6 pl-16 py-5 rounded-3xl bg-white border-2 border-transparent focus:border-indigo-500 shadow-lg outline-none font-bold text-sm transition-all"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isTyping}
                            className="absolute left-3 top-2 bottom-2 px-6 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg active:scale-90 disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-3 text-center font-bold">
                        پاسخ‌ها بر اساس تحلیل لحظه‌ای دیتابیس Supabase و متدهای مدیریت بهینه متل صادر می‌شوند.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminAI;
