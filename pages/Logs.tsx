import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatDateTime } from '../utils/dateUtils';
import { Search } from 'lucide-react';

const Logs: React.FC = () => {
  const { logs } = useData();
  const [filter, setFilter] = useState('');

  const filteredLogs = logs.filter(log => 
    log.username.toLowerCase().includes(filter.toLowerCase()) ||
    log.action.toLowerCase().includes(filter.toLowerCase()) ||
    log.details.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">تاریخچه فعالیت‌ها</h2>
        
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="جستجو در لاگ‌ها..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b">
              <tr>
                <th className="p-4 text-right min-w-[150px]">زمان</th>
                <th className="p-4 text-right min-w-[120px]">کاربر</th>
                <th className="p-4 text-right min-w-[150px]">نوع عملیات</th>
                <th className="p-4 text-right">توضیحات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-4 text-gray-500 dir-ltr text-right font-mono text-xs">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="p-4 font-bold text-slate-700">{log.username}</td>
                  <td className="p-4">
                      <span className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600 font-mono">
                        {log.action}
                      </span>
                  </td>
                  <td className="p-4 text-gray-600">{log.details}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                  <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-400">
                          هیچ رکوردی یافت نشد.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Logs;