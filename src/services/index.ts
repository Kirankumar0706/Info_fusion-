import { 
  Workspace, Source, Fact, Conflict, EvidenceItem, 
  EvidenceGap, Finding, Decision, ActionItem, ReportItem, ActivityLog, Profile, DecisionStatus, ActionStatus 
} from '../types';

// Storage keys for workspace-isolated data
const KEYS = {
  WORKSPACES: 'infofusion_workspaces_v2',
  SOURCES: 'infofusion_sources_v2',
  FACTS: 'infofusion_facts_v2',
  CONFLICTS: 'infofusion_conflicts_v2',
  EVIDENCE: 'infofusion_evidence_v2',
  EVIDENCE_GAPS: 'infofusion_evidence_gaps_v2',
  FINDINGS: 'infofusion_findings_v2',
  DECISIONS: 'infofusion_decisions_v2',
  ACTIONS: 'infofusion_actions_v2',
  REPORTS: 'infofusion_reports_v2',
  ACTIVITY: 'infofusion_activity_v2',
  USER_PROFILE: 'infofusion_user_profile_v2',
};

// Generic storage helpers
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to store ${key}:`, err);
  }
}

// 1. WORKSPACE SERVICE
export const workspaceService = {
  getWorkspaces(): Workspace[] {
    return getStored<Workspace[]>(KEYS.WORKSPACES, []);
  },

  getWorkspace(id: string): Workspace | null {
    const list = this.getWorkspaces();
    return list.find(w => w.id === id) || null;
  },

  createWorkspace(data: {
    name: string;
    organization: string;
    description: string;
    industry?: string;
    use_case?: string;
    owner_id?: string;
  }): Workspace {
    const list = this.getWorkspaces();
    const newWs: Workspace = {
      id: `ws-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      organization: data.organization.trim(),
      description: data.description.trim(),
      industry: data.industry?.trim(),
      use_case: data.use_case?.trim(),
      owner_id: data.owner_id || 'user-current',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      members_count: 1,
    };
    list.unshift(newWs);
    setStored(KEYS.WORKSPACES, list);
    return newWs;
  },

  updateWorkspace(id: string, updates: Partial<Workspace>): Workspace | null {
    const list = this.getWorkspaces();
    const idx = list.findIndex(w => w.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    setStored(KEYS.WORKSPACES, list);
    return list[idx];
  },

  deleteWorkspace(id: string): void {
    const list = this.getWorkspaces().filter(w => w.id !== id);
    setStored(KEYS.WORKSPACES, list);

    // Cascade delete workspace data
    const filterOut = <T extends { workspace_id: string }>(key: string) => {
      const items = getStored<T[]>(key, []).filter(item => item.workspace_id !== id);
      setStored(key, items);
    };

    filterOut(KEYS.SOURCES);
    filterOut(KEYS.FACTS);
    filterOut(KEYS.CONFLICTS);
    filterOut(KEYS.EVIDENCE);
    filterOut(KEYS.EVIDENCE_GAPS);
    filterOut(KEYS.FINDINGS);
    filterOut(KEYS.DECISIONS);
    filterOut(KEYS.ACTIONS);
    filterOut(KEYS.REPORTS);
    filterOut(KEYS.ACTIVITY);
  }
};

// 2. SOURCE SERVICE
export const sourceService = {
  getSources(workspaceId: string): Source[] {
    const all = getStored<Source[]>(KEYS.SOURCES, []);
    return all.filter(s => s.workspace_id === workspaceId);
  },

  getSource(id: string): Source | null {
    const all = getStored<Source[]>(KEYS.SOURCES, []);
    return all.find(s => s.id === id) || null;
  },

  addSource(source: Source): Source {
    const all = getStored<Source[]>(KEYS.SOURCES, []);
    all.unshift(source);
    setStored(KEYS.SOURCES, all);
    return source;
  },

  deleteSource(sourceId: string): void {
    const all = getStored<Source[]>(KEYS.SOURCES, []);
    setStored(KEYS.SOURCES, all.filter(s => s.id !== sourceId));
    // Also remove associated facts
    const facts = getStored<Fact[]>(KEYS.FACTS, []);
    setStored(KEYS.FACTS, facts.filter(f => f.source_id !== sourceId));
  }
};

// 3. FACT SERVICE
export const factService = {
  getFacts(workspaceId: string): Fact[] {
    const all = getStored<Fact[]>(KEYS.FACTS, []);
    return all.filter(f => f.workspace_id === workspaceId);
  },

  addFacts(workspaceId: string, newFacts: Fact[]): void {
    const all = getStored<Fact[]>(KEYS.FACTS, []);
    setStored(KEYS.FACTS, [...newFacts, ...all]);
  }
};

// 4. CONFLICT SERVICE
export const conflictService = {
  getConflicts(workspaceId: string): Conflict[] {
    const all = getStored<Conflict[]>(KEYS.CONFLICTS, []);
    return all.filter(c => c.workspace_id === workspaceId);
  },

  addConflicts(workspaceId: string, newConflicts: Conflict[]): void {
    const all = getStored<Conflict[]>(KEYS.CONFLICTS, []);
    setStored(KEYS.CONFLICTS, [...newConflicts, ...all]);
  },

  updateConflictStatus(conflictId: string, status: Conflict['status'], resolutionNote?: string, resolvedBy?: string): void {
    const all = getStored<Conflict[]>(KEYS.CONFLICTS, []);
    const idx = all.findIndex(c => c.id === conflictId);
    if (idx !== -1) {
      all[idx] = {
        ...all[idx],
        status,
        resolution_note: resolutionNote || all[idx].resolution_note,
        resolved_by: resolvedBy || all[idx].resolved_by,
        resolved_at: status === 'resolved' ? new Date().toISOString() : all[idx].resolved_at,
      };
      setStored(KEYS.CONFLICTS, all);
    }
  },

  resolveConflict(conflictId: string, resolutionNote: string, resolvedBy: string): void {
    this.updateConflictStatus(conflictId, 'resolved', resolutionNote, resolvedBy);
  }
};

// 5. EVIDENCE SERVICE
export const evidenceService = {
  getEvidenceItems(workspaceId: string): EvidenceItem[] {
    const all = getStored<EvidenceItem[]>(KEYS.EVIDENCE, []);
    return all.filter(e => e.workspace_id === workspaceId);
  },

  addEvidenceItems(workspaceId: string, newEvidence: EvidenceItem[]): void {
    const all = getStored<EvidenceItem[]>(KEYS.EVIDENCE, []);
    setStored(KEYS.EVIDENCE, [...newEvidence, ...all]);
  },

  getEvidenceGaps(workspaceId: string): EvidenceGap[] {
    const all = getStored<EvidenceGap[]>(KEYS.EVIDENCE_GAPS, []);
    return all.filter(g => g.workspace_id === workspaceId);
  },

  addEvidenceGaps(workspaceId: string, newGaps: EvidenceGap[]): void {
    const all = getStored<EvidenceGap[]>(KEYS.EVIDENCE_GAPS, []);
    setStored(KEYS.EVIDENCE_GAPS, [...newGaps, ...all]);
  }
};

// 6. INTELLIGENCE SERVICE
export const intelligenceService = {
  getFindings(workspaceId: string): Finding[] {
    const all = getStored<Finding[]>(KEYS.FINDINGS, []);
    return all.filter(f => f.workspace_id === workspaceId);
  },

  addFindings(workspaceId: string, newFindings: Finding[]): void {
    const all = getStored<Finding[]>(KEYS.FINDINGS, []);
    setStored(KEYS.FINDINGS, [...newFindings, ...all]);
  }
};

// 7. DECISION SERVICE
export const decisionService = {
  getDecisions(workspaceId: string): Decision[] {
    const all = getStored<Decision[]>(KEYS.DECISIONS, []);
    return all.filter(d => d.workspace_id === workspaceId);
  },

  createDecision(decision: Decision): Decision {
    const all = getStored<Decision[]>(KEYS.DECISIONS, []);
    all.unshift(decision);
    setStored(KEYS.DECISIONS, all);
    return decision;
  },

  updateDecision(decisionId: string, status: DecisionStatus, reasoning?: string): void {
    const all = getStored<Decision[]>(KEYS.DECISIONS, []);
    const idx = all.findIndex(d => d.id === decisionId);
    if (idx !== -1) {
      all[idx] = {
        ...all[idx],
        status,
        reasoning: reasoning || all[idx].reasoning,
        updated_at: new Date().toISOString(),
      };
      setStored(KEYS.DECISIONS, all);
    }
  }
};

// 8. ACTION SERVICE
export const actionService = {
  getActions(workspaceId: string): ActionItem[] {
    const all = getStored<ActionItem[]>(KEYS.ACTIONS, []);
    return all.filter(a => a.workspace_id === workspaceId);
  },

  createAction(action: ActionItem): ActionItem {
    const all = getStored<ActionItem[]>(KEYS.ACTIONS, []);
    all.unshift(action);
    setStored(KEYS.ACTIONS, all);
    return action;
  },

  updateActionStatus(actionId: string, status: ActionStatus): void {
    const all = getStored<ActionItem[]>(KEYS.ACTIONS, []);
    const idx = all.findIndex(a => a.id === actionId);
    if (idx !== -1) {
      all[idx] = {
        ...all[idx],
        status,
        updated_at: new Date().toISOString(),
      };
      setStored(KEYS.ACTIONS, all);
    }
  }
};

// 9. REPORT SERVICE
export const reportService = {
  getReports(workspaceId: string): ReportItem[] {
    const all = getStored<ReportItem[]>(KEYS.REPORTS, []);
    return all.filter(r => r.workspace_id === workspaceId);
  },

  createReport(report: ReportItem): ReportItem {
    const all = getStored<ReportItem[]>(KEYS.REPORTS, []);
    all.unshift(report);
    setStored(KEYS.REPORTS, all);
    return report;
  }
};

// 10. ACTIVITY SERVICE
export const activityService = {
  getActivityLogs(workspaceId: string): ActivityLog[] {
    const all = getStored<ActivityLog[]>(KEYS.ACTIVITY, []);
    return all.filter(a => a.workspace_id === workspaceId);
  },

  logActivity(workspaceId: string, log: Omit<ActivityLog, 'id' | 'timestamp' | 'workspace_id'>): ActivityLog {
    const all = getStored<ActivityLog[]>(KEYS.ACTIVITY, []);
    const entry: ActivityLog = {
      ...log,
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      workspace_id: workspaceId,
      timestamp: new Date().toISOString(),
    };
    all.unshift(entry);
    setStored(KEYS.ACTIVITY, all);
    return entry;
  }
};
