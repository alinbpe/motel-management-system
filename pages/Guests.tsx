
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { 
  Search, User, Phone, Calendar, ChevronRight, ChevronLeft, 
  MapPin, Users as UsersIcon, PhoneCall, Home, Info
} from 'lucide-react';
import { toJalaaliString, getTodayJalaali, fromJalaaliToDate, addDays } from '../utils/dateUtils';
import jalaali from 'jalaali-js';

const Guests: React.FC = () => {
  const { guests, stays, cabins } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date State for Pagination (One day per page)
  const [selectedJDate, setSelectedJDate] = useState(getTodayJalaali());
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Convert Jalaali State to YYYY-MM-DD for filtering stays
  const selectedDateStr = useMemo(() => {
    const { gy, gm, gd } = jalaali.toGregorian(selectedJDate.jy, selectedJDate.jm, selectedJDate.jd);
    return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
  }, [selectedJDate]);

  // Reset pagination when date or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDateStr, searchTerm]);

  // Daily Stays Data Join
  const dailyStays = useMemo(() => {
    return stays
      .filter(s => s.stayDate === selectedDateStr)
      .filter(s => {
          const guestName = s.guestName?.toLowerCase() || '';
          const guestPhone = s.guestPhone || '';
          const term = searchTerm.toLowerCase();
          return guestName.includes(term) || guestPhone.includes(term);
      })
      .map(s => ({
        ...s,
        cabin: cabins.find(c => c.id === s.cabinId)
      }));
  }, [stays, selectedDateStr, searchTerm, cabins]);

  const changeDay = (offset: number) => {
    const currentGDate = fromJalaaliToDate(selectedJDate.jy, selectedJDate.jm, selectedJDate.jd);
    const newGDate = addDays(currentGDate, offset);
    const j = jalaali.toJalaali(newGDate.getFullYear(), newGDate.getMonth() + 1, newGDate.getDate());
    setSelectedJDate(j);
  };

  // Pagination Logic
  const totalPages = Math.ceil(dailyStays.length / ITEMS_PER_PAGE);
  const paginatedStays = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return dailyStays.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [dailyStays, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      {/* Date Pagination Header */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <button 
                    onClick={() => changeDay(1)} 
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100"
                    title="روز بعد"
                >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
                
                <div className="flex-1 sm:flex-none text-center">
                    <h2 className="text-xl font-black text-slate-900">{toJalaaliString(selectedDateStr)}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">لیست مهمانان روز</p>
                </div>

                <button 
                    onClick={() => changeDay(-1)} 
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100"
                    title="روز قبل"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
            </div>

            <div className="relative w-full sm:w-80">
                <input
                    type="text"
                    placeholder="جستجو در مهمانانِ این روز..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-11 pl-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 text-sm font-bold shadow-inner"
                />
                <Search className="w-5 h-5 text-slate-400 absolute right-4 top-3.5" />
            </div>
        </div>

        {/* Calendar Fast Selection (Mobile Optimized Selects) */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-50">
             <select 
                value={selectedJDate.jd}
                onChange={e => setSelectedJDate({...selectedJDate, jd: Number(e.target.value)})}
                className="bg-white border-2 border-slate-100 rounded-xl p-2 text-xs font-black text-slate-700 outline-none focus:border-blue-500"
            >
                {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select 
                value={selectedJDate.jm}
                onChange={e => setSelectedJDate({...selectedJDate, jm: Number(e.target.value)})}
                className="bg-white border-2 border-slate-100 rounded-xl p-2 text-xs font-black text-slate-700 outline-none focus:border-blue-500"
            >
                {['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'].map((m, i) => (
                    <option key={i} value={i+1}>{m}</option>
                ))}
            </select>
            <select 
                value={selectedJDate.jy}
                onChange={e => setSelectedJDate({...selectedJDate, jy: Number(e.target.value)})}
                className="bg-white border-2 border-slate-100 rounded-xl p-2 text-xs font-black text-slate-700 outline-none focus:border-blue-500"
            >
                {[1403, 1404, 1405].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
        </div>
      </div>

      {/* Daily Guests List */}
      <div className="space-y-4">
        {paginatedStays.length > 0 ? (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedStays.map((stay) => (
              <div 
                key={stay.id} 
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Cabin Header */}
                <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-500 p-1.5 rounded-lg">
                            <Home className="w-4 h-4" />
                        </div>
                        <span className="font-black text-sm">کلبه {stay.cabin?.name || 'نامشخص'}</span>
                    </div>
                    <div className="text-[10px] bg-white/20 px-2 py-1 rounded-full font-bold">
                        {stay.guestCount} نفر
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] text-slate-400 font-bold block">نام مهمان</span>
                            <span className="text-slate-800 font-black">{stay.guestName}</span>
                        </div>
                    </div>

                    <a 
                        href={`tel:${stay.guestPhone}`}
                        className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl border border-emerald-100 group hover:bg-emerald-100 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                                <PhoneCall className="w-4 h-4" />
                            </div>
                            <span className="text-emerald-700 font-black font-mono tracking-wider">{stay.guestPhone}</span>
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase opacity-0 group-hover:opacity-100 transition-opacity">تماس</span>
                    </a>
                </div>
                
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                        <Calendar className="w-3 h-3" />
                        ثبت شده در: {new Date(stay.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <button className="text-blue-600 p-1 hover:bg-blue-50 rounded-lg transition-colors">
                        <Info className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 w-fit mx-auto">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="صفحه قبل"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
                <span className="text-sm font-black text-slate-700">
                    صفحه {currentPage} از {totalPages}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="صفحه بعد"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            </div>
          )}
          </>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-16 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <UsersIcon className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">مهمانی یافت نشد</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto">
                برای تاریخ {toJalaaliString(selectedDateStr)} هنوز اقامتی در سیستم ثبت نشده است.
            </p>
            <button 
                onClick={() => changeDay(0)} // Reset to today or similar
                className="mt-6 text-blue-600 font-black text-sm hover:underline"
            >
                مشاهده ورودی‌های امروز
            </button>
          </div>
        )}
      </div>

      {/* Floating Action / Total Summary */}
      {dailyStays.length > 0 && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-40 border border-slate-700 animate-in slide-in-from-bottom-10">
              <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 font-bold">کلبه‌های فعال</span>
                  <span className="text-sm font-black">{dailyStays.length} مورد</span>
              </div>
              <div className="w-px h-6 bg-slate-700"></div>
              <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 font-bold">مجموع نفرات</span>
                  <span className="text-sm font-black">{dailyStays.reduce((acc, s) => acc + s.guestCount, 0)} نفر</span>
              </div>
          </div>
      )}
    </div>
  );
};

export default Guests;
