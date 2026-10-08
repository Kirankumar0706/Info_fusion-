import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Files, 
  FileSpreadsheet, 
  CheckCircle2, 
  Radar, 
  SearchAlert, 
  AlertTriangle, 
  Scale, 
  ArrowRight, 
  Sparkles, 
  Mail, 
  ShieldCheck, 
  Activity, 
  ChevronRight,
  TrendingUp,
  HelpCircle,
  UploadCloud,
  FileText,
  FileCheck2,
  PieChart,
  BarChart3,
  Clock,
  Layers,
  Building2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Badge, ConfidenceBadge, StatusIndicator } from '../components/common/Badge';
import { ConflictInvestigationModal } from '../components/common/ConflictInvestigationModal';
import { CommunicationModal } from '../components/common/CommunicationModal';
import { NoWorkspaceState } from '../components/common/NoWorkspaceState';
import { Conflict } from '../types';

export const DashboardPage: React.FC = () => {
  const { 
    currentWorkspace, 
    sources, 
    facts, 
    conflicts, 
    evidenceGaps, 
    findings, 
    decisions, 
    actions 
  } = useWorkspace();
  const navigate = useNavigate();

  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
  const [commModalOpen, setCommModalOpen] = useState(false);

  // If no workspace is selected, show the clean Onboarding / Create Workspace flow (Section 2)
  if (!currentWorkspace) {
    return (
      <div className="py-4">
        <NoWorkspaceState 
          title="Create Your Workspace"
          subtitle="Create a workspace for your organization or project. Upload your documents and InfoFusion will analyze only the information belonging to that workspace."
        />
      </div>
    );
  }

  // Computed metrics based strictly on current workspace data (Section 3 & 8)
  const totalSources = sources.length;
  const totalFacts = facts.length;
  const verifiedFacts = facts.filter(f => f.status === 'supported').length;
  const conflictingFacts = facts.filter(f => f.status === 'conflicting').length;
  const uncertainFacts = facts.filter(f => f.status === 'uncertain').length;
  const missingFacts = facts.filter(f => f.status === 'missing_evidence').length;

  const unresolvedConflicts = conflicts.filter(c => c.status === 'unresolved');
  const activeGaps = evidenceGaps.filter(g => g.status === 'evidence_required');
  const highImpactFindings = findings.filter(f => f.severity === 'critical' || f.severity === 'high');
  const openActions = actions.filter(a => a.status !== 'completed');

  // Primary decision for this workspace
  const primaryDecision = decisions[0];

  // Health percentages for visual ring / bar
  const verifiedPct = totalFacts > 0 ? Math.round((verifiedFacts / totalFacts) * 100) : 0;
  const conflictingPct = totalFacts > 0 ? Math.round((conflictingFacts / totalFacts) * 100) : 0;
  const uncertainPct = totalFacts > 0 ? Math.round((uncertainFacts / totalFacts) * 100) : 0;
  const missingPct = totalFacts > 0 ? Math.round((missingFacts / totalFacts) * 100) : 0;

  // Source distribution
  const sourceTypes = sources.reduce((acc, src) => {
    const ext = (src.file_type || 'other').toUpperCase();
    acc[ext] = (acc[ext] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Workspace Overview Header (Section 8) */}
      <div className="rounded-2xl p-6 sm:p-7 glass-panel border-indigo-500/20 shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              WORKSPACE OVERVIEW
            </span>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              {currentWorkspace.organization}
            </span>
            {currentWorkspace.industry && (
              <span className="text-xs text-slate-400 font-medium">
                • {currentWorkspace.industry}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
            {currentWorkspace.name}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {currentWorkspace.description || 'Isolated enterprise workspace for multi-source evidence extraction and strategic decision support.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <button
            onClick={() => navigate('/sources')}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition-all shadow-glow-primary"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Documents</span>
          </button>
          {conflicts.length > 0 && (
            <button
              onClick={() => navigate('/conflicts')}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-surface-100 hover:bg-surface-50 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-all"
            >
              <Radar className="w-4 h-4 text-red-400" />
              <span>Radar ({unresolvedConflicts.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Metric Cards (Section 8) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Sources */}
        <div 
          onClick={() => navigate('/sources')}
          className="glass-card p-3.5 rounded-xl cursor-pointer group hover:border-indigo-500/40 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-medium">Sources</span>
            <Files className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-display text-white">{totalSources}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">Ingested docs</div>
        </div>

        {/* Total Facts */}
        <div 
          onClick={() => navigate('/facts')}
          className="glass-card p-3.5 rounded-xl cursor-pointer group hover:border-indigo-500/40 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-medium">Total Facts</span>
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-display text-white">{totalFacts}</div>
          <div className="text-[10px] text-indigo-400 mt-0.5 truncate">Normalized</div>
        </div>

        {/* Verified Facts */}
        <div 
          onClick={() => navigate('/facts?status=supported')}
          className="glass-card p-3.5 rounded-xl cursor-pointer group border-emerald-500/20 hover:border-emerald-500/40 transition-all"
        >
          <div className="flex items-center justify-between text-emerald-400 mb-1.5">
            <span className="text-[11px] font-medium">Verified Facts</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-display text-emerald-400">{verifiedFacts}</div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5 truncate">100% backed</div>
        </div>

        {/* Contradictions */}
        <div 
          onClick={() => navigate('/conflicts')}
          className="glass-card p-3.5 rounded-xl cursor-pointer group border-red-500/30 bg-red-950/10 hover:border-red-500/50 transition-all shadow-glow-conflict"
        >
          <div className="flex items-center justify-between text-red-400 mb-1.5">
            <span className="text-[11px] font-medium">Contradictions</span>
            <Radar className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-xl font-bold font-display text-red-400">{unresolvedConflicts.length}</div>
          <div className="text-[10px] text-red-400 font-semibold mt-0.5 truncate">Radar flags</div>
        </div>

        {/* Evidence Gaps */}
        <div 
          onClick={() => navigate('/evidence-gaps')}
          className="glass-card p-3.5 rounded-xl cursor-pointer group border-amber-500/20 hover:border-amber-500/40 transition-all"
        >
          <div className="flex items-center justify-between text-amber-400 mb-1.5">
            <span className="text-[11px] font-medium">Evidence Gaps</span>
            <SearchAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-display text-amber-400">{activeGaps.length}</div>
          <div className="text-[10px] text-amber-400/80 mt-0.5 truncate">Missing proof</div>
        </div>

        {/* Findings */}
        <div 
          onClick={() => navigate('/intelligence')}
          className="glass-card p-3.5 rounded-xl cursor-pointer group hover:border-indigo-500/40 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-medium">Findings</span>
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-xl font-bold font-display text-orange-400">{findings.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">Synthesized</div>
        </div>

        {/* Open Actions */}
        <div 
          onClick={() => navigate('/actions')}
          className="glass-card p-3.5 rounded-xl cursor-pointer group hover:border-indigo-500/40 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-medium">Open Actions</span>
            <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-display text-indigo-300">{openActions.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">Pending</div>
        </div>

        {/* Decisions */}
        <div 
          onClick={() => navigate('/decisions')}
          className="glass-card p-3.5 rounded-xl cursor-pointer group hover:border-indigo-500/40 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-medium">Decisions</span>
            <Scale className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-display text-amber-300">{decisions.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">Governance</div>
        </div>
      </div>

      {/* If current workspace has NO DOCUMENTS uploaded yet: Show Clean Empty State (Section 5, 6 & 16) */}
      {totalSources === 0 ? (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl text-center space-y-6 border-white/[0.08] shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
              No documents uploaded to this workspace yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              InfoFusion analyzes only the documents belonging to <strong>{currentWorkspace.name}</strong>. Upload your organization's files to automatically extract facts, verify evidence, flag contradictions, and generate strategic recommendations.
            </p>
          </div>

          {/* Workflow Pipeline Display (Section 6) */}
          <div className="py-4 max-w-2xl mx-auto">
            <div className="p-4 rounded-2xl bg-surface-100 border border-white/[0.06] flex items-center justify-between text-xs font-mono overflow-x-auto gap-2">
              <span className="text-indigo-400 font-bold">1. Upload</span>
              <span className="text-slate-500">→</span>
              <span className="text-slate-400">2. Extract</span>
              <span className="text-slate-500">→</span>
              <span className="text-slate-400">3. Structure</span>
              <span className="text-slate-500">→</span>
              <span className="text-slate-400">4. Analyze</span>
              <span className="text-slate-500">→</span>
              <span className="text-slate-400">5. Verify</span>
              <span className="text-slate-500">→</span>
              <span className="text-emerald-400 font-bold">6. Results</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Supported formats: PDF • DOCX • XLSX / Excel • CSV • TXT • Markdown • Images
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/sources')}
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-2 transition-all shadow-glow-primary"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Your First Document</span>
            </button>
          </div>
        </div>
      ) : (
        /* If current workspace HAS DOCUMENTS: Show Full Audited Analytics */
        <>
          {/* Primary Decision Banner if exists */}
          {primaryDecision && (
            <div className={`rounded-2xl p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              primaryDecision.status === 'approved' 
                ? 'bg-emerald-950/20 border-emerald-500/30' 
                : primaryDecision.status === 'rejected'
                ? 'bg-red-950/20 border-red-500/30'
                : 'bg-amber-950/20 border-amber-500/30'
            }`}>
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                  primaryDecision.status === 'approved'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                }`}>
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                      DECISION STATUS: {primaryDecision.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {primaryDecision.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {primaryDecision.summary}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/decisions')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.12] text-white flex items-center gap-1.5 transition-colors shrink-0"
              >
                <span>Examine Decision Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Main Visualizations: Information Health + Source Distribution / Contradictions (Section 14) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* INFORMATION HEALTH VISUALIZATION */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    Information Health
                  </h3>
                  <span className="text-xs font-mono text-slate-400">{totalFacts} Facts</span>
                </div>

                <p className="text-xs text-slate-300 mb-5 leading-relaxed">
                  Audited cross-source certainty distribution. Statements are verified against physical sources rather than relying on generative guesswork.
                </p>

                {/* Segmented Bar */}
                <div className="h-4 rounded-full bg-slate-800 overflow-hidden flex w-full p-0.5 gap-0.5 mb-6">
                  <div 
                    style={{ width: `${verifiedPct}%` }} 
                    className="bg-emerald-500 rounded-l-full transition-all" 
                    title={`Verified: ${verifiedFacts}`} 
                  />
                  <div 
                    style={{ width: `${conflictingPct}%` }} 
                    className="bg-red-500 transition-all" 
                    title={`Conflicting: ${conflictingFacts}`} 
                  />
                  <div 
                    style={{ width: `${uncertainPct}%` }} 
                    className="bg-amber-500 transition-all" 
                    title={`Uncertain: ${uncertainFacts}`} 
                  />
                  <div 
                    style={{ width: `${missingPct}%` }} 
                    className="bg-slate-500 rounded-r-full transition-all" 
                    title={`Missing Evidence: ${missingFacts}`} 
                  />
                </div>

                {/* Status Breakdown Legend */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-100 border border-white/[0.04]">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="text-slate-200 font-medium">Verified Facts</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      {verifiedFacts} ({verifiedPct}%)
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-100 border border-white/[0.04]">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      <span className="text-slate-200 font-medium">Conflicting Facts</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-red-400">
                      {conflictingFacts} ({conflictingPct}%)
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-100 border border-white/[0.04]">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="text-slate-200 font-medium">Uncertain / Uncorroborated</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-amber-400">
                      {uncertainFacts} ({uncertainPct}%)
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-100 border border-white/[0.04]">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                      <span className="text-slate-200 font-medium">Missing Evidence Gaps</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-400">
                      {missingFacts} ({missingPct}%)
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/facts')}
                className="w-full mt-6 py-2.5 rounded-xl text-xs font-semibold bg-surface-100 hover:bg-surface-50 text-indigo-300 border border-white/[0.08] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Explore Extracted Facts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* CONTRADICTION RADAR PREVIEW (Section 10) */}
            <div className="glass-panel p-6 rounded-2xl lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                      <Radar className="w-4 h-4 text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-white">
                        Contradiction Radar
                      </h3>
                      <p className="text-xs text-slate-400">
                        Cross-document claim and parameter discrepancies
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/conflicts')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    View all ({conflicts.length}) <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Conflict Cards or Clean State */}
                {conflicts.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-surface-100 border border-white/[0.06] space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <div className="text-sm font-semibold text-white">No Contradictions Detected</div>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      All claims across uploaded documents in this workspace are mutually consistent.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {conflicts.slice(0, 3).map((conflict) => (
                      <div
                        key={conflict.id}
                        className="p-4 rounded-xl bg-surface-100 border border-white/[0.08] hover:border-red-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-mono uppercase font-bold text-red-400 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                              {conflict.conflict_type}
                            </span>
                            <ConfidenceBadge confidence={conflict.confidence} />
                            <span className="text-[10px] font-mono text-slate-400">
                              Status: <strong className="text-red-400 uppercase">{conflict.status}</strong>
                            </span>
                          </div>

                          <div className="text-xs text-slate-200 font-medium">
                            {conflict.difference_summary}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                            <div className="truncate">
                              <strong className="text-indigo-400 font-mono">A: </strong>
                              <span className="text-slate-300 font-mono">"{conflict.claim_a}"</span>
                            </div>
                            <div className="truncate">
                              <strong className="text-amber-400 font-mono">B: </strong>
                              <span className="text-slate-300 font-mono">"{conflict.claim_b}"</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedConflict(conflict)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 shrink-0 transition-all"
                        >
                          Investigate
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Deterministic parameter normalization active across {totalSources} documents
                </span>
                <button
                  onClick={() => navigate('/conflicts')}
                  className="text-xs font-semibold text-slate-200 hover:text-white"
                >
                  Examine Full Radar →
                </button>
              </div>
            </div>
          </div>

          {/* Action Center Preview (Section 10) */}
          {actions.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    Action Center: Recommended Steps
                  </h3>
                  <p className="text-xs text-slate-400">
                    Generated from audited contradictions and evidence gaps in this workspace
                  </p>
                </div>

                <button
                  onClick={() => navigate('/actions')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  Manage Actions ({actions.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {actions.slice(0, 4).map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-xl bg-surface-100 border border-white/[0.08] hover:border-indigo-500/30 flex flex-col justify-between transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <Badge variant={act.priority === 'urgent' ? 'critical' : act.priority === 'high' ? 'high' : 'medium'}>
                          {act.priority.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-400">Due: {act.due_date}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white leading-snug">
                        {act.title}
                      </h4>
                      <p className="text-[11px] text-slate-300 line-clamp-2">
                        {act.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400">
                      <span className="truncate">{act.assigned_to.split(' ')[0]}</span>
                      <span className={`font-mono uppercase font-semibold ${
                        act.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {act.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Deep Investigation Modal */}
      <ConflictInvestigationModal
        conflict={selectedConflict}
        onClose={() => setSelectedConflict(null)}
      />

      {/* Communication Generator Modal */}
      <CommunicationModal
        isOpen={commModalOpen}
        onClose={() => setCommModalOpen(false)}
      />
    </div>
  );
};
