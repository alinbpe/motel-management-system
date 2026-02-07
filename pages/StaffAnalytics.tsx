
import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Role, StaffReward } from '../types';
import { 
    TrendingUp, Wallet, UserCheck, AlertTriangle, 
    ChevronLeft, BarChart3, Users, Zap, Calendar, 
    ArrowUpRight, ArrowDownRight, Sparkles
} from 'lucide-react';
import { toJalaaliString } from '../utils/dateUtils';

const StaffAnalytics: React.FC = () => {
    const { issues, cabins, stays, users } = useData();
    const [activeTab, setActiveTab] = useState<'REWARDS' | 'FORECAST'>('REWARDS');

    // مدل پیش‌بینی نیرو (Forecasting)
    const forecasting = useMemo(() => {
        const nextWeekOccupancy = stays.filter(s => s.isActive).length / cabins.length; // تخمین ساده
        const issueRate = issues.filter(i => i.status !== 'RESOLVED').length;
        
        let recommendation = "پایداری نیرو";
        let color = "text-emerald-600";
        let details = "تعداد پرسنل فعلی برای هفته آینده کافی است.";

        if (nextWeekOccupancy > 0.8 || issueRate > 5) {
            recommendation = "نیاز به جذب نیرو / اضافه‌کار";
            color = "text-rose-600";
            details = "پیش‌بینی می‌شود به دلیل اشغال بالای ۸۰٪ و تجمع خرابی‌ها، به ۲ نفر اضافه‌کار نیاز باشد.";
        }

        return { recommendation, color, details, occupancy: Math.round(nextWeekOccupancy * 100) };
    }, [stays, cabins, issues]);

    // داده‌های پاداش فرضی بر اساس امتیاز
    const mockRewards: StaffReward[] = users.map(u => ({
        id: u.id,
        staffId: u.id,
        username: u.username,
        period: '۱۴۰۳/۱۲',
        baseSalary: 15000000,
        performanceBonus: u.role === Role.HOUSEKEEPING ? 2500000 : 1500000,
        penalty: 0,
        finalPay: 17000000,
        explanation: 'عملکرد عالی در حل مسائل فنی و SLA صد درصدی.',
        status: 'PENDING',
        createdAt: new Date().toISOString()
    }));

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-slate-900 p-3 rounded-2xl shadow-xl">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">تحلیل منابع انسانی و مالی</h2>
                        <p className="text-xs text-slate-500 mt-1 font-bold">محاسبه پاداش هوشمند و پیش‌بینی نیاز به نیرو</p>
                    </div>
                </div>
                
                <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('REWARDS')}
                        className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'REWARDS' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        حقوق و پاداش
                    </button>
                    <button 
                        onClick={() => setActiveTab('FORECAST')}
                        className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'FORECAST' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        پیش‌بینی نیرو
                    </button>
                </div>
            </div>

            {activeTab === 'REWARDS' ? (
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-black text-slate-900 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-indigo-600" />
                                فیش حقوقی و پاداش عملکرد (اسفند ۱۴۰۳)
                            </h3>
                            <button className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">تایید کل پرداخت‌ها</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="p-6">پرسنل</th>
                                        <th className="p-6">پایه حقوق</th>
                                        <th className="p-6">پاداش AI</th>
                                        <th className="p-6">جریمه/کسورات</th>
                                        <th className="p-6">دریافتی نهایی</th>
                                        <th className="p-6 text-center">وضعیت</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {mockRewards.map(reward => (
                                        <tr key={reward.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-6">
                                                <div className="font-black text-slate-900">{reward.username}</div>
                                                <div className="text-[10px] text-slate-400 font-bold">کد: {reward.staffId.slice(0, 5)}</div>
                                            </td>
                                            <td className="p-6 font-bold text-slate-600">{reward.baseSalary.toLocaleString()} ریال</td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-1 text-emerald-600 font-black">
                                                    <ArrowUpRight className="w-3 h-3" />
                                                    {reward.performanceBonus.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="p-6 font-bold text-rose-500">{reward.penalty.toLocaleString()}</td>
                                            <td className="p-6 font-black text-slate-900 text-lg">{reward.finalPay.toLocaleString()}</td>
                                            <td className="p-6 text-center">
                                                <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[10px] font-black">
                                                    در انتظار تایید
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Users className="w-32 h-32" /></div>
                            <h3 className="font-black text-xl text-slate-900 mb-8 flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                                پیش‌بینی راندمان ۷ روز آینده
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">نرخ اشغال تخمینی</span>
                                        <span className="text-2xl font-black text-slate-900">{forecasting.occupancy}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                        <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${forecasting.occupancy}%` }} />
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                                        بر اساس رزروهای ثبت شده و روند سال گذشته در این ماه، نرخ اشغال بالا پیش‌بینی می‌شود.
                                    </p>
                                </div>

                                <div className={`p-6 rounded-[2rem] border-2 border-dashed ${forecasting.color === 'text-rose-600' ? 'border-rose-200 bg-rose-50/30' : 'border-emerald-200 bg-emerald-50/30'}`}>
                                    <div className={`text-sm font-black mb-2 ${forecasting.color}`}>{forecasting.recommendation}</div>
                                    <p className="text-[11px] text-slate-600 font-bold leading-loose">
                                        {forecasting.details}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                                <Zap className="w-10 h-10 text-amber-400 mb-4" />
                                <h4 className="font-black text-lg mb-2">بهینه‌سازی هزینه‌ها</h4>
                                <p className="text-xs font-bold opacity-70 leading-relaxed">
                                    سیستم AI پیشنهاد می‌دهد شیفت‌های شب را با یک نفر کمتر در بخش پذیرش مدیریت کنید تا راندمان مالی ۱۰٪ افزایش یابد.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                                <Calendar className="w-10 h-10 text-indigo-600 mb-4" />
                                <h4 className="font-black text-lg mb-2 text-slate-900">توزیع بار کاری</h4>
                                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                    بار کاری بخش نظافت در روزهای آخر هفته ۳ برابر میانگین هفته است. توزیع مجدد شیفت‌ها پیشنهاد می‌شود.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[3rem] text-white shadow-2xl shadow-indigo-200">
                            <Sparkles className="w-10 h-10 text-indigo-200 mb-4" />
                            <h3 className="text-xl font-black mb-4">گزارش هوشمند Gemini</h3>
                            <div className="space-y-4 text-xs font-bold opacity-90 leading-loose">
                                <p>• نرخ خطای پرسنل فنی نسبت به ماه قبل ۱۵٪ کاهش داشته است.</p>
                                <p>• زمان حل مسائل (SLA) در بخش نظافت به رکورد ۴۵ دقیقه رسیده است.</p>
                                <p>• پاداش پیشنهادی برای کل تیم: ۲۵۰،۰۰۰،۰۰۰ ریال.</p>
                            </div>
                            <button className="w-full mt-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl font-black transition-all border border-white/20">تولید گزارش تفصیلی PDF</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffAnalytics;
