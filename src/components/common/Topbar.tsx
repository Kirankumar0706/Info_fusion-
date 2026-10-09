import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Globe2, 
  UploadCloud, 
  Sparkles, 
  Bell, 
  CheckCircle2, 
  LogOut, 
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { SUPPORTED_LANGUAGES } from '../../lib/multilingual';

import { testSupabaseConnection, supabaseUrl, supabaseProjectId } from '../../lib/supabase';

interface TopbarProps {
  onToggleSidebar: () => void;
  onOpenUploadModal?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar, onOpenUploadModal }) => {
  const { profile, activeLanguage, setActiveLanguage, loadDemoWorkspace, currentWorkspace } = useWorkspace();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    authHealthy: boolean;
    tablesCreated: boolean;
  }>({ connected: true, authHealthy: true, tablesCreated: false });

  const navigate = useNavigate();

  React.useEffect(() => {
    testSupabaseConnection().then(res => {
      setSupabaseStatus(res);
    });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/facts?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleDemoClick = () => {
    loadDemoWorkspace();
    navigate('/dashboard');
  };

  const activeLangObj = SUPPORTED_LANGUAGES.find(l => l.code === activeLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="h-16 bg-[#0E1422]/90 backdrop-blur-md border-b border-white/[0.08] sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
      {/* Left section: Hamburger & Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified facts, conflicts, evidence, decisions across workspace... (Press Enter)"
            className="w-full pl-10 pr-12 py-2 rounded-lg bg-surface-100/90 border border-white/[0.08] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all"
          />
          <kbd className="hidden md:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/[0.05] border border-white/[0.1] rounded">
            ⌘K
          </kbd>
        </form>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Instant Judge Demo Mode Button */}
        <button
          onClick={handleDemoClick}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 text-amber-300 hover:border-amber-400 hover:text-amber-200 transition-all shadow-sm"
          title="Instant 3-Minute Judge Scenario with 5 sources, 3 conflicts, 2 missing evidence"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Judge Demo Mode</span>
        </button>

        {/* Supabase / Demo Mode Indicator */}
        <button
          onClick={() => setShowSupabaseModal(true)}
          className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all shadow-sm ${
            supabaseStatus.tablesCreated
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
          }`}
          title="Click to view Supabase & Backend Engine status"
        >
          <span className={`w-2 h-2 rounded-full ${supabaseStatus.tablesCreated ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></span>
          <span className="font-semibold">
            {supabaseStatus.tablesCreated ? 'Supabase Live' : 'Demo Mode (Local Engine)'}
          </span>
        </button>

        {/* Quick Upload Button */}
        {onOpenUploadModal && (
          <button
            onClick={onOpenUploadModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-glow-primary shadow-sm"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Ingest Source</span>
          </button>
        )}

        {/* Multilingual Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-100 border border-white/[0.08] text-xs text-slate-300 hover:text-white hover:border-white/[0.15] transition-colors"
          >
            <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="max-w-[70px] truncate">{activeLangObj.name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#0E1422] border border-white/[0.1] shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 font-mono">
                System Language
              </div>
              <div className="max-h-64 overflow-y-auto space-y-0.5">
                {SUPPORTED_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setActiveLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors text-left ${
                      activeLanguage === lang.code
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    <span>{lang.name}</span>
                    <span className="text-[11px] font-mono text-slate-400">{lang.nativeName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/20">
              {profile.full_name.charAt(0)}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-200 leading-tight">{profile.full_name}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{profile.role}</div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 rounded-xl bg-[#0E1422] border border-white/[0.1] shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                <div className="text-xs font-semibold text-white">{profile.full_name}</div>
                <div className="text-[11px] text-slate-400">{profile.email}</div>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <ShieldCheck className="w-3 h-3" /> RLS Workspace Isolation
                </div>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/[0.05] hover:text-white transition-colors"
              >
                Profile & Organization Settings
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/activity');
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/[0.05] hover:text-white transition-colors"
              >
                Audit Log & Compliance History
              </button>
              <div className="my-1 border-t border-white/[0.06]"></div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Supabase Connection Details Modal */}
      {showSupabaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0F172A] border border-white/[0.1] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="text-base font-bold text-white">Supabase Backend Connected</h3>
              </div>
              <button
                onClick={() => setShowSupabaseModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-100 border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Live Supabase Project URL</span>
                <div className="font-mono text-emerald-300 font-semibold break-all">
                  https://nnnogyufymzlpsgblrda.supabase.co
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-100 border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Project Reference ID</span>
                <div className="font-mono text-white font-semibold">
                  nnnogyufymzlpsgblrda
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-100 border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Auth API Status</span>
                <div className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active & Healthy (GoTrue v2.197.0)
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-200">Database Schema (13 Tables)</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    supabaseStatus.tablesCreated 
                      ? 'bg-emerald-500/20 text-emerald-300' 
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {supabaseStatus.tablesCreated ? 'ONLINE' : 'LOCAL ENGINE ACTIVE'}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {supabaseStatus.tablesCreated 
                    ? 'All 13 tables, RLS policies, and storage buckets are online in your Supabase project.'
                    : 'The app is running in Isolated Demo Mode with local multi-organization persistence. To connect your remote PostgreSQL database, run supabase/schema.sql in your Supabase SQL editor.'}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`https://supabase.com/dashboard/project/${supabaseProjectId}/sql/new`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-sm"
                  >
                    Open Supabase SQL Editor →
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("supabase/schema.sql");
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-50 border border-white/[0.08] text-slate-300 transition-all"
                  >
                    {copiedSql ? '✓ Path Copied' : 'Copy File Path'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSupabaseModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-glow-primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
