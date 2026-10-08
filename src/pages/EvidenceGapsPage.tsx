import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SearchAlert, 
  ShieldQuestion, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Send, 
  UploadCloud 
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { ConfidenceBadge } from '../components/common/Badge';
import { CommunicationModal } from '../components/common/CommunicationModal';
import { NoWorkspaceState } from '../components/common/NoWorkspaceState';

export const EvidenceGapsPage: React.FC = () => {
  const { currentWorkspace, evidenceGaps, createAction, sources } = useWorkspace();
  const navigate = useNavigate();
  const [commModalOpen, setCommModalOpen] = useState(false);
  const [addedActionId, setAddedActionId] = useState<string | null>(null);

  if (!currentWorkspace) {
    return (
      <div className="py-4">
        <NoWorkspaceState 
          title="Select or Create a Workspace to View Evidence Gaps"
          subtitle="Evidence gaps track uncorroborated claims and missing documentation specific to a workspace."
        />
      </div>
    );
  }

  const handleConvertToAction = (gap: typeof evidenceGaps[0]) => {
    createAction({
      title: `Remediate Gap: ${gap.category}`,
      description: gap.recommended_action,
      priority: 'high',
      status: 'not_started',
      assigned_to: 'Workspace Compliance Lead',
      due_date: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
      related_finding: gap.claim,
    });
    setAddedActionId(gap.id);
    setTimeout(() => setAddedActionId(null), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-amber-500/20">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <SearchAlert className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-amber-400">
              AUDIT VERIFICATION LAYER • {currentWorkspace.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Evidence Gaps
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Claims detected in <strong>{currentWorkspace.name}</strong> documents that lack verifiable supporting proof. Under strict enterprise anti-hallucination guardrails, uncorroborated statements are explicitly classified as <em>"Evidence Not Found"</em> rather than assumed true.
          </p>
        </div>

        {evidenceGaps.length > 0 && (
          <button
            onClick={() => setCommModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-glow-primary shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Request Missing Evidence</span>
          </button>
        )}
      </div>

      {/* Anti-Hallucination Guardrail Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-white/[0.08] flex items-start gap-3 text-xs text-slate-300">
        <ShieldQuestion className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-white block">Enterprise Anti-Hallucination Standard</span>
          <p className="text-slate-400">
            InfoFusion never presumes an unverified claim is false. We distinguish <strong>Direct Facts</strong> (substantiated by physical pages/rows) from <strong>Uncorroborated Assertions</strong> that require affirmative validation prior to sign-off.
          </p>
        </div>
      </div>

      {/* If No Gaps: Empty State (Section 5) */}
      {evidenceGaps.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-5 border-white/[0.08]">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <SearchAlert className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">Evidence gaps will appear after your documents are analyzed.</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {sources.length === 0
                ? "Upload documents into this workspace to detect missing certifications, absent audit trails, and unsupported claims."
                : "No evidence gaps currently detected. All active claims in this workspace have sufficient supporting evidence."}
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
        /* Gaps List */
        <div className="space-y-4">
          {evidenceGaps.map((gap) => (
            <div
              key={gap.id}
              className="glass-panel p-6 rounded-2xl border-white/[0.08] hover:border-amber-500/30 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {gap.category}
                  </span>
                  <ConfidenceBadge confidence={gap.confidence} />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    🟠 EVIDENCE REQUIRED
                  </span>
                </div>
              </div>

              {/* Claim details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface-100 border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] font-bold text-slate-400">ASSERTED IN SOURCE</span>
                    <span className="text-slate-400 font-mono text-[10px]">{gap.claimed_location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-white truncate">
                    <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{gap.claimed_in_source}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-200/80 border border-white/[0.04] text-xs font-mono text-slate-200">
                    "{gap.claim}"
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] font-bold text-red-400">SUPPORTING EVIDENCE STATUS</span>
                    <span className="text-red-400 font-mono text-[10px]">VERIFICATION FAILED</span>
                  </div>
                  <div className="text-xs text-red-200 leading-relaxed pt-1">
                    <strong>Evidence Not Found:</strong> No accredited certificate file, third-party audit seal, or testing log exists in any uploaded documents for this workspace.
                  </div>
                </div>
              </div>

              {/* Recommended Action & Conversion */}
              <div className="p-4 rounded-xl bg-surface-200/60 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-mono text-[10px] uppercase font-bold text-indigo-400 block">
                    RECOMMENDED MITIGATION
                  </span>
                  <span className="text-slate-200 font-medium">
                    {gap.recommended_action}
                  </span>
                </div>

                <button
                  onClick={() => handleConvertToAction(gap)}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                    addedActionId === gap.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {addedActionId === gap.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Action Added</span>
                    </>
                  ) : (
                    <>
                      <span>Convert to Action</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Communication Modal */}
      <CommunicationModal
        isOpen={commModalOpen}
        onClose={() => setCommModalOpen(false)}
      />
    </div>
  );
};
