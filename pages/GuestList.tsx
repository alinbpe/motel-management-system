
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Loader2, 
  RefreshCw, 
  WifiOff, 
  Search, 
  UserCircle, 
  Table as TableIcon, 
  AlertCircle,
  Download
} from 'lucide-react';

const GuestList: React.FC = () => {
  const [rawData, setRawData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const DATA_URL = 'https://script.google.com/macros/s/AKfycbw_qnDB5Bp2o527Jk2qNJd9UZx4BI5w-QFAEWjbod0PAHb06Waf2L3z0wHy3oR-PEXZ1w/exec';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // استفاده از Timestamp برای جلوگیری از کش شدن پاسخ توسط مرورگر
      const response = await fetch(`${DATA_URL}?t=${new Date().getTime()}`);
      
      if (!response.ok) {
        throw new Error(`خطای شبکه: ${response.status}`);
      }
      
      const json = await response.json();
      
      // نرمال‌سازی داده‌ها (پشتیبانی از فرمت‌های مختلف خروجی اسکریپت گوگل)
      let rows: any[] = [];
      if (Array.isArray(json)) {
        rows = json;
      } else if (json && json.data && Array.isArray(json.data)) {
        rows = json.data;
      } else if (typeof json === 'object') {
        rows = Object.values(json).filter(v => typeof v === 'object');
      }

      if (rows.length > 0) {
        // استخراج هوشمند نام ستون‌ها از اولین ردیف
        const firstRow = rows[0];
        setHeaders(Object.keys(firstRow));
        setRawData(rows);
      } else {
        setHeaders([]);
        setRawData([]);
      }
      
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setError('امکان دریافت اطلاعات از سرور گوگل وجود ندارد. لطفاً اتصال اینترنت خود را بررسی کنید.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // فیلتر کردن داده‌ها بر اساس عبارت جستجو
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return rawData;
    const term = searchTerm.toLowerCase();
    return rawData.filter(row => 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(term)
      )
    );
  }, [searchTerm, rawData]);

  const renderCell = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? '✅' : '❌';
    return String(value);
  };

  if (loading && rawData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <UserCircle className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-slate-500 font-medium animate-pulse">در حال فراخوانی لیست مهمان‌ها...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] p-6">
        <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-xl shadow-red-50 text-center max-w-sm">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">خطا در دریافت داده‌ها</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={fetchData}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          >
            <RefreshCw className="w-4 h-4" />
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-100">
              <TableIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">لیست مهمان‌ها</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {lastUpdated ? `آخرین بروزرسانی: ${lastUpdated.toLocaleTimeString('fa-IR')}` : 'در حال هماهنگ‌سازی...'}
              </p>
            </div>
          </div>

          <button 
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            بروزرسانی داده‌ها
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="جستجو در نام، تلفن یا هر فیلد دیگری..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-11 pl-4 py-3 bg-slate-50 border-transparent focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 rounded-2xl outline-none transition-all text-sm"
          />
          <Search className="w-5 h-5 text-slate-400 absolute right-4 top-3.5" />
        </div>
      </div>

      {/* Dynamic Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  {headers.map((header, idx) => (
                    <th key={idx} className="p-4 font-bold whitespace-nowrap first:pr-6">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-blue-50/30 transition-colors group">
                    {headers.map((header, cellIdx) => (
                      <td key={cellIdx} className="p-4 text-slate-600 whitespace-nowrap first:pr-6 first:font-bold first:text-slate-800">
                        {renderCell(row[header])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium">هیچ داده‌ای برای نمایش یافت نشد.</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-blue-600 text-sm mt-2 font-bold hover:underline"
              >
                پاک کردن جستجو
              </button>
            )}
          </div>
        )}

        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center text-[10px] sm:text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span>اتصال زنده به Google Sheet</span>
          </div>
          <span>تعداد ردیف‌ها: {filteredData.length}</span>
        </div>
      </div>
    </div>
  );
};

export default GuestList;
