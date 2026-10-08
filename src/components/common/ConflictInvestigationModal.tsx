import React, { useState } from 'react';
import { X, Radar, CheckCircle2, AlertTriangle, FileText, ArrowRight, Check } from 'lucide-react';
import { Conflict } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ConfidenceBadge } from './Badge';

interface ConflictInvestigationModalProps {
  conflict: Conflict | null;
  onClose: () => void;
}

export const ConflictInvestigationModal: React.FC<ConflictInvestigationModalProps> = ({ conflict, onClose }) => {
  const { resolveConflict } = useWorkspace();
  const [resolutionNote, setResolutionNote] = useState('');
  const [isResolved, setIsResolved] = useState(false);

  if (!conflict) return null;

  const handleResolve = () => {
    resolveConflict(conflict.id, resolutionNote.trim() || 'Conflict reconciled and accepted by procurement lead.');
    setIsResolved(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0F172A] border border-white/[0.1] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-surface-200/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <Radar className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  {conflict.conflict_type}
                </span>
                <ConfidenceBadge confidence={conflict.confidence} />
              </div>
              <h3 className="font-display font-semibold text-base text-white mt-1">
                Contradiction Deep Investigation
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Side-by-side Evidence Analysis */}
        <div className="p-6 space-y-6">
          {/* Explanation Alert */}
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-200 leading-relaxed flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-red-300 block mb-0.5">Automated Discrepancy Analysis</span>
              {conflict.explanation}
            </div>
          </div>

          {/* Side by side comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source A */}
            <div className="p-4 rounded-xl bg-surface-100 border border-white/[0.08] space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] uppercase font-bold text-indigo-400">Claim A</span>
                <span className="text-slate-400 font-mono text-[10px]">{conflict.source_a_location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="truncate">{conflict.source_a_name}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-200/90 border border-white/[0.06] text-xs font-mono text-slate-200">
                "{conflict.claim_a}"
              </div>
            </div>

            {/* Source B */}
            <div className="p-4 rounded-xl bg-surface-100 border border-white/[0.08] space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] uppercase font-bold text-amber-400">Claim B</span>
                <span className="text-slate-400 font-mono text-[10px]">{conflict.source_b_location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{conflict.source_b_name}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-200/90 border border-white/[0.06] text-xs font-mono text-slate-200">
                "{conflict.claim_b}"
              </div>
            </div>
          </div>

          {/* Calculated Delta / Discrepancy */}
          <div className="p-3.5 rounded-xl bg-surface-100 border border-white/[0.08] flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">Normalized Variance Metric</span>
            <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
              {conflict.difference_summary}
            </span>
          </div>

          {/* Resolution section */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <label className="block text-xs font-medium text-slate-300">
              Procurement Audit Resolution Note
            </label>
            <textarea
              rows={2}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Verified with vendor via addendum rev-4; ₹4.8L agreed net baseline."
              className="w-full px-3 py-2 rounded-lg bg-surface-100 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-surface-200/50 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono">
            Status: <span className="text-red-400 uppercase font-semibold">{conflict.status}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05]"
            >
              Close
            </button>
            <button
              onClick={handleResolve}
              disabled={conflict.status === 'resolved' || isResolved}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-glow-verified disabled:opacity-50"
            >
              {isResolved ? <Check className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              {isResolved ? 'Resolved!' : 'Mark as Reconciled & Resolved'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
