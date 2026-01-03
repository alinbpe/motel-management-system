import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Role, User } from '../types';
import { ROLE_LABELS } from '../constants';
import { Trash2, UserPlus, ShieldAlert, Pencil, Save, Lock, User as UserIcon } from 'lucide-react';
import { Modal } from '../components/ui/Modal';

const Users: React.FC = () => {
  const { users, addUser, updateUser, deleteUser } = useData();
  const { currentUser, hasRole } = useAuth();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.RECEPTION);
  
  // Edit mode state
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!currentUser || !hasRole([Role.ADMIN])) {
    return (
        <div className="p-8 text-center text-red-500 bg-white rounded-xl shadow-sm border border-red-100 mt-8">
            <ShieldAlert className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold mb-2">دسترسی غیرمجاز</h2>
            <p className="text-sm opacity-80">فقط مدیر سیستم امکان دسترسی به این صفحه را دارد.</p>
        </div>
    );
  }

  const handleOpenAdd = () => {
      setEditingId(null);
      setUsername('');
      setPassword('');
      setRole(Role.RECEPTION);
      setFormError('');
      setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
      setEditingId(user.id);
      setUsername(user.username);
      setPassword(user.password || '');
      setRole(user.role);
      setFormError('');
      setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!username.trim() || !password.trim()) {
        setFormError('لطفا تمام فیلدها را پر کنید');
        return;
    }
    
    // Check duplicates
    const isDuplicate = users.some(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.id !== editingId);
    if(isDuplicate) {
        setFormError('این نام کاربری قبلا استفاده شده است');
        return;
    }

    try {
        if (editingId) {
            await updateUser(editingId, { username, password, role }, currentUser);
        } else {
            await addUser(username, password, role, currentUser);
        }
        setIsModalOpen(false);
    } catch (err) {
        setFormError('خطا در ذخیره اطلاعات');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">مدیریت کاربران</h2>
        <button 
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm text-sm font-medium"
        >
            <UserPlus className="w-4 h-4" />
            <span>افزودن کاربر</span>
        </button>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b">
                <tr>
                <th className="p-4 text-right font-medium">نام کاربری</th>
                <th className="p-4 text-right font-medium">نقش</th>
                <th className="p-4 text-right font-medium hidden sm:table-cell">تاریخ ایجاد</th>
                <th className="p-4 text-center font-medium">عملیات</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                <tr key={user.id} className={`hover:bg-slate-50 transition-colors`}>
                    <td className="p-4 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                <UserIcon className="w-4 h-4" />
                            </div>
                            <span className="dir-ltr text-right">{user.username}</span>
                        </div>
                    </td>
                    <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border
                            ${user.role === Role.ADMIN ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                            user.role === Role.RECEPTION ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            user.role === Role.TECHNICAL ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200'}
                        `}>
                            {ROLE_LABELS[user.role]}
                        </span>
                    </td>
                    <td className="p-4 text-gray-500 hidden sm:table-cell">
                        {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="p-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                        <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="ویرایش"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>

                        {user.id !== currentUser.id && (
                            <button
                            onClick={() => {
                                if(confirm(`آیا از حذف کاربر ${user.username} مطمئن هستید؟`)) {
                                    deleteUser(user.id, currentUser);
                                }
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف کاربر"
                            >
                            <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
      >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">نام کاربری</label>
                <div className="relative">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-left dir-ltr pl-10"
                        placeholder="user_1"
                    />
                    <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">رمز عبور</label>
                <div className="relative">
                    <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-left dir-ltr pl-10"
                        placeholder="••••••"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                </div>
                <p className="text-xs text-gray-500 mt-1">رمز عبور به صورت متن نمایش داده می‌شود.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">نقش کاربری</label>
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                    {Object.entries(ROLE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            {formError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    {formError}
                </div>
            )}

            <div className="pt-2">
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    {editingId ? 'ذخیره تغییرات' : 'افزودن کاربر'}
                </button>
            </div>
          </form>
      </Modal>
    </div>
  );
};

export default Users;