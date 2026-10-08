import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BrainCircuit, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Scale, 
  Mail, 
  FileText, 
  Sparkles, 
  ShieldAlert, 
  ChevronRight,
  UploadCloud
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Badge, ConfidenceBadge } from '../components/common/Badge';
import { CommunicationModal } from '../components/common/CommunicationModal';
import { NoWorkspaceState } from '../components/common/NoWorkspaceState';
import { Finding } from '../types';

export const IntelligencePage: React.FC = () => {
  const { currentWorkspace, findings, decisions, conflicts, evidenceGaps, sources } = useWorkspace();
  const navigate = useNavigate();
  const [commModalOpen, setCommModalOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  if (!currentWorkspace) {
    return (
      <div className="py-4">
        <NoWorkspaceState 
          title="Select or Create a Workspace for Intelligence Analysis"
          subtitle="Cross-document intelligence is synthesized strictly from documents in the active workspace."
        />
      </div>
    );
  }

  const filteredFindings = findings.filter(f => {
    if (filterSeverity !== 'all' && f.severity !== filterSeverity) return false;
    return true;
  });

  const hasIssues = conflicts.length > 0 || evidenceGaps.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-indigo-500/20 shadow-glass">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-indigo-400">
              CROSS-DOCUMENT SYNTHESIS • {currentWorkspace.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Information Intelligence
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            High-impact synthesis connecting contradictory clauses, missing governance proof, and historical compliance records in <strong>{currentWorkspace.name}</strong> into actionable executive findings.
          </p>
        </div>

        {findings.length > 0 && (
          <button
            onClick={() => setCommModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition-all shadow-glow-primary shrink-0"
          >
            <Mail className="w-4 h-4" />
            <span>Draft Executive Memo</span>
          </button>
        )}
      </div>

      {/* If No Findings: Empty State (Section 5) */}
      {findings.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-5 border-white/[0.08]">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <BrainCircuit className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">Intelligence findings will appear here after documents are analyzed.</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {sources.length === 0 
                ? "Upload documents into this workspace to begin cross-document intelligence extraction and high-impact risk synthesis."
                : "No high-impact risks or contradictions flagged yet for this workspace."}
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
          {/* Dynamic Executive Brief Banner */}
          <div className="glass-panel p-6 rounded-2xl border-amber-500/30 bg-amber-950/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  EXECUTIVE BRIEF
                </span>
                <span className="text-xs font-mono text-slate-400">System Verdict:</span>
                <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  {hasIssues ? '🟡 REVIEW REQUIRED' : '🟢 VERIFIED & READY'}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {sources.length} Ingested Documents Audited
              </span>
            </div>

            <h3 className="text-base font-bold text-white">
              {hasIssues 
                ? `${conflicts.length} Contradictions & ${evidenceGaps.length} Evidence Gaps Require Review`
                : 'All Extracted Claims Corroborated Across Ingested Sources'}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              Cross-source intelligence extraction across {sources.length} documents identified {findings.length} key operational findings. 
              {conflicts.length > 0 
                ? ` Parameter inconsistencies between sources require verification or contractual clarification prior to final baseline sign-off.`
                : ` Documented terms and parameters are consistent.`}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto p-2 rounded-xl bg-surface-100 border border-white/[0.08] text-xs">
            <span className="text-slate-400 font-mono pl-2 pr-1">Filter Severity:</span>
            {['all', 'critical', 'high', 'medium'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                  filterSeverity === sev
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Key Findings Cards */}
          <div className="space-y-4">
            {filteredFindings.map((finding) => (
              <div
                key={finding.id}
                className="glass-panel p-6 rounded-2xl border-white/[0.08] hover:border-indigo-500/30 transition-all space-y-4"
              >
                {/* Finding Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Badge variant={finding.severity === 'critical' ? 'critical' : 'high'}>
                      {finding.severity.toUpperCase()} IMPACT
                    </Badge>
                    <h3 className="font-display font-bold text-sm sm:text-base text-white">
                      {finding.title}
                    </h3>
                    <ConfidenceBadge confidence={finding.confidence} />
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>{finding.evidence_count} Supporting Evidence Citations</span>
                  </div>
                </div>

                {/* Description & Detailed Explanation */}
                <div className="space-y-2 text-xs">
                  <p className="text-slate-200 font-medium leading-relaxed">
                    {finding.description}
                  </p>
                  <div className="p-3 rounded-xl bg-surface-100 border border-white/[0.04] text-slate-300 leading-relaxed">
                    <strong className="text-indigo-300 font-mono">Analysis: </strong>
                    {finding.explanation}
                  </div>
                </div>

                {/* Sources Involved & Action Footer */}
                <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] uppercase text-slate-500 font-bold">Sources:</span>
                    {finding.sources_involved.map((srcName, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded bg-surface-200 text-slate-300 font-mono text-[10px] border border-white/[0.04]"
                      >
                        {srcName}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-indigo-300 font-semibold font-mono">
                      Action: {finding.recommended_action}
                    </span>
                    <button
                      onClick={() => navigate('/actions')}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                    >
                      Remediate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <CommunicationModal
        isOpen={commModalOpen}
        onClose={() => setCommModalOpen(false)}
      />
    </div>
  );
};
