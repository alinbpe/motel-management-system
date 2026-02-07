
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Role } from '../../types';
import { ROLE_LABELS, ROLE_THEMES } from '../../constants';
import { 
    LayoutDashboard, Home, Users, History, LogOut, Menu, 
    UserPlus, BookOpen, Wrench, Sun, Moon, Package, 
    Wallet, ShieldCheck, X, Bell, ClipboardCheck, 
    BarChart3, Settings, Mic, BrainCircuit, AlertCircle
} from 'lucide-react';
import { Link, useLocation, Navigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleDarkMode, notifications } = useData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  if (!currentUser) return <Navigate to="/login" replace />;

  const unreadCount = notifications.filter(n => !n.read).length;
  const theme = ROLE_THEMES[currentUser.role];

  // نگاشت منوها بر اساس نقش
  const getMenuItems = () => {
    const rolePrefix = `/${currentUser.role.toLowerCase()}`;
    const baseItems = [
      { to: `${rolePrefix}/dashboard`, icon: LayoutDashboard, label: "داشبورد" },
    ];

    switch (currentUser.role) {
      case Role.ADMIN:
        return [
          ...baseItems,
          { to: "/admin/users", icon: Users, label: "مدیریت کاربران" },
          { to: "/admin/reception", icon: UserPlus, label: "پذیرش مهمان" },
          { to: "/admin/cabins", icon: Home, label: "وضعیت کلبه‌ها" },
          { to: "/admin/inventory", icon: Package, label: "انبار و موجودی" },
          { to: "/admin/accounting", icon: Wallet, label: "حسابداری و مالی" },
          { to: "/admin/ai", icon: BrainCircuit, label: "Admin AI" },
          { to: "/admin/voice", icon: Mic, label: "کنترل صوتی" },
          { to: "/admin/logs", icon: History, label: "لاگ تغییرات" },
        ];
      case Role.RECEPTION:
        return [
          ...baseItems,
          { to: "/reception/booking", icon: UserPlus, label: "پذیرش جدید" },
          { to: "/reception/guests", icon: BookOpen, label: "بانک مهمان‌ها" },
          { to: "/reception/cabins", icon: Home, label: "وضعیت کلبه‌ها" },
        ];
      case Role.HOUSEKEEPING:
        return [
          ...baseItems,
          { to: "/housekeeping/tasks", icon: ClipboardCheck, label: "لیست نظافت" },
          { to: "/housekeeping/issues", icon: AlertCircle, label: "گزارش خرابی" },
        ];
      case Role.MAINTENANCE:
        return [
          ...baseItems,
          { to: "/maintenance/tickets", icon: Wrench, label: "تیکت‌های فنی" },
          { to: "/maintenance/cabins", icon: Home, label: "سرویس کلبه‌ها" },
        ];
      case Role.WAREHOUSE:
        return [
          ...baseItems,
          { to: "/warehouse/inventory", icon: Package, label: "موجودی کالا" },
          { to: "/warehouse/logs", icon: History, label: "تاریخچه مصرف" },
        ];
      case Role.ACCOUNTANT:
        return [
          ...baseItems,
          { to: "/accounting/reports", icon: BarChart3, label: "گزارش درآمد" },
          { to: "/accounting/expenses", icon: Wallet, label: "ثبت هزینه‌ها" },
        ];
      case Role.SUPERVISOR:
        return [
          ...baseItems,
          { to: "/supervisor/overview", icon: ShieldCheck, label: "نظارت زنده" },
          { to: "/supervisor/approvals", icon: ClipboardCheck, label: "تاییدیه عملیات" },
        ];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row transition-colors duration-300">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-80 bg-white dark:bg-slate-900 border-l dark:border-slate-800 h-screen sticky top-0 z-40">
        <div className="p-8 border-b dark:border-slate-800 flex items-center gap-3">
          <div className={`p-3 rounded-2xl bg-${theme}-600 shadow-lg shadow-${theme}-100`}>
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <span className="font-black text-xl dark:text-white block leading-none">Motel OS</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ROLE_LABELS[currentUser.role]}</span>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-4 p-4 rounded-[1.5rem] font-bold text-sm transition-all duration-200
                ${location.pathname.startsWith(item.to) 
                  ? `bg-${theme}-600 text-white shadow-xl shadow-${theme}-100 translate-x-[-8px]` 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900'
                }`}
            >
              <item.icon className={`w-5 h-5 ${location.pathname.startsWith(item.to) ? 'text-white' : `text-${theme}-600 opacity-70`}`} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-slate-500">
                  {currentUser.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">{currentUser.username}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{currentUser.role}</p>
              </div>
              <button onClick={logout} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors">
                  <LogOut className="w-4 h-4" />
              </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden bg-white dark:bg-slate-900 border-b dark:border-slate-800 p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
            <ShieldCheck className={`w-6 h-6 text-${theme}-600`} />
            <span className="font-black text-lg dark:text-white uppercase tracking-tighter">Motel OS</span>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-right duration-500">
                <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center">
                    <span className="font-black text-xl dark:text-white">منوی دسترسی</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <X className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                    </button>
                </div>
                <div className="p-6 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-4 p-5 rounded-3xl font-black text-sm transition-all
                                ${location.pathname.startsWith(item.to) 
                                    ? `bg-${theme}-600 text-white shadow-xl` 
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <item.icon className="w-6 h-6" />
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Main Area */}
      <main className="flex-1 p-4 lg:p-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center mb-8">
               <div className="hidden sm:block">
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">پنل {ROLE_LABELS[currentUser.role]}</h1>
                  <p className="text-slate-500 font-bold mt-1">مدیریت عملیات و ابزارهای اختصاصی بخش</p>
               </div>
               <div className="flex items-center gap-4">
                  <button onClick={toggleDarkMode} className="p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-sm text-slate-600 dark:text-slate-300 transition-transform active:scale-95">
                    {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                  </button>
                  <div className="relative">
                    <button className="p-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-sm text-slate-600 dark:text-slate-300">
                        <Bell className="w-6 h-6" />
                        {unreadCount > 0 && <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 border-2 border-white dark:border-slate-800 rounded-full"></span>}
                    </button>
                  </div>
               </div>
            </div>
            {children}
        </div>
      </main>
    </div>
  );
};
