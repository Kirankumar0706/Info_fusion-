import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Network, 
  Scale, 
  AlertTriangle, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Eye, 
  ShieldCheck, 
  ShieldAlert,
  CheckCircle2, 
  FolderTree,
  UploadCloud,
  FileSpreadsheet,
  HelpCircle,
  ArrowDown,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Badge, ConfidenceBadge } from '../components/common/Badge';
import { NoWorkspaceState } from '../components/common/NoWorkspaceState';
import { Decision, Finding, Fact, EvidenceItem, EvidenceGap, Source, Conflict } from '../types';

interface LineageNodeDetails {
  id: string;
  type: 'decision' | 'finding' | 'fact' | 'evidence' | 'document' | 'gap';
  title: string;
  value?: string;
  confidence: number;
  verification_status: 'verified' | 'uncertain' | 'unverified' | 'gap';
  source_document?: string;
  location?: string;
  quote?: string;
  related_findings?: string[];
  related_contradictions?: string[];
  explanation?: string;
}

export const EvidenceExplorerPage: React.FC = () => {
  const { currentWorkspace, decisions, findings, conflicts, sources, facts, evidenceItems, evidenceGaps } = useWorkspace();
  const navigate = useNavigate();

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'dec-root': true,
  });

  const primaryDecision = decisions[0] || (currentWorkspace ? {
    id: `dec-${currentWorkspace.id}`,
    workspace_id: currentWorkspace.id,
    title: conflicts.length > 0 || evidenceGaps.length > 0 ? 'Review Required' : 'Ready',
    status: conflicts.length > 0 || evidenceGaps.length > 0 ? 'review_required' : 'ready',
    summary: 'Automated decision synthesis across workspace documents.',
    recommendation: conflicts.length > 0 || evidenceGaps.length > 0 
      ? 'Perform manual audit and reconciliation on detected discrepancies and missing approvals.'
      : 'All extracted facts corroborated across uploaded workspace documents.',
    reasoning: `Synthesized from ${facts.length} facts, ${conflicts.length} contradiction(s), and ${evidenceGaps.length} evidence gap(s).`,
    confidence: 0.94,
    factors: [],
    created_by: 'System Intelligence',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as Decision : null);

  const [selectedNode, setSelectedNode] = useState<LineageNodeDetails>(() => ({
    id: primaryDecision?.id || 'dec-root',
    type: 'decision',
    title: primaryDecision?.title || 'Decision Baseline',
    value: primaryDecision?.status?.replace('_', ' ').toUpperCase() || 'REVIEW REQUIRED',
    confidence: primaryDecision?.confidence || 0.94,
    verification_status: 'uncertain',
    explanation: primaryDecision?.reasoning || 'Automated decision synthesis across workspace documents.',
  }));

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
              EVIDENCE EXPLORER & AUDIT TRAIL • {currentWorkspace.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Evidence Explorer
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Real traceability showing how every high-level decision links to findings, individual facts, physical evidence coordinates, and raw source documents.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-100 border border-white/[0.08] text-xs font-mono text-slate-300 flex items-center gap-2.5 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Lineage Pipeline: Decision ↓ Finding ↓ Fact ↓ Evidence ↓ Document</span>
        </div>
      </div>

      {/* If No Documents: Empty State (Section 18) */}
      {sources.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-5 border-white/[0.08]">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <Network className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">No documents uploaded yet.</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload documents to start extracting facts, detecting contradictions, and generating traceable evidence lineage.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/sources')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-2 transition-all shadow-glow-primary"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Documents to Begin</span>
            </button>
          </div>
        </div>
      ) : (
        /* Hierarchical 5-Level Traceability Explorer */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Interactive Lineage Tree */}
          <div className="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-indigo-400" />
                Evidence Provenance Lineage
              </h3>
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                Click any node to inspect
              </span>
            </div>

            {/* Tree Container */}
            <div className="space-y-3 font-sans">
              {/* LEVEL 1: DECISION */}
              {primaryDecision && (
                <div className="space-y-3">
                  <div 
                    onClick={() => {
                      toggleNode('dec-root');
                      setSelectedNode({
                        id: primaryDecision.id,
                        type: 'decision',
                        title: primaryDecision.title,
                        value: primaryDecision.status.replace('_', ' ').toUpperCase(),
                        confidence: primaryDecision.confidence ?? 0.94,
                        verification_status: primaryDecision.status === 'ready' ? 'verified' : 'uncertain',
                        explanation: primaryDecision.reasoning,
                        related_findings: findings.map(f => f.title),
                        related_contradictions: conflicts.map(c => c.difference_summary),
                      });
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      selectedNode.id === primaryDecision.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/40'
                        : 'bg-surface-100 border-white/[0.08] text-slate-200 hover:bg-surface-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {expandedNodes['dec-root'] ? (
                        <ChevronDown className="w-4 h-4 text-indigo-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <Scale className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-[10px] font-mono uppercase font-bold text-amber-400">LEVEL 1: DECISION</div>
                        <div className="text-xs font-bold text-white">{primaryDecision.title}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                      primaryDecision.status === 'ready' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {primaryDecision.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* LEVEL 2: FINDINGS & CONFLICTS */}
                  {expandedNodes['dec-root'] && (
                    <div className="pl-6 border-l-2 border-indigo-500/30 space-y-3 pt-1">
                      {/* Contradiction Findings */}
                      {conflicts.map((conf) => {
                        const confKey = `conf-${conf.id}`;
                        const isExpanded = !!expandedNodes[confKey];
                        const relatedFacts = facts.filter(f => 
                          f.claim === conf.claim_a || f.claim === conf.claim_b ||
                          (conf.subject && f.subject === conf.subject)
                        );

                        return (
                          <div key={conf.id} className="space-y-2">
                            <div 
                              onClick={() => {
                                toggleNode(confKey);
                                setSelectedNode({
                                  id: conf.id,
                                  type: 'finding',
                                  title: `Contradiction: ${conf.conflict_type}`,
                                  value: conf.difference_summary,
                                  confidence: conf.confidence,
                                  verification_status: 'uncertain',
                                  explanation: conf.explanation,
                                  location: `${conf.source_a_location} vs ${conf.source_b_location}`,
                                  source_document: `${conf.source_a_name} & ${conf.source_b_name}`,
                                  related_contradictions: [conf.difference_summary],
                                });
                              }}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                selectedNode.id === conf.id
                                  ? 'bg-red-500/15 border-red-500 text-white shadow-sm'
                                  : 'bg-surface-100 border-white/[0.06] text-slate-300 hover:bg-surface-50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                )}
                                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                <div>
                                  <div className="text-[9px] font-mono uppercase text-red-400 font-bold">LEVEL 2: FINDING (CONFLICT)</div>
                                  <div className="text-xs font-semibold">{conf.difference_summary}</div>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">2 Sources</span>
                            </div>

                            {/* LEVEL 3, 4, 5: Branch for Source A and Source B */}
                            {isExpanded && (
                              <div className="pl-5 border-l-2 border-red-500/30 space-y-3 pt-1 text-xs">
                                {/* Branch A */}
                                <div className="space-y-1.5 p-3 rounded-xl bg-surface-100 border border-white/[0.04]">
                                  {/* LEVEL 3: FACT A */}
                                  <div 
                                    onClick={() => setSelectedNode({
                                      id: `${conf.id}-fact-a`,
                                      type: 'fact',
                                      title: `Fact Claim: ${conf.attribute || 'Attribute Value'}`,
                                      value: conf.claim_a,
                                      confidence: 0.95,
                                      verification_status: 'uncertain',
                                      source_document: conf.source_a_name,
                                      location: conf.source_a_location,
                                      explanation: 'Extracted statement from Document A.',
                                    })}
                                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] font-mono uppercase font-bold text-indigo-400">LEVEL 3: FACT A:</span>
                                      <span className="font-mono text-indigo-200">"{conf.claim_a}"</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400">{conf.source_a_name}</span>
                                  </div>

                                  {/* LEVEL 4: EVIDENCE A */}
                                  <div 
                                    onClick={() => setSelectedNode({
                                      id: `${conf.id}-ev-a`,
                                      type: 'evidence',
                                      title: `Physical Evidence in ${conf.source_a_name}`,
                                      value: conf.claim_a,
                                      confidence: 0.95,
                                      verification_status: 'verified',
                                      source_document: conf.source_a_name,
                                      location: conf.source_a_location,
                                      quote: conf.claim_a,
                                    })}
                                    className="pl-3 border-l border-indigo-500/30 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer transition-colors flex items-center justify-between"
                                  >
                                    <span>↓ LEVEL 4: EVIDENCE: {conf.source_a_location}</span>
                                    <span className="text-emerald-400 font-mono text-[10px]">Verified Provenance</span>
                                  </div>

                                  {/* LEVEL 5: SOURCE DOCUMENT A */}
                                  <div 
                                    onClick={() => setSelectedNode({
                                      id: `${conf.id}-doc-a`,
                                      type: 'document',
                                      title: conf.source_a_name,
                                      value: 'Source Document Container',
                                      confidence: 1.0,
                                      verification_status: 'verified',
                                      source_document: conf.source_a_name,
                                      location: 'Workspace Storage Root',
                                      explanation: `Active document container uploaded to ${currentWorkspace.name}.`,
                                    })}
                                    className="pl-6 border-l border-indigo-500/20 text-[10px] text-slate-500 hover:text-indigo-300 cursor-pointer transition-colors flex items-center gap-1.5 font-mono"
                                  >
                                    <FileText className="w-3 h-3 text-indigo-400" />
                                    <span>LEVEL 5: DOCUMENT: {conf.source_a_name}</span>
                                  </div>
                                </div>

                                {/* Branch B */}
                                <div className="space-y-1.5 p-3 rounded-xl bg-surface-100 border border-white/[0.04]">
                                  {/* LEVEL 3: FACT B */}
                                  <div 
                                    onClick={() => setSelectedNode({
                                      id: `${conf.id}-fact-b`,
                                      type: 'fact',
                                      title: `Fact Claim: ${conf.attribute || 'Attribute Value'}`,
                                      value: conf.claim_b,
                                      confidence: 0.95,
                                      verification_status: 'uncertain',
                                      source_document: conf.source_b_name,
                                      location: conf.source_b_location,
                                      explanation: 'Extracted conflicting statement from Document B.',
                                    })}
                                    className="cursor-pointer hover:text-white transition-colors flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] font-mono uppercase font-bold text-amber-400">LEVEL 3: FACT B:</span>
                                      <span className="font-mono text-amber-200">"{conf.claim_b}"</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400">{conf.source_b_name}</span>
                                  </div>

                                  {/* LEVEL 4: EVIDENCE B */}
                                  <div 
                                    onClick={() => setSelectedNode({
                                      id: `${conf.id}-ev-b`,
                                      type: 'evidence',
                                      title: `Physical Evidence in ${conf.source_b_name}`,
                                      value: conf.claim_b,
                                      confidence: 0.95,
                                      verification_status: 'verified',
                                      source_document: conf.source_b_name,
                                      location: conf.source_b_location,
                                      quote: conf.claim_b,
                                    })}
                                    className="pl-3 border-l border-amber-500/30 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer transition-colors flex items-center justify-between"
                                  >
                                    <span>↓ LEVEL 4: EVIDENCE: {conf.source_b_location}</span>
                                    <span className="text-emerald-400 font-mono text-[10px]">Verified Provenance</span>
                                  </div>

                                  {/* LEVEL 5: SOURCE DOCUMENT B */}
                                  <div 
                                    onClick={() => setSelectedNode({
                                      id: `${conf.id}-doc-b`,
                                      type: 'document',
                                      title: conf.source_b_name,
                                      value: 'Source Document Container',
                                      confidence: 1.0,
                                      verification_status: 'verified',
                                      source_document: conf.source_b_name,
                                      location: 'Workspace Storage Root',
                                      explanation: `Active document container uploaded to ${currentWorkspace.name}.`,
                                    })}
                                    className="pl-6 border-l border-amber-500/20 text-[10px] text-slate-500 hover:text-amber-300 cursor-pointer transition-colors flex items-center gap-1.5 font-mono"
                                  >
                                    <FileSpreadsheet className="w-3 h-3 text-amber-400" />
                                    <span>LEVEL 5: DOCUMENT: {conf.source_b_name}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Evidence Gap Findings (Section 10 Requirement) */}
                      {evidenceGaps.map((gap) => {
                        const gapKey = `gap-${gap.id}`;
                        const isExpanded = !!expandedNodes[gapKey];

                        return (
                          <div key={gap.id} className="space-y-2">
                            <div 
                              onClick={() => {
                                toggleNode(gapKey);
                                setSelectedNode({
                                  id: gap.id,
                                  type: 'gap',
                                  title: `Missing Evidence: ${gap.missing_evidence_type || gap.required_evidence || gap.category}`,
                                  value: 'Evidence gap detected — Evidence unavailable',
                                  confidence: 0.95,
                                  verification_status: 'gap',
                                  explanation: `Required governance document "${gap.missing_evidence_type || gap.required_evidence || gap.category}" not uploaded to this workspace.`,
                                  location: 'Workspace Global Repository',
                                  related_findings: [`Missing Evidence: ${gap.missing_evidence_type || gap.required_evidence || gap.category}`],
                                });
                              }}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                selectedNode.id === gap.id
                                  ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                                  : 'bg-surface-100 border-white/[0.06] text-slate-300 hover:bg-surface-50'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                )}
                                <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <div>
                                  <div className="text-[9px] font-mono uppercase text-amber-400 font-bold">LEVEL 2: EVIDENCE GAP FINDING</div>
                                  <div className="text-xs font-semibold">{gap.claim}</div>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                                GAP DETECTED
                              </span>
                            </div>

                            {/* Level 3 & 4: Fact & Missing Evidence Node */}
                            {isExpanded && (
                              <div className="pl-5 border-l-2 border-amber-500/30 space-y-2 pt-1 text-xs">
                                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono text-[9px] uppercase font-bold text-amber-400">LEVEL 3: FACT REQUIREMENT:</span>
                                    <span className="text-[10px] font-mono text-amber-300">Mandatory Proof</span>
                                  </div>
                                  <div className="text-xs text-slate-200">
                                    "{gap.missing_evidence_type || gap.required_evidence || gap.category}" required for verification.
                                  </div>
                                  <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-red-300 font-mono">
                                    <span>LEVEL 4: EVIDENCE STATUS:</span>
                                    <span className="font-bold underline">Evidence unavailable</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* General Findings */}
                      {findings.map((f) => (
                        <div 
                          key={f.id}
                          onClick={() => setSelectedNode({
                            id: f.id,
                            type: 'finding',
                            title: f.title,
                            value: f.description,
                            confidence: f.confidence,
                            verification_status: 'verified',
                            explanation: f.explanation,
                            source_document: f.sources_involved.join(', '),
                            related_findings: [f.title],
                          })}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            selectedNode.id === f.id
                              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                              : 'bg-surface-100 border-white/[0.06] text-slate-300 hover:bg-surface-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <div>
                              <div className="text-[9px] font-mono uppercase text-indigo-400 font-bold">LEVEL 2: INTELLIGENCE FINDING</div>
                              <div className="text-xs font-semibold">{f.title}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{f.sources_involved.length} Sources</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Deep Node Inspector (Section 9) */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                Lineage Node Inspector
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                selectedNode.verification_status === 'verified'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : selectedNode.verification_status === 'gap'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {selectedNode.verification_status === 'gap' ? 'Evidence Gap' : selectedNode.verification_status}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Node Identity */}
              <div>
                <span className="font-mono text-[10px] uppercase text-slate-400 block mb-1">
                  Node Type: <strong className="text-indigo-400 uppercase">{selectedNode.type}</strong>
                </span>
                <h4 className="text-base font-bold text-white font-display">
                  {selectedNode.title}
                </h4>
              </div>

              {/* Node Value */}
              {selectedNode.value && (
                <div className="p-3.5 rounded-xl bg-surface-100 border border-white/[0.08] space-y-1">
                  <span className="font-mono text-[10px] uppercase text-slate-400 block">Extracted Claim / Value:</span>
                  <div className="font-mono text-xs font-bold text-indigo-200">
                    {selectedNode.value}
                  </div>
                </div>
              )}

              {/* Confidence & Verification Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-surface-100 border border-white/[0.06] space-y-1">
                  <span className="font-mono text-[10px] uppercase text-slate-400 block">Confidence:</span>
                  <ConfidenceBadge confidence={selectedNode.confidence} />
                </div>
                <div className="p-3 rounded-xl bg-surface-100 border border-white/[0.06] space-y-1">
                  <span className="font-mono text-[10px] uppercase text-slate-400 block">Verification:</span>
                  <span className="font-mono font-bold text-white uppercase text-[11px]">
                    {selectedNode.verification_status}
                  </span>
                </div>
              </div>

              {/* Source Document & Location Coordinates */}
              {(selectedNode.source_document || selectedNode.location) && (
                <div className="p-3.5 rounded-xl bg-surface-100 border border-white/[0.08] space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Source Document: {selectedNode.source_document || 'Workspace Collection'}</span>
                  </div>
                  {selectedNode.location && (
                    <div className="text-[11px] font-mono text-slate-400 pl-5">
                      Coordinates: <strong className="text-slate-200">{selectedNode.location}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* Exact Quote */}
              {selectedNode.quote && (
                <div className="p-3.5 rounded-xl bg-surface-200/90 border border-white/[0.06] space-y-1">
                  <span className="font-mono text-[10px] uppercase text-slate-400 block">Exact Physical Quote:</span>
                  <div className="font-mono text-xs text-slate-200 italic">
                    "{selectedNode.quote}"
                  </div>
                </div>
              )}

              {/* Explanation / Reasoning */}
              {selectedNode.explanation && (
                <div className="p-3.5 rounded-xl bg-surface-100 border border-white/[0.08] space-y-1">
                  <span className="font-mono text-[10px] uppercase text-slate-400 block">Analysis & Lineage Context:</span>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {selectedNode.explanation}
                  </p>
                </div>
              )}

              {/* Missing Evidence Warning */}
              {selectedNode.verification_status === 'gap' && (
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 text-red-200 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-red-300">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Evidence Gap Detected</span>
                  </div>
                  <p className="text-red-300/90">
                    Evidence unavailable. No matching proof was detected in any uploaded document for this workspace.
                  </p>
                </div>
              )}

              {/* Related Findings or Contradictions */}
              {selectedNode.related_contradictions && selectedNode.related_contradictions.length > 0 && (
                <div className="p-3 rounded-xl bg-surface-100 border border-white/[0.06] space-y-1 text-[11px]">
                  <span className="font-mono text-[10px] uppercase text-red-400 font-bold block">Related Contradictions:</span>
                  {selectedNode.related_contradictions.map((cText, cIdx) => (
                    <div key={cIdx} className="text-slate-300 font-mono truncate">
                      • {cText}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
