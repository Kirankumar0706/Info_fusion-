import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  FileCode,
  ShieldCheck,
  Send,
  UploadCloud
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useWorkspace } from '../context/WorkspaceContext';
import { NoWorkspaceState } from '../components/common/NoWorkspaceState';
import { ReportItem, ReportType } from '../types';

export const ReportsPage: React.FC = () => {
  const { 
    reports, 
    generateReport, 
    currentWorkspace, 
    facts, 
    conflicts, 
    evidenceGaps, 
    findings, 
    actions,
    sources
  } = useWorkspace();

  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!currentWorkspace) {
    return (
      <div className="py-4">
        <NoWorkspaceState 
          title="Select or Create a Workspace to Generate Reports"
          subtitle="Reports synthesize verified evidence and analysis belonging to a specific workspace."
        />
      </div>
    );
  }

  const reportOptions: Array<{ type: ReportType; label: string; desc: string }> = [
    { 
      type: 'executive_brief', 
      label: 'Executive Decision Brief', 
      desc: 'High-level synthesis of status, critical contradictions, and sign-off prerequisites.' 
    },
    { 
      type: 'conflict_report', 
      label: 'Contradiction Radar Matrix', 
      desc: 'Complete cross-source side-by-side claim comparison with normalized deltas.' 
    },
    { 
      type: 'evidence_report', 
      label: 'Evidence & Gap Audit Dossier', 
      desc: 'Full fact provenance, citations, and missing compliance certificates.' 
    },
    { 
      type: 'action_plan', 
      label: 'Strategic Action & Mitigation Plan', 
      desc: 'Operational checklist of tasks, assigned owners, and milestone deadlines.' 
    },
    { 
      type: 'complete_workspace', 
      label: 'Complete Workspace Intelligence Dossier', 
      desc: `Unabridged enterprise report containing all ${facts.length} facts, ${conflicts.length} contradictions, and audit trail.` 
    },
  ];

  const handleGenerate = (type: ReportType, label: string) => {
    setGenerating(true);
    setTimeout(() => {
      generateReport(type, label);
      setGenerating(false);
    }, 600);
  };

  const handleDownloadPDF = (reportTitle: string) => {
    const doc = new jsPDF();
    const margin = 14;
    let y = 20;

    // Header
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text('INFOFUSION ENTERPRISE INTELLIGENCE', margin, y);
    y += 8;

    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229);
    doc.text(reportTitle.toUpperCase(), margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Workspace: ${currentWorkspace.name} (${currentWorkspace.organization})`, margin, y);
    y += 5;
    doc.text(`Generated On: ${new Date().toLocaleString()} | Security Level: RLS AUDITED`, margin, y);
    y += 10;

    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, 195, y);
    y += 8;

    // Executive Summary
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Executive Verdict & Decision Status', margin, y);
    y += 6;

    doc.setFontSize(10);
    const hasIssues = conflicts.length > 0 || evidenceGaps.length > 0;
    doc.setTextColor(hasIssues ? 220 : 16, hasIssues ? 38 : 185, hasIssues ? 38 : 129);
    doc.text(hasIssues ? 'CURRENT STATUS: REVIEW REQUIRED (Discrepancies Detected)' : 'CURRENT STATUS: VERIFIED (Consistent Evidence)', margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const summaryText = `Evaluation across ${sources.length} workspace documents extracted ${facts.length} verified facts. ${conflicts.length} contradiction(s) and ${evidenceGaps.length} evidence gap(s) require review prior to final sign-off.`;
    const splitSummary = doc.splitTextToSize(summaryText, 180);
    doc.text(splitSummary, margin, y);
    y += splitSummary.length * 5 + 6;

    // Conflicts Table
    if (conflicts.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text('2. Audited Cross-Source Contradictions', margin, y);
      y += 6;

      doc.setFontSize(9);
      conflicts.slice(0, 5).forEach((conf, i) => {
        doc.setTextColor(185, 28, 28);
        doc.text(`${i + 1}. [${conf.conflict_type.toUpperCase()}]`, margin, y);
        y += 5;
        doc.setTextColor(51, 65, 85);
        doc.text(`   • Claim A: "${conf.claim_a}" (${conf.source_a_name})`, margin, y);
        y += 5;
        doc.text(`   • Claim B: "${conf.claim_b}" (${conf.source_b_name})`, margin, y);
        y += 5;
        doc.text(`   • Delta: ${conf.difference_summary}`, margin, y);
        y += 7;
      });
    }

    doc.save(`${currentWorkspace.name.replace(/\s+/g, '_')}_${reportTitle.replace(/\s+/g, '_')}.pdf`);
    setDownloadSuccess(reportTitle);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-indigo-500/20 shadow-glass">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-indigo-400">
              EXECUTIVE REPORTING • {currentWorkspace.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Audit Dossiers & Reports
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Generate board-ready, immutable PDF and Markdown dossiers for <strong>{currentWorkspace.name}</strong>. Every claim includes cryptographic source citations for governance and audit compliance.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-surface-100 border border-white/[0.08] text-xs font-mono text-slate-300 flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Full Evidentiary Provenance</span>
        </div>
      </div>

      {/* If Workspace Has No Data: Empty State (Section 5) */}
      {sources.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-5 border-white/[0.08]">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">Reports will become available after your workspace contains analyzed information.</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload documents into this workspace. Once facts and contradictions are extracted, one-click PDF audit dossiers can be compiled.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/sources')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-2 transition-all shadow-glow-primary"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Documents First</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Download Notification */}
          {downloadSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Successfully generated and downloaded PDF dossier: <strong>{downloadSuccess}</strong></span>
            </div>
          )}

          {/* Report Generation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportOptions.map((opt) => (
              <div
                key={opt.type}
                className="glass-panel p-6 rounded-2xl border-white/[0.08] hover:border-indigo-500/30 flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    {opt.label}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {opt.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <button
                    onClick={() => handleGenerate(opt.type, opt.label)}
                    disabled={generating}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-100 hover:bg-surface-50 text-indigo-300 border border-indigo-500/20 transition-colors"
                  >
                    {generating ? 'Compiling...' : 'Generate In-App'}
                  </button>

                  <button
                    onClick={() => handleDownloadPDF(opt.label)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Generated Reports History */}
          <div className="glass-panel p-6 rounded-2xl space-y-4 border-white/[0.08]">
            <h3 className="font-display font-bold text-base text-white">
              Compiled Workspace Dossiers ({reports.length})
            </h3>

            {reports.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No reports compiled in-app yet. Click "Generate In-App" or "Download PDF" above to generate a report.
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 rounded-xl bg-surface-100 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{rep.title}</span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-200 text-slate-300">
                          {rep.report_type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Generated by {rep.generated_by} • {new Date(rep.created_at).toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadPDF(rep.title)}
                      className="px-3 py-1.5 rounded-lg bg-surface-200 hover:bg-surface-50 text-indigo-300 border border-white/[0.08] flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export PDF</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
