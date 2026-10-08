import React, { useState } from 'react';
import { 
  History, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Radar, 
  Scale, 
  CheckSquare, 
  Clock 
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { NoWorkspaceState } from '../components/common/NoWorkspaceState';

export const ActivityPage: React.FC = () => {
  const { activityLogs, currentWorkspace } = useWorkspace();
  const [search, setSearch] = useState('');

  if (!currentWorkspace) {
    return (
      <div className="py-4">
        <NoWorkspaceState 
          title="Select or Create a Workspace to View Audit Trail"
          subtitle="Activity and audit logs are recorded and isolated per workspace."
        />
      </div>
    );
  }

  const filteredLogs = activityLogs.filter(log =>
    log.action_type.toLowerCase().includes(search.toLowerCase()) ||
    log.entity_title.toLowerCase().includes(search.toLowerCase()) ||
    log.user_name.toLowerCase().includes(search.toLowerCase())
  );

  const getActionBadge = (type: string) => {
    if (type.includes('CONFLICT')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">CONFLICT</span>;
    }
    if (type.includes('DECISION')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">DECISION</span>;
    }
    if (type.includes('SOURCE')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">SOURCE</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">AUDIT</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-indigo-500/20 shadow-glass">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <History className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-indigo-400">
              ENTERPRISE AUDIT TRAIL • {currentWorkspace.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Activity & Compliance Log
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Immutable chronology of all ingestion operations, fact extractions, conflict detections, resolutions, and executive decisions in <strong>{currentWorkspace.name}</strong>.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-surface-100 border border-white/[0.08] text-xs font-mono text-slate-300 flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Audit Log Active</span>
        </div>
      </div>

      {activityLogs.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border-white/[0.08]">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white">No activity recorded yet</h3>
            <p className="text-xs text-slate-400">
              Audit log entries will appear automatically as documents are ingested and verified.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Search Input */}
          <div className="p-3 rounded-xl bg-surface-100 border border-white/[0.08] flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity logs by action, user, or entity name..."
              className="bg-transparent text-xs text-white placeholder-slate-500 w-full focus:outline-none"
            />
          </div>

          {/* Timeline List */}
          <div className="glass-panel p-6 rounded-2xl space-y-4 border-white/[0.08]">
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-surface-100 border border-white/[0.04] hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getActionBadge(log.action_type)}
                      <span className="font-mono text-[11px] font-bold text-slate-400">
                        {log.entity_type}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="font-semibold text-white">
                        {log.user_name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-200 font-mono">
                      {log.entity_title}
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 shrink-0 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
