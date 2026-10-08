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

  // Metric computations per Section 5
  const totalCount = conflicts.length;
  const highSeverityCount = conflicts.filter(c => c.severity === 'critical' || c.severity === 'high').length;
  const mediumSeverityCount = conflicts.filter(c => c.severity === 'medium').length;
  const lowSeverityCount = conflicts.filter(c => c.severity === 'low').length;

  // Filtered conflicts
  const filteredConflicts = conflicts.filter(c => {
    if (filterSeverity === 'high' && (c.severity !== 'critical' && c.severity !== 'high')) return false;
    if (filterSeverity !== 'all' && filterSeverity !== 'high' && c.severity !== filterSeverity) return false;
    
    if (filterStatus === 'open' && (c.status !== 'open' && c.status !== 'unresolved')) return false;
    if (filterStatus === 'under_review' && (c.status !== 'under_review' && c.status !== 'investigating')) return false;
    if (filterStatus !== 'all' && filterStatus !== 'open' && filterStatus !== 'under_review' && c.status !== filterStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = c.conflict_type.toLowerCase().includes(q) ||
        c.claim_a.toLowerCase().includes(q) ||
        c.claim_b.toLowerCase().includes(q) ||
        c.explanation.toLowerCase().includes(q) ||
        (c.attribute && c.attribute.toLowerCase().includes(q)) ||
        (c.subject && c.subject.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

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
              CONTRADICTION RADAR • {currentWorkspace.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Contradiction Radar
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Continuously compares claims, parameters, and clauses across all documents in <strong>{currentWorkspace.name}</strong>. Differences are rigorously analyzed before declaring contradictions to distinguish valid versioning from true conflicts.
          </p>
        </div>

        {/* Dynamic Severity Metric Badges (Section 5) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2.5 relative z-10 shrink-0">
          <div className="p-3 rounded-xl bg-surface-100 border border-white/[0.08] text-center min-w-[95px]">
            <div className="text-[10px] text-slate-400 font-mono uppercase font-medium">Total</div>
            <div className="text-xl font-bold font-display text-white">{totalCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-surface-100 border border-red-500/30 text-center min-w-[95px]">
            <div className="text-[10px] text-red-400 font-mono uppercase font-medium">High / Critical</div>
            <div className="text-xl font-bold font-display text-red-400">{highSeverityCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-surface-100 border border-amber-500/30 text-center min-w-[95px]">
            <div className="text-[10px] text-amber-400 font-mono uppercase font-medium">Medium</div>
            <div className="text-xl font-bold font-display text-amber-400">{mediumSeverityCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-surface-100 border border-blue-500/30 text-center min-w-[95px]">
            <div className="text-[10px] text-blue-400 font-mono uppercase font-medium">Low</div>
            <div className="text-xl font-bold font-display text-blue-400">{lowSeverityCount}</div>
          </div>
        </div>
      </div>

      {/* If No Conflicts Detected: Exact Empty State per Section 5 & 18 */}
      {conflicts.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-5 border-white/[0.08]">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <Radar className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">No contradictions detected in this workspace.</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {sources.length === 0 
                ? "Upload documents to start extracting facts and detecting contradictions across sources."
                : "All extracted facts and claims in this workspace are mutually consistent or have non-conflicting contexts."}
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
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 rounded-xl bg-surface-100 border border-white/[0.08]">
            {/* Severity and Status Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 flex-wrap">
              <span className="text-xs text-slate-400 font-mono pl-1 pr-1">Severity:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'high', label: 'High' },
                { id: 'medium', label: 'Medium' },
                { id: 'low', label: 'Low' },
              ].map((sev) => (
                <button
                  key={sev.id}
                  onClick={() => setFilterSeverity(sev.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    filterSeverity === sev.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  {sev.label}
                </button>
              ))}

              <span className="text-xs text-slate-500 font-mono px-1">|</span>

              <span className="text-xs text-slate-400 font-mono pr-1">Status:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'open', label: 'Open' },
                { id: 'under_review', label: 'Under Review' },
                { id: 'resolved', label: 'Resolved' },
                { id: 'dismissed', label: 'Dismissed' },
              ].map((stat) => (
                <button
                  key={stat.id}
                  onClick={() => setFilterStatus(stat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    filterStatus === stat.id
                      ? 'bg-surface-50 text-indigo-300 border border-indigo-500/30 font-semibold'
                      : 'text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  {stat.label}
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
                No active contradictions in this workspace match your selected severity or status filter criteria.
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
                        conflict.severity === 'critical' || conflict.severity === 'high'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                          : conflict.severity === 'medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {conflict.severity === 'critical' ? 'HIGH' : conflict.severity.toUpperCase()} SEVERITY
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
                          : conflict.status === 'dismissed'
                          ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          : conflict.status === 'under_review' || conflict.status === 'investigating'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {conflict.status.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => setSelectedConflict(conflict)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <span>Inspect & Resolve</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Detection Reason Banner */}
                  <div className="p-3.5 rounded-xl bg-surface-100 border border-white/[0.06] flex items-start gap-2.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200">Detection Reason: </span>
                      <span className="text-slate-300">{conflict.explanation}</span>
                    </div>
                  </div>

                  {/* Conflicting Values Side-by-Side Comparison Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Value 1 / Source A */}
                    <div className="p-4 rounded-xl bg-surface-100 border border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] font-bold text-indigo-400">VALUE 1 (SOURCE A)</span>
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

                    {/* Value 2 / Source B */}
                    <div className="p-4 rounded-xl bg-surface-100 border border-white/[0.06] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] font-bold text-amber-400">VALUE 2 (SOURCE B)</span>
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

                  {/* Variance and Traceability Footer */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20 inline-block">
                      Variance: {conflict.difference_summary}
                    </div>

                    <button
                      onClick={() => navigate('/evidence')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold self-end sm:self-auto"
                    >
                      <span>Trace Evidence Lineage</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {conflict.resolution_note && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                      <strong>Audit Resolution Note: </strong> {conflict.resolution_note}
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
