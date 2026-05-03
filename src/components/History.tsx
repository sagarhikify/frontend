import React from 'react';
import { Notice } from '../types';
import { motion } from 'motion/react';
import { Search, Filter, ArrowUpRight, Clock, MapPin, Hash } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';

interface HistoryProps {
  notices: Notice[];
  onSelectNotice: (notice: Notice) => void;
}

export const History: React.FC<HistoryProps> = ({ notices, onSelectNotice }) => {
  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Notice History</h2>
          <p className="text-slate-500 font-medium">Tracking {notices.length} processed documents in your archive.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Filter by title..." 
              className="bg-white border rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none border-slate-200"
            />
          </div>
          <button className="px-4 py-2 border rounded-2xl flex items-center gap-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors border-slate-200">
            <Filter size={18} />
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {notices.map((notice, idx) => (
          <motion.div
            key={notice.id || `history-${idx}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelectNotice(notice)}
            className="group glass rounded-[2rem] p-6 cursor-pointer hover:shadow-2xl transition-all border-slate-200 relative overflow-hidden flex flex-col h-full"
          >
            {/* Visual Accent */}
            <div className={cn(
              "absolute top-0 left-0 w-full h-1.5",
              notice.category === 'Legal' ? "bg-blue-500" : "bg-green-500"
            )} />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-slate-100 rounded-lg text-slate-500">
                  <Hash size={14} />
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{notice.id.substring(0, 8)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-500">
                <Clock size={12} />
                {formatDate(notice.createdAt)}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <h4 className="text-xl font-bold text-slate-800 group-hover:text-primary transition-colors leading-tight">
                {notice.title}
              </h4>
              <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">
                {notice.simplifiedSummary}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Deadlines</span>
                  <span className="text-xs font-bold text-slate-800">{notice.deadlines.length} Total</span>
                </div>
                <div className="h-6 w-[1px] bg-slate-200" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Progress</span>
                  <span className="text-xs font-bold text-slate-800">{Math.round((notice.actions.filter(a => a.completed).length / notice.actions.length) * 100)}%</span>
                </div>
              </div>
              
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                <ArrowUpRight size={20} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
