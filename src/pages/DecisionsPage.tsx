import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Mail, 
  Check, 
  XCircle,
  HelpCircle,
  ShieldCheck,
  Send,
  UploadCloud
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWorkspace } from '../context/WorkspaceContext';
import { Badge, StatusIndicator } from '../components/common/Badge';
import { CommunicationModal } from '../components/common/CommunicationModal';
import { NoWorkspaceState } from '../components/common/NoWorkspaceState';

export const DecisionsPage: React.FC = () => {
  const { currentWorkspace, decisions, updateDecisionStatus, actions, sources } = useWorkspace();
  const navigate = useNavigate();
  const [commModalOpen, setCommModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);

  if (!currentWorkspace) {
    return (
      <div className="py-4">
        <NoWorkspaceState 
          title="Select or Create a Workspace for Decision Analysis"
          subtitle="Decision frameworks are generated from findings and evidence within a specific workspace."
        />
      </div>
    );
  }

  const decision = decisions[0];

  const handleApproveWithOverride = () => {
    if (!decision) return;
    updateDecisionStatus(decision.id, 'approved', overrideReason || 'Approved with documented risk mitigation exception.');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setShowOverrideDialog(false);
  };

  const handleDeclineDecision = () => {
    if (!decision) return;
    updateDecisionStatus(decision.id, 'rejected', 'Decision deferred due to unresolved discrepancies and missing compliance evidence.');
    setShowOverrideDialog(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-indigo-500/20 shadow-glass">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <Scale className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-indigo-400">
              STRATEGIC GOVERNANCE • {currentWorkspace.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Decision Center
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Move beyond conversational answers to auditable, defensible business decisions for <strong>{currentWorkspace.name}</strong>. InfoFusion synthesizes all verified facts and flagged contradictions into a structured decision matrix.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCommModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface-100 hover:bg-surface-50 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-all"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Draft Memo</span>
          </button>
          <button
            onClick={() => navigate('/actions')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-glow-primary"
          >
            <span>Action Plan ({actions.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* If No Decision: Empty State (Section 5) */}
      {!decision ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-5 border-white/[0.08]">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <Scale className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">Decisions will appear after the system identifies relevant findings.</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {sources.length === 0
                ? "Upload documents to this workspace. Once facts and findings are extracted, InfoFusion constructs an evidence-backed decision matrix."
                : "Analyzing workspace findings to synthesize an evidence-backed decision matrix..."}
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
          {/* Main Decision Status Banner */}
          <div className={`p-6 rounded-2xl border transition-all ${
            decision.status === 'approved' 
              ? 'bg-emerald-950/20 border-emerald-500/40' 
              : decision.status === 'rejected'
              ? 'bg-red-950/30 border-red-500/40'
              : 'bg-red-950/20 border-red-500/30 shadow-glow-conflict'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                    decision.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : decision.status === 'rejected'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'bg-red-500/20 text-red-400 border border-red-500/40'
                  }`}>
                    {decision.status === 'review_required' ? '⚠️ REVIEW REQUIRED' : decision.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Owner: {decision.created_by}</span>
                </div>

                <h2 className="text-xl font-bold text-white tracking-tight">
                  {decision.title}
                </h2>

                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  {decision.summary}
                </p>
              </div>

              {/* Action Trigger Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                <button
                  onClick={() => setShowOverrideDialog(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.12] text-slate-200 transition-colors"
                >
                  Override / Change Status
                </button>
                <button
                  onClick={() => setCommModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-glow-primary"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Clarification
                </button>
              </div>
            </div>
          </div>

          {/* Decision Factors Table */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="font-display font-bold text-base text-white">
                Decision Factors & Evidentiary Criteria
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {decision.factors.length} Evaluation Criteria
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] text-slate-400 font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Evaluation Factor</th>
                    <th className="py-2.5 px-3">Criterion Status</th>
                    <th className="py-2.5 px-3">Evidentiary Finding</th>
                    <th className="py-2.5 px-3">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {decision.factors.map((f, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 font-semibold text-white">
                        {f.factor_name || f.factor}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          f.status === 'pass' || f.status === 'supported'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : f.status === 'fail' || f.status === 'conflict'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 max-w-md">
                        {f.finding || f.detail}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400 uppercase text-[10px]">
                        {f.weight ?? f.impact ?? 'High'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Override Dialog */}
      {showOverrideDialog && decision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-[#0F172A] border border-white/[0.1] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">Executive Override & Status Transition</h3>
            <p className="text-xs text-slate-300">
              Provide justification for approving or rejecting despite open contradiction warnings.
            </p>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g. Approved with risk mitigation exception and commercial addendum..."
              rows={3}
              className="w-full p-3 rounded-xl bg-surface-100 border border-white/[0.1] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowOverrideDialog(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.08] text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineDecision}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-600/30 text-red-300 border border-red-500/40"
              >
                Decline / Reject Scope
              </button>
              <button
                onClick={handleApproveWithOverride}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white"
              >
                Approve Decision Baseline
              </button>
            </div>
          </div>
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
