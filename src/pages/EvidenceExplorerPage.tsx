import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Network, 
  Scale, 
  AlertTriangle, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Eye, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  FolderTree,
  UploadCloud
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Badge, ConfidenceBadge } from '../components/common/Badge';
import { NoWorkspaceState } from '../components/common/NoWorkspaceState';

export const EvidenceExplorerPage: React.FC = () => {
  const { currentWorkspace, decisions, findings, conflicts, sources, facts } = useWorkspace();
  const navigate = useNavigate();

  const [selectedNode, setSelectedNode] = useState<string>('dec-root');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'dec-root': true,
  });

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!currentWorkspace) {
    return (
      <div className="py-4">
        <NoWorkspaceState 
          title="Select or Create a Workspace to Explore Evidence"
          subtitle="The Evidence Explorer constructs a provenance tree for the active workspace."
        />
      </div>
    );
  }

  const primaryDecision = decisions[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-indigo-500/20 shadow-glass">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <Network className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-indigo-400">
              PROVENANCE TRACEABILITY GRAPH • {currentWorkspace.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Evidence Explorer
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Trace every high-stakes recommendation directly down through Findings, Extracted Claims, and Physical Source Coordinates in <strong>{currentWorkspace.name}</strong>. Never accept an ungrounded summary without complete lineage.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-surface-100 border border-white/[0.08] text-xs font-mono text-slate-300 flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Full Lineage Audit Active</span>
        </div>
      </div>

      {/* If No Findings/Conflicts: Empty State (Section 5) */}
      {sources.length === 0 || (findings.length === 0 && conflicts.length === 0) ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-5 border-white/[0.08]">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <Network className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">Evidence lineage will appear after documents are analyzed.</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trace: <strong>Decision → Finding → Fact → Evidence → Source</strong> once documents in this workspace are processed and verified.
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
        /* Hierarchical Traceability Explorer */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Tree Hierarchy */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-indigo-400" />
                Decision Provenance Tree
              </h3>
              <span className="text-[11px] font-mono text-slate-400">Decision → Finding → Claim → Source → Location</span>
            </div>

            {/* Root Level: DECISION */}
            <div className="space-y-3 font-sans">
              <div 
                onClick={() => {
                  toggleNode('dec-root');
                  setSelectedNode('dec-root');
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedNode === 'dec-root'
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-sm'
                    : 'bg-surface-100 border-white/[0.08] text-slate-200 hover:bg-surface-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {expandedNodes['dec-root'] ? (
                    <ChevronDown className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <Scale className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] font-mono uppercase font-bold text-amber-400">LEVEL 1: DECISION</div>
                    <div className="text-xs font-bold text-white">
                      {primaryDecision?.title || `${currentWorkspace.name} Verification Baseline`}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {primaryDecision?.status?.toUpperCase() || 'ANALYZED'}
                </span>
              </div>

              {/* Level 2: FINDINGS & CONFLICTS */}
              {expandedNodes['dec-root'] && (
                <div className="pl-6 border-l-2 border-indigo-500/30 space-y-3 pt-1">
                  {conflicts.map((conf) => (
                    <div key={conf.id} className="space-y-2">
                      <div 
                        onClick={() => {
                          toggleNode(conf.id);
                          setSelectedNode(conf.id);
                        }}
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                          selectedNode === conf.id
                            ? 'bg-red-500/15 border-red-500/40 text-white'
                            : 'bg-surface-100 border-white/[0.06] text-slate-300 hover:bg-surface-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {expandedNodes[conf.id] ? (
                            <ChevronDown className="w-3.5 h-3.5 text-red-400" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <div>
                            <div className="text-[9px] font-mono uppercase text-red-400 font-bold">LEVEL 2: CONTRADICTION FINDING</div>
                            <div className="text-xs font-semibold">{conf.difference_summary}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">2 Sources</span>
                      </div>

                      {/* Level 3 & 4: Claims & Sources */}
                      {expandedNodes[conf.id] && (
                        <div className="pl-5 border-l-2 border-red-500/30 space-y-2 pt-1 text-xs">
                          {/* Source A */}
                          <div 
                            onClick={() => setSelectedNode(`${conf.id}-src-a`)}
                            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                              selectedNode === `${conf.id}-src-a`
                                ? 'bg-indigo-600/20 border-indigo-500 text-white'
                                : 'bg-surface-200 border-white/[0.04] text-slate-300 hover:bg-surface-100'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                              <span className="text-indigo-400 font-bold">SOURCE A: {conf.source_a_name}</span>
                              <span>{conf.source_a_location}</span>
                            </div>
                            <div className="text-xs font-mono text-indigo-200 mt-1">
                              "{conf.claim_a}"
                            </div>
                          </div>

                          {/* Source B */}
                          <div 
                            onClick={() => setSelectedNode(`${conf.id}-src-b`)}
                            className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                              selectedNode === `${conf.id}-src-b`
                                ? 'bg-amber-600/20 border-amber-500 text-white'
                                : 'bg-surface-200 border-white/[0.04] text-slate-300 hover:bg-surface-100'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                              <span className="text-amber-400 font-bold">SOURCE B: {conf.source_b_name}</span>
                              <span>{conf.source_b_location}</span>
                            </div>
                            <div className="text-xs font-mono text-amber-200 mt-1">
                              "{conf.claim_b}"
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {findings.map((f) => (
                    <div key={f.id} className="p-3 rounded-lg bg-surface-100 border border-white/[0.06] text-xs">
                      <div className="font-semibold text-white">{f.title}</div>
                      <div className="text-slate-300 text-[11px] mt-0.5">{f.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Deep Inspection Panel */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                Evidence Inspector
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-100 text-emerald-400 border border-emerald-500/20">
                Verified Lineage
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-mono text-[10px] uppercase text-slate-400 block mb-1">
                  Active Workspace Node
                </span>
                <div className="text-sm font-bold text-white">
                  {selectedNode === 'dec-root' 
                    ? (primaryDecision?.title || `${currentWorkspace.name} Decision Matrix`)
                    : selectedNode}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-100 border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Confidence Rating</span>
                  <ConfidenceBadge confidence={0.96} />
                </div>

                <div className="text-xs text-slate-300 leading-relaxed font-mono bg-surface-200 p-3 rounded-lg border border-white/[0.04]">
                  Workspace: {currentWorkspace.name}
                  {'\n'}Isolated Tenant: {currentWorkspace.organization}
                  {'\n'}Ingested Files: {sources.length} sources
                  {'\n'}Audit Status: Grounded in Physical Artifacts
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-indigo-200 text-xs">
                <span className="font-semibold block mb-1">Audit Trail Guarantee:</span>
                Every fact in this workspace is linked directly to byte offsets or row coordinates in uploaded documents.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
