import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Radar, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Scale, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Network, 
  Layers, 
  SearchAlert,
  BrainCircuit,
  Lock,
  Globe2,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { loadDemoWorkspace } = useWorkspace();

  const handleExploreDemo = () => {
    loadDemoWorkspace();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Navigation Header */}
      <header className="h-20 border-b border-white/[0.08] sticky top-0 z-50 bg-[#0B0F19]/85 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-400 flex items-center justify-center shadow-glow-primary">
            <Radar className="w-5 h-5 text-white animate-pulse-subtle" />
          </div>
          <div>
            <div className="font-display font-extrabold text-xl text-white tracking-tight flex items-center gap-1.5">
              INFOFUSION
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">From scattered information to trusted decisions.</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <a href="#differentiator" className="hover:text-white transition-colors">Why InfoFusion</a>
          <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
          <a href="#radar" className="hover:text-white transition-colors">Contradiction Radar</a>
          <a href="#evidence" className="hover:text-white transition-colors">Evidence Traceability</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={handleExploreDemo}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-primary flex items-center gap-1.5 transition-all"
          >
            <span>Explore Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 1. HERO SECTION (Section 4 specifications) */}
      <section className="relative pt-20 pb-24 px-6 lg:px-12 max-w-7xl mx-auto w-full text-center space-y-8 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-100 border border-indigo-500/30 text-xs font-mono text-indigo-300 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>NOT A GENERIC CHATBOT • AUDITABLE DECISION INTELLIGENCE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.1]">
          Turn scattered information into <span className="text-gradient-primary">trusted decisions.</span>
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          InfoFusion connects information across documents, detects contradictions and missing evidence, traces findings back to their sources, and turns complex information into clear actions.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('/signup')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-primary flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Start Building Intelligence</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleExploreDemo}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold bg-surface-100 hover:bg-surface-50 text-slate-200 border border-white/[0.1] flex items-center justify-center gap-2 transition-all"
          >
            <Radar className="w-4 h-4 text-amber-400" />
            <span>Explore 3-Minute Demo Scenario</span>
          </button>
        </div>

        {/* Live Hero Comparison Card: Normal AI vs InfoFusion (Section 2) */}
        <div className="pt-12 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {/* Generic AI Card */}
            <div className="p-6 rounded-2xl bg-surface-200/50 border border-white/[0.06] space-y-4 opacity-75">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>TRADITIONAL AI (ChatGPT / Claude)</span>
                <span className="text-red-400 font-bold">Unverifiable</span>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-300 text-xs font-mono text-slate-300">
                User: "What does this proposal say?"
              </div>
              <div className="p-3.5 rounded-xl bg-surface-300 text-xs font-mono text-slate-400 space-y-2">
                <div>AI: "Here is a 3-paragraph summary of the document contents..."</div>
                <div className="text-[11px] text-red-400 pt-1">
                  ⚠️ Blind to price conflicts with other spreadsheets. Does not verify whether compliance certificates actually exist. Leaves the human to do all the checking.
                </div>
              </div>
            </div>

            {/* InfoFusion Card */}
            <div className="p-6 rounded-2xl bg-surface-100 border border-indigo-500/40 shadow-glow-primary space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-indigo-400 font-bold">INFOFUSION SYSTEM</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Audit Verified
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-200 text-xs font-mono text-slate-200">
                User Ingests: Proposal.pdf + Quotation.xlsx + Email.pdf + TechSpec.pdf
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs font-mono space-y-1.5">
                <div className="text-emerald-400 font-bold">✓ 147 normalized facts extracted (18 verified)</div>
                <div className="text-red-400 font-bold">🔴 3 contradictions detected (₹5.2L vs ₹4.8L)</div>
                <div className="text-amber-400 font-bold">🟠 2 missing evidence items (ISO 27001)</div>
                <div className="text-slate-200 font-bold pt-1">DECISION STATUS: ⚠️ REVIEW REQUIRED</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. JUDGE DIFFERENTIATOR MESSAGE (Section 38 specifications) */}
      <section id="differentiator" className="py-20 px-6 lg:px-12 bg-surface-100/50 border-y border-white/[0.06]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">
            THE CRITICAL DISTINCTION
          </div>

          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            AI can answer your question. <br />
            <span className="text-slate-400">But can it tell you:</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-6">
            {[
              'Which source is trustworthy?',
              'Where two sources disagree?',
              'What evidence is missing?',
              'Which issue matters most?',
              'What you should do next?',
              'Why the recommendation was made?',
              'Which exact source page supports the finding?',
              'Whether compliance certifications actually exist?',
            ].map((question, i) => (
              <div key={i} className="p-4 rounded-xl bg-surface-200 border border-white/[0.06] flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-xs shrink-0 font-bold">
                  ?
                </div>
                <span className="text-xs sm:text-sm font-semibold text-white">{question}</span>
              </div>
            ))}
          </div>

          <div className="pt-6">
            <p className="text-base text-indigo-300 font-semibold font-display">
              InfoFusion is purpose-built around that complete workflow, rather than starting with a blank chat.
            </p>
          </div>
        </div>
      </section>

      {/* 3. COMPLETE 6-STAGE WORKFLOW (Section 1) */}
      <section id="workflow" className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">
            END-TO-END INTELLIGENCE LIFECYCLE
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
            From Ingestion to Defensible Action
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            A continuous, multi-stage pipeline converting unorganized documents into verifiable governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          {[
            { step: '01', title: 'FIND', desc: 'Ingest multi-format PDFs, Excel sheets, and email records.' },
            { step: '02', title: 'UNDERSTAND', desc: 'Chunk and structure claims into normalized JSON parameters.' },
            { step: '03', title: 'ORGANIZE', desc: 'Cluster facts by categories (commercial, SLA, security, legal).' },
            { step: '04', title: 'VERIFY', desc: 'Contradiction Radar cross-checks claims to flag discrepancies.' },
            { step: '05', title: 'DECIDE', desc: 'Synthesize verified factors into an auditable Decision Brief.' },
            { step: '06', title: 'ACT', desc: 'Generate outbound clarification emails and remediation plans.' },
          ].map((stage, sIdx) => (
            <div key={sIdx} className="glass-panel p-5 rounded-2xl border-white/[0.08] space-y-2 relative group hover:border-indigo-500/40 transition-all">
              <div className="text-xs font-mono font-bold text-indigo-400">{stage.step}</div>
              <h3 className="font-display font-bold text-sm text-white">{stage.title}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">{stage.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CONTRADICTION RADAR SHOWCASE (Section 10) */}
      <section id="radar" className="py-20 px-6 lg:px-12 bg-surface-100/40 border-y border-white/[0.06]">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="text-xs font-mono uppercase tracking-widest text-red-400 font-bold">
              CONTRADICTION RADAR
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Deterministic Conflict Detection
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              When a sales proposal quotes ₹5.2 Lakhs and an operations quotation quotes ₹4.8 Lakhs, InfoFusion flags the exact mathematical variance and warns the evaluation team.
            </p>
          </div>

          <div className="glass-panel p-6 sm:p-8 rounded-2xl border-red-500/30 shadow-glow-conflict space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                  CRITICAL COMMERCIAL CONFLICT
                </span>
                <span className="text-xs font-mono text-emerald-400">96.5% Confidence</span>
              </div>
              <span className="text-xs font-mono font-bold text-red-400 uppercase">
                STATUS: UNRESOLVED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface-200 border border-indigo-500/30 space-y-2">
                <div className="text-[10px] font-mono font-bold text-indigo-400">SOURCE A: Proposal_Acme_Cloud_ERP.pdf (Page 4)</div>
                <div className="text-xs font-mono text-slate-200">
                  "Annual enterprise subscription fee is fixed at ₹5,20,000 (INR 5.2 L)"
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-200 border border-amber-500/30 space-y-2">
                <div className="text-[10px] font-mono font-bold text-amber-400">SOURCE B: Commercial_Quotation_Acme.xlsx (Row 18)</div>
                <div className="text-xs font-mono text-slate-200">
                  "Total Commercial Price: ₹4,80,000 net (INR 4.8 L)"
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Normalized variance of <strong>₹40,000</strong> identified between commercial instruments.</span>
              </div>
              <button
                onClick={handleExploreDemo}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 shrink-0 transition-colors"
              >
                Investigate in Demo →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MULTILINGUAL & SECURITY (Section 21 & 23) */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-2xl border-white/[0.08] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Globe2 className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold font-display text-white">Full Multilingual Intelligence</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Upload English documents and query in <strong>Tamil (தமிழ்), Hindi (हिन्दी), Telugu (తెలుగు), Malayalam, or Bengali</strong>. InfoFusion preserves technical values, dates, and currencies without corrupting source citations.
          </p>
          <div className="p-3.5 rounded-xl bg-surface-200 text-xs font-mono text-indigo-200 border border-indigo-500/20">
            "இந்த ஆவணங்களில் என்னென்ன முரண்பாடுகள் மற்றும் பிரச்சனைகள் இருக்கு?" → Responds with audited citations in Tamil.
          </div>
        </div>

        <div className="glass-panel p-8 rounded-2xl border-white/[0.08] space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold font-display text-white">Supabase PostgreSQL & Strict RLS</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Enterprise database-level Row Level Security guarantees complete tenant isolation. Private documents are stored securely with time-limited signed URLs—never exposing secret keys to client browsers.
          </p>
          <div className="p-3.5 rounded-xl bg-surface-200 text-xs font-mono text-emerald-300 border border-emerald-500/20">
            ALTER TABLE sources ENABLE ROW LEVEL SECURITY; -- Enforced across 13 core tables.
          </div>
        </div>
      </section>

      {/* 6. FAQ (Section 4) */}
      <section id="faq" className="py-20 px-6 lg:px-12 bg-surface-100/50 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-display font-extrabold text-white">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400">Everything you need to know about InfoFusion's intelligence system</p>
          </div>

          <div className="space-y-4 text-xs">
            {[
              {
                q: 'How is InfoFusion different from ChatGPT or Claude with PDF upload?',
                a: 'ChatGPT and Claude generate fluent prose summaries but cannot deterministically extract parameters, compare numeric values across different spreadsheets, alert you to contradictory SLAs, or map conclusions directly to physical document page numbers.'
              },
              {
                q: 'What happens when evidence is missing?',
                a: 'Under our strict anti-hallucination rules, InfoFusion never presumes a claim is false or invents nonexistent proof. It explicitly marks the statement as "Evidence Not Found" and creates a remediation action to obtain formal documentation.'
              },
              {
                q: 'Can InfoFusion handle multiple document formats in one project?',
                a: 'Yes. You can ingest PDF proposals, Excel quotations, CSV pricing sheets, Word documents, plain text emails, and Markdown notes simultaneously into a single workspace.'
              },
              {
                q: 'Does it support regional Indian languages?',
                a: 'Yes! InfoFusion provides native support for Tamil, Hindi, Telugu, Malayalam, Kannada, Bengali, Marathi, Gujarati, Punjabi, Urdu, and English.'
              }
            ].map((faq, fIdx) => (
              <div key={fIdx} className="glass-panel p-5 rounded-xl space-y-2">
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{faq.q}</span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-16 px-6 lg:px-12 border-t border-white/[0.08] max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-indigo-400" />
          <span className="font-display font-bold text-white">INFOFUSION</span>
          <span>© 2026 Apex Global Enterprise Systems. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleExploreDemo} className="hover:text-white transition-colors">Judge Demo</button>
          <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Sign In</button>
          <button onClick={() => navigate('/signup')} className="text-indigo-400 hover:text-indigo-300 font-semibold">Get Started →</button>
        </div>
      </footer>
    </div>
  );
};
