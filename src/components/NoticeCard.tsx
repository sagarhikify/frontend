import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronRight, 
  Languages, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Download,
  Share2,
  Sparkles,
  Bell
} from 'lucide-react';
import { Notice } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { LiveCountdown } from './LiveCountdown';
import { sendEmailNotification } from '../services/backendService';

interface NoticeCardProps {
  notice: Notice;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice }) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [lang, setLang] = useState<'en' | 'kn'>('en');
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [isNotifying, setIsNotifying] = useState(false);

  const toggleAction = (id: string) => {
    const next = new Set(completedActions);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCompletedActions(next);
  };

  const handleNotifyMe = async () => {
    setIsNotifying(true);
    try {
      await sendEmailNotification(
        "citizen@example.gov",
        `Reminder: ${notice.title}`,
        `You have a notice with upcoming deadlines. Review it here: ${window.location.href}`
      );
      alert("✅ Notification registered! We'll send alerts to your registered email.");
    } catch (e) {
      alert("Failed to set notification.");
    } finally {
      setIsNotifying(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-5xl mx-auto space-y-8 pb-20"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
              {notice.category}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">
              ID: {notice.id.substring(0, 8)}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-tight max-w-2xl">
            {notice.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar size={16} />
              <span>Processed on {formatDate(notice.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Simplified with AI</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleNotifyMe}
            disabled={isNotifying}
            className="flex items-center gap-2 px-4 py-3 bg-accent text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent/20 font-bold text-sm"
          >
            <Bell size={18} className={isNotifying ? "animate-bounce" : ""} />
            {isNotifying ? "Setting Alert..." : "Notify Me"}
          </button>
          <button className="p-3 glass rounded-xl hover:bg-slate-100 transition-colors shadow-sm text-slate-600">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & Explanation */}
        <div className="lg:col-span-2 space-y-8">
          <section className="glass rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="text-primary" size={24} />
                Simplified Explanation
              </h3>
              <button 
                onClick={() => setLang(l => l === 'en' ? 'kn' : 'en')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 transition-colors rounded-xl text-sm font-bold"
              >
                <Languages size={18} />
                {lang === 'en' ? 'Translate to Kannada' : 'Switch to English'}
              </button>
            </div>

            <div className="prose prose-slate max-w-none leading-relaxed text-slate-700 text-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={lang}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="font-medium"
                >
                  {lang === 'en' ? notice.simplifiedSummary : notice.kannadaSummary}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-bold">Key Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-accent/5 border border-accent/20 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-accent">
                  <AlertCircle size={20} />
                  <span className="font-bold text-sm uppercase tracking-wider">Fees & Costs</span>
                </div>
                <p className="text-xl font-black text-slate-800 marker-highlight">
                  {notice.fees || "Not Specified"}
                </p>
              </div>
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 size={20} />
                  <span className="font-bold text-sm uppercase tracking-wider">Eligibility</span>
                </div>
                <p className="text-slate-800 font-bold leading-snug">
                  {notice.eligibility || "Open to all specific residents"}
                </p>
              </div>
            </div>
          </section>

          <div className="border border-slate-200 rounded-3xl overflow-hidden">
            <button 
              onClick={() => setShowOriginal(!showOriginal)}
              className="w-full flex items-center justify-between p-6 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Copy size={20} className="text-slate-400" />
                <span className="font-bold text-slate-700 text-sm">View Original Document Text</span>
              </div>
              <ChevronRight className={cn("text-slate-400 transition-transform", showOriginal && "rotate-90")} />
            </button>
            <AnimatePresence>
              {showOriginal && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-8 bg-slate-50/50 border-t border-slate-200">
                    <pre className="text-xs text-slate-500 whitespace-pre-wrap font-mono uppercase leading-relaxed max-h-60 overflow-y-auto">
                      {notice.originalText}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Deadlines & Actions */}
        <div className="space-y-8">
          {/* Deadlines Section */}
          <div className="glass rounded-3xl p-6 space-y-6 shadow-xl border-accent/20 border-t-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-accent" size={24} />
              <h3 className="font-bold text-lg">Deadlines</h3>
            </div>
            
            <div className="space-y-4">
              {notice.deadlines.map((dl, idx) => (
                <div key={dl.id || `dl-${idx}`} className={cn(
                  "p-4 rounded-2xl border transition-all duration-300",
                  dl.isUrgent ? "bg-red-50 border-red-100 ring-2 ring-red-100" : "bg-white border-slate-100"
                )}>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{dl.label}</p>
                  <p className={cn(
                    "text-lg font-black mb-2",
                    dl.isUrgent ? "text-red-600" : "text-slate-800"
                  )}>
                    {formatDate(dl.date)}
                  </p>
                  <LiveCountdown targetDate={dl.date} />
                </div>
              ))}
            </div>
          </div>

          {/* Action Checklist */}
          <div className="glass rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-500" size={24} />
                <h3 className="font-bold text-lg">Action Plan</h3>
              </div>
              <span className="text-xs font-bold py-1 px-3 bg-green-50 text-green-600 rounded-full border border-green-100">
                {completedActions.size} / {notice.actions.length} Done
              </span>
            </div>

            <div className="space-y-3">
              {notice.actions.map((action, idx) => {
                const isCompleted = completedActions.has(action.id || `action-${idx}`);
                return (
                  <button 
                    key={action.id || `action-${idx}`}
                    onClick={() => toggleAction(action.id || `action-${idx}`)}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-md transition-all text-left text-sm group"
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-md border-2 border-slate-200 flex items-center justify-center transition-colors",
                      isCompleted ? "bg-green-500 border-green-500" : "bg-white"
                    )}>
                      {isCompleted && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className={cn(
                      "font-medium tracking-tight flex-1",
                      isCompleted ? "text-slate-400 line-through" : "text-slate-700"
                    )}>
                      {action.label}
                    </span>
                    <ArrowRight size={14} className="text-slate-300 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => {
                const next = new Set<string>();
                notice.actions.forEach((a, i) => next.add(a.id || `action-${i}`));
                setCompletedActions(next);
              }}
              className={cn(
                "w-full py-4 font-bold rounded-2xl shadow-xl transition-all",
                completedActions.size === notice.actions.length 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                  : "bg-primary text-white shadow-primary/20 hover:scale-[1.02]"
              )}
              disabled={completedActions.size === notice.actions.length}
            >
              {completedActions.size === notice.actions.length ? "All Tasks Completed" : "Mark All as Completed"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
