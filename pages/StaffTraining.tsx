
import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { StaffTraining, Role } from '../types';
import { BookOpen, CheckCircle, Clock, Lightbulb, PlayCircle, ShieldAlert, Award, ChevronRight } from 'lucide-react';

const StaffTrainingPage: React.FC = () => {
    const { issues } = useData();
    const { currentUser: authUser } = useAuth();

    // تولید محتوای آموزشی فرضی بر اساس ضعف‌ها (Simulation)
    const trainingModules: StaffTraining[] = useMemo(() => {
        if (!authUser) return [];
        
        const myIssues = issues.filter(i => i.reportedBy === authUser.username);
        const hasTechnicalIssues = myIssues.some(i => i.type === 'TECHNICAL');
        
        const modules: StaffTraining[] = [
            {
                id: '1',
                staffId: authUser.id,
                topic: 'اصول مدیریت زمان در نظافت',
                reason: 'تاخیر در حل ۲ مورد SLA در هفته اخیر',
                content: 'در این دوره می‌آموزید که چگونه چک‌لیست‌های ۱۶ گانه را در کمتر از ۴۰ دقیقه با دقت ۱۰۰٪ تکمیل کنید.',
                status: 'ASSIGNED',
                createdAt: new Date().toISOString()
            }
        ];

        /* Fixed: Using Role.MAINTENANCE instead of non-existent Role.TECHNICAL */
        if (hasTechnicalIssues || authUser.role === Role.MAINTENANCE) {
            modules.push({
                id: '2',
                staffId: authUser.id,
                topic: 'عیب‌یابی سریع سیستم‌های گرمایشی',
                reason: 'گزارش‌های مکرر خرابی پکیج در کلبه‌های کوهستانی',
                content: 'راهنمای گام‌به‌گام فشارسنج و ترموستات برای کاهش زمان تعمیرات اضطراری.',
                status: 'ASSIGNED',
                createdAt: new Date().toISOString()
            });
        }

        return modules;
    }, [issues, authUser]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-emerald-600 p-4 rounded-2xl shadow-xl shadow-emerald-100">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">مرکز آموزش و ارتقای مهارت</h2>
                        <p className="text-sm text-slate-500 mt-1 font-bold">محتوای آموزشی شخصی‌سازی شده بر اساس عملکرد شما</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="text-center px-6 border-l">
                        <div className="text-2xl font-black text-emerald-600">۸۵</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase">امتیاز یادگیری</div>
                    </div>
                    <div className="text-center px-6">
                        <div className="text-2xl font-black text-indigo-600">۲</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase">دوره فعال</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="font-black text-slate-800 flex items-center gap-2 px-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        دوره‌های پیشنهادی AI برای شما
                    </h3>
                    
                    <div className="space-y-4">
                        {trainingModules.map(module => (
                            <div key={module.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <div className="w-full sm:w-48 h-32 bg-slate-100 rounded-3xl flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
                                        <PlayCircle className="w-12 h-12 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-xl font-black text-slate-900">{module.topic}</h4>
                                            <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black border border-amber-100">الزامی</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black">
                                            <ShieldAlert className="w-3.5 h-3.5" />
                                            علت: {module.reason}
                                        </div>
                                        <p className="text-sm text-slate-500 font-bold leading-relaxed line-clamp-2">
                                            {module.content}
                                        </p>
                                        <div className="pt-2 flex justify-between items-center">
                                            <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ۱۵ دقیقه</span>
                                                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> ۵ امتیاز</span>
                                            </div>
                                            <button className="flex items-center gap-1 text-sm font-black text-indigo-600 hover:gap-2 transition-all">
                                                شروع یادگیری
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 p-8 rounded-[3rem] text-white space-y-6">
                        <Award className="w-12 h-12 text-amber-400" />
                        <h3 className="text-xl font-black">مسیر شغلی شما</h3>
                        <p className="text-xs font-bold opacity-70 leading-relaxed">
                            با اتمام ۵ دوره آموزشی دیگر و حفظ امتیاز بالای ۹۰، شما واجد شرایط دریافت نشان "سرپرست تیم" و افزایش پایه حقوق ۱۰٪ خواهید بود.
                        </p>
                        <div className="pt-4 space-y-2">
                            <div className="flex justify-between text-[10px] font-black">
                                <span>پیشرفت در مسیر ارتقا</span>
                                <span>۶۰٪</span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div className="bg-amber-400 h-full w-[60%] rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50 p-8 rounded-[3rem] border border-emerald-100 space-y-4">
                        <div className="bg-emerald-600 w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <h4 className="font-black text-emerald-900">دوره‌های گذرانده شده</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                پروتکل‌های بهداشتی کلبه (نمره ۱۰۰)
                            </li>
                            <li className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                نحوه برخورد با مهمان معترض (نمره ۹۵)
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffTrainingPage;
