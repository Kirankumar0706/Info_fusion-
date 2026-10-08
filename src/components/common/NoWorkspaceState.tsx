import React, { useState } from 'react';
import { 
  Building2, 
  FolderPlus, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface NoWorkspaceStateProps {
  title?: string;
  subtitle?: string;
}

export const NoWorkspaceState: React.FC<NoWorkspaceStateProps> = ({
  title = "Create Your Workspace",
  subtitle = "Create a workspace for your organization or project. Upload your documents and InfoFusion will analyze only the information belonging to that workspace."
}) => {
  const { createWorkspace, workspaces, switchWorkspace } = useWorkspace();

  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [useCase, setUseCase] = useState('');
  const [createdNotice, setCreatedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !organization.trim()) return;

    createWorkspace({
      name: name.trim(),
      organization: organization.trim(),
      description: description.trim() || `${organization.trim()} information analysis workspace`,
      industry: industry.trim() || undefined,
      use_case: useCase.trim() || undefined,
    });

    setCreatedNotice(true);
  };

  const industries = [
    'Healthcare & Life Sciences',
    'Financial Services & Banking',
    'Legal & Contracts',
    'Procurement & Sourcing',
    'Human Resources & People Ops',
    'Technology & Engineering',
    'Risk, Audit & Governance',
    'Government & Public Sector',
    'Manufacturing & Supply Chain',
    'Other / General Enterprise'
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-in fade-in duration-200">
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border-white/[0.1] shadow-2xl space-y-8 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Workspace Isolation Architecture</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Existing workspaces switcher if any exist */}
        {workspaces.length > 0 && (
          <div className="p-4 rounded-2xl bg-surface-100 border border-white/[0.08] space-y-2">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
              Or Switch to an Existing Workspace:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => switchWorkspace(ws.id)}
                  className="p-2.5 rounded-xl bg-surface-200 hover:bg-surface-50 border border-white/[0.06] hover:border-indigo-500/40 text-left transition-all flex items-center justify-between group"
                >
                  <div className="truncate pr-2">
                    <div className="text-xs font-semibold text-white truncate group-hover:text-indigo-300">
                      {ws.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {ws.organization}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Creation Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-200 font-semibold mb-1.5">
              Workspace Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. ABC Healthcare Compliance, Q3 Financial Audit, M&A Diligence..."
              className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-200 font-semibold mb-1.5">
                Organization / Company <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. ABC Healthcare, Apex Corp..."
                className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-200 font-semibold mb-1.5">
                Industry / Domain <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-white/[0.1] text-white focus:outline-none focus:border-indigo-500 transition-all text-xs"
              >
                <option value="">Select industry domain...</option>
                {industries.map(ind => (
                  <option key={ind} value={ind} className="bg-slate-900 text-slate-200">
                    {ind}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-200 font-semibold mb-1.5">
              Description & Scope <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what information or documents will be analyzed in this workspace..."
              className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-xs"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!name.trim() || !organization.trim()}
              className="w-full py-3.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Security & Isolation Note (Section 19) */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-center gap-2 text-center text-[11px] text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Your workspace data is isolated and analyzed strictly within its selected workspace.</span>
        </div>
      </div>
    </div>
  );
};
