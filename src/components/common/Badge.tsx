import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'verified' | 'conflict' | 'uncertain' | 'missing' | 'primary' | 'neutral' | 'critical' | 'high' | 'medium' | 'low';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral', 
  size = 'md',
  icon 
}) => {
  const styles: Record<string, string> = {
    verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    conflict: 'bg-red-500/10 text-red-400 border-red-500/30',
    uncertain: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    missing: 'bg-slate-700/50 text-slate-400 border-slate-600/40',
    primary: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    critical: 'bg-red-500/20 text-red-400 border-red-500/40 font-semibold',
    high: 'bg-orange-500/15 text-orange-400 border-orange-500/30 font-medium',
    medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  };

  const sizeClasses = size === 'sm' 
    ? 'text-[11px] px-2 py-0.5 tracking-tight' 
    : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${styles[variant] || styles.neutral} ${sizeClasses}`}>
      {icon}
      {children}
    </span>
  );
};

export const ConfidenceBadge: React.FC<{ confidence: number }> = ({ confidence }) => {
  const pct = Math.round(confidence * 100);
  const color = pct >= 95 
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' 
    : pct >= 85 
    ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' 
    : 'text-amber-400 bg-amber-500/10 border-amber-500/30';

  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md border ${color}`}>
      <span>◈</span> {pct}% Confidence
    </span>
  );
};

export const StatusIndicator: React.FC<{ status: 'supported' | 'conflicting' | 'uncertain' | 'missing_evidence' | 'unresolved' | 'resolved' }> = ({ status }) => {
  switch (status) {
    case 'supported':
      return <Badge variant="verified" icon={<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}>🟢 Verified Fact</Badge>;
    case 'conflicting':
    case 'unresolved':
      return <Badge variant="conflict" icon={<span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>}>🔴 Conflict</Badge>;
    case 'uncertain':
      return <Badge variant="uncertain" icon={<span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}>🟡 Uncertain</Badge>;
    case 'missing_evidence':
      return <Badge variant="missing" icon={<span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>}>⚫ Missing Evidence</Badge>;
    case 'resolved':
      return <Badge variant="verified" icon={<span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}>✓ Resolved</Badge>;
    default:
      return null;
  }
};
