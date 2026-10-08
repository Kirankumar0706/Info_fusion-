import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  Globe2, 
  ShieldCheck, 
  FileText, 
  ChevronRight, 
  ExternalLink,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  UploadCloud,
  Building2
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { SUPPORTED_LANGUAGES, queryWorkspaceMultilingual } from '../lib/multilingual';
import { ConfidenceBadge } from '../components/common/Badge';
import { NoWorkspaceState } from '../components/common/NoWorkspaceState';
import { AssistantAnswer } from '../types';

export const AskAssistantPage: React.FC = () => {
  const { currentWorkspace, conflicts, evidenceGaps, findings, sources, facts, activeLanguage, setActiveLanguage } = useWorkspace();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [targetLang, setTargetLang] = useState(activeLanguage || 'auto');
  const [chatHistory, setChatHistory] = useState<Array<{ query: string; response: AssistantAnswer }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!currentWorkspace) {
    return (
      <div className="py-4">
        <NoWorkspaceState 
          title="Select or Create a Workspace to Ask Questions"
          subtitle="The AI assistant is strictly workspace-isolated and only accesses information belonging to the active workspace."
        />
      </div>
    );
  }

  const sampleQueries = [
    { label: 'Why Review Required?', text: 'Why is this decision marked Review Required?' },
    { label: 'Major Contradictions', text: 'What are the major contradictions detected between documents in this workspace?' },
    { label: 'Missing Evidence', text: 'Which claims have insufficient or missing evidence?' },
    { label: 'Extracted Facts', text: 'What are the key facts extracted from the documents?' },
  ];

  const handleSend = (textToSend?: string, langOverride?: string) => {
    const q = textToSend || query;
    if (!q.trim()) return;

    setIsLoading(true);
    const selectedL = langOverride || targetLang;

    setTimeout(() => {
      let resp: AssistantAnswer;

      if (sources.length === 0) {
        resp = {
          answer: `No documents have been uploaded to workspace "${currentWorkspace.name}" yet. Please upload documents so InfoFusion can extract verified facts, detect contradictions, and answer your query with cited evidence.`,
          language: selectedL === 'auto' ? 'en' : selectedL,
          language_used: selectedL === 'auto' ? 'en' : selectedL,
          citations: [],
          sources_used: [],
          status: 'missing_evidence',
          confidence: 0,
        };
      } else {
        resp = queryWorkspaceMultilingual(q, selectedL, {
          workspaceName: currentWorkspace.name,
          sources,
          facts,
          conflicts,
          evidenceGaps,
          findings,
        });
      }

      setChatHistory(prev => [...prev, { query: q, response: resp }]);
      setQuery('');
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-indigo-500/20 shadow-glass">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-indigo-400">
              WORKSPACE-AWARE INTELLIGENCE
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Ask Your Information
          </h1>

          {/* Section 11 requirement: Clearly show "Asking about: [Workspace Name]" */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Asking about: {currentWorkspace.name}</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
            Query information isolated to <strong>{currentWorkspace.name}</strong> ({currentWorkspace.organization}) in any language. Answers are grounded 100% in uploaded documents with exact citations. Data never crosses workspace boundaries.
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-100 border border-white/[0.08] shrink-0 self-start md:self-auto">
          <Globe2 className="w-4 h-4 text-indigo-400 pl-1" />
          <span className="text-xs text-slate-400 font-mono">Response Language:</span>
          <select
            value={targetLang}
            onChange={(e) => {
              setTargetLang(e.target.value);
              setActiveLanguage(e.target.value);
            }}
            className="bg-surface-200 border border-white/[0.08] rounded-lg text-xs font-medium text-white px-2.5 py-1 focus:outline-none"
          >
            {SUPPORTED_LANGUAGES.map(l => (
              <option key={l.code} value={l.code} className="bg-slate-900 text-slate-200">
                {l.name} ({l.nativeName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Suggested Query Pills */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          Suggested Inquiries for {currentWorkspace.name}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq.text)}
              className="px-3 py-1.5 rounded-lg text-xs bg-surface-100 hover:bg-surface-50 border border-white/[0.08] text-slate-300 hover:text-white transition-colors shrink-0 text-left"
            >
              <span>{sq.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dialogue Thread */}
      <div className="space-y-6">
        {chatHistory.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center space-y-4 border-white/[0.08]">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-white">Ask anything about {currentWorkspace.name}</h3>
              <p className="text-xs text-slate-400">
                {sources.length === 0 
                  ? "Upload documents first so InfoFusion can cross-reference physical evidence and cite specific pages."
                  : `Currently indexing ${sources.length} document(s), ${conflicts.length} contradiction(s), and ${evidenceGaps.length} evidence gap(s).`}
              </p>
            </div>
            {sources.length === 0 && (
              <div className="pt-1">
                <button
                  onClick={() => navigate('/sources')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-1.5 transition-all"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Documents</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          chatHistory.map((item, idx) => (
            <div key={idx} className="space-y-3">
              {/* User message */}
              <div className="flex justify-end">
                <div className="max-w-xl p-4 rounded-2xl rounded-tr-sm bg-indigo-600 text-white text-xs sm:text-sm font-medium shadow-sm">
                  {item.query}
                </div>
              </div>

              {/* AI Assistant Answer Card */}
              <div className="glass-panel p-6 rounded-2xl border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-mono font-bold text-indigo-300">
                      INFOFUSION AUDITED ANSWER • {currentWorkspace.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ConfidenceBadge confidence={item.response.confidence} />
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      item.response.status === 'supported'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : item.response.status === 'conflicting'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {item.response.status ? item.response.status.replace('_', ' ') : 'VERIFIED'}
                    </span>
                  </div>
                </div>

                {/* Answer body */}
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  {item.response.answer}
                </p>

                {/* Source Citations & Provenance */}
                {((item.response.sources_used && item.response.sources_used.length > 0) || (item.response.citations && item.response.citations.length > 0)) && (
                  <div className="pt-3 border-t border-white/[0.06] space-y-2">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Audited Source Provenance & Citations:</span>
                    </div>

                    {item.response.sources_used && item.response.sources_used.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.response.sources_used.map((src, sIdx) => (
                          <div 
                            key={sIdx}
                            className="p-2.5 rounded-xl bg-surface-100 border border-white/[0.06] space-y-1 text-[11px]"
                          >
                            <div className="flex items-center justify-between text-slate-300 font-medium">
                              <div className="flex items-center gap-1.5 truncate">
                                <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                <span className="truncate">{src.source_name}</span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 shrink-0">{src.location}</span>
                            </div>
                            <div className="font-mono text-indigo-200/90 text-[10px] pl-5 italic truncate">
                              "{src.quote}"
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {item.response.citations?.map((cite, cIdx) => (
                          <div 
                            key={cIdx}
                            className="flex items-center gap-2 p-2 rounded-lg bg-surface-100 border border-white/[0.04] text-[11px] text-slate-300 font-mono"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span className="truncate">{cite}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="p-4 rounded-xl glass-panel border-indigo-500/30 flex items-center gap-3 text-xs text-indigo-300 animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Analyzing {currentWorkspace.name} documents and cross-referencing citations...</span>
          </div>
        )}
      </div>

      {/* Query Input Box */}
      <div className="sticky bottom-4 pt-4">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Ask about ${currentWorkspace.name}... e.g. "What are the major risks and contradictions?"`}
            className="w-full pl-5 pr-28 py-3.5 rounded-2xl bg-[#0F172A] border border-white/[0.12] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-2xl transition-all"
          />

          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="absolute right-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center gap-1.5 transition-all shadow-glow-primary"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-500 mt-2 font-mono">
          Isolated Query • Grounded in {currentWorkspace.name} sources only • Cryptographic Provenance
        </p>
      </div>
    </div>
  );
};
