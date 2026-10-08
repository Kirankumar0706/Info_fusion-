import React, { useState } from 'react';
import { X, Radar, CheckCircle2, AlertTriangle, FileText, ArrowRight, Check, Eye, HelpCircle, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Conflict } from '../../types';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ConfidenceBadge } from './Badge';

interface ConflictInvestigationModalProps {
  conflict: Conflict | null;
  onClose: () => void;
}

export const ConflictInvestigationModal: React.FC<ConflictInvestigationModalProps> = ({ conflict, onClose }) => {
  const { updateConflictStatus } = useWorkspace();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<Conflict['status']>(conflict?.status || 'open');
  const [resolutionNote, setResolutionNote] = useState(conflict?.resolution_note || '');
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  if (!conflict) return null;

  const handleUpdateStatus = (newStatus: Conflict['status']) => {
    setSelectedStatus(newStatus);
    const note = resolutionNote.trim() || `Status updated to ${newStatus.replace('_', ' ')} by auditor.`;
    updateConflictStatus(conflict.id, newStatus, note);
    setSavedNotification(`Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
    setTimeout(() => {
      setSavedNotification(null);
    }, 2000);
  };

  const handleSaveNotes = () => {
    updateConflictStatus(conflict.id, selectedStatus, resolutionNote.trim());
    setSavedNotification('Audit note recorded');
    setTimeout(() => {
      setSavedNotification(null);
    }, 2000);
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
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                  {conflict.conflict_type}
                </span>
                <ConfidenceBadge confidence={conflict.confidence} />
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                  selectedStatus === 'resolved' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : selectedStatus === 'dismissed'
                    ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                    : selectedStatus === 'under_review'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {selectedStatus.replace('_', ' ')}
                </span>
              </div>
              <h3 className="font-display font-semibold text-base text-white mt-1">
                Contradiction Deep Investigation & Resolution
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
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {savedNotification && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>{savedNotification}</span>
            </div>
          )}

          {/* Detection Reason Alert */}
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-200 leading-relaxed flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-red-300 block mb-0.5">Detection Reason:</span>
              {conflict.explanation}
            </div>
          </div>

          {/* Side by side comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source A */}
            <div className="p-4 rounded-xl bg-surface-100 border border-white/[0.08] space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] uppercase font-bold text-indigo-400">SOURCE A</span>
                <span className="text-slate-400 font-mono text-[10px]">{conflict.source_a_location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="truncate">{conflict.source_a_name}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-200/90 border border-white/[0.06] text-xs font-mono text-slate-200 leading-relaxed">
                "{conflict.claim_a}"
              </div>
            </div>

            {/* Source B */}
            <div className="p-4 rounded-xl bg-surface-100 border border-white/[0.08] space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] uppercase font-bold text-amber-400">SOURCE B</span>
                <span className="text-slate-400 font-mono text-[10px]">{conflict.source_b_location}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{conflict.source_b_name}</span>
              </div>
              <div className="p-3 rounded-lg bg-surface-200/90 border border-white/[0.06] text-xs font-mono text-slate-200 leading-relaxed">
                "{conflict.claim_b}"
              </div>
            </div>
          </div>

          {/* Calculated Delta / Discrepancy */}
          <div className="p-3.5 rounded-xl bg-surface-100 border border-white/[0.08] flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">Variance / Difference Summary</span>
            <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
              {conflict.difference_summary}
            </span>
          </div>

          {/* Status Change Selector (Section 5 requirement) */}
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-300">
                Update Contradiction Status:
              </label>
              <span className="text-[10px] font-mono text-slate-400">Audit Status Pipeline</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleUpdateStatus('open')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  selectedStatus === 'open' || selectedStatus === 'unresolved'
                    ? 'bg-red-500/20 border-red-500 text-red-300 shadow-sm'
                    : 'bg-surface-100 border-white/[0.08] text-slate-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Open</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus('under_review')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  selectedStatus === 'under_review' || selectedStatus === 'investigating'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-surface-100 border-white/[0.08] text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Under Review</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus('resolved')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  selectedStatus === 'resolved'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-surface-100 border-white/[0.08] text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Resolved</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus('dismissed')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  selectedStatus === 'dismissed'
                    ? 'bg-slate-500/20 border-slate-400 text-slate-200 shadow-sm'
                    : 'bg-surface-100 border-white/[0.08] text-slate-400 hover:text-white'
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Dismissed</span>
              </button>
            </div>
          </div>

          {/* Audit Resolution Note */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-300">
                Auditor Resolution / Justification Note
              </label>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Save Note
              </button>
            </div>
            <textarea
              rows={2}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Contract addendum rev-2 supercedes earlier proposal; verified by auditor."
              className="w-full px-3 py-2 rounded-lg bg-surface-100 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] bg-surface-200/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              navigate('/evidence');
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Trace Lineage in Evidence Explorer</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.08] text-white hover:bg-white/[0.12] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
