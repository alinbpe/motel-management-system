
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MapPin, Search, Loader2, Navigation, Compass, Star, ExternalLink, Globe, AlertCircle } from 'lucide-react';

const Attractions: React.FC = () => {
  const [query, setQuery] = useState('جاذبه‌های گردشگری نزدیک جاده چالوس و کلاردشت');
  const [content, setContent] = useState<string>('');
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttractions = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let latLng = undefined;
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        latLng = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
      } catch (geoErr) {
        console.warn("Geolocation could not be retrieved, using query only.", geoErr);
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${query} را بر روی نقشه پیدا کن و لیست بهترین‌ها را با توضیحات بنویس.`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: latLng ? {
            retrievalConfig: { latLng }
          } : undefined
        },
      });

      setContent(response.text || 'محتوایی یافت نشد.');
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const extractedLinks = chunks.map((chunk: any) => {
        if (chunk.maps) return { title: chunk.maps.title, uri: chunk.maps.uri };
        return null;
      }).filter(Boolean);
      
      setSources(extractedLinks);
    } catch (err: any) {
      console.error("Attractions Fetch Error:", err);
      setError("در حال حاضر امکان دریافت اطلاعات از سرویس گوگل وجود ندارد. لطفاً دقایقی دیگر تلاش کنید یا از عبارت جستجوی متفاوتی استفاده نمایید.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttractions();
  }, []);

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-100">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">جاذبه‌های اطراف</h2>
            <p className="text-xs text-slate-400 mt-0.5">کاوش در مکان‌های دیدنی و گردشگری منطقه</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="کجا را جستجو کنیم؟"
            className="w-full pr-11 pl-4 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold shadow-inner"
          />
          <Search className="w-5 h-5 text-slate-400 absolute right-4 top-3.5" />
        </div>
        <button 
          onClick={fetchAttractions}
          disabled={loading}
          className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-2xl font-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
          جستجو
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
          <p className="text-slate-500 font-bold animate-pulse">در حال دریافت اطلاعات از نقشه‌های گوگل...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-8 rounded-3xl border border-red-100 text-center max-w-2xl mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 font-bold leading-relaxed">{error}</p>
          <button 
            onClick={fetchAttractions}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-black text-xs"
          >
            تلاش مجدد
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm prose prose-slate max-w-none prose-p:leading-relaxed prose-li:font-bold">
              <div className="whitespace-pre-wrap font-medium text-slate-700 leading-loose">
                {content}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-3xl shadow-xl">
              <h3 className="text-white font-black mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                لینک‌های مستقیم در نقشه
              </h3>
              <div className="space-y-3">
                {sources.length > 0 ? sources.map((source, idx) => (
                  <a 
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500 p-1.5 rounded-lg">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs text-white font-bold truncate max-w-[150px]">{source.title || 'مشاهده در نقشه'}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                  </a>
                )) : (
                  <p className="text-white/40 text-xs text-center py-4 font-bold">مکان خاصی روی نقشه علامت‌گذاری نشده است.</p>
                )}
              </div>
            </div>

            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 space-y-3">
              <h4 className="font-black text-emerald-900 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                راهنمای هوشمند
              </h4>
              <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                این اطلاعات به صورت زنده از گوگل مپس استخراج شده است. برای نتایج دقیق‌تر، اجازه دسترسی به مکان خود را صادر نمایید.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attractions;
