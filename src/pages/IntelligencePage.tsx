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
  UploadCloud,
  Check,
  PlusCircle,
  Eye,
  HelpCircle,
  Clock,
  Layers,
  Search
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Badge, ConfidenceBadge } from '../components/common/Badge';
import { CommunicationModal } from '../components/common/CommunicationModal';
import { NoWorkspaceState } from '../components/common/NoWorkspaceState';
import { Finding } from '../types';

export const IntelligencePage: React.FC = () => {
  const { currentWorkspace, findings, decisions, conflicts, evidenceGaps, sources, facts, createAction } = useWorkspace();
  const navigate = useNavigate();
  const [commModalOpen, setCommModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [convertedActions, setConvertedActions] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

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

  // Categories per Section 7
  const categories = [
    { id: 'all', label: 'All Findings' },
    { id: 'Risk', label: 'Risk' },
    { id: 'Conflict', label: 'Conflict' },
    { id: 'Missing Evidence', label: 'Missing Evidence' },
    { id: 'Important Change', label: 'Important Change' },
    { id: 'Anomaly', label: 'Anomaly' },
    { id: 'Verification Required', label: 'Verification Required' },
    { id: 'Opportunity', label: 'Opportunity' },
    { id: 'General Finding', label: 'General Finding' },
  ];

  const filteredFindings = findings.filter(f => {
    if (filterSeverity !== 'all' && f.severity !== filterSeverity) return false;
    if (filterCategory !== 'all') {
      const cat = f.category || 'General Finding';
      if (cat.toLowerCase() !== filterCategory.toLowerCase()) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = f.title.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.explanation.toLowerCase().includes(q) ||
        f.recommended_action.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const hasIssues = conflicts.length > 0 || evidenceGaps.length > 0;

  const handleConvertToAction = (finding: Finding) => {
    createAction({
      title: `Action: ${finding.title}`,
      description: `Remediation requirement for finding "${finding.title}": ${finding.recommended_action || finding.description}`,
      priority: finding.severity === 'critical' || finding.severity === 'high' ? 'high' : 'medium',
      status: 'pending',
      assigned_to: 'Audit & Compliance Officer',
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    });
    setConvertedActions(prev => ({ ...prev, [finding.id]: true }));
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Risk':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Conflict':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'Missing Evidence':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Important Change':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Anomaly':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Verification Required':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'Opportunity':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    }
  };

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
            Intelligence Engine
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Synthesizes verified facts, conflicting claims, and missing proof across all uploaded documents in <strong>{currentWorkspace.name}</strong> into actionable findings with structured lineage.
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

      {/* If No Findings: Exact Empty State per Section 18 */}
      {findings.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-5 border-white/[0.08]">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <BrainCircuit className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">No intelligence findings available yet.</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {sources.length === 0 
                ? "Upload documents to start extracting facts and generating intelligence."
                : "No high-impact contradictions or evidence gaps flagged yet for this workspace."}
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
                {sources.length} Ingested Document{sources.length === 1 ? '' : 's'} Audited
              </span>
            </div>

            <h3 className="text-base font-bold text-white">
              {hasIssues 
                ? `${conflicts.length} Contradiction${conflicts.length === 1 ? '' : 's'} & ${evidenceGaps.length} Evidence Gap${evidenceGaps.length === 1 ? '' : 's'} Require Review`
                : 'All Extracted Claims Corroborated Across Ingested Sources'}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              Cross-source intelligence extraction across {sources.length} documents identified {findings.length} key operational findings. 
              {conflicts.length > 0 
                ? ` Parameter inconsistencies between sources require verification or contractual clarification prior to final baseline sign-off.`
                : ` Documented terms and parameters are consistent.`}
            </p>
          </div>

          {/* Filter Bar with Categories (Section 7) */}
          <div className="space-y-3 p-3.5 rounded-2xl bg-surface-100 border border-white/[0.08]">
            {/* Categories Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-mono pl-1 pr-1 shrink-0">Category:</span>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
                    filterCategory.toLowerCase() === cat.id.toLowerCase()
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Severity and Search Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-white/[0.06] text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-mono pl-1 pr-1">Severity:</span>
                {['all', 'critical', 'high', 'medium'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all ${
                      filterSeverity === sev
                        ? 'bg-surface-50 text-indigo-300 border border-indigo-500/30 font-semibold'
                        : 'text-slate-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search findings..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-200 border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Key Findings Cards (Section 6 & 7) */}
          {filteredFindings.length === 0 ? (
            <div className="p-12 text-center rounded-2xl glass-panel space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-semibold text-white">No Findings Matching Filter</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No intelligence findings match your chosen category or severity filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFindings.map((finding) => (
                <div
                  key={finding.id}
                  className="glass-panel p-6 rounded-2xl border-white/[0.08] hover:border-indigo-500/30 transition-all space-y-4"
                >
                  {/* Finding Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase border ${getCategoryColor(finding.category)}`}>
                        {finding.category || 'GENERAL FINDING'}
                      </span>
                      <Badge variant={finding.severity === 'critical' ? 'critical' : 'high'}>
                        {finding.severity.toUpperCase()} RISK
                      </Badge>
                      <h3 className="font-display font-bold text-sm sm:text-base text-white">
                        {finding.title}
                      </h3>
                      <ConfidenceBadge confidence={finding.confidence} />
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span>{finding.evidence_count} Citations</span>
                    </div>
                  </div>

                  {/* Summary & Detailed Explanation */}
                  <div className="space-y-2 text-xs">
                    <p className="text-slate-200 font-medium leading-relaxed">
                      {finding.description}
                    </p>
                    <div className="p-3.5 rounded-xl bg-surface-100 border border-white/[0.04] text-slate-300 leading-relaxed">
                      <strong className="text-indigo-300 font-mono">Synthesis & Cross-Source Reasoning: </strong>
                      {finding.explanation}
                    </div>
                  </div>

                  {/* Supporting Facts, Related Contradictions & Gaps */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* Supporting Facts */}
                    <div className="p-3 rounded-xl bg-surface-100 border border-white/[0.04] space-y-1.5">
                      <div className="text-[10px] font-mono uppercase font-bold text-indigo-400 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" />
                        <span>Supporting Facts</span>
                      </div>
                      {finding.supporting_facts && finding.supporting_facts.length > 0 ? (
                        <div className="space-y-1">
                          {finding.supporting_facts.map((fText, fIdx) => (
                            <div key={fIdx} className="text-slate-300 font-mono text-[11px] truncate">
                              • {fText}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-400 text-[11px]">
                          {facts.length > 0 ? `${facts.length} facts corroborated in workspace` : 'Fact synthesis complete'}
                        </div>
                      )}
                    </div>

                    {/* Related Contradictions */}
                    <div className="p-3 rounded-xl bg-surface-100 border border-white/[0.04] space-y-1.5">
                      <div className="text-[10px] font-mono uppercase font-bold text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Related Contradictions</span>
                      </div>
                      {finding.related_contradictions && finding.related_contradictions.length > 0 ? (
                        <div className="space-y-1">
                          {finding.related_contradictions.map((cId, cIdx) => (
                            <div key={cIdx} className="text-red-300 font-mono text-[11px] truncate">
                              • Ref: {cId}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-400 text-[11px]">
                          {conflicts.length > 0 ? `${conflicts.length} active contradiction(s)` : 'None detected'}
                        </div>
                      )}
                    </div>

                    {/* Related Evidence Gaps */}
                    <div className="p-3 rounded-xl bg-surface-100 border border-white/[0.04] space-y-1.5">
                      <div className="text-[10px] font-mono uppercase font-bold text-amber-400 flex items-center gap-1.5">
                        <HelpCircle className="w-3 h-3" />
                        <span>Related Evidence Gaps</span>
                      </div>
                      {finding.related_evidence_gaps && finding.related_evidence_gaps.length > 0 ? (
                        <div className="space-y-1">
                          {finding.related_evidence_gaps.map((gId, gIdx) => (
                            <div key={gIdx} className="text-amber-300 font-mono text-[11px] truncate">
                              • Missing: {gId}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-400 text-[11px]">
                          {evidenceGaps.length > 0 ? `${evidenceGaps.length} evidence gap(s) identified` : 'No gaps flagged'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sources Involved, Recommended Action & Convert to Action (Section 10 & 12) */}
                  <div className="pt-3 border-t border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] uppercase text-slate-500 font-bold">Source Documents:</span>
                      {finding.sources_involved.map((srcName, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded bg-surface-200 text-slate-300 font-mono text-[10px] border border-white/[0.04]"
                        >
                          {srcName}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <button
                        onClick={() => navigate('/evidence')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-surface-100 hover:bg-surface-50 border border-white/[0.06] flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Trace Lineage</span>
                      </button>

                      <button
                        onClick={() => handleConvertToAction(finding)}
                        disabled={convertedActions[finding.id]}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                          convertedActions[finding.id]
                            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-primary'
                        }`}
                      >
                        {convertedActions[finding.id] ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Action Created</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Convert to Action</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <CommunicationModal
        isOpen={commModalOpen}
        onClose={() => setCommModalOpen(false)}
      />
    </div>
  );
};
