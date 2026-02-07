
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Search, Loader2, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Lock, ShieldCheck, Key, FilePlus, ExternalLink, Copy, Check, Database, Terminal, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

const SheetData: React.FC = () => {
  const [data, setData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false); // New state for non-blocking error
  const [copied, setCopied] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showDevHelp, setShowDevHelp] = useState(false);
  
  // Search & Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: number; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const loadDemoData = (isFallback = false) => {
      setIsDemoMode(true);
      if (isFallback) setConnectionError(true);
      
      setHeaders(['نام کلبه', 'وضعیت', 'قیمت (تومان)', 'آخرین نظافت', 'توضیحات']);
      setData([
          ['شوکا', 'پر', '1,500,000', '1402/12/01', 'مهمان ویژه'],
          ['میچکا', 'خالی', '1,200,000', '1402/12/02', 'نیاز به تعمیر شیر آب'],
          ['پاپلی', 'خالی', '1,300,000', '1402/12/03', '-'],
          ['اوپاچ', 'پر', '1,800,000', '1402/12/01', '-'],
          ['زیک', 'تعمیرات', '0', '1402/11/28', 'تعویض کفپوش'],
      ]);
      setLoading(false);
  };

  const fetchData = async () => {
    setLoading(true);
    setConnectionError(false);
    setIsDemoMode(false);
    setShowDevHelp(false);
    
    try {
      const { data: responseData, error: fnError } = await supabase.functions.invoke('read-google-sheet');

      // Handle Supabase Invocation Errors (Network, 500s wrapped in error)
      if (fnError) {
          console.error("Supabase Function Error:", fnError);
          // If network failure, throw to catch block to trigger fallback
          throw fnError; 
      }
      
      // Handle Application Errors returned as 200/500 OK-ish but with error body
      if (responseData && responseData.error) {
          // If specific API error (like missing secret), we might still want to show specific UI
          // But for now, let's treat generic errors as cause for fallback to keep app usable
          console.warn("API Error Response:", responseData);
          if (responseData.error === 'MISSING_SECRET' || responseData.error === 'PERMISSION_DENIED') {
             // Pass these specific errors to state if we want to show setup guide?
             // For "Fix Error" request, simpler is better: fallback + banner.
          }
          throw new Error(responseData.message || responseData.error);
      }

      const rows = responseData.values || [];
      
      if (rows.length > 0) {
        const normalizedRows = rows.map((row: any[]) => row.map(cell => String(cell || '')));
        setHeaders(normalizedRows[0]); 
        setData(normalizedRows.slice(1)); 
      } else {
        setHeaders([]);
        setData([]);
      }
    } catch (err: any) {
      console.error('Data Fetch Failed, switching to Demo Mode:', err);
      // AUTO FALLBACK
      loadDemoData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  // Filter Data
  const filteredData = data.filter(row => 
    row.some(cell => String(cell).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort Data
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const cellA = a[sortConfig.key] || '';
      const cellB = b[sortConfig.key] || '';
      const numA = parseFloat(cellA);
      const numB = parseFloat(cellB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
      }
      return sortConfig.direction === 'asc' 
        ? String(cellA).localeCompare(String(cellB), 'fa')
        : String(cellB).localeCompare(String(cellA), 'fa');
    });
  }, [filteredData, sortConfig]);

  const handleSort = (index: number) => {
    setSortConfig(current => {
      if (current?.key === index && current.direction === 'asc') {
        return { key: index, direction: 'desc' };
      }
      return { key: index, direction: 'asc' };
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p>در حال دریافت اطلاعات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            داده‌های شیت (Google Sheets)
            {isDemoMode && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">حالت دمو</span>}
            </h2>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {isDemoMode 
                    ? 'نمایش داده‌های آزمایشی' 
                    : 'دسترسی اختصاصی توسط سرویس اکانت'
                }
            </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
             <button 
                onClick={fetchData} 
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-colors"
                title="بروزرسانی"
             >
                 <RefreshCw className="w-5 h-5" />
             </button>
            <div className="relative flex-1 md:w-64">
                <input
                    type="text"
                    placeholder="جستجو..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
        </div>
      </div>

      {/* Connection Error Banner */}
      {connectionError && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-start sm:items-center justify-between gap-2 text-sm">
             <div className="flex items-center gap-2 text-orange-800">
                 <AlertCircle className="w-5 h-5 shrink-0 text-orange-600" />
                 <span>
                    ارتباط با سرور برقرار نشد. در حال نمایش <b>داده‌های آزمایشی</b> هستید.
                 </span>
             </div>
             
             <button 
                onClick={() => setShowDevHelp(!showDevHelp)}
                className="text-orange-600 underline text-xs font-bold whitespace-nowrap"
             >
                 {showDevHelp ? 'بستن راهنما' : 'راهنمای رفع خطا'}
             </button>
          </div>
      )}

      {/* Developer Help Section (Collapsible) */}
      {showDevHelp && connectionError && (
        <div className="bg-slate-900 rounded-lg p-4 text-slate-300 text-xs font-mono dir-ltr border border-slate-700 shadow-inner">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <Terminal className="w-4 h-4" />
                <span className="font-bold">Developer Guide: Fix Connection</span>
            </div>
            
            <p className="mb-1 text-slate-500">1. Deploy the function:</p>
            <div className="bg-black/30 p-2 rounded mb-3 flex justify-between items-center group">
                <code>supabase functions deploy read-google-sheet --no-verify-jwt</code>
                <button onClick={() => handleCopy('supabase functions deploy read-google-sheet --no-verify-jwt')} className="opacity-0 group-hover:opacity-100 transition-opacity"><Copy className="w-3 h-3" /></button>
            </div>

            <p className="mb-1 text-slate-500">2. Set the Secret:</p>
            <div className="bg-black/30 p-2 rounded mb-3 overflow-x-auto whitespace-nowrap group">
                <code className="text-green-400">supabase secrets set GOOGLE_SERVICE_ACCOUNT='...'</code>
            </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[70vh]">
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-right border-collapse">
            <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm">
              <tr>
                {headers.map((header, index) => (
                  <th 
                    key={index} 
                    className="p-4 font-bold border-b whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={() => handleSort(index)}
                  >
                    <div className="flex items-center gap-2">
                        {header}
                        <div className="text-gray-400">
                            {sortConfig?.key === index ? (
                                sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                            ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-30" />
                            )}
                        </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedData.length > 0 ? sortedData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-slate-50 transition-colors group">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="p-4 border-l last:border-l-0 border-gray-50 text-slate-700 whitespace-nowrap max-w-xs overflow-hidden text-ellipsis" title={cell}>
                      {cell}
                    </td>
                  ))}
                </tr>
              )) : (
                <tr>
                    <td colSpan={headers.length || 1} className="p-12 text-center text-gray-400">
                        داده‌ای یافت نشد.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-gray-50 border-t text-xs text-gray-500 flex justify-between items-center">
            <span>تعداد سطرها: {sortedData.length}</span>
            <span className="flex items-center gap-1">
                {isDemoMode ? <Database className="w-3 h-3 text-orange-500" /> : <Lock className="w-3 h-3 text-green-600" />}
                {isDemoMode ? 'داده‌های آزمایشی' : 'اتصال امن برقرار است'}
            </span>
        </div>
      </div>
    </div>
  );
};

export default SheetData;
