import React from 'react';
import { 
  Bell, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  FileText,
  TrendingUp,
  UserCheck,
  Timer
} from 'lucide-react';
import { Notice, Deadline } from '../types';
import { motion } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { LiveCountdown } from './LiveCountdown';

interface DashboardProps {
  recentNotices: Notice[];
  upcomingDeadlines: Deadline[];
  onSelectNotice: (notice: Notice) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ recentNotices, upcomingDeadlines, onSelectNotice }) => {
  const isExpired = (date: string) => new Date(date).getTime() < new Date().getTime();

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Processed Notices" 
          value="12" 
          trend="+3 this week" 
          icon={FileText} 
          color="bg-blue-500" 
        />
        <StatCard 
          label="Upcoming Deadlines" 
          value={upcomingDeadlines.length.toString()} 
          trend="2 urgent" 
          icon={Calendar} 
          color="bg-accent" 
        />
        <StatCard 
          label="Pending Actions" 
          value="8" 
          trend="Next: Submit ID" 
          icon={Clock} 
          color="bg-orange-500" 
        />
        <StatCard 
          label="Success Rate" 
          value="94%" 
          trend="+2% improve" 
          icon={TrendingUp} 
          color="bg-green-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Urgent Alerts Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold tracking-tight">Recent Notices</h3>
            <button className="text-sm font-bold text-primary hover:underline flex items-center">
              View All <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="space-y-4">
            {recentNotices.map((notice, idx) => (
              <motion.div
                key={notice.id || `notice-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onSelectNotice(notice)}
                className="group p-5 glass rounded-2xl cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all border-slate-100 flex items-center gap-6"
              >
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors border border-slate-200">
                  <FileText size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{notice.category}</p>
                  <h4 className="font-bold text-slate-800 truncate text-lg group-hover:text-primary transition-colors">
                    {notice.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                    <span>{formatDate(notice.createdAt)}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span>{notice.actions.length} action items</span>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    notice.status === 'Completed' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {notice.status}
                  </span>
                </div>
                <ChevronRight className="text-slate-300" size={20} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar Alerts */}
        <div className="space-y-8">
          <div className="glass rounded-3xl p-6 bg-red-50/50 border-red-100 border-t-4 border-t-red-500">
            <h3 className="text-lg font-bold flex items-center gap-3 mb-6">
              <AlertTriangle className="text-red-500" size={20} />
              Critical Alerts
            </h3>
            <div className="space-y-4">
              {upcomingDeadlines.filter(d => d.isUrgent && !isExpired(d.date)).slice(0, 3).map((dl, idx) => (
                <div key={dl.id || `deadline-${idx}`} className="p-4 bg-white rounded-2xl border border-red-50 shadow-sm space-y-3">
                  <div>
                    <p className="text-xs font-bold text-red-500 uppercase mb-1">Deadline Approaching</p>
                    <p className="font-bold text-slate-800 leading-snug">{dl.label}</p>
                  </div>
                  <LiveCountdown targetDate={dl.date} />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-400">{formatDate(dl.date)}</span>
                    <button className="text-[10px] font-black px-3 py-1.5 bg-red-600 text-white rounded-lg shadow-lg shadow-red-200 uppercase tracking-widest">
                      Take Action
                    </button>
                  </div>
                </div>
              ))}
              {upcomingDeadlines.some(d => isExpired(d.date)) && (
                <div className="p-4 bg-slate-100/50 rounded-2xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                    <Timer size={14} />
                    Some deadlines have expired
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="glass rounded-3xl p-6">
            <h3 className="text-lg font-bold flex items-center gap-3 mb-6">
              <Bell className="text-primary" size={20} />
              System Notifications
            </h3>
            <div className="space-y-3">
              <NotificationItem title="AI Update" time="2h ago" text="Model improved for regional dialect detection." />
              <NotificationItem title="Profile Sync" time="1d ago" text="Successfully connected to Gov Portal." />
              <NotificationItem title="Welcome" time="2d ago" text="Ready to simplify your first notice?" isActive />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; trend: string; icon: any; color: string }> = ({ label, value, trend, icon: Icon, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="p-6 glass rounded-3xl space-y-4 transition-all hover:shadow-2xl border-slate-100 group"
  >
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:rotate-6", color)}>
      <Icon size={24} />
    </div>
    <div className="space-y-1">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
    </div>
    <p className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded inline-block">
      {trend}
    </p>
  </motion.div>
);

const NotificationItem: React.FC<{ title: string; time: string; text: string; isActive?: boolean }> = ({ title, time, text, isActive }) => (
  <div className={cn(
    "p-4 rounded-2xl border transition-all",
    isActive ? "bg-primary/5 border-primary/20" : "bg-slate-50 border-transparent"
  )}>
    <div className="flex items-center justify-between mb-1">
      <span className={cn("text-xs font-bold", isActive ? "text-primary" : "text-slate-800")}>{title}</span>
      <span className="text-[10px] text-slate-400 font-medium">{time}</span>
    </div>
    <p className="text-xs text-slate-600 line-clamp-1">{text}</p>
  </div>
);
