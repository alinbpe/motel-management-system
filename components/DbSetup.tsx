
import { Database, Copy, Check, Shield, AlertTriangle } from 'lucide-react';
import React, { useState } from 'react';

const RLS_SQL = `-- Motel OS - Enterprise RLS & Schema Configuration

-- 1. جدول کاربران (بروزرسانی محدودیت نقش‌ها)
-- در صورتی که با خطای users_role_check مواجه شدید، دستورات زیر را اجرا کنید تا محدودیت با کد هماهنگ شود:

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('ADMIN', 'RECEPTION', 'HOUSEKEEPING', 'TECHNICAL', 'MAINTENANCE', 'WAREHOUSE', 'ACCOUNTANT', 'SUPERVISOR'));

-- 2. فعال‌سازی امنیت لایه دیتابیس (RLS)
ALTER TABLE cabins ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stays ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- 3. سیاست‌های دسترسی (Policies)
CREATE POLICY "Admin/Supervisor full access" ON cabins 
FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' IN ('ADMIN', 'SUPERVISOR'));

CREATE POLICY "Reception read/write status" ON cabins 
FOR UPDATE TO authenticated 
USING (auth.jwt() ->> 'role' = 'RECEPTION')
WITH CHECK (status IN ('OCCUPIED', 'EMPTY_CLEAN'));

CREATE POLICY "Staff read cabins" ON cabins 
FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Admins manage users" ON users 
FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Users read own profile" ON users 
FOR SELECT TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Reception/Admin full access stays" ON stays 
FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' IN ('ADMIN', 'RECEPTION'));

CREATE POLICY "Staff manage issues" ON issues 
FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' IN ('ADMIN', 'TECHNICAL', 'MAINTENANCE', 'HOUSEKEEPING'));
`;

export const DbSetup: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(RLS_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-right" dir="rtl">
      <div className="max-w-3xl w-full bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-10 text-center border-b border-slate-100 bg-slate-50">
          <Shield className="w-16 h-16 text-brand-600 mx-auto mb-6" />
          <h1 className="text-3xl font-black text-slate-800">امنیت و تنظیمات دیتابیس</h1>
          <p className="text-slate-500 mt-3 text-sm font-bold max-w-lg mx-auto leading-relaxed">
            برای رفع خطای "users_role_check" و فعال‌سازی امنیت (RLS)، کدهای زیر را در SQL Editor وب‌سایت Supabase اجرا کنید.
          </p>
        </div>
        <div className="p-10 space-y-6">
          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex items-center gap-3 text-rose-600 text-xs font-bold">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            توجه: این دستورات محدودیت‌های نقش (Role) را با کد برنامه هماهنگ می‌کنند.
          </div>
          <pre className="bg-slate-900 text-emerald-400 p-8 rounded-[2rem] text-[11px] font-mono overflow-auto max-h-[400px] text-left dir-ltr border-4 border-slate-800 shadow-inner">
            {RLS_SQL}
          </pre>
          <button onClick={handleCopy} className="w-full py-5 bg-brand-600 text-white rounded-3xl font-black flex items-center justify-center gap-3 transition-all hover:bg-brand-700 shadow-xl shadow-brand-100 active:scale-95">
            {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
            {copied ? 'کدها کپی شدند' : 'کپی دستورات SQL برای Supabase'}
          </button>
        </div>
      </div>
    </div>
  );
};
