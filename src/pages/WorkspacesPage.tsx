import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderGit2, 
  Plus, 
  Building2, 
  Users, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Radar, 
  AlertTriangle,
  UploadCloud,
  Layers,
  Sparkles,
  Trash2
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export const WorkspacesPage: React.FC = () => {
  const { workspaces, currentWorkspace, switchWorkspace, createWorkspace, deleteWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form fields per Section 2 & 15
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [useCase, setUseCase] = useState('');
  const [recentlyCreatedName, setRecentlyCreatedName] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !organization.trim()) return;

    createWorkspace({
      name: name.trim(),
      organization: organization.trim(),
      description: description.trim() || `${organization.trim()} document analysis workspace`,
      industry: industry.trim() || undefined,
      use_case: useCase.trim() || undefined,
    });

    const createdName = name.trim();
    setName('');
    setOrganization('');
    setDescription('');
    setIndustry('');
    setUseCase('');
    setShowCreateModal(false);
    setRecentlyCreatedName(createdName);
  };

  const industries = [
    'Healthcare & Compliance',
    'Financial Services & Banking',
    'Legal & Contract Review',
    'Procurement & Sourcing',
    'Human Resources & Internal Audits',
    'Technology & IT Architecture',
    'Risk Assessment & Governance',
    'Government & Public Sector',
    'Other / General Enterprise'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-indigo-500/20 shadow-glass">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-indigo-400">
              WORKSPACE MANAGEMENT & ARCHITECTURE
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Workspaces
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every workspace isolates documents, facts, contradictions, and decisions. Information uploaded to one workspace will never appear in or contaminate another.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition-all shadow-glow-primary shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Workspace</span>
        </button>
      </div>

      {/* Post-creation Success Banner (Section 15) */}
      {recentlyCreatedName && (
        <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Workspace "{recentlyCreatedName}" created successfully!
              </h3>
              <p className="text-xs text-slate-300">
                Next step: Upload your first document to begin automated analysis.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/sources')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 transition-all shadow-sm shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Documents</span>
          </button>
        </div>
      )}

      {/* If No Workspaces: Empty State (Section 4) */}
      {workspaces.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-5 border-white/[0.08]">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <FolderGit2 className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">No workspaces yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create a workspace for your organization or project. Upload your documents and InfoFusion will analyze only the information belonging to that workspace.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-2 transition-all shadow-glow-primary"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Workspace</span>
            </button>
          </div>
        </div>
      ) : (
        /* Workspaces Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workspaces.map((ws) => {
            const isActive = ws.id === currentWorkspace?.id;
            return (
              <div
                key={ws.id}
                className={`glass-panel p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 group ${
                  isActive 
                    ? 'border-indigo-500/60 bg-surface-100 shadow-glow-primary' 
                    : 'border-white/[0.08] hover:border-white/[0.18]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase ${
                      ws.status === 'review_required'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {ws.status?.replace('_', ' ') || 'ACTIVE'}
                    </span>

                    {isActive && (
                      <span className="text-[10px] font-mono text-indigo-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> ACTIVE
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                      {ws.name}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {ws.description}
                    </p>
                  </div>

                  <div className="pt-2 text-[11px] font-mono text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{ws.organization}</span>
                    </div>
                    {ws.industry && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Layers className="w-3.5 h-3.5 text-slate-500" />
                        <span>{ws.industry}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(ws.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        switchWorkspace(ws.id);
                        navigate('/dashboard');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-surface-200 hover:bg-surface-50 text-slate-300 hover:text-white border border-white/[0.06]'
                      }`}
                    >
                      <span>{isActive ? 'Opened' : 'Open Workspace'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Workspace Modal (Section 2 & 15) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-[#0F172A] border border-white/[0.1] rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base text-white">Create New Workspace</h3>
                  <p className="text-xs text-slate-400">Data and documents will be isolated to this workspace</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-200 font-semibold mb-1">
                  Workspace Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ABC Healthcare Compliance"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-200 font-semibold mb-1">
                  Organization / Company <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. ABC Healthcare"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-200 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Compliance document analysis, regulatory review, and risk mitigation"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-200 font-semibold mb-1">
                    Industry / Sector (Optional)
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-100 border border-white/[0.1] text-white focus:outline-none"
                  >
                    <option value="">Select Industry...</option>
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-200 font-semibold mb-1">
                    Use Case (Optional)
                  </label>
                  <input
                    type="text"
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    placeholder="e.g. Audit, M&A, Policy Review"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-100 border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.06] text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-glow-primary"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
