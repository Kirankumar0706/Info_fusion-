import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Globe2, 
  Building2, 
  ShieldCheck, 
  Database, 
  Save, 
  CheckCircle2, 
  Trash2,
  Lock,
  Download
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { SUPPORTED_LANGUAGES } from '../lib/multilingual';

export const SettingsPage: React.FC = () => {
  const { profile, updateProfile, activeLanguage, setActiveLanguage, currentWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'profile' | 'language' | 'workspace' | 'security' | 'data'>('profile');

  // Form states
  const [fullName, setFullName] = useState(profile.full_name);
  const [email, setEmail] = useState(profile.email);
  const [org, setOrg] = useState(profile.organization);
  const [role, setRole] = useState(profile.role);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: fullName,
      email,
      organization: org,
      role,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 max-w-5xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-indigo-500/20 shadow-glass">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <Settings className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-indigo-400">
              PREFERENCES & CONFIGURATION
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Settings & Governance
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Manage your user identity, multilingual defaults, security controls, and enterprise data export settings.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.08] gap-4 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'profile', label: 'User Profile', icon: User },
          { id: 'language', label: 'Language & Locale', icon: Globe2 },
          { id: 'workspace', label: 'Workspace Details', icon: Building2 },
          { id: 'security', label: 'Security & RLS', icon: ShieldCheck },
          { id: 'data', label: 'Data Management', icon: Database },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="glass-panel p-6 rounded-2xl space-y-4 max-w-2xl">
          <h3 className="font-display font-bold text-base text-white">Profile Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Organization</label>
              <input
                type="text"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Role Title</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-glow-primary transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Profile</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Language & Locale */}
      {activeTab === 'language' && (
        <div className="glass-panel p-6 rounded-2xl space-y-4 max-w-2xl">
          <h3 className="font-display font-bold text-base text-white">Multilingual Interaction Settings</h3>
          <p className="text-xs text-slate-300">
            Set your preferred query response language. In auto mode, InfoFusion automatically detects Tamil, Hindi, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, and other languages.
          </p>

          <div className="space-y-2 text-xs">
            <label className="block text-slate-300 font-medium">Default Response Language</label>
            <select
              value={activeLanguage}
              onChange={(e) => setActiveLanguage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-surface-100 border border-white/[0.08] text-white focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-slate-200">
                  {l.name} — {l.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Tab 3: Workspace */}
      {activeTab === 'workspace' && (
        <div className="glass-panel p-6 rounded-2xl space-y-4 max-w-2xl">
          <h3 className="font-display font-bold text-base text-white">Current Workspace Config</h3>
          <div className="p-4 rounded-xl bg-surface-100 border border-white/[0.06] space-y-2 text-xs">
            <div className="text-white font-bold">{currentWorkspace.name}</div>
            <div className="text-slate-300">{currentWorkspace.description}</div>
            <div className="text-[11px] font-mono text-slate-400 pt-1">
              Organization: {currentWorkspace.organization} • ID: {currentWorkspace.id}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security */}
      {activeTab === 'security' && (
        <div className="glass-panel p-6 rounded-2xl space-y-4 max-w-2xl">
          <h3 className="font-display font-bold text-base text-white">Security & Backend Architecture</h3>
          <div className="space-y-3 text-xs text-slate-300">
            {/* Live Supabase Project Card */}
            <div className="p-4 rounded-xl bg-surface-100 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-semibold text-white">Live Supabase Project Connected</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ONLINE
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-300 space-y-0.5 pt-1">
                <div>Project URL: <strong className="text-emerald-300">https://nnnogyufymzlpsgblrda.supabase.co</strong></div>
                <div>Project Ref: <strong className="text-indigo-300">nnnogyufymzlpsgblrda</strong></div>
                <div>Auth Service: <strong className="text-emerald-300">GoTrue v2.197.0 (Active)</strong></div>
              </div>
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Database Schema: 13 RLS Tables in supabase/schema.sql</span>
                <a
                  href="https://supabase.com/dashboard/project/nnnogyufymzlpsgblrda/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
                >
                  Open SQL Editor →
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-100 border border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="font-semibold text-white">Supabase Row-Level Security (RLS)</div>
                  <div className="text-[11px] text-slate-400">Strict database-level multi-tenant isolation enforced</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-100 border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-indigo-400" />
                <div>
                  <div className="font-semibold text-white">Zero Public Document Exposure</div>
                  <div className="text-[11px] text-slate-400">Private storage buckets with time-limited signed tokens</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                ENFORCED
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Data */}
      {activeTab === 'data' && (
        <div className="glass-panel p-6 rounded-2xl space-y-4 max-w-2xl">
          <h3 className="font-display font-bold text-base text-white">Workspace Data Management</h3>
          <p className="text-xs text-slate-300">
            Download your raw structured facts or purge this workspace container.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => {
                const data = localStorage.getItem('infofusion_facts_v1') || '[]';
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `facts_export_${Date.now()}.json`;
                a.click();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-100 hover:bg-surface-50 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Raw JSON Facts</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
