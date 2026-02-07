
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Cabin, CabinStatus, Guest, Stay, Role } from '../types';
import { CabinIcon } from '../components/ui/CabinIcon';
import { getTodayJalaali, fromJalaaliToDate, toJalaaliString } from '../utils/dateUtils';
import jalaali from 'jalaali-js';
import { 
    Calendar, User, Phone, CheckCircle2, Home, Users, Loader2, 
    Printer, ArrowRight, LayoutList, ChevronLeft, Plus, Trash2, ShieldAlert, AlertCircle
} from 'lucide-react';
import { Modal } from '../components/ui/Modal';

// Define a JoinedStay type that includes the cabin info to resolve property access errors
interface JoinedStay extends Stay {
    cabin?: Cabin;
}

const Reception: React.FC = () => {
  const { cabins, findGuestByPhone, registerReceptionStay, deleteStay, stays, refreshData } = useData();
  const { currentUser, hasRole } = useAuth();
  
  const [view, setView] = useState<'SELECT_DATE' | 'REGISTER' | 'SUMMARY'>('SELECT_DATE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reception State
  const [selectedJDate, setSelectedJDate] = useState(getTodayJalaali());
  const [activeCabin, setActiveCabin] = useState<Cabin | null>(null);
  
  // Guest Form
  const [guestPhone, setGuestPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [nights, setNights] = useState(1);
  const [isExistingGuest, setIsExistingGuest] = useState(false);

  // Deletion Modal State - Using JoinedStay to allow access to .cabin property
  const [stayToDelete, setStayToDelete] = useState<JoinedStay | null>(null);

  // Security Check
  if (!hasRole([Role.ADMIN, Role.RECEPTION])) {
      return (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-red-100 shadow-xl shadow-red-50">
              <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-xl font-extrabold text-slate-800 mb-2">عدم دسترسی</h2>
              <p className="text-slate-500 text-sm">فقط پرسنل پذیرش مجاز به ثبت اطلاعات در این بخش هستند.</p>
          </div>
      );
  }

  const selectedDateStr = useMemo(() => {
    const { gy, gm, gd } = jalaali.toGregorian(selectedJDate.jy, selectedJDate.jm, selectedJDate.jd);
    return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
  }, [selectedJDate]);

  // Joined stays with cabin information for UI display
  const dailyStays = useMemo<JoinedStay[]>(() => {
      return stays
        .filter(s => s.stayDate === selectedDateStr)
        .map(s => ({
            ...s,
            cabin: cabins.find(c => c.id === s.cabinId)
        }));
  }, [stays, selectedDateStr, cabins]);

  useEffect(() => {
    const lookup = async () => {
      if (guestPhone.length >= 11) {
        const found = await findGuestByPhone(guestPhone);
        if (found) {
          setFirstName(found.firstName);
          setLastName(found.lastName);
          setIsExistingGuest(true);
        } else {
          setIsExistingGuest(false);
        }
      }
    };
    lookup();
  }, [guestPhone]);

  const handleCabinSelect = (cabin: Cabin) => {
      if (cabin.status !== CabinStatus.EMPTY_CLEAN) {
          setErrorMsg(`کلبه ${cabin.name} در حال حاضر قابل تحویل نیست.`);
          setActiveCabin(null);
          setTimeout(() => setErrorMsg(null), 3000);
          return;
      }
      setErrorMsg(null);
      setActiveCabin(cabin);
  };

  const handleStartReception = () => setView('REGISTER');
  
  const handleRegisterStay = async () => {
    if (!activeCabin || !currentUser) return;
    setIsSubmitting(true);
    try {
        await registerReceptionStay(
            activeCabin.id,
            { firstName, lastName, phone: guestPhone },
            selectedDateStr,
            nights,
            guestCount,
            currentUser
        );
        setGuestPhone('');
        setFirstName('');
        setLastName('');
        setGuestCount(2);
        setNights(1);
        setActiveCabin(null);
        await refreshData();
    } catch (e) {
        alert("خطا در ثبت اطلاعات.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const confirmDeleteStay = async () => {
    if (!stayToDelete || !currentUser) return;
    setIsSubmitting(true);
    try {
        await deleteStay(stayToDelete.id, currentUser);
        setStayToDelete(null);
    } catch (e) {
        alert("خطا در حذف اقامت.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderSelectDate = () => (
    <div className="max-w-md mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="text-center">
            <div className="bg-blue-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200">
                <Calendar className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">پذیرش مهمان</h2>
            <p className="text-slate-600 mt-2 font-medium">ابتدا تاریخ پذیرش را انتخاب کنید</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block px-1">روز</label>
                    <select 
                        value={selectedJDate.jd}
                        onChange={e => setSelectedJDate({...selectedJDate, jd: Number(e.target.value)})}
                        className="w-full p-3 rounded-xl bg-white border-2 border-slate-300 outline-none focus:border-blue-500 font-black text-slate-900 transition-all cursor-pointer text-lg"
                    >
                        {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block px-1">ماه</label>
                    <select 
                        value={selectedJDate.jm}
                        onChange={e => setSelectedJDate({...selectedJDate, jm: Number(e.target.value)})}
                        className="w-full p-3 rounded-xl bg-white border-2 border-slate-300 outline-none focus:border-blue-500 font-black text-slate-900 transition-all cursor-pointer text-lg"
                    >
                        {['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'].map((m, i) => (
                            <option key={i} value={i+1}>{m}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block px-1">سال</label>
                    <select 
                        value={selectedJDate.jy}
                        onChange={e => setSelectedJDate({...selectedJDate, jy: Number(e.target.value)})}
                        className="w-full p-3 rounded-xl bg-white border-2 border-slate-300 outline-none focus:border-blue-500 font-black text-slate-900 transition-all cursor-pointer text-lg"
                    >
                        {[1403, 1404, 1405].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <button 
                onClick={handleStartReception}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                شروع پذیرش این روز
                <ArrowRight className="w-6 h-6" />
            </button>
        </div>
    </div>
  );

  const renderRegister = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
        {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 animate-bounce shadow-lg">
                <AlertCircle className="w-6 h-6" />
                <span className="font-bold">{errorMsg}</span>
            </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm gap-4">
            <div className="flex items-center gap-3">
                <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                    <Calendar className="w-5 h-5" />
                </div>
                <div>
                    <span className="text-xs text-slate-500 block font-bold">در حال ثبت برای:</span>
                    <span className="font-black text-slate-900 text-lg">{toJalaaliString(selectedDateStr)}</span>
                </div>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => setView('SELECT_DATE')}
                    className="px-4 py-2 text-xs font-black text-blue-600 hover:bg-blue-50 border-2 border-blue-100 rounded-xl transition-all"
                >
                    تغییر تاریخ
                </button>
                <button 
                    onClick={() => setView('SUMMARY')}
                    className="px-6 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-black transition-all shadow-lg"
                >
                    مشاهده لیست پذیرش
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="font-black text-slate-900 flex items-center gap-2 text-lg">
                        <Home className="w-5 h-5 text-blue-600" />
                        انتخاب کلبه (فقط موارد آماده تحویل)
                    </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {cabins.map(cabin => {
                        const isSelected = activeCabin?.id === cabin.id;
                        const isReady = cabin.status === CabinStatus.EMPTY_CLEAN;
                        const hasStayToday = dailyStays.some(s => s.cabinId === cabin.id);
                        
                        return (
                            <button
                                key={cabin.id}
                                onClick={() => handleCabinSelect(cabin)}
                                className={`p-4 rounded-3xl border-2 transition-all text-center relative ${
                                    isSelected 
                                        ? 'border-blue-600 bg-blue-50 shadow-inner' 
                                        : !isReady 
                                            ? 'border-slate-100 bg-slate-50 opacity-60 grayscale cursor-not-allowed' 
                                            : 'border-white bg-white shadow-sm hover:border-blue-200'
                                }`}
                            >
                                <CabinIcon iconName={cabin.icon} className={`w-12 h-12 mx-auto mb-2 ${isSelected ? 'text-blue-600' : isReady ? 'text-emerald-500' : 'text-slate-300'}`} />
                                <div className={`font-black text-sm ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>{cabin.name}</div>
                                {!isReady && (
                                    <div className="text-[8px] mt-1 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
                                        غیرمجاز
                                    </div>
                                )}
                                {hasStayToday && (
                                    <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full shadow-md">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-black text-slate-900 flex items-center gap-2 px-2 text-lg">
                    <User className="w-5 h-5 text-emerald-600" />
                    اطلاعات مهمان
                </h3>
                <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 shadow-lg space-y-5">
                    {!activeCabin ? (
                        <div className="py-12 text-center text-slate-400">
                            <Home className="w-16 h-16 mx-auto mb-4 opacity-10" />
                            <p className="font-bold text-sm">لطفا یک کلبه «آماده تحویل» انتخاب کنید</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mb-2 bg-blue-600 p-3 rounded-2xl shadow-md">
                                <CabinIcon iconName={activeCabin.icon} className="w-6 h-6 text-white" />
                                <span className="font-black text-white text-lg">کلبه {activeCabin.name}</span>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="relative">
                                    <label className="text-xs text-slate-500 font-black mb-1 block mr-1">شماره تلفن</label>
                                    <input 
                                        type="tel" 
                                        placeholder="مثال: 09123456789"
                                        value={guestPhone}
                                        onChange={e => setGuestPhone(e.target.value)}
                                        className="w-full pr-10 py-4 rounded-2xl bg-white border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dir-ltr text-right text-slate-900 font-black text-lg transition-all placeholder:text-slate-300 shadow-sm"
                                    />
                                    <Phone className="w-5 h-5 text-slate-400 absolute right-3 top-10" />
                                    {isExistingGuest && <div className="text-xs text-emerald-600 font-black mt-1 mr-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> مهمان قدیمی یافت شد</div>}
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <input 
                                        placeholder="نام..."
                                        value={firstName}
                                        onChange={e => setFirstName(e.target.value)}
                                        className="w-full px-4 py-4 rounded-2xl bg-white border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-slate-900 font-black text-lg transition-all placeholder:text-slate-300 shadow-sm"
                                    />
                                    <input 
                                        placeholder="نام خانوادگی..."
                                        value={lastName}
                                        onChange={e => setLastName(e.target.value)}
                                        className="w-full px-4 py-4 rounded-2xl bg-white border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-slate-900 font-black text-lg transition-all placeholder:text-slate-300 shadow-sm"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-500 font-black mb-1 block mr-1">تعداد نفرات</label>
                                        <input 
                                            type="number"
                                            value={guestCount}
                                            onChange={e => setGuestCount(Number(e.target.value))}
                                            className="w-full px-4 py-4 rounded-2xl bg-white border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-center font-black text-slate-900 text-xl transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-500 font-black mb-1 block mr-1">تعداد شب</label>
                                        <input 
                                            type="number"
                                            min="1"
                                            value={nights}
                                            onChange={e => setNights(Number(e.target.value))}
                                            className="w-full px-4 py-4 rounded-2xl bg-white border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 text-center font-black text-slate-900 text-xl transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleRegisterStay}
                                disabled={isSubmitting || !firstName || !lastName || !guestPhone}
                                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
                            >
                                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                                ثبت نهایی پذیرش
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="pb-24">
        {view === 'SELECT_DATE' && renderSelectDate()}
        {view === 'REGISTER' && renderRegister()}
        {view === 'SUMMARY' && (
            <div className="animate-in fade-in duration-500 space-y-6">
                <button onClick={() => setView('REGISTER')} className="flex items-center gap-2 font-black text-slate-600 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border">
                    <ChevronLeft className="w-4 h-4" />
                    بازگشت به ثبت پذیرش
                </button>
                
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 p-6 border-b">
                        <h3 className="text-xl font-black text-slate-800">خلاصه پذیرش روز {toJalaaliString(selectedDateStr)}</h3>
                        <p className="text-xs text-slate-400 mt-1">لیست تمام مهمانانی که برای این تاریخ ثبت شده‌اند.</p>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-slate-100 text-slate-500">
                                <tr>
                                    <th className="p-4 font-black">کلبه</th>
                                    <th className="p-4 font-black">نام مهمان</th>
                                    <th className="p-4 font-black">نفرات</th>
                                    <th className="p-4 font-black">مدت (شب)</th>
                                    <th className="p-4 font-black">عملیات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {dailyStays.length > 0 ? dailyStays.map(stay => (
                                    <tr key={stay.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-black text-blue-600">کلبه {stay.cabin?.name || 'نامشخص'}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{stay.guestName}</div>
                                            <div className="text-[10px] text-slate-400 dir-ltr text-right">{stay.guestPhone}</div>
                                        </td>
                                        <td className="p-4 font-bold">{stay.guestCount} نفر</td>
                                        <td className="p-4 font-bold">{stay.nights} شب</td>
                                        <td className="p-4">
                                            <button 
                                                onClick={() => setStayToDelete(stay)}
                                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                title="حذف اقامت"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-slate-400 font-bold">
                                            <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                            هیچ پذیرشی برای این تاریخ ثبت نشده است.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* Confirmation Modal for Deletion */}
        <Modal 
            isOpen={!!stayToDelete} 
            onClose={() => setStayToDelete(null)} 
            title="تایید حذف اقامت"
        >
            <div className="space-y-6">
                <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 flex items-start gap-4 text-rose-800">
                    <AlertCircle className="w-8 h-8 shrink-0 text-rose-500" />
                    <div>
                        <p className="font-black text-lg mb-1 leading-tight">آیا از حذف این اقامت اطمینان دارید؟</p>
                        <p className="text-sm font-medium opacity-80 leading-relaxed">این عملیات غیرقابل بازگشت است و تمام رکوردهای مربوط به این پذیرش از سیستم پاک خواهد شد.</p>
                    </div>
                </div>

                {stayToDelete && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-bold">نام مهمان:</span>
                            <span className="text-slate-800 font-black">{stayToDelete.guestName}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-400 font-bold">کلبه:</span>
                            <span className="text-slate-800 font-black">{stayToDelete.cabin?.name || 'نامشخص'}</span>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <button 
                        onClick={() => setStayToDelete(null)}
                        disabled={isSubmitting}
                        className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black transition-all active:scale-95"
                    >
                        لغو
                    </button>
                    <button 
                        onClick={confirmDeleteStay}
                        disabled={isSubmitting}
                        className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black shadow-lg shadow-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        حذف
                    </button>
                </div>
            </div>
        </Modal>
    </div>
  );
};

export default Reception;
