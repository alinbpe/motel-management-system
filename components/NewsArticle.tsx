
import React from 'react';
import { ExternalLink, Globe, Calendar } from 'lucide-react';

interface NewsArticleProps {
  article: {
    title: string;
    summary: string;
    url: string;
    source: string;
  };
}

export const NewsArticle: React.FC<NewsArticleProps> = ({ article }) => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">
            {article.source}
          </span>
          <Globe className="w-4 h-4 text-slate-300" />
        </div>
        <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed font-medium">
          {article.summary}
        </p>
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
          <Calendar className="w-3 h-3" />
          بروزرسانی شده
        </div>
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700"
        >
          مشاهده خبر
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
