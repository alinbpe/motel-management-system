import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { LayoutDashboard, Home, Users, History, LogOut, Menu, Database } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout, hasRole } = useAuth();
  const location = useLocation();

  if (!currentUser) return <>{children}</>;

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <Link
      to={to}
      className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-3 p-2 sm:px-4 sm:py-3 rounded-lg transition-colors
        ${isActive(to) 
          ? 'text-blue-600 bg-blue-50' 
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
        }`}
    >
      <Icon className="w-6 h-6 sm:w-5 sm:h-5" />
      <span className="text-[10px] sm:text-sm font-medium">{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col sm:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex flex-col w-64 bg-white border-l h-screen sticky top-0">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-slate-800">مدیریت متل</h1>
          <p className="text-sm text-slate-500 mt-1">خوش آمدید، {currentUser.username}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem to="/dashboard" icon={LayoutDashboard} label="داشبورد" />
          <NavItem to="/cabins" icon={Home} label="کلبه‌ها" />
          {hasRole([Role.ADMIN]) && <NavItem to="/users" icon={Users} label="کاربران" />}
          <NavItem to="/logs" icon={History} label="تاریخچه" />
          <NavItem to="/profile" icon={Menu} label="پروفایل" />
        </nav>

        <div className="p-4 border-t space-y-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-green-50 text-green-700">
              <Database className="w-4 h-4" />
              <span>اتصال: آنلاین (Supabase)</span>
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>خروج</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sm:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-30">
        <h1 className="text-lg font-bold text-slate-800">مدیریت متل</h1>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                <Database className="w-3 h-3" />
                <span>آنلاین</span>
            </div>
            <div className="text-sm text-slate-500">{currentUser.username}</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-24 sm:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2 flex justify-between items-center z-40 safe-area-pb">
        <NavItem to="/dashboard" icon={LayoutDashboard} label="داشبورد" />
        <NavItem to="/cabins" icon={Home} label="کلبه‌ها" />
        {hasRole([Role.ADMIN]) && <NavItem to="/users" icon={Users} label="کاربران" />}
        <NavItem to="/logs" icon={History} label="تاریخچه" />
        <NavItem to="/profile" icon={Menu} label="پروفایل" />
      </nav>
    </div>
  );
};