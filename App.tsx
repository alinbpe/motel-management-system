
import React from 'react';
import { MemoryRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/ui/Layout';
import { Role } from './types';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cabins from './pages/Cabins';
import Users from './pages/Users';
import Inventory from './pages/Inventory';
import Issues from './pages/Issues';
import Logs from './pages/Logs';
import Reception from './pages/Reception';
import Guests from './pages/Guests';
import AdminAI from './pages/AdminAI';
import AdminVoice from './pages/AdminVoice';

// گارد امنیتی مبتنی بر نقش
const RoleGuard: React.FC<{ children: React.ReactNode; allowedRoles: Role[] }> = ({ children, allowedRoles }) => {
  const { currentUser, isAuthenticating } = useAuth();
  const location = useLocation();
  
  if (isAuthenticating) return (
    <div className="h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-500"></div>
    </div>
  );

  if (!currentUser) return <Navigate to="/login" replace state={{ from: location }} />;
  
  if (!allowedRoles.includes(currentUser.role)) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white p-12 text-center">
        <div className="bg-rose-50 p-8 rounded-[3rem] border-2 border-rose-100 shadow-xl shadow-rose-50">
            <div className="w-20 h-20 bg-rose-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl font-black">!</div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">شما به این بخش دسترسی ندارید</h1>
            <p className="text-slate-500 font-bold mb-8 leading-relaxed">نقش کاربری شما ({currentUser.role}) اجازه ورود به این پنل اختصاصی را نمی‌دهد.<br/>در صورت نیاز با مدیر سیستم تماس بگیرید.</p>
            <button 
                onClick={() => window.history.back()} 
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-lg active:scale-95"
            >
                بازگشت به پنل خود
            </button>
        </div>
      </div>
    );
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* پنل مدیریت کل */}
        <Route path="/admin/*" element={
          <RoleGuard allowedRoles={[Role.ADMIN]}>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="cabins" element={<Cabins />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="accounting" element={<div className="p-8 font-black">پنل حسابداری مدیر</div>} />
              <Route path="ai" element={<AdminAI />} />
              <Route path="voice" element={<AdminVoice />} />
              <Route path="logs" element={<Logs />} />
              <Route path="reception" element={<Reception />} />
            </Routes>
          </RoleGuard>
        } />

        {/* پنل پذیرش */}
        <Route path="/reception/*" element={
          <RoleGuard allowedRoles={[Role.ADMIN, Role.RECEPTION]}>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="booking" element={<Reception />} />
              <Route path="guests" element={<Guests />} />
              <Route path="cabins" element={<Cabins />} />
            </Routes>
          </RoleGuard>
        } />

        {/* پنل خانه‌داری */}
        <Route path="/housekeeping/*" element={
          <RoleGuard allowedRoles={[Role.ADMIN, Role.HOUSEKEEPING]}>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tasks" element={<Cabins />} />
              <Route path="issues" element={<Issues />} />
            </Routes>
          </RoleGuard>
        } />

        {/* پنل فنی و تعمیرات */}
        <Route path="/maintenance/*" element={
          <RoleGuard allowedRoles={[Role.ADMIN, Role.MAINTENANCE]}>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="tickets" element={<Issues />} />
              <Route path="cabins" element={<Cabins />} />
            </Routes>
          </RoleGuard>
        } />

        {/* پنل انبارداری */}
        <Route path="/warehouse/*" element={
          <RoleGuard allowedRoles={[Role.ADMIN, Role.WAREHOUSE]}>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
            </Routes>
          </RoleGuard>
        } />

        {/* پنل حسابداری */}
        <Route path="/accounting/*" element={
          <RoleGuard allowedRoles={[Role.ADMIN, Role.ACCOUNTANT]}>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="reports" element={<div className="p-8 font-black">گزارشات مالی حسابدار</div>} />
              <Route path="expenses" element={<div className="p-8 font-black">ثبت هزینه‌های حسابدار</div>} />
            </Routes>
          </RoleGuard>
        } />

        {/* پنل سرپرست */}
        <Route path="/supervisor/*" element={
          <RoleGuard allowedRoles={[Role.ADMIN, Role.SUPERVISOR]}>
            <Routes>
              <Route path="overview" element={<Dashboard />} />
              <Route path="approvals" element={<div className="p-8 font-black">تاییدیه عملیات سرپرست</div>} />
            </Routes>
          </RoleGuard>
        } />

        {/* ریدایرکت‌های هوشمند */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </MemoryRouter>
  );
};

function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </DataProvider>
  );
}

export default App;
