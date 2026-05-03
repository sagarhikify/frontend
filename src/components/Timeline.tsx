import React from 'react';
import { Notice } from '../types';
import { motion } from 'motion/react';
import { Calendar, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';

interface TimelineProps {
  notices: Notice[];
}

export const Timeline: React.FC<TimelineProps> = ({ notices }) => {
  const allDeadlines = notices.flatMap(n => 
    n.deadlines.map(d => ({ ...d, noticeTitle: n.title, category: n.category }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-3xl font-black tracking-tight text-slate-800">Critical Timeline</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Urgent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-200 rounded-full" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Normal</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* The vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200" />
        
        <div className="space-y-12 relative">
          {allDeadlines.map((deadline, idx) => (
            <motion.div 
              key={deadline.id || `timeline-${idx}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex gap-8 group"
            >
              <div className="relative">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-4 border-slate-50 z-10 relative transition-transform group-hover:scale-110",
                  deadline.isUrgent ? "bg-red-500 text-white shadow-xl shadow-red-200" : "bg-white text-slate-800 shadow-lg"
                )}>
                  <span className="text-xs font-black leading-none">{new Date(deadline.date).toLocaleDateString(undefined, {month: 'short'})}</span>
                  <span className="text-xl font-black leading-none mt-1">{new Date(deadline.date).getDate()}</span>
                </div>
              </div>

              <div className="flex-1 pb-4">
                <div className="glass rounded-3xl p-6 hover:shadow-2xl transition-all border-slate-200 group-hover:border-primary/20">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-lg uppercase tracking-widest">{deadline.category}</span>
                        {deadline.isUrgent && <span className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1 animate-pulse"><AlertCircle size={12} /> Urgent Action Needed</span>}
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors">{deadline.label}</h4>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                  
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-sm font-medium text-slate-600 line-clamp-2 italic">
                      From: {deadline.noticeTitle}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex -space-x-2">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                           {i}
                         </div>
                       ))}
                    </div>
                    <button className={cn(
                      "px-5 py-2 rounded-xl text-sm font-bold shadow-lg transition-transform active:scale-95",
                      deadline.isUrgent ? "bg-primary text-white" : "bg-white border text-slate-700"
                    )}>
                      {deadline.isUrgent ? "Secure Now" : "Review Details"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
