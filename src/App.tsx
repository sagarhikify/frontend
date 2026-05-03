/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { UploadZone } from './components/UploadZone';
import { NoticeCard } from './components/NoticeCard';
import { Timeline } from './components/Timeline';
import { History } from './components/History';
import { Page, Notice, User, UserRole, Deadline } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, LogIn, Mail, Globe, Settings, LogOut, Bell, Search, Menu, ArrowRight, Info, CheckCircle2, AlertTriangle, Eye, EyeOff, Loader2, UserCircle, MessageSquare, Send, X } from 'lucide-react';
import { cn } from './lib/utils';
import { getNotifications, getNotices, askChatbot } from './services/backendService';

const MOCK_NOTICES: Notice[] = [
  {
    id: 'not_001',
    userId: 'user_1',
    title: 'New Property Tax Assessment Regulations 2024',
    originalText: 'The Government of Karnataka, Department of Revenue, hereby notifies all residents regarding the revised property tax schedules effective from April 1st, 2024. All assessments must be completed through the online portal by the stipulated date to avoid penalties under Section 12-A of the Karnataka Municipality Act...',
    simplifiedSummary: 'The Karnataka government has updated property tax rules starting April 1, 2024. You must complete your property tax assessment online through the official portal to avoid paying extra fines. The calculation is now based on your area\'s unit value rather than the previous fixed rates.',
    kannadaSummary: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರವು ಏಪ್ರಿಲ್ 1, 2024 ರಿಂದ ಜಾರಿಗೆ ಬರುವಂತೆ ಆಸ್ತಿ ತೆರಿಗೆ ನಿಯಮಗಳನ್ನು ನವೀಕರಿಸಿದೆ. ದಂಡವನ್ನು ಎದುರಿಸುವುದನ್ನು ತಪ್ಪಿಸಲು ನೀವು ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಮೂಲಕ ನಿಮ್ಮ ಆಸ್ತಿ ತೆರಿಗೆ ಮೌಲ್ಯಮಾಪನವನ್ನು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಪೂರ್ಣಗೊಳಿಸಬೇಕು.',
    category: 'Legal',
    status: 'Processed',
    deadlines: [
      { id: 'dl_1', label: 'Payment Deadline', date: '2026-05-30', isUrgent: true },
      { id: 'dl_2', label: 'Appeal Window', date: '2026-06-15', isUrgent: false },
    ],
    fees: '₹2,500 - ₹15,000 varies by zone',
    eligibility: 'All property owners in Karnataka urban local bodies',
    actions: [
      { id: 'a_1', label: 'Visit Property Tax Portal', completed: true },
      { id: 'a_2', label: 'Upload Property Documents', completed: true },
      { id: 'a_3', label: 'Pay Assessment Fee', completed: false },
      { id: 'a_4', label: 'Download Receipt', completed: false },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'not_002',
    userId: 'user_1',
    title: 'Free Health Checkup Week for Seniors',
    originalText: 'Under the Vayoshrestha Samman program, the Ministry of Health and Family Welfare announces a week-long free health screening camp for senior citizens (aged 60+) in various community centers...',
    simplifiedSummary: 'Government is providing free health checkups for senior citizens (above 60 years) at local community centers for one week. This includes blood tests, vision screening, and general checkups.',
    kannadaSummary: 'ಹಿರಿಯ ನಾಗರಿಕರಿಗೆ (60 ವರ್ಷ ಮೇಲ್ಪಟ್ಟವರಿಗೆ) ಎಲ್ಲಾ ಸಮುದಾಯ ಕೇಂದ್ರಗಳಲ್ಲಿ ಒಂದು ವಾರದವರೆಗೆ ಉಚಿತ ಆರೋಗ್ಯ ಪರೀಕ್ಷೆಯನ್ನು ಸರ್ಕಾರ ಆಯೋಜಿಸಿದೆ.',
    category: 'Health',
    status: 'Completed',
    deadlines: [
      { id: 'dl_3', label: 'Registration Closes', date: '2026-05-10', isUrgent: false },
    ],
    fees: 'Free of Cost',
    eligibility: 'Senior citizens aged 60 and above with valid ID',
    actions: [
      { id: 'a_5', label: 'Locate nearest health center', completed: true },
      { id: 'a_6', label: 'Carry Aadhar Card', completed: false },
    ],
    createdAt: new Date().toISOString(),
  }
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [notices, setNotices] = useState<Notice[]>(MOCK_NOTICES);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  
  // New Backend State
  const [backendNotifications, setBackendNotifications] = useState<any[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'bot', text: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Smart Reminder System
  useEffect(() => {
    if (!user || notices.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      notices.forEach(notice => {
        notice.deadlines.forEach(dl => {
          const deadlineDate = new Date(dl.date);
          const diffMs = deadlineDate.getTime() - now.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);

          // If deadline is within 48 hours and we haven't notified yet (mocking state)
          if (diffHours > 0 && diffHours < 48) {
            console.log(`[SMART REMINDER] ${notice.title} - ${dl.label} approaching in ${Math.round(diffHours)}h`);
            // Add to notifications if not already there
            setBackendNotifications(prev => {
              const exists = prev.some(n => n.title.includes(notice.title) && n.title.includes(dl.label));
              if (exists) return prev;
              return [{
                id: `smart_${Date.now()}_${notice.id}`,
                title: `Action Required: ${dl.label}`,
                message: `The deadline for ${notice.title} is approaching in less than 48 hours. Please complete required actions soon.`,
                type: 'warning',
                createdAt: new Date().toISOString()
              }, ...prev];
            });
          }
        });
      });
    };

    const timer = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Initial check
    return () => clearInterval(timer);
  }, [user, notices]);

  // Poll for data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const notifs = await getNotifications();
        if (notifs.success) setBackendNotifications(notifs.data);
        
        const ntc = await getNotices();
        if (ntc.success && ntc.data.length > 0) {
          // Merge mock with backend
          setNotices(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newNotices = ntc.data.filter((n: any) => !existingIds.has(n.id));
            return [...newNotices, ...prev];
          });
        }
      } catch (e) {
        console.error("Fetch error", e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const upcomingDeadlines = useMemo(() => {
    return notices.flatMap(n => n.deadlines).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [notices]);

  const handleUpload = async (input: string | File) => {
    setIsProcessing(true);
    setCurrentPage('view');
    try {
      const { analyzeNotice } = await import('./services/backendService');
      const response = await analyzeNotice(input);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || "Analysis failed");
      }

      const result = response.data;
      const newNotice: Notice = {
        id: `not_${Date.now()}`,
        userId: user?.id || 'guest',
        title: result.title,
        originalText: typeof input === 'string' ? input : "Document Uploaded",
        simplifiedSummary: result.summaryEn,
        kannadaSummary: result.summaryKn,
        category: result.category as any,
        status: 'Processed',
        deadlines: result.deadlines.map((d: any, i: number) => ({
          id: `dl_${Date.now()}_${i}`,
          ...d
        })),
        fees: result.fees,
        eligibility: result.eligibility,
        actions: result.actions.map((label: string, i: number) => ({
          id: `a_${Date.now()}_${i}`,
          label,
          completed: false
        })),
        createdAt: new Date().toISOString(),
      };
      setNotices([newNotice, ...notices]);
      setSelectedNotice(newNotice);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again or check the documentation format.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('dashboard');
    setSelectedNotice(null);
  };

  const handleGoogleLoginClick = () => {
    setShowAccountSelector(true);
  };

  const selectGoogleAccount = (email: string, name: string) => {
    setIsProcessing(true);
    setShowAccountSelector(false);
    setTimeout(() => {
      setUser({
        id: `google_${Date.now()}`,
        email,
        name,
        role: UserRole.USER,
        avatar: 'https://lh3.googleusercontent.com/a/default-user'
      });
      setIsProcessing(false);
    }, 1000);
  };

  if (!user) {
    return (
      <>
        <AuthPage onLogin={handleLogin} onGoogleLogin={handleGoogleLoginClick} />
        <AnimatePresence>
          {showAccountSelector && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200"
              >
                <div className="p-8 text-center border-b border-slate-100">
                  <div className="flex justify-center mb-4">
                    <svg className="w-8 h-8" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.46-.37z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-serif font-black text-slate-800">Identify your account</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Continue to Digital Services Portal</p>
                </div>
                
                <div className="p-3 space-y-1">
                  <button 
                    onClick={() => selectGoogleAccount('citizen.karnataka@gmail.com', 'Karnataka Citizen')}
                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all text-left group border border-transparent hover:border-slate-100"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black uppercase text-lg">
                      KC
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-800">Karnataka Citizen</p>
                      <p className="text-sm text-slate-500">citizen.karnataka@gmail.com</p>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => selectGoogleAccount('laxman.p@gmail.com', 'Laxman Poojary')}
                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all text-left group border border-transparent hover:border-slate-100"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-black uppercase text-lg">
                      LP
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-800">Laxman Poojary</p>
                      <p className="text-sm text-slate-500">laxman.p@gmail.com</p>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 mt-2">
                    <button 
                      onClick={() => {
                        const email = prompt("Please enter your Google Email address:");
                        if (email) selectGoogleAccount(email, email.split('@')[0]);
                      }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-200 transition-colors">
                        <UserCircle size={24} />
                      </div>
                      <span className="text-sm font-bold text-slate-600">Use another account</span>
                    </button>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 flex justify-end">
                  <button 
                    onClick={() => setShowAccountSelector(false)}
                    className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 relative selection:bg-primary/20 selection:text-primary">
      <div className="watermark" />
      <div 
        className="custom-cursor hidden lg:block" 
        style={{ left: cursorPos.x, top: cursorPos.y, transform: `translate(-50%, -50%)` }} 
      />

      <Sidebar 
        currentPage={currentPage} 
        onPageChange={(page) => {
          setCurrentPage(page);
          if (page !== 'view') setSelectedNotice(null);
        }} 
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1 ml-64 p-8 relative overflow-hidden">
        {/* Chatbot Floating UI */}
        <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end gap-4">
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="w-80 h-[450px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
              >
                <div className="p-4 bg-primary text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={18} />
                    <span className="font-bold text-sm">Citizen Assistant</span>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded-lg">
                    <X size={16} />
                  </button>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {chatMessages.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-10">Ask me anything about notices, deadlines, or government services.</p>
                  )}
                  {chatMessages.map((m, i) => (
                    <div key={`chat-${i}`} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[80%] p-3 rounded-2xl text-sm",
                        m.role === 'user' ? "bg-primary text-white" : "bg-slate-100 text-slate-800"
                      )}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && <div className="text-xs text-slate-400 animate-pulse">Typing...</div>}
                </div>

                <div className="p-4 border-t border-slate-100 flex gap-2">
                  <input 
                    id="chat-input"
                    type="text" 
                    placeholder="Type your question..."
                    className="flex-1 bg-slate-50 border-none rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.currentTarget;
                        const val = input.value;
                        if (!val) return;
                        input.value = '';
                        setChatMessages(prev => [...prev, { role: 'user', text: val }]);
                        setChatLoading(true);
                        askChatbot(val, notices[0]?.simplifiedSummary).then(res => {
                          setChatMessages(prev => [...prev, { role: 'bot', text: res.response }]);
                        }).finally(() => setChatLoading(false));
                      }
                    }}
                  />
                  <button className="bg-primary text-white p-2 rounded-xl">
                    <Send size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-14 h-14 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all gold-glow"
          >
            <MessageSquare size={24} />
          </button>
        </div>

        {/* Top Navbar */}
        <header className="flex items-center justify-between mb-10 glass px-6 py-4 rounded-3xl sticky top-8 z-40">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search notices, deadlines, or keywords..." 
                className="w-full bg-slate-100/50 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-white" />
            </button>
            <div className="h-6 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-400 font-medium">Verified Citizen</p>
              </div>
              <button className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <Globe size={18} className="text-slate-600" />
              </button>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage + (selectedNotice?.id || '')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {currentPage === 'dashboard' && (
              <Dashboard 
                recentNotices={notices} 
                upcomingDeadlines={upcomingDeadlines}
                onSelectNotice={(n) => {
                  setSelectedNotice(n);
                  setCurrentPage('view');
                }}
              />
            )}

            {currentPage === 'upload' && (
              <UploadZone onUpload={handleUpload} isProcessing={isProcessing} />
            )}

            {currentPage === 'view' && selectedNotice && (
              <NoticeCard notice={selectedNotice} />
            )}

            {currentPage === 'timeline' && (
              <Timeline notices={notices} />
            )}

            {currentPage === 'history' && (
              <History notices={notices} onSelectNotice={(n) => {
                setSelectedNotice(n);
                setCurrentPage('view');
              }} />
            )}

            {currentPage === 'notifications' && (
              <div className="max-w-3xl mx-auto space-y-6 py-10">
                <h2 className="text-3xl font-black tracking-tight text-slate-800 flex items-center gap-3">
                  <Bell className="text-primary" />
                  Your Notifications
                </h2>
                <div className="space-y-4">
                  {backendNotifications.length > 0 ? backendNotifications.map((notif, i) => (
                    <motion.div 
                      key={notif.id || `notif-${i}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 glass rounded-3xl border-slate-200 flex items-start gap-4 hover:shadow-lg transition-all"
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        notif.type === 'warning' ? "bg-red-50 text-red-500" : notif.type === 'success' ? "bg-green-50 text-green-500" : "bg-blue-50 text-blue-500"
                      )}>
                        {notif.type === 'warning' ? <AlertTriangle size={24} /> : notif.type === 'success' ? <CheckCircle2 size={24} /> : <Info size={24} />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-800">{notif.title}</h4>
                          <span className="text-xs font-medium text-slate-400">
                            {new Date(notif.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{notif.message}</p>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-20 glass rounded-3xl text-slate-400 font-medium">
                      No new notifications
                    </div>
                  )}
                </div>
              </div>
            )}

            {(currentPage === 'analytics' || currentPage === 'profile') && (
              <div className="flex flex-col items-center justify-center p-20 glass rounded-3xl text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center animate-bounce">
                  <div className="w-10 h-10 bg-primary rounded-full" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight capitalize">{currentPage} View</h3>
                <p className="text-slate-500 max-w-sm">This module is currently being optimized for high-density government data visualizations. Check back soon!</p>
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  className="px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
            
            {currentPage === 'admin' && user.role === UserRole.ADMIN && (
               <div className="space-y-8">
                 <div className="flex items-center justify-between">
                   <h2 className="text-3xl font-black tracking-tight">Admin Command Center</h2>
                   <div className="px-4 py-2 bg-red-100 text-red-600 rounded-xl text-xs font-black uppercase tracking-widest border border-red-200">
                     Live System Access
                   </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   {/* Broadcast Section */}
                   <div className="lg:col-span-2 p-8 glass rounded-[2.5rem] space-y-6 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-8 opacity-10">
                       <Bell size={120} className="text-primary" />
                     </div>
                     
                     <div className="space-y-2">
                       <h3 className="text-2xl font-black text-slate-800">Global Broadcast</h3>
                       <p className="text-slate-500 text-sm">Send urgent push notifications and emails to all registered citizens instantly.</p>
                     </div>

                     <div className="space-y-4">
                       <textarea 
                         id="broadcast-message"
                         placeholder="Type your emergency message here..."
                         className="w-full h-40 bg-slate-50 border border-slate-200 rounded-3xl p-6 text-slate-700 focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
                       />
                       <div className="flex items-center gap-4">
                         <button 
                           onClick={async () => {
                             const msgInput = document.getElementById('broadcast-message') as HTMLTextAreaElement;
                             const msg = msgInput.value;
                             if (!msg.trim()) return alert("Please enter a message!");
                             
                             try {
                               const { broadcastMessage } = await import('./services/backendService');
                               await broadcastMessage(msg, "Admin Broadcast", "warning");
                               alert(`Broadcast Sent Successfully to all citizens!`);
                               msgInput.value = '';
                             } catch (e) {
                               alert("Failed to send broadcast. Check console.");
                             }
                           }}
                           className="flex-1 py-4 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                         >
                           <Bell size={20} />
                           Send Broadcast Notification
                         </button>
                         <button className="px-6 py-4 glass border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all">
                           Schedule
                         </button>
                       </div>
                     </div>
                   </div>

                   {/* Quick Stats */}
                   <div className="space-y-6">
                     <div className="p-6 glass rounded-3xl bg-slate-900 text-white space-y-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Sessions</p>
                        <p className="text-4xl font-black tracking-tight">1,284</p>
                        <div className="pt-2 flex items-center gap-2 text-green-400 text-xs font-bold">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                          Systems Operational
                        </div>
                     </div>
                     <div className="p-6 glass rounded-3xl space-y-4 border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notices Today</p>
                        <p className="text-4xl font-black tracking-tight text-slate-800">42</p>
                        <p className="text-xs text-slate-500 font-medium">+15% from yesterday</p>
                     </div>
                   </div>
                 </div>
               </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function AuthPage({ onLogin, onGoogleLogin }: { onLogin: (data: FormData) => void; onGoogleLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const validatePassword = (pass: string) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return pass.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const validateAadhaar = (aadhaar: string) => {
    const clean = aadhaar.replace(/\s/g, '');
    return /^\d{12}$/.test(clean);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    
    if (isRegistering) {
      const aadhaar = formData.get('aadhaar') as string;
      const email = formData.get('email') as string;
      const username = formData.get('username') as string;
      const fullname = formData.get('fullname') as string;

      if (!validateAadhaar(aadhaar)) {
        alert("🆔 Invalid Aadhaar: Must be exactly 12 digits.");
        return;
      }

      if (!validatePassword(password)) {
        alert("🔐 Password must be at least 8 characters, include 1 uppercase, 1 lowercase, 1 number, and 1 special character.");
        return;
      }

      if (!username || username.length < 4) {
        alert("Please enter a valid username (min 4 characters).");
        return;
      }

      setIsLoading(true);
      try {
        const { registerCitizen } = await import('./services/backendService');
        const res = await registerCitizen({ fullname, aadhaar, username, email, password });
        if (res.success) {
          alert(`✅ ${res.message}`);
          setIsRegistering(false);
        } else {
          alert(`❌ Registration failed: ${res.error}`);
        }
      } catch (e) {
        alert("Connection refused by server.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        const identifier = formData.get('email') as string;
        const { loginCitizen } = await import('./services/backendService');
        const res = await loginCitizen({ identifier, password });
        if (res.success) {
          onLogin(res.user);
        } else {
          alert(`❌ Login failed: ${res.error}`);
        }
      } catch (e) {
        alert("Connection refused by server.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(circle_at_top_right,_#FAF9F6_0%,#E5E5E5_100%)] p-6 overflow-hidden relative font-sans">
      <div 
        className="absolute inset-0 z-0 opacity-15 grayscale-[30%] bg-no-repeat bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1620766182966-c6eb5ed2b718?q=80&w=2600&auto=format&fit=crop")',
        }}
      />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-30 z-1" />
      
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px] mix-blend-multiply" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] mix-blend-multiply" />
      
      <motion.div 
        key={isRegistering ? 'register' : 'login'}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="ornamental-border relative z-10"
      >
        <div className="w-full max-w-md royal-glass rounded-[2.4rem] p-10 space-y-8">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto relative cursor-pointer group">
              <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full scale-150 animate-pulse" />
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/2/23/Emblem_of_Karnataka.svg" 
                alt="Emblem" 
                className="w-full h-full relative z-10 transform group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-serif font-black tracking-tight text-primary">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</h1>
              <p className="text-primary/80 text-xl font-serif font-bold tracking-tight">Digital Services Portal</p>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] pt-2">
                {isRegistering ? 'Citizen Registration' : 'Security Verification Required'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {!isRegistering && (
              <>
                <button 
                  onClick={onGoogleLogin}
                  className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md gold-glow"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.46-.37z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="tracking-tight">Continue with Google</span>
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-accent/20" /></div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]"><span className="bg-white px-4 text-accent font-bold">Credential Access</span></div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {isRegistering && (
                <>
                  <div className="floating-label-group">
                    <input 
                      required
                      name="fullname"
                      type="text" 
                      placeholder=" "
                      className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-4 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                    <label className="absolute left-4 top-4 text-slate-400 font-medium transition-all pointer-events-none">Full Name (As per Aadhaar)</label>
                  </div>

                  <div className="floating-label-group">
                    <input 
                      required
                      name="aadhaar"
                      type="text" 
                      maxLength={14}
                      placeholder=" "
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length > 12) value = value.slice(0, 12);
                        const parts = value.match(/.{1,4}/g);
                        e.target.value = parts ? parts.join(' ') : value;
                      }}
                      className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-4 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-mono tracking-widest"
                    />
                    <label className="absolute left-4 top-4 text-slate-400 font-medium transition-all pointer-events-none">12-Digit Aadhaar Number</label>
                  </div>

                  <div className="floating-label-group">
                    <input 
                      required
                      name="username"
                      type="text" 
                      placeholder=" "
                      className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-4 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                    <label className="absolute left-4 top-4 text-slate-400 font-medium transition-all pointer-events-none">Create Username</label>
                  </div>
                </>
              )}

              <div className="floating-label-group">
                <input 
                  required
                  name="email"
                  type="email" 
                  placeholder=" "
                  className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-4 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
                <label className="absolute left-4 top-4 text-slate-400 font-medium transition-all pointer-events-none">{isRegistering ? 'Email Address' : 'Username or Email'}</label>
              </div>

              <div className="space-y-1">
                <div className="floating-label-group relative">
                  <input 
                    required
                    name="password"
                    id="password"
                    type={showPassword ? "text" : "password"} 
                    placeholder=" "
                    className="peer w-full bg-white border border-slate-200 rounded-2xl py-4 px-4 pr-12 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                  <label 
                    htmlFor="password" 
                    className="absolute left-4 top-4 text-slate-400 font-medium transition-all pointer-events-none peer-focus:-top-2 peer-focus:left-4 peer-focus:text-xs peer-focus:bg-white peer-focus:px-1 peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
                  >
                    {isRegistering ? 'Create Password' : 'Access Credentials (Password / PIN)'}
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {isRegistering && (
                  <p className="text-[10px] text-slate-400 px-2 leading-tight">
                    Min 8 chars, 1 uppercase, 1 number, 1 special character.
                  </p>
                )}
              </div>

              {!isRegistering && (
                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700">Remember Me</span>
                  </label>
                  <button type="button" className="text-xs font-bold text-primary hover:underline underline-offset-4">Forgot ID or PIN?</button>
                </div>
              )}

              <motion.button 
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="w-full py-4 bg-gradient-to-tr from-primary via-primary to-[#A00000] text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 group border border-accent/20 gold-glow"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {isRegistering ? 'Request UID Access' : 'Authorize Access'}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>
          </div>

          <div className="text-center">
            {isRegistering ? (
              <p className="text-xs text-slate-500 font-medium">Already have a digital ID? <button onClick={() => setIsRegistering(false)} className="text-primary font-bold hover:underline">Sign In</button></p>
            ) : (
              <p className="text-xs text-slate-500 font-medium">New to digital services? <button onClick={() => setIsRegistering(true)} className="text-primary font-bold hover:underline">Register your UID</button></p>
            )}
          </div>
        </div>
      </motion.div>

      <div className="fixed bottom-10 flex flex-col items-center gap-2">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Official Portal of Karnataka</p>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="hover:text-primary cursor-pointer">Support</span>
          <div className="w-1 h-1 bg-slate-300 rounded-full" />
          <span className="hover:text-primary cursor-pointer">Security Policy</span>
          <div className="w-1 h-1 bg-slate-300 rounded-full" />
          <span className="hover:text-primary cursor-pointer">Digital India</span>
        </div>
      </div>
    </div>
  );
}
