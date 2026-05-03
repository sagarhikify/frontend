import React from 'react';
import { 
  LayoutGrid, 
  FileUp, 
  Sparkles, 
  Highlighter, 
  ListTodo, 
  GitBranch, 
  Languages, 
  Bell, 
  History, 
  ShieldCheck, 
  UserCircle,
  LogOut 
} from 'lucide-react';
import { Page, User } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  user: User;
  onLogout?: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'upload', label: 'Upload Notice', icon: FileUp },
  { id: 'view', label: 'Simplified Output', icon: Sparkles },
  { id: 'timeline', label: 'Timeline', icon: GitBranch },
  { id: 'history', label: 'History', icon: History },
  { id: 'analytics', label: 'Analytics', icon: Languages },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, user, onLogout }) => {
  const isAdmin = user.role === 'admin';
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="w-64 h-screen royal-glass border-r flex flex-col p-4 fixed left-0 top-0 z-50">
      <div className="flex items-center gap-3 mb-10 px-2 py-4 border-b border-accent/20">
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/23/Emblem_of_Karnataka.svg" alt="Emblem" className="w-8 h-8" />
        </div>
        <h1 className="font-serif font-black text-primary text-sm leading-tight tracking-tight uppercase">
          Karnataka<br/><span className="text-accent text-[10px] tracking-[0.2em]">Digital Portal</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPageChange(item.id as Page)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary text-white shadow-md" 
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon size={20} className={cn(
                "transition-transform group-hover:rotate-6",
                isActive ? "text-white" : "text-primary/70"
              )} />
              <span className="font-medium tracking-tight text-sm">{item.label}</span>
              
              {item.id === 'notifications' && (
                <span className="absolute right-4 w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_8px_#FACC15]" />
              )}
              
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute inset-0 bg-primary rounded-xl -z-10"
                />
              )}
            </motion.button>
          );
        })}

        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPageChange('admin')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mt-8",
              currentPage === 'admin' 
                ? "bg-red-600 text-white shadow-md" 
                : "text-red-600 hover:bg-red-50"
            )}
          >
            <ShieldCheck size={20} />
            <span className="font-bold text-sm">Admin Panel</span>
          </motion.button>
        )}
      </nav>

      <div className="pt-4 border-t border-slate-200 space-y-2">
        <button 
          onClick={() => onPageChange('profile')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg shadow-primary/20">
            {getInitials(user.name)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate leading-none mb-1">{user.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
          </div>
        </button>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut size={18} />
          <span className="font-bold text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};
