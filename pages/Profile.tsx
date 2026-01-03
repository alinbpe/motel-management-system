import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ROLE_LABELS } from '../constants';
import { User, Calendar, Shield, Activity } from 'lucide-react';
import { formatDateTime } from '../utils/dateUtils';

const Profile: React.FC = () => {
    const { currentUser } = useAuth();
    const { logs } = useData();

    if (!currentUser) return null;

    const myLogs = logs.filter(l => l.userId === currentUser.id).slice(0, 10);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">پروفایل کاربری</h2>

            <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="bg-blue-100 p-6 rounded-full">
                    <User className="w-12 h-12 text-blue-600" />
                </div>
                <div className="flex-1 space-y-4 w-full text-center sm:text-right">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900">{currentUser.username}</h3>
                        <p className="text-slate-500">{ROLE_LABELS[currentUser.role]}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                            <Calendar className="w-4 h-4" />
                            <span>عضویت: {formatDateTime(currentUser.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                             <Shield className="w-4 h-4" />
                             <span>نقش: {currentUser.role}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-4">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-gray-500" />
                    فعالیت‌های اخیر شما
                </h3>
                <div className="space-y-4">
                    {myLogs.length > 0 ? myLogs.map(log => (
                        <div key={log.id} className="flex gap-3 text-sm border-b pb-3 last:border-0 last:pb-0">
                            <div className="text-gray-400 font-mono text-xs whitespace-nowrap pt-1">
                                {formatDateTime(log.timestamp)}
                            </div>
                            <div>
                                <p className="font-medium text-slate-800">{log.action}</p>
                                <p className="text-slate-500 text-xs">{log.details}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-gray-400 text-center py-4">هنوز فعالیتی ثبت نشده است.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;