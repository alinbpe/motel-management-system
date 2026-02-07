
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Cabin, CabinStatus, CleaningChecklist, IssueType, Priority, Role, Stay } from '../types';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { Modal } from '../components/ui/Modal';
import { CabinIcon, AVAILABLE_ICONS } from '../components/ui/CabinIcon';
import { AlertTriangle, CheckCircle, Wrench, LogOut, ClipboardCheck, Loader2, LayoutGrid, List, Zap, User, Phone, Clock, Filter, AlertCircle, Eye } from 'lucide-react';
import { CleaningChecklistUI } from '../components/ui/CleaningChecklist';
import { formatDateTime } from '../utils/dateUtils';

const Cabins: React.FC = () => {
  const { 
      cabins, issues, stays, updateCabinStatus, updateCabinIcon, checkIn, reportIssue, resolveIssue,
      getCleaningChecklist, submitCleaningChecklist, approveCleaningChecklist
  } = useData();
  const { currentUser, hasRole } = useAuth();
  
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedCabin, setSelectedCabin] = useState<Cabin | null>(null);
  const [cabinToCheckout, setCabinToCheckout] = useState<Cabin | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [currentChecklist, setCurrentChecklist] = useState<CleaningChecklist | undefined>(undefined);
  const [loadingChecklist, setLoadingChecklist] = useState(false);

  if (!currentUser) return null;

  const filteredCabins = useMemo(() => {
      if (statusFilter === 'ALL') return cabins;
      return cabins.filter(c => c.status === statusFilter);
  }, [cabins, statusFilter]);

  const activeStayForSelected = useMemo(() => {
    if (!selectedCabin || selectedCabin.status !== CabinStatus.OCCUPIED) return null;
    return stays.find(s => s.cabinId === selectedCabin.id && s.isActive);
  }, [selectedCabin, stays]);

  const handleCabinClick = async (cabin: Cabin) => {
    setSelectedCabin(cabin);
    setShowChecklist(false);
    setCurrentChecklist(undefined);

    if (cabin.pendingCleaningId && (hasRole([Role.ADMIN, Role.RECEPTION]))) {
        setLoadingChecklist(true);
        try {
            const cl = await getCleaningChecklist(cabin.pendingCleaningId);
            if (cl) setCurrentChecklist(cl as any);
        } catch (err) {
            console.error("Error fetching checklist:", err);
        } finally {
            setLoadingChecklist(false);
        }
    }
  };

  const handleQuickCheckoutTrigger = (e: React.MouseEvent, cabin: Cabin) => {
    e.stopPropagation(); 
    setCabinToCheckout(cabin);
  };

  const executeCheckout = async () => {
    if (!cabinToCheckout) return;
    setIsUpdating(true);
    try {
        await updateCabinStatus(cabinToCheckout.id, CabinStatus.EMPTY_DIRTY, currentUser, `تخلیه مستقیم از کارت`);
        setCabinToCheckout(null);
        setSelectedCabin(null);
    } catch (err) {
        console.error(err);
        alert('خطا در بروزرسانی وضعیت.');
    } finally {
        setIsUpdating(false);
    }
  };

  const handleClose = () => {
    setSelectedCabin(null);
    setShowChecklist(false);
    setIsUpdating(false);
  };

  const ActionButton = ({ onClick, color, icon: Icon, label, disabled = false, badge = null, variant = 'default' }: any) => (
    <button
      onClick={onClick}
      disabled={disabled || isUpdating}
      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
        (disabled || isUpdating)
            ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400' 
            : variant === 'highlight' 
                ? `bg-${color}-700 border-${color}-700 text-white hover:bg-${color}-800 shadow-lg`
                : `bg-white hover:bg-slate-50 border-slate-200 hover:border-${color}-300 shadow-sm hover:shadow-md text-slate-800`
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${variant === 'highlight' ? 'bg-white/20' : `bg-${color}-50 text-${color}-700`}`}>
          {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
        </div>
        <span className="font-bold text-sm">{label}</span>
      </div>
    </button>
  );

  const renderActions = () => {
    if (!selectedCabin) return null;

    if (showChecklist) {
        return (
            <CleaningChecklistUI 
                cabinName={selectedCabin.name}
                checklist={currentChecklist as any}
                currentUser={currentUser}
                onSubmit={async (items) => {
                    setIsUpdating(true);
                    await submitCleaningChecklist(selectedCabin.id, items, currentUser);
                    handleClose();
                }}
                onApprove={async () => {
                    if (currentChecklist) {
                        setIsUpdating(true);
                        await approveCleaningChecklist(currentChecklist.id, currentUser);
                        handleClose();
                    }
                }}
            />
        );
    }

    const isAdmin = hasRole([Role.ADMIN]);
    const isReception = hasRole([Role.RECEPTION]);
    const isHousekeeping = hasRole([Role.HOUSEKEEPING]);
    /* Fixed: Using Role.MAINTENANCE instead of non-existent Role.TECHNICAL */
    const isTechnical = hasRole([Role.MAINTENANCE]);
    const status = selectedCabin.status;

    return (
      <div className="space-y-3">
        {(isAdmin || isReception) && status === CabinStatus.OCCUPIED && activeStayForSelected && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                    <h4 className="font-black text-slate-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-700" />
                        اطلاعات مهمان فعلی
                    </h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">نام مهمان</span>
                        <span className="text-sm font-black text-slate-900">{activeStayForSelected.guestName}</span>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">زمان ورود</span>
                        <span className="text-[10px] font-black text-slate-900">{formatDateTime(activeStayForSelected.createdAt)}</span>
                    </div>
                </div>
            </div>
        )}

        {(isAdmin || isReception) && status === CabinStatus.EMPTY_DIRTY && selectedCabin.pendingCleaningId && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-4 space-y-3">
                <div className="flex items-start gap-3 text-amber-900">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                    <div className="text-xs space-y-1">
                        <p className="font-black text-sm">نظافت انجام شده است</p>
                        <p className="font-bold opacity-80 leading-relaxed">چک‌لیست نظافت برای این کلبه ارسال شده و منتظر تایید کیفیت شماست.</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowChecklist(true)}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                    {loadingChecklist ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    بررسی و تایید نظافت
                </button>
            </div>
        )}

        {/* Resolve Issue Actions */}
        {(isAdmin || isTechnical || isHousekeeping) && (status === CabinStatus.ISSUE_TECH || status === CabinStatus.ISSUE_CLEAN) && (
            <div className="space-y-3">
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-2 flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                    <div>
                        <p className="text-xs font-black text-red-900">کلبه دارای گزارش مشکل است</p>
                        <p className="text-[10px] font-bold text-red-700">پس از اتمام کار، وضعیت را از دکمه‌های زیر تغییر دهید.</p>
                    </div>
                </div>
                <ActionButton
                    color="orange"
                    icon={Wrench}
                    label="رفع مشکل و انتقال به لیست نظافت"
                    onClick={async () => {
                        setIsUpdating(true);
                        await updateCabinStatus(selectedCabin.id, CabinStatus.EMPTY_DIRTY, currentUser, `رفع مشکل و انتقال به نظافت`);
                        handleClose();
                    }}
                />
                {isAdmin && (
                    <ActionButton
                        color="emerald"
                        variant="highlight"
                        icon={CheckCircle}
                        label="رفع مشکل و تایید نهایی (آماده تحویل)"
                        onClick={async () => {
                            setIsUpdating(true);
                            await updateCabinStatus(selectedCabin.id, CabinStatus.EMPTY_CLEAN, currentUser, `رفع مشکل و تایید نهایی مدیریت`);
                            handleClose();
                        }}
                    />
                )}
            </div>
        )}

        {(isAdmin || isReception) && status === CabinStatus.EMPTY_CLEAN && (
          <div className="space-y-3">
            <ActionButton
              color="blue"
              icon={Zap}
              variant="highlight"
              label="ورود سریع (مهمان گذری)"
              onClick={async () => {
                setIsUpdating(true);
                await checkIn(selectedCabin.id, 2, 1, currentUser);
                handleClose();
              }}
            />
          </div>
        )}

        {(isAdmin || isReception) && status === CabinStatus.OCCUPIED && (
          <ActionButton
            color="orange"
            icon={LogOut}
            label="تخلیه کلبه (Checkout)"
            onClick={(e: any) => handleQuickCheckoutTrigger(e, selectedCabin)}
          />
        )}

        {(isAdmin || isHousekeeping) && status === CabinStatus.EMPTY_DIRTY && !selectedCabin.pendingCleaningId && (
           <ActionButton
             color="emerald"
             icon={ClipboardCheck}
             label="شروع نظافت (چک‌لیست)"
             onClick={() => setShowChecklist(true)}
           />
        )}
        
        {isHousekeeping && status === CabinStatus.EMPTY_DIRTY && selectedCabin.pendingCleaningId && (
            <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-700">
                    <Clock className="w-6 h-6" />
                </div>
                <p className="text-sm font-black text-blue-900">در انتظار تایید مدیریت</p>
                <p className="text-[11px] text-blue-700 mt-1 font-bold">نظافت ثبت شده و پس از تایید مدیر، وضعیت تغییر می‌کند.</p>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-black text-slate-900">وضعیت کلبه‌ها</h2>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-300 shadow-sm w-full sm:w-auto focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <Filter className="w-4 h-4 text-slate-500" />
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="text-xs font-black outline-none bg-transparent p-1 flex-1 cursor-pointer text-slate-800"
              >
                  <option value="ALL">نمایش همه</option>
                  <option value={CabinStatus.OCCUPIED}>{STATUS_LABELS[CabinStatus.OCCUPIED]}</option>
                  <option value={CabinStatus.EMPTY_DIRTY}>{STATUS_LABELS[CabinStatus.EMPTY_DIRTY]}</option>
                  <option value={CabinStatus.EMPTY_CLEAN}>{STATUS_LABELS[CabinStatus.EMPTY_CLEAN]}</option>
                  <option value={CabinStatus.ISSUE_TECH}>{STATUS_LABELS[CabinStatus.ISSUE_TECH]}</option>
                  <option value={CabinStatus.ISSUE_CLEAN}>{STATUS_LABELS[CabinStatus.ISSUE_CLEAN]}</option>
              </select>
          </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCabins.length > 0 ? filteredCabins.map((cabin) => {
            const colorClass = STATUS_COLORS[cabin.status];
            const isOccupied = cabin.status === CabinStatus.OCCUPIED;
            
            // Badge background color based on status as requested
            const badgeColor = 
                cabin.status === CabinStatus.OCCUPIED ? 'bg-red-600' :
                cabin.status === CabinStatus.EMPTY_CLEAN ? 'bg-emerald-600' :
                cabin.status === CabinStatus.EMPTY_DIRTY ? 'bg-orange-500' :
                cabin.status === CabinStatus.ISSUE_TECH ? 'bg-slate-900' :
                cabin.status === CabinStatus.ISSUE_CLEAN ? 'bg-amber-600' :
                'bg-blue-600';

            return (
                <div
                    key={cabin.id}
                    onClick={() => handleCabinClick(cabin)}
                    className={`relative overflow-hidden rounded-[2rem] border-2 transition-all active:scale-[0.98] cursor-pointer shadow-sm group flex flex-col h-full ${colorClass} hover:shadow-xl hover:translate-y-[-4px]`}
                >
                    {/* Visual Differentiation Badge */}
                    <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-black text-white uppercase tracking-wider shadow-sm z-10 ${badgeColor}`}>
                        {STATUS_LABELS[cabin.status]}
                    </div>

                    <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-8">
                            <div className="bg-white/70 p-4 rounded-2xl backdrop-blur-md shadow-sm transition-transform group-hover:scale-110 border border-white/50">
                                <CabinIcon iconName={cabin.icon} className="w-10 h-10 text-slate-800" />
                            </div>
                            {(cabin.pendingCleaningId || cabin.status === CabinStatus.ISSUE_TECH || cabin.status === CabinStatus.ISSUE_CLEAN) && (
                                <div className={`p-2 rounded-xl shadow-lg animate-pulse border-2 border-white/20 ${cabin.status === CabinStatus.ISSUE_TECH ? 'bg-red-600' : 'bg-amber-500'} text-white`} title={STATUS_LABELS[cabin.status]}>
                                    {cabin.status === CabinStatus.ISSUE_TECH ? <Wrench className="w-5 h-5" /> : <ClipboardCheck className="w-5 h-5" />}
                                </div>
                            )}
                        </div>
                        
                        <h3 className="text-2xl font-black mb-1 text-slate-900">{cabin.name}</h3>
                        <p className="text-[11px] font-black opacity-90 uppercase tracking-widest">{STATUS_LABELS[cabin.status]}</p>
                    </div>

                    <div className="px-6 pb-6 pt-3 border-t border-black/5 bg-white/30 backdrop-blur-md mt-auto">
                        {isOccupied ? (
                            <button
                                onClick={(e) => handleQuickCheckoutTrigger(e, cabin)}
                                disabled={isUpdating}
                                className="w-full py-3 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 font-black text-sm z-10 bg-orange-600 hover:bg-orange-700 text-white border-b-4 border-orange-800"
                            >
                                {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                                تخلیه کلبه
                            </button>
                        ) : (
                            <div className="w-full py-3 rounded-2xl bg-black/5 text-slate-800 font-black text-xs text-center uppercase tracking-wider flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4 opacity-40" />
                                {STATUS_LABELS[cabin.status]}
                            </div>
                        )}
                    </div>
                </div>
            );
        }) : (
            <div className="col-span-full py-24 text-center bg-white rounded-[2rem] border-4 border-dashed border-slate-200">
                <Filter className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-black text-lg">موردی یافت نشد!</p>
            </div>
        )}
      </div>

      <Modal isOpen={!!selectedCabin} onClose={handleClose} title={<span className="font-black text-xl">{selectedCabin?.name}</span>}>
         {renderActions()}
      </Modal>

      <Modal 
        isOpen={!!cabinToCheckout} 
        onClose={() => setCabinToCheckout(null)} 
        title={<span className="font-black text-rose-700">تایید تخلیه کلبه</span>}
      >
        <div className="space-y-6">
            <div className="bg-rose-50 p-6 rounded-3xl border border-rose-200 flex items-start gap-4 text-rose-900">
                <AlertCircle className="w-10 h-10 shrink-0 text-rose-600" />
                <div>
                    <p className="font-black text-xl mb-2 leading-tight">تخلیه کلبه انجام شود؟</p>
                    <p className="text-sm font-bold opacity-90 leading-relaxed">
                        با تایید این عملیات، وضعیت کلبه <span className="font-black text-rose-700 underline underline-offset-4">{cabinToCheckout?.name}</span> به «خالی (نظافت نشده)» تغییر می‌کند.
                    </p>
                </div>
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={() => setCabinToCheckout(null)}
                    disabled={isUpdating}
                    className="flex-1 py-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-2xl font-black transition-all active:scale-95 border-b-4 border-slate-400"
                >
                    انصراف
                </button>
                <button 
                    onClick={executeCheckout}
                    disabled={isUpdating}
                    className="flex-1 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 border-b-4 border-orange-800"
                >
                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
                    تایید نهایی
                </button>
            </div>
        </div>
      </Modal>
    </div>
  );
};

export default Cabins;
