import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Files, 
  FileSpreadsheet, 
  BrainCircuit, 
  Radar, 
  SearchAlert, 
  Network, 
  Scale, 
  CheckSquare, 
  FileText, 
  History, 
  Settings, 
  Sparkles,
  ChevronDown,
  Building2,
  FolderGit2
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  isAi?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentWorkspace, workspaces, switchWorkspace, conflicts, evidenceGaps, actions } = useWorkspace();
  const location = useLocation();

  const unresolvedConflictsCount = conflicts.filter(c => c.status === 'unresolved').length;
  const activeGapsCount = evidenceGaps.filter(g => g.status === 'evidence_required').length;
  const pendingActionsCount = actions.filter(a => a.status !== 'completed').length;

  const navGroups: NavGroup[] = [
    {
      label: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Workspaces', path: '/workspaces', icon: FolderGit2 },
      ]
    },
    {
      label: 'INFORMATION',
      items: [
        { name: 'Sources', path: '/sources', icon: Files },
        { name: 'Facts', path: '/facts', icon: FileSpreadsheet },
        { name: 'Intelligence', path: '/intelligence', icon: BrainCircuit },
      ]
    },
    {
      label: 'VERIFICATION',
      items: [
        { 
          name: 'Contradiction Radar', 
          path: '/conflicts', 
          icon: Radar,
          badge: unresolvedConflictsCount > 0 ? `${unresolvedConflictsCount}` : undefined,
          badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/40'
        },
        { 
          name: 'Evidence Gaps', 
          path: '/evidence-gaps', 
          icon: SearchAlert,
          badge: activeGapsCount > 0 ? `${activeGapsCount}` : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
        },
        { name: 'Evidence Explorer', path: '/evidence-explorer', icon: Network },
      ]
    },
    {
      label: 'DECISION',
      items: [
        { name: 'Decision Center', path: '/decisions', icon: Scale },
        { 
          name: 'Action Center', 
          path: '/actions', 
          icon: CheckSquare,
          badge: pendingActionsCount > 0 ? `${pendingActionsCount}` : undefined,
          badgeColor: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
        },
        { name: 'Reports', path: '/reports', icon: FileText },
      ]
    },
    {
      label: 'SYSTEM',
      items: [
        { name: 'Activity Log', path: '/activity', icon: History },
        { name: 'Settings', path: '/settings', icon: Settings },
      ]
    },
    {
      label: 'AI INTELLIGENCE',
      items: [
        { 
          name: 'Ask Your Information', 
          path: '/ask', 
          icon: Sparkles,
          isAi: true 
        },
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0E1422] border-r border-white/[0.08] flex flex-col
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.08]">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-primary-500 to-sky-400 flex items-center justify-center shadow-glow-primary group-hover:scale-105 transition-transform">
              <Radar className="w-5 h-5 text-white animate-pulse-subtle" />
            </div>
            <div>
              <div className="font-display font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                INFOFUSION
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">PRO</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">Trusted Decision System</p>
            </div>
          </NavLink>
        </div>

        {/* Workspace Switcher */}
        <div className="p-3 border-b border-white/[0.06]">
          {workspaces.length === 0 ? (
            <div className="p-2.5 rounded-xl bg-surface-100 border border-dashed border-indigo-500/30 text-center space-y-2">
              <div className="text-xs font-medium text-slate-300">No workspaces yet</div>
              <NavLink
                to="/workspaces"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>+ Create Workspace</span>
              </NavLink>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center justify-between px-1 mb-1">
                <label className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  {currentWorkspace ? 'Active Workspace' : 'Select Workspace'}
                </label>
                <NavLink 
                  to="/workspaces" 
                  onClick={onClose}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono"
                >
                  + New
                </NavLink>
              </div>

              <div className="bg-surface-100 hover:bg-surface-50 border border-white/[0.08] rounded-lg p-2.5 flex items-center justify-between cursor-pointer transition-colors group">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-7 h-7 rounded-md bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                      {currentWorkspace?.name || 'Select or create a workspace'}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {currentWorkspace?.organization || 'Switch Workspace'}
                    </div>
                  </div>
                </div>

                <select 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  value={currentWorkspace?.id || ''}
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      window.location.hash = '#/workspaces';
                    } else if (e.target.value) {
                      switchWorkspace(e.target.value);
                    }
                  }}
                >
                  <option value="" disabled className="bg-slate-900 text-slate-400">
                    -- Select or create a workspace --
                  </option>
                  {workspaces.map(ws => (
                    <option key={ws.id} value={ws.id} className="bg-slate-900 text-slate-200">
                      {ws.name} ({ws.organization})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

              <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-slate-400 font-mono">
                <NavLink to="/workspaces" onClick={onClose} className="hover:text-indigo-300">
                  Manage ({workspaces.length})
                </NavLink>
                <NavLink to="/settings" onClick={onClose} className="hover:text-indigo-300">
                  Settings
                </NavLink>
              </div>
            </div>
          )}
        </div>

        {/* Nav list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase px-3 mb-1.5 font-mono">
                {group.label}
              </div>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive: exactActive }) => `
                        flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group
                        ${(exactActive || isActive)
                          ? item.isAi
                            ? 'bg-gradient-to-r from-indigo-600/30 to-sky-600/20 text-indigo-200 border border-indigo-500/40 shadow-sm'
                            : 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                          : item.isAi
                            ? 'text-slate-300 hover:text-white hover:bg-indigo-950/40 border border-dashed border-indigo-500/20'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 transition-colors ${
                          isActive 
                            ? 'text-indigo-400' 
                            : item.isAi 
                            ? 'text-sky-400 group-hover:text-sky-300' 
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`} />
                        <span className={item.isAi ? 'font-semibold text-gradient-primary' : ''}>
                          {item.name}
                        </span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer Status Pill */}
        <div className="p-3 border-t border-white/[0.06] bg-surface-200/50">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Audit Layer Active
            </span>
            <span className="text-[10px] font-mono text-slate-400">v1.4 Enterprise</span>
          </div>
        </div>
      </aside>
    </>
  );
};
