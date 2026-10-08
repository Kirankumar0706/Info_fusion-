import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  User, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Filter, 
  Check, 
  Send,
  UploadCloud
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Badge } from '../components/common/Badge';
import { CommunicationModal } from '../components/common/CommunicationModal';
import { NoWorkspaceState } from '../components/common/NoWorkspaceState';
import { ActionItem, ActionPriority, ActionStatus } from '../types';

export const ActionsPage: React.FC = () => {
  const { currentWorkspace, actions, updateActionStatus, createAction, sources } = useWorkspace();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [commModalOpen, setCommModalOpen] = useState(false);

  // New action form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ActionPriority>('high');
  const [assignedTo, setAssignedTo] = useState('Workspace Lead');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));

  if (!currentWorkspace) {
    return (
      <div className="py-4">
        <NoWorkspaceState 
          title="Select or Create a Workspace to Manage Actions"
          subtitle="Action items and follow-ups are tracked specifically for each workspace."
        />
      </div>
    );
  }

  const filteredActions = actions.filter(act => {
    if (filterStatus !== 'all' && act.status !== filterStatus) return false;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createAction({
      title,
      description,
      priority,
      status: 'not_started',
      assigned_to: assignedTo,
      due_date: dueDate,
    });

    setTitle('');
    setDescription('');
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-indigo-500/20 shadow-glass">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-indigo-400">
              EXECUTION LAYER • {currentWorkspace.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Action Center
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Convert audited contradictions and missing evidence into assigned, trackable operational tasks for <strong>{currentWorkspace.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {actions.length > 0 && (
            <button
              onClick={() => setCommModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface-100 hover:bg-surface-50 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Generate Comms</span>
            </button>
          )}
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-glow-primary"
          >
            <Plus className="w-4 h-4" />
            <span>New Action</span>
          </button>
        </div>
      </div>

      {/* If No Actions: Empty State (Section 5) */}
      {actions.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-5 border-white/[0.08]">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <CheckSquare className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">No actions yet.</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create an action manually or upload documents to automatically convert contradictions and evidence gaps into strategic follow-ups.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowNewModal(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-1.5 transition-all shadow-glow-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Action</span>
            </button>
            {sources.length === 0 && (
              <button
                onClick={() => navigate('/sources')}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-surface-100 hover:bg-surface-50 text-slate-200 border border-white/[0.08] inline-flex items-center gap-1.5 transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Documents</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto p-2 rounded-xl bg-surface-100 border border-white/[0.08]">
            <span className="text-xs text-slate-400 font-mono pl-2 pr-1">Filter Status:</span>
            {['all', 'not_started', 'in_progress', 'completed', 'blocked'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all shrink-0 ${
                  filterStatus === st
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Action List Grid */}
          <div className="space-y-3.5">
            {filteredActions.map((act) => (
              <div
                key={act.id}
                className="glass-panel p-5 rounded-2xl border-white/[0.08] hover:border-indigo-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Badge variant={act.priority === 'urgent' ? 'critical' : act.priority === 'high' ? 'high' : 'medium'}>
                      {act.priority.toUpperCase()}
                    </Badge>
                    <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                      act.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : act.status === 'in_progress'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'bg-surface-100 text-slate-300 border border-white/[0.06]'
                    }`}>
                      {act.status.replace('_', ' ')}
                    </span>
                    {act.due_date && (
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Due: {act.due_date}
                      </span>
                    )}
                    {act.assigned_to && (
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3" /> {act.assigned_to}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-white">
                    {act.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {act.description}
                  </p>

                  {act.related_finding && (
                    <div className="text-[11px] font-mono text-indigo-300/80 bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10">
                      <strong>Grounded in Finding:</strong> "{act.related_finding}"
                    </div>
                  )}
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                  <select
                    value={act.status}
                    onChange={(e) => updateActionStatus(act.id, e.target.value as ActionStatus)}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-100 border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>

                  <button
                    onClick={() => updateActionStatus(act.id, act.status === 'completed' ? 'in_progress' : 'completed')}
                    className={`p-2 rounded-lg transition-colors ${
                      act.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white/[0.04] text-slate-400 hover:text-white'
                    }`}
                    title={act.status === 'completed' ? 'Mark In Progress' : 'Mark Completed'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* New Action Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-[#0F172A] border border-white/[0.1] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">Create New Strategic Action</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Action Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Request Updated Compliance Addendum"
                  className="w-full px-3 py-2 rounded-lg bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Description & Scope</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the actionable deliverables and proof requirement..."
                  className="w-full px-3 py-2 rounded-lg bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ActionPriority)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-100 border border-white/[0.08] text-white focus:outline-none"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface-100 border border-white/[0.08] text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Assigned Lead / Owner</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="e.g. Sarah Jenkins (Risk Lead)"
                  className="w-full px-3 py-2 rounded-lg bg-surface-100 border border-white/[0.08] text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/[0.06] text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Create Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Communication Modal */}
      <CommunicationModal
        isOpen={commModalOpen}
        onClose={() => setCommModalOpen(false)}
      />
    </div>
  );
};
