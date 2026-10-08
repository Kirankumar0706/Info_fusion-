import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radar, 
  Filter, 
  Search, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  TrendingDown, 
  Layers, 
  ShieldAlert,
  UploadCloud 
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Badge, ConfidenceBadge } from '../components/common/Badge';
import { ConflictInvestigationModal } from '../components/common/ConflictInvestigationModal';
import { NoWorkspaceState } from '../components/common/NoWorkspaceState';
import { Conflict, ConflictSeverity, ConflictStatus } from '../types';

export const ConflictsPage: React.FC = () => {
  const { currentWorkspace, conflicts, sources } = useWorkspace();
  const navigate = useNavigate();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);

  if (!currentWorkspace) {
    return (
      <div className="py-4">
        <NoWorkspaceState 
          title="Select or Create a Workspace to View Contradictions"
          subtitle="Contradiction detection operates strictly within the documents uploaded to a specific workspace."
        />
      </div>
    );
  }

  // Filtered conflicts
  const filteredConflicts = conflicts.filter(c => {
    if (filterSeverity !== 'all' && c.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = c.conflict_type.toLowerCase().includes(q) ||
        c.claim_a.toLowerCase().includes(q) ||
        c.claim_b.toLowerCase().includes(q) ||
        c.explanation.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const unresolvedCount = conflicts.filter(c => c.status === 'unresolved').length;
  const criticalCount = conflicts.filter(c => c.severity === 'critical').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header with Visual Radar Graphic */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 border-red-500/20 shadow-glow-conflict">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <Radar className="w-4 h-4 text-red-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-red-400">
              AUDIT VERIFICATION LAYER • {currentWorkspace.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Contradiction Radar
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Identifies conflicting claims and parameter discrepancies between documents in <strong>{currentWorkspace.name}</strong>. Unlike generative chatbots that hallucinate syntheses, InfoFusion pins each conflicting claim to its exact source and offsets.
          </p>
        </div>

        {/* Metric Badges */}
        <div className="flex sm:flex-row md:flex-col gap-3 relative z-10 shrink-0">
          <div className="p-3 rounded-xl bg-surface-100 border border-red-500/30 text-center min-w-[130px]">
            <div className="text-xs text-slate-400 font-medium">Unresolved Conflicts</div>
            <div className="text-2xl font-bold font-display text-red-400">{unresolvedCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-surface-100 border border-white/[0.08] text-center min-w-[130px]">
            <div className="text-xs text-slate-400 font-medium">Critical Severity</div>
            <div className="text-2xl font-bold font-display text-orange-400">{criticalCount}</div>
          </div>
        </div>
      </div>

      {/* If No Conflicts Detected: Empty State (Section 5) */}
      {conflicts.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-5 border-white/[0.08]">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <Radar className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">No contradictions detected yet.</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {sources.length === 0 
                ? "Upload multiple documents to this workspace to enable automated cross-document consistency auditing."
                : "All extracted claims in this workspace are mutually consistent or within allowable thresholds."}
            </p>
          </div>

          {sources.length === 0 && (
            <div className="pt-2">
              <button
                onClick={() => navigate('/sources')}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-2 transition-all shadow-glow-primary"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Documents to Analyze</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface-100 border border-white/[0.08]">
            {/* Severity Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-slate-400 font-mono pl-2 pr-1 hidden sm:inline">Severity:</span>
              {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all shrink-0 ${
                    filterSeverity === sev
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}

              <span className="text-xs text-slate-400 font-mono px-2 hidden sm:inline">|</span>

              {/* Status Filters */}
              {['all', 'unresolved', 'resolved'].map((stat) => (
                <button
                  key={stat}
                  onClick={() => setFilterStatus(stat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all shrink-0 ${
                    filterStatus === stat
                      ? 'bg-surface-50 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  {stat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contradictions..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-200 border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Contradiction Cards Grid */}
          {filteredConflicts.length === 0 ? (
            <div className="p-12 text-center rounded-2xl glass-panel space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-semibold text-white">No Contradictions Matching Filters</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active conflicts meet your selected severity or status filter criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className="glass-panel p-5 sm:p-6 rounded-2xl border-white/[0.08] hover:border-red-500/30 transition-all space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                        conflict.severity === 'critical' 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                          : conflict.severity === 'high' 
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {conflict.severity} SEVERITY
                      </span>
                      <h3 className="font-display font-bold text-sm sm:text-base text-white">
                        {conflict.conflict_type}
                      </h3>
                      <ConfidenceBadge confidence={conflict.confidence} />
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono uppercase font-bold px-2 py-0.5 rounded ${
                        conflict.status === 'resolved' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {conflict.status}
                      </span>
                      <button
                        onClick={() => setSelectedConflict(conflict)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <span>Investigate</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Conflict Side-by-Side Comparison Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Source A */}
                    <div className="p-4 rounded-xl bg-surface-100 border border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] font-bold text-indigo-400">SOURCE A</span>
                        <span className="text-slate-400 font-mono text-[10px]">{conflict.source_a_location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-white truncate">
                        <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{conflict.source_a_name}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-surface-200/80 border border-white/[0.04] text-xs font-mono text-slate-200">
                        "{conflict.claim_a}"
                      </div>
                    </div>

                    {/* Source B */}
                    <div className="p-4 rounded-xl bg-surface-100 border border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] font-bold text-amber-400">SOURCE B</span>
                        <span className="text-slate-400 font-mono text-[10px]">{conflict.source_b_location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-white truncate">
                        <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{conflict.source_b_name}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-surface-200/80 border border-white/[0.04] text-xs font-mono text-slate-200">
                        "{conflict.claim_b}"
                      </div>
                    </div>
                  </div>

                  {/* Calculated Delta and Explanation */}
                  <div className="p-3.5 rounded-xl bg-surface-200/70 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2 text-slate-300">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{conflict.explanation}</span>
                    </div>
                    <div className="shrink-0 font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                      {conflict.difference_summary}
                    </div>
                  </div>

                  {conflict.resolution_note && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                      <strong>Resolution: </strong> {conflict.resolution_note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Investigation Modal */}
      <ConflictInvestigationModal
        conflict={selectedConflict}
        onClose={() => setSelectedConflict(null)}
      />
    </div>
  );
};
