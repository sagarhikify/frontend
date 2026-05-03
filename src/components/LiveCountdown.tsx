import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface LiveCountdownProps {
  targetDate: string;
  className?: string;
}

export const LiveCountdown: React.FC<LiveCountdownProps> = ({ targetDate, className }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetDate).getTime() - new Date().getTime();
      if (diff <= 0) return setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ d, h, m, s });
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  const isUrgent = timeLeft.d < 3;

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-[10px] sm:text-xs",
      isUrgent ? "bg-red-100 text-red-600 animate-pulse" : "bg-blue-50 text-blue-600",
      className
    )}>
      <Clock size={12} className={isUrgent ? "animate-spin" : ""} />
      <span>
        {timeLeft.d}d {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
      </span>
    </div>
  );
};
