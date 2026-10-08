import React, { useState } from 'react';
import { X, Mail, Copy, Check, Sparkles, Send, FileSpreadsheet, ShieldAlert } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { generateCommunication } from '../../lib/aiPipeline';

interface CommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunicationModal: React.FC<CommunicationModalProps> = ({ isOpen, onClose }) => {
  const { currentWorkspace, conflicts, findings, actions } = useWorkspace();
  const [commType, setCommType] = useState<'vendor_clarification' | 'executive_memo' | 'meeting_agenda' | 'follow_up'>('executive_memo');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generated = generateCommunication(commType, {
    conflicts,
    findings,
    actions,
    vendorName: currentWorkspace?.organization || 'External Stakeholder',
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(`${generated.subject}\n\n${generated.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[#0F172A] border border-white/[0.1] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Mail className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-base text-white">
                Generate Verified Communication
              </h3>
              <p className="text-xs text-slate-400">
                Grounded strictly on evidence-backed findings — Anti-hallucination enforced
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Communication Type Selector */}
        <div className="p-6 border-b border-white/[0.06] bg-surface-200/40">
          <label className="block text-xs font-semibold text-slate-300 uppercase font-mono tracking-wider mb-2">
            Select Output Format
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'vendor_clarification', label: 'Clarification Request' },
              { id: 'executive_memo', label: 'Executive Decision Memo' },
              { id: 'meeting_agenda', label: 'Meeting Alignment Agenda' },
              { id: 'follow_up', label: 'Internal Status Checklist' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCommType(tab.id as typeof commType)}
                className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
                  commType === tab.id
                    ? 'bg-indigo-600 text-white shadow-glow-primary'
                    : 'bg-surface-100 text-slate-300 hover:bg-surface-50 border border-white/[0.06]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generated Output Preview */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Subject</label>
            <div className="px-3 py-2 rounded-lg bg-surface-100 border border-white/[0.08] text-xs font-semibold text-indigo-200">
              {generated.subject}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Message Content</label>
            <div className="p-3.5 rounded-lg bg-surface-100 border border-white/[0.08] text-xs text-slate-200 font-mono whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
              {generated.body}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-surface-200/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
            <ShieldAlert className="w-3.5 h-3.5" />
            100% Evidence Grounded
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-glow-primary"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
