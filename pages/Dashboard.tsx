
import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { toJalaaliString, formatDateTime } from '../utils/dateUtils';
import { 
    Home, Calendar, CheckCircle2, Wrench, ClipboardList, 
    BrainCircuit, Zap, Users, ShieldAlert, Sparkles, TrendingUp, ChevronLeft, ArrowUpRight,
    Bell, Package, Activity, Clock, Wallet, BarChart3, AlertCircle
} from 'lucide-react';
import { CabinStatus, Priority, Role } from '../types';
import { ROLE_LABELS } from '../constants';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { cabins, stays, issues, logs, notifications, inventory } = useData();
  const { currentUser } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const stats = useMemo(() => ({
      occupied: cabins.filter(c => c.status === CabinStatus.OCCUPIED).length,
      ready: cabins.filter(c => c.status === CabinStatus.EMPTY_CLEAN).length,
      dirty: cabins.filter(c => c.status === CabinStatus.EMPTY_DIRTY).length,
      maintenance: cabins.filter(c => c.status === CabinStatus.ISSUE_TECH || c.status === CabinStatus.ISSUE_CLEAN).length,
      lowStock: inventory.filter(i => i.quantity <= i.minThreshold).length,
  }), [cabins, inventory]);

  if (!currentUser) return null;

  const rolePrefix = `/${currentUser.role.toLowerCase()}`;

  const StatCard = ({ icon: Icon, color, value, label, link }: any) => (
    <Link to={link} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
        <div className={`absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity`}>
            <Icon className="w-24 h-24" />
        </div>
        <div className={`w-14 h-14 rounded-3xl flex items-center justify-center mb-4 bg-${color}-500/10 text-${color}-600 dark:text-${color}-400`}>
            <Icon className="w-8 h-8" />
        </div>
        <div className="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter">{value}</div>
        <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</div>
    </Link>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={Home} color="indigo" value={stats.occupied} label="اشغال فعلی" link="/admin/cabins" />
            <StatCard icon={CheckCircle2} color="emerald" value={stats.ready} label="آماده تحویل" link="/admin/cabins" />
            <StatCard icon={BarChart3} color="blue" value="۸۴٪" label="ضریب اشغال ماه" link="/admin/accounting" />
            <StatCard icon={Wrench} color="rose" value={stats.maintenance} label="تیکت باز فنی" link="/admin/issues" />
        </div>
        <div className="bg-gradient-to-br from-brand-600 to-indigo-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="space-y-6">
                    <h3 className="text-3xl font-black flex items-center gap-3">
                        <BrainCircuit className="w-10 h-10 animate-pulse" />
                        AI Insights: بهبود راندمان
                    </h3>
                    <p className="text-lg font-bold opacity-90 max-w-2xl leading-relaxed">
                        بر اساس روند تخلیه امروز، پیش‌بینی می‌شود تا ساعت ۱۸:۰۰ تمام کلبه‌های <span className="bg-white/20 px-2 rounded-lg">خالی-کثیف</span> توسط تیم خانه‌داری تمیز شوند. پیشنهاد می‌شود برای فردا موجودی هیزم شارژ شود.
                    </p>
                    <div className="flex gap-4">
                        <Link to="/admin/ai" className="px-8 py-4 bg-white text-indigo-900 rounded-2xl font-black shadow-xl hover:scale-105 transition-transform">گفتگو با دستیار</Link>
                    </div>
                </div>
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20">
                    <TrendingUp className="w-16 h-16" />
                </div>
            </div>
        </div>
    </div>
  );

  const renderHousekeepingDashboard = () => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard icon={ClipboardList} color="emerald" value={stats.dirty} label="کلبه منتظر نظافت" link="/housekeeping/tasks" />
            <StatCard icon={AlertCircle} color="amber" value={stats.maintenance} label="گزارش خرابی ثبت شده" link="/housekeeping/issues" />
        </div>
        <div className="bg-emerald-600 p-10 rounded-[3.5rem] text-white shadow-2xl">
            <h3 className="text-2xl font-black mb-4">وضعیت شیفت امروز</h3>
            <p className="font-bold opacity-80 leading-relaxed">خوش آمدید! امروز شما مسئول نظافت ۹ کلبه هستید. اولویت با کلبه‌های «اوپاچ» و «میچکا» جهت پذیرش جدید است.</p>
        </div>
    </div>
  );

  const renderMaintenanceDashboard = () => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard icon={Wrench} color="orange" value={stats.maintenance} label="تیکت‌های در دست اقدام" link="/maintenance/tickets" />
            <StatCard icon={Zap} color="rose" value="۲" label="موارد بحرانی (Critical)" link="/maintenance/tickets" />
        </div>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div className="space-y-1">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {currentUser.username} عزیز، خوش آمدید
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">داشبورد هوشمند بخش {ROLE_LABELS[currentUser.role]}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 px-6 py-3 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
                <Calendar className="w-5 h-5 text-brand-600" />
                <span className="font-black text-slate-800 dark:text-slate-200">{toJalaaliString(today)}</span>
            </div>
        </div>

        {currentUser.role === Role.ADMIN && renderAdminDashboard()}
        {currentUser.role === Role.HOUSEKEEPING && renderHousekeepingDashboard()}
        {currentUser.role === Role.MAINTENANCE && renderMaintenanceDashboard()}
        
        {/* داشبورد عمومی برای سایر نقش‌ها */}
        {!([Role.ADMIN, Role.HOUSEKEEPING, Role.MAINTENANCE].includes(currentUser.role)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={Activity} color="indigo" value="Live" label="سیستم آنلاین" link={`${rolePrefix}/dashboard`} />
                <StatCard icon={Bell} color="amber" value={unreadCount} label="اعلان‌های جدید" link="#" />
            </div>
        )}

        {/* فید لاگ برای همه (فقط مربوط به بخش خودشان در آینده) */}
        <div className="mt-12 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <Activity className="w-6 h-6 text-brand-600" />
                    آخرین رویدادها
                </h3>
            </div>
            <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
                {logs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black text-[10px] shrink-0 uppercase tracking-widest">
                            {log.username[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <p className="text-xs font-black text-slate-900 dark:text-white truncate">{log.details}</p>
                                <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap mr-2">
                                    {formatDateTime(log.timestamp)}
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{log.action}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default Dashboard;
