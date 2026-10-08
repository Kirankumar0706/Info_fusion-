import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Radar, 
  ShieldCheck, 
  Scale, 
  Eye, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Badge, ConfidenceBadge, StatusIndicator } from '../components/common/Badge';

export const SourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sources, facts, conflicts, evidenceItems } = useWorkspace();

  const source = sources.find(s => s.id === id) || sources[0];

  const sourceFacts = facts.filter(f => f.source_id === source?.id);
  const sourceConflicts = conflicts.filter(c => c.source_a_id === source?.id || c.source_b_id === source?.id);
  const sourceEvidence = evidenceItems.filter(e => e.source_id === source?.id);

  const [activeTab, setActiveTab] = useState<'facts' | 'text' | 'conflicts' | 'evidence'>('facts');
  const [highlightedSnippet, setHighlightedSnippet] = useState<string | null>(null);

  if (!source) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-white">Source Not Found</h2>
        <button
          onClick={() => navigate('/sources')}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
        >
          Return to Sources
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/sources')}
          className="p-2 rounded-xl bg-surface-100 hover:bg-surface-50 border border-white/[0.08] text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {source.file_type.toUpperCase()} DOCUMENT
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-white mt-0.5">
            {source.file_name}
          </h1>
        </div>
      </div>

      {/* Top Metadata Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 font-mono">File Size</div>
          <div className="text-sm font-bold text-white mt-1">{(source.file_size / 1024).toFixed(0)} KB</div>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 font-mono">Extracted Facts</div>
          <div className="text-sm font-bold text-indigo-400 mt-1">{sourceFacts.length || source.facts_count} Facts</div>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 font-mono">Related Conflicts</div>
          <div className="text-sm font-bold text-red-400 mt-1">{sourceConflicts.length} Detected</div>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-[11px] text-slate-400 font-mono">Uploaded Date</div>
          <div className="text-sm font-bold text-slate-200 mt-1">{new Date(source.created_at).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/[0.08] gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('facts')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'facts' 
              ? 'border-indigo-500 text-indigo-400' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Extracted Facts ({sourceFacts.length})
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'text' 
              ? 'border-indigo-500 text-indigo-400' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Extracted Content & Viewer
        </button>
        <button
          onClick={() => setActiveTab('conflicts')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'conflicts' 
              ? 'border-indigo-500 text-indigo-400' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Related Contradictions ({sourceConflicts.length})
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'evidence' 
              ? 'border-indigo-500 text-indigo-400' 
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Linked Evidence ({sourceEvidence.length})
        </button>
      </div>

      {/* Tab 1: Extracted Facts */}
      {activeTab === 'facts' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>Every claim is normalized with physical source coordinate and confidence rating</span>
            <span>Total: {sourceFacts.length} Claims</span>
          </div>

          <div className="space-y-3">
            {sourceFacts.map((fact) => (
              <div
                key={fact.id}
                className="glass-panel p-4 rounded-xl border-white/[0.06] hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusIndicator status={fact.status} />
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-100 text-slate-300 border border-white/[0.06]">
                      {fact.category}
                    </span>
                    <ConfidenceBadge confidence={fact.confidence} />
                    <span className="text-[10px] font-mono text-slate-400">
                      Location: <strong className="text-indigo-300">{fact.source_location}</strong>
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-white">
                    "{fact.claim}"
                  </p>

                  <div className="text-[11px] font-mono text-slate-400">
                    Normalized Key: <strong className="text-indigo-300">{fact.normalized_key}</strong> = {fact.normalized_value}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('text');
                    setHighlightedSnippet(fact.claim);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-100 hover:bg-surface-50 text-indigo-300 border border-white/[0.08] shrink-0 transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Source</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Extracted Text & Ingestion Content Viewer */}
      {activeTab === 'text' && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <h3 className="font-display font-bold text-sm text-white">
              Document Text Stream & OCR Extraction
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">
              Verified Ingestion Container
            </span>
          </div>

          <div className="p-4 rounded-xl bg-surface-200/90 border border-white/[0.06] font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
            {source.extracted_text}
          </div>
        </div>
      )}

      {/* Tab 3: Related Conflicts */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4">
          {sourceConflicts.length === 0 ? (
            <div className="p-8 text-center rounded-xl glass-panel text-slate-400 text-xs">
              No direct contradictions found for this specific document.
            </div>
          ) : (
            sourceConflicts.map((conf) => (
              <div key={conf.id} className="glass-panel p-5 rounded-xl border-red-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-red-400 font-bold uppercase">{conf.conflict_type}</span>
                  <ConfidenceBadge confidence={conf.confidence} />
                </div>
                <div className="text-xs font-semibold text-white">{conf.difference_summary}</div>
                <p className="text-xs text-slate-300">{conf.explanation}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Linked Evidence */}
      {activeTab === 'evidence' && (
        <div className="space-y-3">
          {sourceEvidence.map((evi) => (
            <div key={evi.id} className="glass-panel p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-indigo-300">
                <span>{evi.source_location}</span>
                <ConfidenceBadge confidence={evi.confidence} />
              </div>
              <p className="text-xs text-slate-200 font-mono">"{evi.evidence_text}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
