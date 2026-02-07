
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { InventoryItem, Role } from '../types';
import { 
    Package, Search, Plus, Minus, RefreshCw, 
    AlertTriangle, CheckCircle2, ShoppingCart, 
    ArrowUpRight, History, Calendar, Trash2
} from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';

const Inventory: React.FC = () => {
  const { inventory, updateInventory } = useData();
  const { currentUser, hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  if (!currentUser) return null;

  const categories = Array.from(new Set(inventory.map(item => item.category)));

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUpdateQuantity = async (id: string, newQty: number) => {
    if (newQty < 0) return;
    await updateInventory(id, newQty, currentUser);
  };

  // Fix: Explicitly type as React.FC to handle standard React props like 'key' correctly in JSX
  const InventoryCard: React.FC<{ item: InventoryItem }> = ({ item }) => {
    const isLow = item.quantity <= item.minThreshold;
    
    return (
      <div className={`bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border-2 transition-all shadow-sm flex flex-col justify-between ${isLow ? 'border-rose-200 bg-rose-50/10' : 'border-slate-100 dark:border-slate-800'}`}>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className={`p-3 rounded-2xl ${isLow ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              <Package className="w-6 h-6" />
            </div>
            {isLow && (
              <div className="flex items-center gap-1 bg-rose-600 text-white text-[9px] font-black px-2 py-1 rounded-full animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                موجودی بحرانی
              </div>
            )}
          </div>

          <div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">{item.name}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.category}</p>
          </div>

          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl">
             <button 
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors shadow-sm"
             >
                <Minus className="w-5 h-5" />
             </button>
             <div className="text-center">
                <span className={`text-2xl font-black ${isLow ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                  {item.quantity}
                </span>
                <span className="text-[10px] text-slate-400 block font-bold">{item.unit}</span>
             </div>
             <button 
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-emerald-500 transition-colors shadow-sm"
             >
                <Plus className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t dark:border-slate-800 flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDateTime(item.lastRestocked)}
          </div>
          {isLow && hasRole([Role.ADMIN, Role.RECEPTION]) && (
            <button className="flex items-center gap-1 text-rose-600 hover:underline">
              <ShoppingCart className="w-3 h-3" /> خرید مجدد
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl shadow-xl shadow-emerald-100">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">مدیریت موجودی انبار</h2>
            <p className="text-xs text-slate-500 font-bold mt-1">کنترل اقلام مصرفی و ملزومات کلبه‌ها</p>
          </div>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <input 
                type="text" 
                placeholder="جستجو در اقلام..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-11 pl-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm"
             />
             <Search className="w-5 h-5 text-slate-400 absolute right-4 top-3.5" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
         <button 
            onClick={() => setFilterCategory('ALL')}
            className={`px-6 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${filterCategory === 'ALL' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 border dark:border-slate-800'}`}
         >
            همه دسته‌ها
         </button>
         {categories.map(cat => (
           <button 
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-6 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${filterCategory === cat ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-500 border dark:border-slate-800'}`}
           >
              {cat}
           </button>
         ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.length > 0 ? filteredItems.map(item => (
          <InventoryCard key={item.id} item={item} />
        )) : (
          <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 text-center">
            <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-black">موردی یافت نشد!</p>
          </div>
        )}
      </div>

      {/* Action Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <RefreshCw className="w-32 h-32" />
          </div>
          <h3 className="text-xl font-black mb-4 flex items-center gap-3">
            <ArrowUpRight className="w-6 h-6" />
            سفارش‌گذاری هوشمند
          </h3>
          <p className="text-sm font-bold opacity-80 leading-relaxed mb-8">
            بر اساس نرخ مصرف هفته اخیر، پیشنهاد می‌شود موجودی «هیزم» و «مایع دستشویی» تا فردا شارژ شود تا با کمبود مواجه نشوید.
          </p>
          <button className="bg-white text-emerald-900 px-8 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            ایجاد لیست خرید
          </button>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
           <div className="flex justify-between items-center mb-6">
             <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3">
                <History className="w-6 h-6 text-slate-400" />
                آخرین تغییرات انبار
             </h3>
           </div>
           <div className="space-y-4">
              {inventory.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                   <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black">
                      <RefreshCw className="w-4 h-4" />
                   </div>
                   <div className="flex-1">
                      <div className="text-xs font-black text-slate-800 dark:text-white">{item.name} بروز شد</div>
                      <div className="text-[10px] text-slate-400 font-bold">{formatDateTime(item.lastRestocked)}</div>
                   </div>
                   <div className="text-sm font-black text-slate-900 dark:text-white">{item.quantity} {item.unit}</div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
