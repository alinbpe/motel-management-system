
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Newspaper, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { NewsArticle } from '../components/NewsArticle';

interface NewsArticleData {
  title: string;
  summary: string;
  url: string;
  source: string;
}

const News: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "آخرین اخبار مربوط به گردشگری، هتلداری و مدیریت اقامتگاه‌ها در ایران را به صورت ۵ مورد خبری کوتاه پیدا کن. برای هر مورد عنوان، خلاصه بسیار کوتاه و منبع را ذکر کن.",
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "عنوان خبر" },
                summary: { type: Type.STRING, description: "خلاصه کوتاه خبر" },
                url: { type: Type.STRING, description: "لینک منبع خبر" },
                source: { type: Type.STRING, description: "نام منبع خبری" },
              },
              required: ["title", "summary", "url", "source"],
            },
          },
        },
      });

      const newsData = JSON.parse(response.text || "[]") as NewsArticleData[];
      setArticles(newsData);
    } catch (err: any) {
      console.error("News Fetch Error:", err);
      setError("خطا در دریافت اخبار. لطفا دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">اخبار و تازه‌ها</h2>
            <p className="text-xs text-slate-400 mt-0.5">آخرین رویدادهای گردشگری و مدیریت هتلداری</p>
          </div>
        </div>
        
        <button 
          onClick={fetchNews}
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-xl shadow-slate-200 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          دریافت آخرین اخبار
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 animate-pulse">
              <div className="h-6 bg-slate-100 rounded-lg w-3/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-50 rounded w-full"></div>
                <div className="h-3 bg-slate-50 rounded w-5/6"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-slate-50 rounded w-20"></div>
                <div className="h-4 bg-slate-50 rounded w-24"></div>
              </div>
            </div>
          ))
        ) : (
          articles.map((article, idx) => (
            <NewsArticle key={idx} article={article} />
          ))
        )}

        {!loading && articles.length === 0 && !error && (
          <div className="col-span-full py-20 text-center space-y-4">
            <Newspaper className="w-16 h-16 text-slate-100 mx-auto" />
            <p className="text-slate-400 font-bold">هنوز خبری دریافت نشده است. روی دکمه دریافت اخبار کلیک کنید.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default News;
