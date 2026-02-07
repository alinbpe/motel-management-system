
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  Cabin, CabinStatus, Issue, IssueStatus, Log, Notification, Stay, 
  User, Role, Priority, IssueType, CleaningChecklist, Guest, Type, InventoryItem
} from '../types';
import { MockDB } from '../services/mockDb';
import { v4 as uuidv4 } from 'uuid'; 
import { GoogleGenAI } from "@google/genai";

interface DataContextType {
  cabins: Cabin[];
  users: User[];
  issues: Issue[];
  stays: Stay[];
  logs: Log[];
  notifications: Notification[];
  inventory: InventoryItem[];
  isOnline: boolean;
  isDemoMode: boolean;
  dbError: string | null;
  syncPendingCount: number;
  aiInsights: any;
  loading: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  refreshData: () => Promise<void>;
  enableDemoMode: () => void;
  reportIssue: (cabinId: string | null, type: IssueType, title: string, description: string, priority: Priority, operator: User) => Promise<void>;
  updateIssueStatus: (issueId: string, status: IssueStatus, operator: User) => Promise<void>;
  updateCabinStatus: (cabinId: string, status: CabinStatus, operator: User, detail?: string) => Promise<void>;
  updateCabinIcon: (cabinId: string, icon: string) => Promise<void>;
  checkIn: (cabinId: string, guestCount: number, nights: number, operator: User) => Promise<void>;
  registerReceptionStay: (cabinId: string, guest: Partial<Guest>, stayDate: string, nights: number, guestCount: number, operator: User) => Promise<void>;
  deleteStay: (stayId: string, operator: User) => Promise<void>;
  findGuestByPhone: (phone: string) => Promise<Guest | null>;
  getCleaningChecklist: (id: string) => Promise<CleaningChecklist | null>;
  submitCleaningChecklist: (cabinId: string, items: Record<string, boolean>, operator: User) => Promise<void>;
  approveCleaningChecklist: (id: string, operator: User) => Promise<void>;
  runAIPrediction: () => Promise<void>;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  addUser: (username: string, pass: string, role: Role, operator: User) => Promise<void>;
  updateUser: (id: string, data: Partial<User>, operator: User) => Promise<void>;
  deleteUser: (id: string, operator: User) => Promise<void>;
  updateInventory: (id: string, quantity: number, operator: User) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stays, setStays] = useState<Stay[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDemoMode, setIsDemoMode] = useState(localStorage.getItem('motel_demo_mode') === 'true');
  const [dbError, setDbError] = useState<string | null>(null);
  const [syncPendingCount, setSyncPendingCount] = useState(0);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    const handleStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine && !isDemoMode) syncOfflineData();
    };
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, [isDemoMode]);

  const refreshData = async () => {
    if (isDemoMode) {
        setLoading(false);
        return;
    }
    setLoading(true);
    setDbError(null);
    try {
      const [c, u, i, s, l] = await Promise.all([
        MockDB.getCabins(),
        MockDB.getUsers(),
        MockDB.getIssues(),
        MockDB.getStays(),
        MockDB.getLogs(),
      ]);
      setCabins(c);
      setUsers(u);
      setIssues(i);
      setStays(s);
      setLogs(l);

      // Initialize Inventory with mock data if empty
      const savedInv = localStorage.getItem('motel_inventory');
      if (savedInv) {
        setInventory(JSON.parse(savedInv));
      } else {
        const defaultInv: InventoryItem[] = [
          { id: '1', name: 'کبریت', category: 'ملزومات', quantity: 20, unit: 'بسته', minThreshold: 5, lastRestocked: new Date().toISOString() },
          { id: '2', name: 'چای کیسه‌ای', category: 'خوراکی', quantity: 100, unit: 'عدد', minThreshold: 20, lastRestocked: new Date().toISOString() },
          { id: '3', name: 'هیزم', category: 'سوخت', quantity: 5, unit: 'بسته', minThreshold: 2, lastRestocked: new Date().toISOString() },
          { id: '4', name: 'مایع دستشویی', category: 'بهداشتی', quantity: 10, unit: 'لیتر', minThreshold: 3, lastRestocked: new Date().toISOString() },
        ];
        setInventory(defaultInv);
        localStorage.setItem('motel_inventory', JSON.stringify(defaultInv));
      }

      // Load Notifications
      const savedNotifs = localStorage.getItem('motel_notifications');
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));

    } catch (e: any) {
      console.error("Fetch error", e);
      if (e.message === 'MISSING_TABLES' || e.message === 'NETWORK_ERROR') {
          setDbError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (title: string, message: string, priority: Priority = Priority.MEDIUM, link?: string) => {
    const newNotif: Notification = {
      id: uuidv4(),
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      priority,
      link
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 50);
      localStorage.setItem('motel_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const enableDemoMode = () => {
      setIsDemoMode(true);
      localStorage.setItem('motel_demo_mode', 'true');
      setDbError(null);
      setLoading(false);
      const demoUser = { id: 'admin-id', username: 'admin', password: 'zanous2311', role: Role.ADMIN, createdAt: new Date().toISOString() };
      setUsers([demoUser]);
      setLogs([{ id: uuidv4(), userId: demoUser.id, username: demoUser.username, action: 'LOGIN', details: 'ورود به سیستم دمو', timestamp: new Date().toISOString() }]);
  };

  const syncOfflineData = async () => {
    const queue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
    if (queue.length === 0) return;
    setLoading(true);
    for (const item of queue) {
      if (item.action === 'REPORT_ISSUE' || item.action === 'UPDATE_STATUS') {
        await MockDB.saveIssue(item.payload);
      }
    }
    localStorage.removeItem('sync_queue');
    setSyncPendingCount(0);
    await refreshData();
  };

  const logActivity = async (operator: User, action: string, details: string) => {
      const log: Log = {
          id: uuidv4(),
          userId: operator.id,
          username: operator.username,
          action,
          details,
          timestamp: new Date().toISOString()
      };
      if (!isDemoMode) await MockDB.addLog(log);
      setLogs(prev => [log, ...prev].slice(0, 100));
  };

  const reportIssue = async (cabinId: string | null, type: IssueType, title: string, description: string, priority: Priority, operator: User) => {
    const slaLimit = type === IssueType.TECHNICAL ? (priority === Priority.CRITICAL ? 60 : 480) : 90;
    const deadline = new Date(Date.now() + slaLimit * 60000).toISOString();
    const newIssue: Issue = {
      id: uuidv4(),
      cabinId,
      title,
      type,
      priority,
      description,
      reportedBy: operator.username,
      reportedAt: new Date().toISOString(),
      status: IssueStatus.OPEN,
      slaDeadline: deadline,
      isSynced: isOnline && !isDemoMode
    };

    if (!isOnline && !isDemoMode) {
      const queue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
      queue.push({ action: 'REPORT_ISSUE', payload: newIssue });
      localStorage.setItem('sync_queue', JSON.stringify(queue));
      setSyncPendingCount(queue.length);
      setIssues(prev => [newIssue, ...prev]);
    } else if (!isDemoMode) {
      await MockDB.saveIssue(newIssue);
      await logActivity(operator, 'REPORT_ISSUE', `گزارش مشکل ${title} برای ${cabinId || 'عمومی'}`);
      
      if (priority === Priority.HIGH || priority === Priority.CRITICAL) {
        addNotification(`مشکل فوری گزارش شد`, `گزارش جدید: ${title} برای ${cabinId || 'عمومی'}`, priority, '/issues');
      }

      await refreshData();
    } else {
      setIssues(prev => [newIssue, ...prev]);
      logActivity(operator, 'REPORT_ISSUE_DEMO', `گزارش مشکل دمو: ${title}`);
    }
  };

  const updateIssueStatus = async (issueId: string, status: IssueStatus, operator: User) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;
    const updated = { ...issue, status, resolvedAt: status === IssueStatus.RESOLVED ? new Date().toISOString() : undefined };
    
    if (!isOnline && !isDemoMode) {
        const queue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
        queue.push({ action: 'UPDATE_STATUS', payload: updated });
        localStorage.setItem('sync_queue', JSON.stringify(queue));
        setSyncPendingCount(queue.length);
        setIssues(prev => prev.map(i => i.id === issueId ? updated : i));
    } else if (!isDemoMode) {
        await MockDB.saveIssue(updated);
        await logActivity(operator, 'UPDATE_ISSUE', `تغییر وضعیت مشکل ${issue.title} به ${status}`);
        
        if (status === IssueStatus.RESOLVED) {
          addNotification('رفع مشکل فنی', `مشکل "${issue.title}" توسط ${operator.username} رفع شد.`, Priority.LOW, '/issues');
        }

        await refreshData();
    } else {
        setIssues(prev => prev.map(i => i.id === issueId ? updated : i));
        logActivity(operator, 'UPDATE_ISSUE_DEMO', `تغییر وضعیت دمو به ${status}`);
    }
  };

  const updateCabinStatus = async (cabinId: string, status: CabinStatus, operator: User, detail?: string) => {
      const cabin = cabins.find(c => c.id === cabinId);
      if (isDemoMode) {
          setCabins(prev => prev.map(c => c.id === cabinId ? { ...c, status } : c));
          logActivity(operator, 'CABIN_STATUS_DEMO', `تغییر وضعیت دمو کلبه ${cabin?.name} به ${status}`);
          return;
      }
      await MockDB.updateCabin({ id: cabinId, status });
      if (status === CabinStatus.EMPTY_DIRTY) {
          await MockDB.deactivateStaysForCabin(cabinId);
          addNotification('کلبه تخلیه شد', `کلبه ${cabin?.name} تخلیه شد و نیاز به نظافت دارد.`, Priority.MEDIUM, '/cabins');
      }
      await logActivity(operator, 'CABIN_STATUS', `تغییر وضعیت کلبه ${cabin?.name} به ${status} ${detail ? `(${detail})` : ''}`);
      await refreshData();
  };

  const updateCabinIcon = async (cabinId: string, icon: string) => {
      if (isDemoMode) return;
      await MockDB.updateCabin({ id: cabinId, icon });
      await refreshData();
  };

  const checkIn = async (cabinId: string, guestCount: number, nights: number, operator: User) => {
      const stayDate = new Date().toISOString().split('T')[0];
      const checkoutDate = new Date(Date.now() + nights * 86400000).toISOString().split('T')[0];
      if (isDemoMode) return;
      await MockDB.addStay({
          cabinId,
          guestCount,
          nights,
          stayDate,
          checkOutDate: checkoutDate,
          createdBy: operator.username,
          isActive: true
      });
      await MockDB.updateCabin({ id: cabinId, status: CabinStatus.OCCUPIED });
      await logActivity(operator, 'CHECK_IN', `پذیرش سریع کلبه ${cabinId}`);
      addNotification('پذیرش جدید', `کلبه ${cabins.find(c => c.id === cabinId)?.name} پذیرش شد.`, Priority.LOW, '/reception');
      await refreshData();
  };

  const registerReceptionStay = async (cabinId: string, guest: Partial<Guest>, stayDate: string, nights: number, guestCount: number, operator: User) => {
      if (isDemoMode) return;
      const savedGuest = await MockDB.saveGuest(guest);
      const checkoutDate = new Date(new Date(stayDate).getTime() + nights * 86400000).toISOString().split('T')[0];
      await MockDB.addStay({
          cabinId,
          guestId: savedGuest.id,
          guestCount,
          nights,
          stayDate,
          checkOutDate: checkoutDate,
          createdBy: operator.username,
          isActive: true
      });
      const isToday = stayDate === new Date().toISOString().split('T')[0];
      if (isToday) {
          await MockDB.updateCabin({ id: cabinId, status: CabinStatus.OCCUPIED });
      }
      await logActivity(operator, 'RECEPTION_STAY', `پذیرش مهمان ${guest.lastName} برای تاریخ ${stayDate}`);
      addNotification('پذیرش ثبت شد', `پذیرش ${guest.lastName} برای کلبه ${cabins.find(c => c.id === cabinId)?.name} ثبت گردید.`, Priority.LOW, '/guests');
      await refreshData();
  };

  const deleteStay = async (stayId: string, operator: User) => {
      if (isDemoMode) return;
      const stay = stays.find(s => s.id === stayId);
      await MockDB.deleteStay(stayId);
      if (stay && stay.isActive) {
          await MockDB.updateCabin({ id: stay.cabinId, status: CabinStatus.EMPTY_CLEAN });
      }
      await logActivity(operator, 'DELETE_STAY', `حذف رکورد اقامت ${stayId}`);
      await refreshData();
  };

  const findGuestByPhone = async (phone: string) => {
      if (isDemoMode) return null;
      return await MockDB.getGuestByPhone(phone);
  };

  const getCleaningChecklist = async (id: string) => {
      if (isDemoMode) return null;
      return await MockDB.getChecklist(id);
  };

  const submitCleaningChecklist = async (cabinId: string, items: Record<string, boolean>, operator: User) => {
      if (isDemoMode) return;
      await MockDB.submitChecklist({ cabinId, items, filledBy: operator.username });
      await logActivity(operator, 'CLEANING_SUBMIT', `ارسال چک‌لیست نظافت برای کلبه ${cabinId}`);
      addNotification('نظافت ثبت شد', `چک‌لیست نظافت کلبه ${cabins.find(c => c.id === cabinId)?.name} برای تایید ارسال شد.`, Priority.LOW, '/cabins');
      await refreshData();
  };

  const approveCleaningChecklist = async (id: string, operator: User) => {
      if (isDemoMode) return;
      const cl = await MockDB.getChecklist(id);
      if (cl) {
          await MockDB.approveChecklist(id, operator.username);
          await MockDB.updateCabin({ id: cl.cabinId, status: CabinStatus.EMPTY_CLEAN, pendingCleaningId: undefined });
          await logActivity(operator, 'CLEANING_APPROVE', `تایید نظافت کلبه ${cl.cabinId}`);
          addNotification('نظافت تایید شد', `کلبه ${cabins.find(c => c.id === cl.cabinId)?.name} آماده تحویل است.`, Priority.LOW, '/cabins');
          await refreshData();
      }
  };

  const updateInventory = async (id: string, quantity: number, operator: User) => {
      setInventory(prev => {
        const updated = prev.map(item => {
          if (item.id === id) {
            const newItem = { ...item, quantity, lastRestocked: new Date().toISOString() };
            if (newItem.quantity <= newItem.minThreshold) {
              addNotification('کمبود موجودی', `موجودی ${item.name} رو به اتمام است (${quantity} ${item.unit})`, Priority.HIGH, '/inventory');
            }
            return newItem;
          }
          return item;
        });
        localStorage.setItem('motel_inventory', JSON.stringify(updated));
        return updated;
      });
      await logActivity(operator, 'INVENTORY_UPDATE', `بروزرسانی موجودی انبار: ${inventory.find(i=>i.id===id)?.name}`);
  };

  const runAIPrediction = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `تحلیل داده‌های متل: ${JSON.stringify(issues.slice(0, 20))}. کدام کلبه‌ها ریسک خرابی فنی دارند؟`,
        config: { responseMimeType: "application/json" }
      });
      if (response.text) {
        setAiInsights(JSON.parse(response.text));
      }
    } catch (e) {
      console.error("AI Prediction Error", e);
    }
  };

  const markNotificationAsRead = (id: string) => {
      setNotifications(prev => {
        const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
        localStorage.setItem('motel_notifications', JSON.stringify(updated));
        return updated;
      });
  };

  const clearNotifications = () => {
      setNotifications([]);
      localStorage.removeItem('motel_notifications');
  };

  const addUser = async (username: string, password: string, role: Role, operator: User) => {
      if (isDemoMode) return;
      await MockDB.saveUser({ id: uuidv4(), username, password, role, createdAt: new Date().toISOString() });
      await logActivity(operator, 'ADD_USER', `افزودن کاربر جدید: ${username}`);
      await refreshData();
  };

  const updateUser = async (id: string, data: Partial<User>, operator: User) => {
      if (isDemoMode) return;
      const existing = users.find(u => u.id === id);
      if (existing) {
          await MockDB.saveUser({ ...existing, ...data });
          await logActivity(operator, 'UPDATE_USER', `ویرایش کاربر: ${existing.username}`);
          await refreshData();
      }
  };

  const deleteUser = async (id: string, operator: User) => {
      await logActivity(operator, 'DELETE_USER', `حذف کاربر ${id}`);
      await refreshData();
  };

  useEffect(() => { refreshData(); }, []);

  return (
    <DataContext.Provider value={{
      cabins, users, issues, stays, logs, notifications, inventory, isOnline, isDemoMode, dbError,
      syncPendingCount, aiInsights, loading, isDarkMode, toggleDarkMode, refreshData, enableDemoMode, reportIssue,
      updateIssueStatus, updateCabinStatus, updateCabinIcon, checkIn, registerReceptionStay,
      deleteStay, findGuestByPhone, getCleaningChecklist, submitCleaningChecklist,
      approveCleaningChecklist, runAIPrediction, markNotificationAsRead, clearNotifications,
      addUser, updateUser, deleteUser, updateInventory
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useData must be used within DataProvider");
    return context;
};
