import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Radar, 
  Files, 
  SearchAlert, 
  Scale, 
  CheckSquare, 
  Globe2, 
  Mail, 
  FileText,
  Play
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const DemoPage: React.FC = () => {
  const navigate = useNavigate();
  const { loadDemoWorkspace } = useWorkspace();
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    loadDemoWorkspace();
  }, []);

  const demoSteps = [
    {
      step: 1,
      title: 'Enterprise Evaluation Scenario',
      desc: 'Context: Multi-document enterprise review and cross-source consistency audit.',
      route: '/dashboard',
      actionLabel: 'View Dashboard',
    },
    {
      step: 2,
      title: '5 Heterogeneous Sources Ingested',
      desc: 'Proposal.pdf, Quotation.xlsx, Email.pdf, TechSpec.pdf, PerformanceReport.pdf.',
      route: '/sources',
      actionLabel: 'Inspect Sources',
    },
    {
      step: 3,
      title: 'Information Health & 3 Conflicts',
      desc: 'Real-time dashboard reflects 147 extracted facts, 18 verified, 3 conflicts detected.',
      route: '/dashboard',
      actionLabel: 'View Health Metrics',
    },
    {
      step: 4,
      title: 'Contradiction Radar (₹5.2L vs ₹4.8L)',
      desc: 'Inspect mathematical pricing discrepancy and SLA coverage contradiction.',
      route: '/conflicts',
      actionLabel: 'Open Radar',
    },
    {
      step: 5,
      title: 'Deep Source Investigation',
      desc: 'Side-by-side evidence inspection showing exact Page 4 and Row 18 offsets.',
      route: '/conflicts',
      actionLabel: 'Examine Provenance',
    },
    {
      step: 6,
      title: 'Evidence Gaps: Missing ISO 27001',
      desc: 'Anti-hallucination guardrail flags claimed certification as "Evidence Not Found".',
      route: '/evidence-gaps',
      actionLabel: 'Check Gaps',
    },
    {
      step: 7,
      title: 'Decision Center: REVIEW REQUIRED',
      desc: 'Defensible 5-factor evaluation matrix blocks approval until risks resolved.',
      route: '/decisions',
      actionLabel: 'Open Decision Center',
    },
    {
      step: 8,
      title: 'Strategic Action Plan',
      desc: 'Remediation tasks assigned to procurement, compliance, and IT PMO leads.',
      route: '/actions',
      actionLabel: 'Review Actions',
    },
    {
      step: 9,
      title: 'Multilingual Query in Tamil / Hindi',
      desc: 'Query repository in regional languages without losing technical figures or citations.',
      route: '/ask',
      actionLabel: 'Try Multilingual AI',
    },
    {
      step: 10,
      title: 'Evidence Explorer Graph',
      desc: 'Full hierarchical lineage tree: Decision → Finding → Claim → Source → Location.',
      route: '/evidence-explorer',
      actionLabel: 'View Graph',
    },
    {
      step: 11,
      title: 'AI Clarification & Communication Generator',
      desc: 'One-click outbound clarification memo grounded 100% on evidence-backed findings.',
      route: '/decisions',
      actionLabel: 'Generate Memo',
    },
    {
      step: 12,
      title: 'Export Publication-Grade PDF Dossier',
      desc: 'Compile and download official Decision Brief with verified citations.',
      route: '/reports',
      actionLabel: 'Download PDF Report',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-6 lg:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Banner */}
        <div className="glass-panel p-8 rounded-3xl border-amber-500/30 shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                OFFICIAL EVALUATION RUNBOOK
              </span>
              <span className="text-xs text-slate-400 font-mono">3-Minute Judge Scenario</span>
            </div>
            <h1 className="text-3xl font-display font-extrabold text-white">
              InfoFusion Interactive Demo Mode
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Demonstrating the full <strong>FIND → UNDERSTAND → ORGANIZE → VERIFY → DECIDE → ACT</strong> workflow. All metrics and documents are pre-seeded for instantaneous review without file upload delays.
            </p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-primary flex items-center gap-2 transition-all shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Dashboard</span>
          </button>
        </div>

        {/* 12-Step Walkthrough Flow */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>JUDGE DEMO FLOW (SECTIONS 36 & 37)</span>
            <span>12 Complete Stages</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {demoSteps.map((s) => (
              <div
                key={s.step}
                onClick={() => navigate(s.route)}
                className="glass-panel p-5 rounded-2xl border-white/[0.08] hover:border-indigo-500/40 transition-all cursor-pointer flex items-start justify-between gap-4 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-surface-100 border border-white/[0.08] text-xs font-mono font-bold text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {s.step < 10 ? `0${s.step}` : s.step}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(s.route);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-100 hover:bg-surface-50 text-indigo-300 border border-white/[0.06] shrink-0 transition-colors flex items-center gap-1"
                >
                  <span>{s.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Return Button */}
        <div className="pt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Return to Public Homepage
          </button>
        </div>
      </div>
    </div>
  );
};
