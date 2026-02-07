
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { 
    ShieldCheck, Eye, EyeOff, Lock, User, Loader2, 
    ArrowLeft, Mic, Sparkles, AlertCircle, Database, 
    PlayCircle, Terminal, ShieldAlert 
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { DbSetup } from '../components/DbSetup';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showDbSetup, setShowDbSetup] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'IDLE' | 'LISTENING' | 'VERIFYING'>('IDLE');
  
  const { login, currentUser } = useAuth();
  const { loading, dbError, enableDemoMode, isDemoMode } = useData();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (currentUser) {
      navigate(`/${currentUser.role.toLowerCase()}/dashboard`);
    }
  }, [currentUser, navigate]);

  const handleVoiceLogin = () => {
    setVoiceStatus('LISTENING');
    setTimeout(() => {
        setVoiceStatus('VERIFYING');
        setTimeout(async () => {
            const user = await login('admin', 'zanous2311');
            if (user) {
                navigate(`/${user.role.toLowerCase()}/dashboard`);
            } else {
                setError('خطا در تایید هویت صوتی.');
            }
            setVoiceStatus('IDLE');
            setIsVoiceMode(false);
        }, 1500);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setIsPending(true);
    setError('');
    
    try {
        const user = await login(username, password);
        if (user) {
            // Success! Navigate directly based on the user's role
            navigate(`/${user.role.toLowerCase()}/dashboard`);
        } else {
            setError('نام کاربری یا رمز عبور اشتباه است.');
        }
    } catch (err) {
        setError('خطا در برقراری ارتباط با سرور.');
    } finally {
        setIsPending(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6">
        <div className="relative mb-8">
            <div className="absolute -inset-4 bg-brand-500/20 rounded-full blur-xl animate-pulse"></div>
            <Loader2 className="w-16 h-16 animate-spin text-brand-500 relative" />
        </div>
        <div className="text-center space-y-2">
            <p className="text-white text-xl font-black tracking-tight">در حال اتصال به هسته متل...</p>
            <p className="text-slate-500 font-bold text-sm">لطفاً شکیبا باشید</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden p-6">
      {/* Background Decorations */}
      <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-brand-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>

      <div className="w-full max-w-[440px] z-10 space-y-8">
        <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-5 bg-brand-600 rounded-4xl shadow-2xl shadow-brand-500/40 transform transition-transform hover:scale-110">
                <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">پنل مدیریت هوشمند</h1>
            <p className="text-slate-400 font-bold">ورود امن به سامانه Motel OS</p>
        </div>

        {/* Database Connection Alert */}
        {dbError && !isDemoMode && (
            <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-3xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-start gap-3">
                    <Database className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                    <div className="space-y-1">
                        <h4 className="text-amber-500 font-black text-sm">خطای اتصال به دیتابیس Supabase</h4>
                        <p className="text-amber-500/70 text-xs font-bold leading-relaxed">
                            {dbError === 'MISSING_TABLES' 
                                ? 'جداول مورد نیاز در دیتابیس شما یافت نشد. لطفاً ابتدا اسکریپت SQL را اجرا کنید.' 
                                : 'امکان برقراری ارتباط با دیتابیس وجود ندارد. وضعیت اینترنت یا کلیدهای Supabase را بررسی کنید.'}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setShowDbSetup(true)}
                        className="flex items-center justify-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 py-3 rounded-2xl text-[10px] font-black transition-all"
                    >
                        <Terminal className="w-4 h-4" /> دستورات SQL
                    </button>
                    <button 
                        onClick={enableDemoMode}
                        className="flex items-center justify-center gap-2 bg-amber-500 text-white py-3 rounded-2xl text-[10px] font-black shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                    >
                        <PlayCircle className="w-4 h-4" /> ورود به حالت دمو
                    </button>
                </div>
            </div>
        )}

        <div className="glass rounded-4xl border border-white/10 shadow-2xl p-8 sm:p-10 transition-all duration-500">
          {!isVoiceMode ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 mr-2 uppercase tracking-widest">شناسه کاربری</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 px-5 py-4 rounded-2xl outline-none transition-all font-black text-slate-900 dark:text-white dir-ltr"
                    placeholder="Username"
                    autoComplete="username"
                  />
                  <User className="w-5 h-5 text-slate-400 absolute right-4 top-4 group-focus-within:text-brand-500 transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 mr-2 uppercase tracking-widest">رمز عبور</label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-100/50 dark:bg-slate-800/50 border-2 border-transparent focus:border-brand-500 px-5 py-4 rounded-2xl outline-none transition-all font-black text-slate-900 dark:text-white dir-ltr pr-12"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <Lock className="w-5 h-5 text-slate-400 absolute right-4 top-4 group-focus-within:text-brand-500 transition-colors" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-4 text-slate-400 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-rose-500/10 text-rose-500 p-4 rounded-2xl text-xs font-black border border-rose-500/20 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button 
                    type="submit" 
                    disabled={isPending} 
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-5 rounded-3xl transition-all shadow-xl shadow-brand-500/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <><span>ورود به سامانه</span><ArrowLeft className="w-5 h-5" /></>}
                </button>
                
                <button 
                    type="button" 
                    onClick={() => setIsVoiceMode(true)} 
                    className="w-full bg-slate-800/50 text-slate-300 font-black py-4 rounded-3xl transition-all border border-white/5 hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <Mic className="w-5 h-5 text-brand-500" /> ورود با تشخیص هویت صوتی
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center py-6 space-y-8 animate-in zoom-in-95">
                <div className={`w-28 h-28 rounded-full flex items-center justify-center bg-brand-600/10 text-brand-500 relative ${voiceStatus === 'LISTENING' ? 'voice-ring' : ''}`}>
                    {voiceStatus === 'VERIFYING' ? <Sparkles className="w-12 h-12 animate-pulse" /> : <Mic className="w-12 h-12" />}
                </div>
                
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-white">
                        {voiceStatus === 'IDLE' ? 'آماده تایید هویت' : voiceStatus === 'LISTENING' ? 'در حال گوش دادن...' : 'تحلیل فرکانس صدا...'}
                    </h3>
                    <p className="text-sm text-slate-500 font-bold px-6 leading-relaxed">
                        {voiceStatus === 'IDLE' ? 'جمله "ورود به سیستم مدیریت" را بیان کنید' : 'لطفاً جمله را تکرار کنید...'}
                    </p>
                </div>

                <div className="flex gap-4 w-full pt-4">
                    <button onClick={() => setIsVoiceMode(false)} className="flex-1 py-4 bg-slate-800 text-slate-400 rounded-3xl font-black">انصراف</button>
                    <button onClick={handleVoiceLogin} disabled={voiceStatus !== 'IDLE'} className="flex-[2] py-4 bg-brand-600 text-white rounded-3xl font-black shadow-lg shadow-brand-500/20 disabled:opacity-50 transition-all active:scale-95">
                        {voiceStatus === 'IDLE' ? 'شروع ضبط' : 'درحال پردازش'}
                    </button>
                </div>
            </div>
          )}
        </div>
        
        {isDemoMode && (
             <div className="bg-blue-600/10 border-2 border-blue-600/20 rounded-3xl p-5 flex items-center gap-4 animate-in fade-in duration-500">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                    <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h4 className="text-blue-500 font-black text-sm">شما در حالت دمو هستید</h4>
                    <p className="text-slate-500 text-[10px] font-bold mt-1">
                        اطلاعات شما در مرورگر ذخیره می‌شود و به سرور ارسال نمی‌گردد.
                    </p>
                </div>
            </div>
        )}

        <p className="text-center text-slate-600 text-[10px] font-black tracking-widest uppercase opacity-50">Motel OS Enterprise v6.5.2</p>
      </div>

      {/* Database Setup Modal */}
      <Modal isOpen={showDbSetup} onClose={() => setShowDbSetup(false)} title={<div className="flex items-center gap-2"><Database className="w-5 h-5 text-blue-600" /> <span>تنظیمات پایگاه داده</span></div>}>
          <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
            <DbSetup />
          </div>
      </Modal>
    </div>
  );
};

export default Login;
