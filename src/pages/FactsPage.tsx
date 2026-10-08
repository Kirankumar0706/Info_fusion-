import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Layers,
  ChevronDown,
  UploadCloud
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Badge, ConfidenceBadge, StatusIndicator } from '../components/common/Badge';
import { NoWorkspaceState } from '../components/common/NoWorkspaceState';
import { Fact, FactStatus } from '../types';

export const FactsPage: React.FC = () => {
  const { currentWorkspace, facts, sources } = useWorkspace();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'all');
  const [selectedSource, setSelectedSource] = useState<string>('all');

  useEffect(() => {
    const s = searchParams.get('search');
    if (s) setSearch(s);
    const st = searchParams.get('status');
    if (st) setSelectedStatus(st);
  }, [searchParams]);

  if (!currentWorkspace) {
    return (
      <div className="py-4">
        <NoWorkspaceState 
          title="Select or Create a Workspace to View Facts"
          subtitle="Facts are extracted from the documents uploaded into a specific workspace."
        />
      </div>
    );
  }

  // Filtering
  const filteredFacts = facts.filter(f => {
    if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && f.status !== selectedStatus) return false;
    if (selectedSource !== 'all' && f.source_id !== selectedSource) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = f.claim.toLowerCase().includes(q) ||
        f.normalized_key.toLowerCase().includes(q) ||
        f.normalized_value.toLowerCase().includes(q) ||
        (f.source_name && f.source_name.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const categories = ['all', 'commercial', 'sla', 'technical', 'security', 'delivery', 'compliance', 'legal', 'operational', 'general'];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-indigo-500/20 shadow-glass">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-indigo-400">
              AUDITED KNOWLEDGE BASE • {currentWorkspace.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Fact Explorer
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Search across extracted and normalized claims in <strong>{currentWorkspace.name}</strong>. Every entity is tied to its originating source coordinate, confidence score, and cross-document verification status.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-surface-100 border border-white/[0.08] text-xs font-mono text-slate-300 flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>{facts.filter(f => f.status === 'supported').length} of {facts.length} Verified</span>
        </div>
      </div>

      {/* If No Facts: Empty State (Section 5) */}
      {facts.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-5 border-white/[0.08]">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">Facts will appear here after documents are analyzed.</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload documents into this workspace. InfoFusion will extract key entities, numerical figures, and factual claims.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/sources')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-2 transition-all shadow-glow-primary"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Go to Source Documents</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Filter and Instant Search Bar */}
          <div className="p-4 rounded-xl bg-surface-100 border border-white/[0.08] space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Instant Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search facts by claim, parameter key, value, or citation..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-200 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Source Dropdown */}
              {sources.length > 0 && (
                <div className="relative min-w-[180px]">
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-200 border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">All Sources ({sources.length})</option>
                    {sources.map(s => (
                      <option key={s.id} value={s.id}>{s.file_name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 text-xs">
              <span className="text-slate-400 font-mono text-[11px] pr-1">Status:</span>
              {[
                { key: 'all', label: 'All Statuses' },
                { key: 'supported', label: 'Verified Supported' },
                { key: 'conflicting', label: 'Conflicting' },
                { key: 'uncertain', label: 'Uncertain' },
                { key: 'missing_evidence', label: 'Missing Evidence' },
              ].map(st => (
                <button
                  key={st.key}
                  onClick={() => setSelectedStatus(st.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedStatus === st.key
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Facts Table */}
          <div className="glass-panel rounded-2xl border-white/[0.08] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-surface-200/50 text-slate-400 font-mono uppercase text-[10px]">
                    <th className="py-3 px-4">Normalized Fact Claim</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Value</th>
                    <th className="py-3 px-4">Source & Offset</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredFacts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                        No facts found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredFacts.slice(0, 50).map((fact) => (
                      <tr key={fact.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 max-w-sm">
                          <div className="font-semibold text-white truncate" title={fact.claim}>
                            {fact.claim}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            key: {fact.normalized_key}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-100 text-slate-300 border border-white/[0.06]">
                            {fact.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-300">
                          {fact.normalized_value}
                        </td>
                        <td className="py-3 px-4 text-slate-300 max-w-xs">
                          <div className="truncate font-medium">{fact.source_name || 'Uploaded Source'}</div>
                          <div className="text-[10px] font-mono text-slate-500">{fact.source_location}</div>
                        </td>
                        <td className="py-3 px-4">
                          <ConfidenceBadge confidence={fact.confidence} />
                        </td>
                        <td className="py-3 px-4">
                          <StatusIndicator status={fact.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredFacts.length > 50 && (
              <div className="p-3 bg-surface-200/50 border-t border-white/[0.06] text-center text-xs text-slate-400 font-mono">
                Showing first 50 of {filteredFacts.length} normalized claims
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
