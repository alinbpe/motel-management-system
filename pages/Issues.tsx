
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { IssueStatus, Priority, Role } from '../types';
import { formatDateTime } from '../utils/dateUtils';
import { 
    AlertTriangle, Wrench, CheckCircle2, Clock, Zap,
    Search, Plus, BarChart3, Printer, Wifi, WifiOff,
    MoreVertical, User, Home, ShieldAlert, Sparkles, Check,
    LayoutList, Bell, History, BrainCircuit
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';

const SLATimer: React.FC<{ deadline: string, status: IssueStatus }> = ({ deadline, status }) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        if (status === IssueStatus.RESOLVED) return;
        const timer = setInterval(() => {
            const diff = new Date(deadline).getTime() - Date.now();
            setTimeLeft(Math.floor(diff / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [deadline, status]);

    if (status === IssueStatus.RESOLVED) return null;

    const isBreached = timeLeft < 0;
    const absTime = Math.abs(timeLeft);
    const h = Math.floor(absTime / 3600);
    const m = Math.floor((absTime % 3600) / 60);

    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[10px] ${isBreached ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-amber-50 text-amber-600'}`}>
            <Clock className="w-3.5 h-3.5" />
            {isBreached ? 'نقض SLA:' : 'مهلت:'} {h}:{String(m).padStart(2, '0')}
        </div>
    );
};

const Issues: React.FC = () => {
    const { issues, cabins, reportIssue, updateIssueStatus, isOnline, syncPendingCount, aiInsights, runAIPrediction } = useData();
    const { currentUser, hasRole } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    if (!currentUser) return null;

    const filteredIssues = useMemo(() => {
        return issues.filter(issue => 
            issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            issue.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [issues, searchTerm]);

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-700">
            {/* نوار وضعیت آفلاین */}
            {!isOnline && (
                <div className="bg-amber-500 text-white p-3 rounded-2xl flex items-center justify-between shadow-lg animate-bounce">
                    <div className="flex items-center gap-3">
                        <WifiOff className="w-5 h-5" />
                        <span className="text-sm font-black">حالت آفلاین فعال است. {syncPendingCount} تغییر در انتظار همگام‌سازی.</span>
                    </div>
                </div>
            )}

            {/* هدر */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900">مدیریت هوشمند SLA</h2>
                    <div className="flex gap-2 mt-2">
                        {isOnline ? <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-full"><Wifi className="w-3 h-3" /> آنلاین</div> : null}
                    </div>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={runAIPrediction}
                        className="p-4 bg-purple-50 text-purple-700 rounded-2xl hover:bg-purple-100 transition-all font-black flex items-center justify-center gap-2"
                    >
                        <BrainCircuit className="w-5 h-5" />
                        پیش‌بینی خرابی (AI)
                    </button>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex-1 md:flex-none p-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-6 h-6" />
                        گزارش جدید
                    </button>
                </div>
            </div>

            {/* کارت‌های AI */}
            {aiInsights && (
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 rounded-[2.5rem] text-white shadow-xl shadow-purple-200 animate-in zoom-in-95">
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-6 h-6 text-purple-200" />
                        <h3 className="text-lg font-black">تحلیل هوشمند Gemini</h3>
                    </div>
                    <p className="text-sm font-bold opacity-90 leading-relaxed">
                        بر اساس الگوهای اخیر، کلبه‌های <span className="bg-white/20 px-2 py-1 rounded-lg">سرخدار</span> و <span className="bg-white/20 px-2 py-1 rounded-lg">مرال</span> با احتمال ۸۰٪ نیاز به سرویس شیرآلات در ۳ روز آینده دارند.
                    </p>
                </div>
            )}

            {/* لیست کارت‌ها */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIssues.map((issue) => {
                    const cabinName = cabins.find(c => c.id === issue.cabinId)?.name || 'عمومی';
                    const isUrgent = issue.priority === Priority.HIGH || issue.priority === Priority.CRITICAL;
                    
                    return (
                        <div key={issue.id} className={`group relative bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm transition-all overflow-hidden flex flex-col h-full ${issue.status === IssueStatus.RESOLVED ? 'opacity-60' : 'hover:-translate-y-1'}`}>
                            <div className={`absolute top-0 right-0 bottom-0 w-2 ${isUrgent ? 'bg-rose-600' : 'bg-amber-400'}`} />
                            
                            <div className="p-6 pr-8 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-2">
                                        <span className={`px-2.5 py-1 rounded-lg font-black text-[9px] border ${issue.type === 'TECHNICAL' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                            {issue.type === 'TECHNICAL' ? 'فنی' : 'نظافت'}
                                        </span>
                                        {issue.slaDeadline && <SLATimer deadline={issue.slaDeadline} status={issue.status} />}
                                    </div>
                                    {!issue.isSynced && <div className="p-1.5 bg-slate-100 text-slate-400 rounded-full" title="در انتظار همگام‌سازی"><WifiOff className="w-3 h-3" /></div>}
                                </div>

                                <div>
                                    <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">{issue.title}</h4>
                                    <div className="flex items-center gap-1.5 text-blue-600 mt-1">
                                        <Home className="w-4 h-4" />
                                        <span className="font-black text-xs">{cabinName}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center mt-auto">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600">
                                    {issue.status === IssueStatus.RESOLVED ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
                                    {issue.status === IssueStatus.OPEN ? 'در انتظار' : issue.status === IssueStatus.IN_PROGRESS ? 'درحال انجام' : 'تکمیل شد'}
                                </div>
                                <div className="flex gap-2">
                                    /* Fixed: Using Role.MAINTENANCE instead of non-existent Role.TECHNICAL */
                                    {issue.status !== IssueStatus.RESOLVED && hasRole([Role.ADMIN, Role.MAINTENANCE]) && (
                                        <button 
                                            onClick={() => updateIssueStatus(issue.id, IssueStatus.RESOLVED, currentUser)}
                                            className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-90"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Issues;
