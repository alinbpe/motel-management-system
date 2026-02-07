
import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
// Fix: Added Role to imports
import { Role } from '../types';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, MicOff, BrainCircuit, Loader2, Sparkles, Volume2, ShieldCheck, Info } from 'lucide-react';

const AdminVoice: React.FC = () => {
    const { issues, cabins, stays } = useData();
    const { hasRole } = useAuth();
    
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'LISTENING' | 'SPEAKING'>('IDLE');
    const [transcript, setTranscript] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const sessionRef = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Audio encoding functions
    const encode = (bytes: Uint8Array) => {
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };

    const createBlob = (data: Float32Array) => {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        return {
            data: encode(new Uint8Array(int16.buffer)),
            // The supported audio MIME type is 'audio/pcm'. Do not use other types.
            mimeType: 'audio/pcm;rate=16000',
        };
    };

    const toggleAssistant = async () => {
        if (isActive) {
            stopSession();
        } else {
            startSession();
        }
    };

    const startSession = async () => {
        setStatus('CONNECTING');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const contextData = {
                activeIssues: issues.filter(i => i.status !== 'RESOLVED').length,
                totalOccupancy: stays.filter(s => s.isActive).length,
                cabinSummary: cabins.map(c => `${c.name}: ${c.status}`).join(', ')
            };

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('LISTENING');
                        setIsActive(true);
                        startMicStreaming();
                    },
                    onmessage: async (msg) => {
                        if (msg.serverContent?.outputTranscription) {
                            setAiResponse(prev => prev + msg.serverContent.outputTranscription.text);
                            setStatus('SPEAKING');
                        }
                        if (msg.serverContent?.turnComplete) {
                            setStatus('LISTENING');
                        }
                    },
                    onclose: () => stopSession(),
                    onerror: () => stopSession()
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
                    },
                    systemInstruction: `شما دستیار صوتی مدیر متل هستید. لحن شما باید محترمانه، کوتاه و متمرکز بر داده باشد. داده‌های فعلی متل: ${JSON.stringify(contextData)}. فقط به سوالات مربوط به مدیریت متل پاسخ دهید.`
                }
            });
            sessionRef.current = await sessionPromise;
        } catch (e) {
            console.error(e);
            stopSession();
        }
    };

    const startMicStreaming = async () => {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        
        const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
        const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
        
        scriptProcessor.onaudioprocess = (e) => {
            if (!isActive || !sessionRef.current) return;
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionRef.current.sendRealtimeInput({ media: pcmBlob });
        };

        source.connect(scriptProcessor);
        scriptProcessor.connect(audioContextRef.current.destination);
    };

    const stopSession = () => {
        setIsActive(false);
        setStatus('IDLE');
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (audioContextRef.current) audioContextRef.current.close();
        if (sessionRef.current) sessionRef.current.close();
        sessionRef.current = null;
    };

    // Fix: Role.ADMIN is now correctly typed due to import
    if (!hasRole([Role.ADMIN])) {
        return <div className="p-12 text-center text-red-500 font-black">دسترسی غیرمجاز</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-slate-900 flex items-center justify-center gap-3">
                    <BrainCircuit className="w-8 h-8 text-indigo-600" />
                    دستیار صوتی مدیریت
                </h2>
                <p className="text-slate-500 font-bold">برای شروع مکالمه با Gemini، دکمه را لمس کنید</p>
            </div>

            <div className="relative">
                <div className={`absolute -inset-8 bg-indigo-500/20 rounded-full blur-3xl transition-opacity duration-1000 ${isActive ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
                <button 
                    onClick={toggleAssistant}
                    className={`relative w-32 h-32 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 shadow-2xl ${
                        isActive ? 'bg-rose-600 scale-110' : 'bg-indigo-600 hover:scale-105'
                    }`}
                >
                    {status === 'CONNECTING' ? (
                        <Loader2 className="w-12 h-12 text-white animate-spin" />
                    ) : isActive ? (
                        <MicOff className="w-12 h-12 text-white" />
                    ) : (
                        <Mic className="w-12 h-12 text-white" />
                    )}
                </button>
            </div>

            <div className="w-full max-w-lg bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400 border-b pb-4">
                    <span>وضعیت سیستم</span>
                    <span className={isActive ? 'text-emerald-500' : 'text-slate-300'}>
                        {status === 'IDLE' ? 'آماده‌باش' : status === 'LISTENING' ? 'در حال شنیدن...' : 'در حال پاسخ...'}
                    </span>
                </div>

                <div className="space-y-4">
                    {aiResponse && (
                        <div className="flex gap-4 animate-in slide-in-from-bottom-2">
                            <div className="bg-indigo-100 p-2 rounded-xl shrink-0"><Volume2 className="w-5 h-5 text-indigo-600" /></div>
                            <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                                "{aiResponse}"
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3">
                    <Info className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                    <p className="text-[10px] text-slate-500 font-bold leading-loose">
                        دستیار صوتی به تمام لاگ‌ها، وضعیت کلبه‌ها و امتیازات پرسنل دسترسی دارد. می‌توانید مستقیماً در مورد راندمان کاری این هفته سوال بپرسید.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminVoice;
