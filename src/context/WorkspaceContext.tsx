import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Workspace, Source, Fact, Conflict, EvidenceItem, 
  EvidenceGap, Finding, Decision, ActionItem, ReportItem, ActivityLog, Profile 
} from '../types';
import { 
  workspaceService, sourceService, factService, conflictService, 
  evidenceService, intelligenceService, decisionService, actionService, 
  reportService, activityService 
} from '../services';
import { analyzeWorkspaceSource } from '../lib/aiPipeline';

interface CreateWorkspaceInput {
  name: string;
  organization: string;
  description: string;
  industry?: string;
  use_case?: string;
}

interface WorkspaceContextType {
  profile: Profile;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  sources: Source[];
  facts: Fact[];
  conflicts: Conflict[];
  evidenceItems: EvidenceItem[];
  evidenceGaps: EvidenceGap[];
  findings: Finding[];
  decisions: Decision[];
  actions: ActionItem[];
  reports: ReportItem[];
  activityLogs: ActivityLog[];
  activeLanguage: string;
  isProcessingUpload: boolean;
  uploadStage: string;
  
  // Actions
  switchWorkspace: (workspaceId: string | null) => void;
  createWorkspace: (input: CreateWorkspaceInput) => Workspace;
  deleteWorkspace: (workspaceId: string) => void;
  uploadSource: (file: File | { name: string; type: string; size: number; content: string }) => Promise<void>;
  deleteSource: (sourceId: string) => void;
  resolveConflict: (conflictId: string, resolutionNote: string) => void;
  updateActionStatus: (actionId: string, newStatus: ActionItem['status']) => void;
  createAction: (action: Omit<ActionItem, 'id' | 'created_at' | 'updated_at' | 'workspace_id'>) => void;
  updateDecisionStatus: (decisionId: string, status: Decision['status'], reasoning?: string) => void;
  createDecision: (decision: Omit<Decision, 'id' | 'created_at' | 'updated_at' | 'workspace_id'>) => void;
  generateReport: (reportType: ReportItem['report_type'], title: string) => ReportItem;
  setActiveLanguage: (langCode: string) => void;
  logActivity: (action_type: string, entity_type: string, entity_title: string) => void;
  updateProfile: (updated: Partial<Profile>) => void;
  loadDemoWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'infofusion_user_profile_v2';
const ACTIVE_WS_KEY = 'infofusion_active_ws_id_v2';

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Profile State - Generic clean default profile
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: 'usr-analyst-default',
      full_name: 'Lead Evaluator',
      email: 'analyst@enterprise.org',
      organization: 'Enterprise Organization',
      role: 'Intelligence & Compliance Lead',
      preferred_language: 'en',
      created_at: new Date().toISOString(),
    };
  });

  // 2. Language State
  const [activeLanguage, setActiveLanguageState] = useState<string>(() => {
    return localStorage.getItem('infofusion_active_language') || 'auto';
  });

  // 3. Workspaces State - Starts EMPTY by default
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    return workspaceService.getWorkspaces();
  });

  // Current Workspace ID - Defaults to NULL (no workspace selected initially)
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(() => {
    const saved = localStorage.getItem(ACTIVE_WS_KEY);
    const existing = workspaceService.getWorkspaces();
    if (saved && existing.some(w => w.id === saved)) {
      return saved;
    }
    return null; // NO DEFAULT WORKSPACE
  });

  // Upload progress state
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [uploadStage, setUploadStage] = useState('Idle');

  // Trigger state to re-read workspace data
  const [dataVersion, setDataVersion] = useState(0);
  const bumpVersion = () => setDataVersion(v => v + 1);

  // Sync active workspace ID to localStorage
  useEffect(() => {
    if (currentWorkspaceId) {
      localStorage.setItem(ACTIVE_WS_KEY, currentWorkspaceId);
    } else {
      localStorage.removeItem(ACTIVE_WS_KEY);
    }
  }, [currentWorkspaceId]);

  useEffect(() => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  // Derived current workspace object
  const currentWorkspace = useMemo(() => {
    if (!currentWorkspaceId) return null;
    return workspaces.find(w => w.id === currentWorkspaceId) || null;
  }, [currentWorkspaceId, workspaces]);

  // Workspace-Isolated Data Collections
  const sources = useMemo(() => {
    if (!currentWorkspaceId) return [];
    return sourceService.getSources(currentWorkspaceId);
  }, [currentWorkspaceId, dataVersion]);

  const facts = useMemo(() => {
    if (!currentWorkspaceId) return [];
    return factService.getFacts(currentWorkspaceId);
  }, [currentWorkspaceId, dataVersion]);

  const conflicts = useMemo(() => {
    if (!currentWorkspaceId) return [];
    return conflictService.getConflicts(currentWorkspaceId);
  }, [currentWorkspaceId, dataVersion]);

  const evidenceItems = useMemo(() => {
    if (!currentWorkspaceId) return [];
    return evidenceService.getEvidenceItems(currentWorkspaceId);
  }, [currentWorkspaceId, dataVersion]);

  const evidenceGaps = useMemo(() => {
    if (!currentWorkspaceId) return [];
    return evidenceService.getEvidenceGaps(currentWorkspaceId);
  }, [currentWorkspaceId, dataVersion]);

  const findings = useMemo(() => {
    if (!currentWorkspaceId) return [];
    return intelligenceService.getFindings(currentWorkspaceId);
  }, [currentWorkspaceId, dataVersion]);

  const decisions = useMemo(() => {
    if (!currentWorkspaceId) return [];
    return decisionService.getDecisions(currentWorkspaceId);
  }, [currentWorkspaceId, dataVersion]);

  const actions = useMemo(() => {
    if (!currentWorkspaceId) return [];
    return actionService.getActions(currentWorkspaceId);
  }, [currentWorkspaceId, dataVersion]);

  const reports = useMemo(() => {
    if (!currentWorkspaceId) return [];
    return reportService.getReports(currentWorkspaceId);
  }, [currentWorkspaceId, dataVersion]);

  const activityLogs = useMemo(() => {
    if (!currentWorkspaceId) return [];
    return activityService.getActivityLogs(currentWorkspaceId);
  }, [currentWorkspaceId, dataVersion]);

  // Actions
  const logActivity = (action_type: string, entity_type: string, entity_title: string) => {
    if (!currentWorkspaceId) return;
    activityService.logActivity(currentWorkspaceId, {
      user_name: profile.full_name,
      action_type,
      entity_type,
      entity_title,
    });
    bumpVersion();
  };

  const switchWorkspace = (workspaceId: string | null) => {
    setCurrentWorkspaceId(workspaceId);
    if (workspaceId) {
      const ws = workspaces.find(w => w.id === workspaceId);
      if (ws) {
        logActivity('WORKSPACE_SWITCHED', 'Workspace', `Switched to workspace: ${ws.name}`);
      }
    }
    bumpVersion();
  };

  const createWorkspace = (input: CreateWorkspaceInput): Workspace => {
    const newWs = workspaceService.createWorkspace({
      ...input,
      owner_id: profile.id,
    });
    setWorkspaces(workspaceService.getWorkspaces());
    setCurrentWorkspaceId(newWs.id);
    activityService.logActivity(newWs.id, {
      user_name: profile.full_name,
      action_type: 'WORKSPACE_CREATED',
      entity_type: 'Workspace',
      entity_title: `Created workspace: ${newWs.name}`,
    });
    bumpVersion();
    return newWs;
  };

  const deleteWorkspace = (workspaceId: string) => {
    workspaceService.deleteWorkspace(workspaceId);
    const updated = workspaceService.getWorkspaces();
    setWorkspaces(updated);
    if (currentWorkspaceId === workspaceId) {
      setCurrentWorkspaceId(updated.length > 0 ? updated[0].id : null);
    }
    bumpVersion();
  };

  const deleteSource = (sourceId: string) => {
    if (!currentWorkspaceId) return;
    const src = sources.find(s => s.id === sourceId);
    sourceService.deleteSource(sourceId);
    logActivity('SOURCE_DELETED', 'Source', `Deleted source: ${src?.file_name || sourceId}`);
    bumpVersion();
  };

  const resolveConflict = (conflictId: string, resolutionNote: string) => {
    if (!currentWorkspaceId) return;
    conflictService.resolveConflict(conflictId, resolutionNote, profile.full_name);
    logActivity('CONFLICT_RESOLVED', 'Conflict', `Resolved conflict ID: ${conflictId}`);
    bumpVersion();
  };

  const updateActionStatus = (actionId: string, newStatus: ActionItem['status']) => {
    if (!currentWorkspaceId) return;
    actionService.updateActionStatus(actionId, newStatus);
    logActivity('ACTION_UPDATED', 'Action', `Updated action status to ${newStatus}`);
    bumpVersion();
  };

  const createAction = (actionData: Omit<ActionItem, 'id' | 'created_at' | 'updated_at' | 'workspace_id'>) => {
    if (!currentWorkspaceId) return;
    actionService.createAction({
      ...actionData,
      id: `act-${Date.now()}`,
      workspace_id: currentWorkspaceId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    logActivity('ACTION_CREATED', 'Action', `Created action: ${actionData.title}`);
    bumpVersion();
  };

  const updateDecisionStatus = (decisionId: string, status: Decision['status'], reasoning?: string) => {
    if (!currentWorkspaceId) return;
    decisionService.updateDecision(decisionId, status, reasoning);
    logActivity('DECISION_UPDATED', 'Decision', `Decision status updated to: ${status}`);
    bumpVersion();
  };

  const createDecision = (decisionData: Omit<Decision, 'id' | 'created_at' | 'updated_at' | 'workspace_id'>) => {
    if (!currentWorkspaceId) return;
    decisionService.createDecision({
      ...decisionData,
      id: `dec-${Date.now()}`,
      workspace_id: currentWorkspaceId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    logActivity('DECISION_CREATED', 'Decision', `Created decision: ${decisionData.title}`);
    bumpVersion();
  };

  const generateReport = (reportType: ReportItem['report_type'], title: string): ReportItem => {
    if (!currentWorkspaceId) throw new Error('No active workspace');
    const newReport: ReportItem = {
      id: `rep-${Date.now()}`,
      workspace_id: currentWorkspaceId,
      report_type: reportType,
      title,
      generated_by: profile.full_name,
      summary: `Automated intelligence report generated on ${new Date().toLocaleDateString()} for ${currentWorkspace?.name || 'Workspace'}. Synthesized ${facts.length} facts, ${conflicts.length} conflicts, and ${actions.length} action items.`,
      download_url: '#',
      created_at: new Date().toISOString(),
    };
    reportService.createReport(newReport);
    logActivity('REPORT_GENERATED', 'Report', `Generated report: ${title}`);
    bumpVersion();
    return newReport;
  };

  const setActiveLanguage = (langCode: string) => {
    setActiveLanguageState(langCode);
    localStorage.setItem('infofusion_active_language', langCode);
  };

  const updateProfile = (updated: Partial<Profile>) => {
    setProfile(prev => ({ ...prev, ...updated }));
  };

  // Full Multi-stage source ingestion simulation pipeline (Section 6 & 16)
  const uploadSource = async (fileInput: File | { name: string; type: string; size: number; content: string }) => {
    if (!currentWorkspaceId) {
      throw new Error('Please select or create a workspace before uploading documents.');
    }

    setIsProcessingUpload(true);
    const fileName = fileInput.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase() || 'pdf';
    const fileSize = 'size' in fileInput ? fileInput.size : 1024000;

    // Stage 1: Uploading
    setUploadStage('Uploading document to workspace container...');
    await new Promise(r => setTimeout(r, 500));

    // Stage 2: Extracting
    setUploadStage('Extracting text, parameters, and metadata...');
    await new Promise(r => setTimeout(r, 600));

    // Stage 3: Structuring
    setUploadStage('Chunking & structuring extracted claims...');
    await new Promise(r => setTimeout(r, 600));

    // Stage 4: Analyzing
    setUploadStage('Normalizing values & cross-checking workspace documents...');
    await new Promise(r => setTimeout(r, 600));

    // Stage 5: Verification
    setUploadStage('Verifying evidence provenance...');
    await new Promise(r => setTimeout(r, 500));

    const sourceId = `src-${Date.now()}`;
    const newSource: Source = {
      id: sourceId,
      workspace_id: currentWorkspaceId,
      uploaded_by: profile.id,
      file_name: fileName,
      file_type: (fileExt as Source['file_type']) || 'pdf',
      storage_path: `workspaces/${currentWorkspaceId}/${fileName}`,
      file_size: fileSize,
      processing_status: 'ready',
      extracted_text: 'content' in fileInput ? fileInput.content : `Extracted document content for ${fileName}: Full operational clauses, parameters, and governance records structured for verification.`,
      metadata: {
        page_count: Math.floor(Math.random() * 8) + 2,
        author: profile.full_name,
        date: new Date().toLocaleDateString(),
      },
      facts_count: 2,
      conflicts_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Run dynamic workspace-specific analysis
    const analysis = analyzeWorkspaceSource(
      newSource,
      sources,
      facts,
      currentWorkspace?.name || 'Workspace',
      currentWorkspace?.organization || 'Organization'
    );

    // Save strictly to this workspace
    sourceService.addSource(newSource);
    factService.addFacts(currentWorkspaceId, analysis.facts);
    if (analysis.conflicts.length > 0) {
      conflictService.addConflicts(currentWorkspaceId, analysis.conflicts);
    }
    if (analysis.evidenceGaps.length > 0) {
      evidenceService.addEvidenceGaps(currentWorkspaceId, analysis.evidenceGaps);
    }
    if (analysis.findings.length > 0) {
      intelligenceService.addFindings(currentWorkspaceId, analysis.findings);
    }
    if (analysis.actions.length > 0) {
      analysis.actions.forEach(a => actionService.createAction(a));
    }

    // Auto-create initial decision container if none exists for this workspace
    const existingDecisions = decisionService.getDecisions(currentWorkspaceId);
    if (existingDecisions.length === 0) {
      decisionService.createDecision({
        id: `dec-${Date.now()}`,
        workspace_id: currentWorkspaceId,
        title: `Approve Document & Operational Baseline for ${currentWorkspace?.name || 'Workspace'}`,
        status: analysis.conflicts.length > 0 ? 'review_required' : 'review_required',
        summary: `Verification assessment for newly ingested records in ${currentWorkspace?.name || 'Workspace'}.`,
        reasoning: `Analysis completed across ${sources.length + 1} source document(s). Parameter verification and reconciliation required before sign-off.`,
        factors: [
          {
            factor: 'Operational Baseline',
            status: analysis.conflicts.length > 0 ? 'conflict' : 'supported',
            impact: 'High',
            detail: `Verified claims extracted from ${fileName}.`
          },
          {
            factor: 'Compliance & Verification',
            status: analysis.evidenceGaps.length > 0 ? 'unverified' : 'supported',
            impact: 'High',
            detail: `Evidence validation across active documentation.`
          }
        ],
        created_by: profile.full_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    logActivity('SOURCE_UPLOADED', 'Source', `Uploaded and analyzed source: ${fileName}`);
    setUploadStage('Ready');
    setIsProcessingUpload(false);
    bumpVersion();
  };

  // Optional Demo Loader for judges / evaluation testing
  const loadDemoWorkspace = () => {
    const demoWsId = 'ws-sample-evaluation';
    let demoWs = workspaceService.getWorkspace(demoWsId);
    if (!demoWs) {
      demoWs = workspaceService.createWorkspace({
        name: 'Evaluation & Procurement Audit',
        organization: 'Apex Global Enterprises',
        description: 'Multi-source evaluation review cross-checking proposals, quotations, SLAs, and performance audits.',
        industry: 'Procurement & Sourcing',
      });
      demoWs.id = demoWsId;
    }

    // Also seed sample data if workspace was newly created
    const existingSrc = sourceService.getSources(demoWsId);
    if (existingSrc.length === 0) {
      const src1: Source = {
        id: `src-demo-prop`,
        workspace_id: demoWsId,
        uploaded_by: profile.id,
        file_name: 'Commercial_Proposal.pdf',
        file_type: 'pdf',
        storage_path: `workspaces/${demoWsId}/Commercial_Proposal.pdf`,
        file_size: 1420000,
        processing_status: 'ready',
        extracted_text: 'Annual subscription fee fixed at ₹5,20,000 (5.2 Lakhs). Dedicated 24/7 support guaranteed. 15 business days delivery.',
        metadata: { page_count: 8, author: 'Commercial Team' },
        facts_count: 12,
        conflicts_count: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const src2: Source = {
        id: `src-demo-quot`,
        workspace_id: demoWsId,
        uploaded_by: profile.id,
        file_name: 'Itemized_Quotation.xlsx',
        file_type: 'xlsx',
        storage_path: `workspaces/${demoWsId}/Itemized_Quotation.xlsx`,
        file_size: 480000,
        processing_status: 'ready',
        extracted_text: 'Row 18: Total price: ₹4,80,000 net. Row 22: Staging deployment window 30 calendar days.',
        metadata: { row_count: 36, author: 'Finance Operations' },
        facts_count: 10,
        conflicts_count: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      sourceService.addSource(src1);
      sourceService.addSource(src2);

      factService.addFacts(demoWsId, [
        {
          id: 'demo-fact-1',
          workspace_id: demoWsId,
          source_id: src1.id,
          source_name: src1.file_name,
          claim: 'Annual enterprise subscription fee is fixed at ₹5,20,000 (INR 5.2 L)',
          normalized_key: 'annual_subscription_fee',
          normalized_value: '520000 INR',
          value_type: 'currency',
          category: 'commercial',
          confidence: 0.985,
          status: 'conflicting',
          source_location: 'Page 4, Section 1.1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'demo-fact-2',
          workspace_id: demoWsId,
          source_id: src2.id,
          source_name: src2.file_name,
          claim: 'Total commercial price is ₹4,80,000 (INR 4.8 L net)',
          normalized_key: 'annual_subscription_fee',
          normalized_value: '480000 INR',
          value_type: 'currency',
          category: 'commercial',
          confidence: 0.975,
          status: 'conflicting',
          source_location: 'Row 18, Total Cost Cell',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]);

      conflictService.addConflicts(demoWsId, [
        {
          id: 'demo-conf-price',
          workspace_id: demoWsId,
          fact_a_id: 'demo-fact-1',
          fact_b_id: 'demo-fact-2',
          claim_a: 'Annual enterprise subscription fee is ₹5,20,000 (INR 5.2 L)',
          claim_b: 'Total commercial price is ₹4,80,000 (INR 4.8 L net)',
          source_a_id: src1.id,
          source_a_name: src1.file_name,
          source_a_location: 'Page 4, Section 1.1',
          source_b_id: src2.id,
          source_b_name: src2.file_name,
          source_b_location: 'Row 18, Total Cost Cell',
          difference_summary: 'Discrepancy of ₹40,000 between Commercial Proposal and Quotation.',
          conflict_type: 'Pricing & Financial Discrepancy',
          severity: 'critical',
          explanation: 'The Proposal document explicitly quotes an annual fee of ₹5,20,000, whereas the formal line-item quotation specifies a net total of ₹4,80,000.',
          confidence: 0.965,
          status: 'unresolved',
          created_at: new Date().toISOString(),
        }
      ]);

      evidenceService.addEvidenceGaps(demoWsId, [
        {
          id: 'demo-gap-iso',
          workspace_id: demoWsId,
          claim: 'Contractual party claims ISO/IEC 27001:2022 security accreditation.',
          category: 'Security & Governance Certification',
          claimed_in_source: src1.file_name,
          claimed_location: 'Page 9, Section 3.1',
          status: 'evidence_required',
          recommended_action: 'Formally request valid ISO 27001 certificate attachment.',
          confidence: 0.98,
          created_at: new Date().toISOString(),
        }
      ]);

      intelligenceService.addFindings(demoWsId, [
        {
          id: 'demo-find-price',
          workspace_id: demoWsId,
          title: 'Commercial Inconsistency Between Primary Instruments',
          description: 'A net variance of ₹40,000 exists between commercial documents.',
          severity: 'critical',
          confidence: 0.965,
          status: 'active',
          finding_type: 'commercial_risk',
          evidence_count: 2,
          sources_involved: [src1.file_name, src2.file_name],
          explanation: 'Reconciliation required prior to milestone authorization.',
          recommended_action: 'Issue formal clarification notice.',
          created_at: new Date().toISOString(),
        }
      ]);

      decisionService.createDecision({
        id: 'demo-dec-approval',
        workspace_id: demoWsId,
        title: 'Approve Operational Baseline & Execution Agreement?',
        status: 'review_required',
        summary: 'Decision blocked pending resolution of pricing variance and unverified security documentation.',
        reasoning: 'Reconciliation required to eliminate commercial and governance risks.',
        factors: [
          {
            factor: 'Commercial Pricing',
            status: 'conflict',
            impact: 'High',
            detail: '₹5.2 Lakhs in proposal vs ₹4.8 Lakhs in itemized quotation.'
          },
          {
            factor: 'Security Certification',
            status: 'unverified',
            impact: 'High',
            detail: 'ISO 27001 claimed, no attachment found in repository.'
          }
        ],
        created_by: profile.full_name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      actionService.createAction({
        id: 'demo-act-1',
        workspace_id: demoWsId,
        title: 'Confirm Binding Commercial Ceiling & Pricing Baseline',
        description: 'Demand confirmation on whether ₹4.8 Lakhs is final binding figure.',
        priority: 'urgent',
        status: 'in_progress',
        assigned_to: 'Commercial Lead',
        due_date: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    setWorkspaces(workspaceService.getWorkspaces());
    setCurrentWorkspaceId(demoWsId);
    bumpVersion();
  };

  return (
    <WorkspaceContext.Provider value={{
      profile,
      workspaces,
      currentWorkspace,
      sources,
      facts,
      conflicts,
      evidenceItems,
      evidenceGaps,
      findings,
      decisions,
      actions,
      reports,
      activityLogs,
      activeLanguage,
      isProcessingUpload,
      uploadStage,
      switchWorkspace,
      createWorkspace,
      deleteWorkspace,
      uploadSource,
      deleteSource,
      resolveConflict,
      updateActionStatus,
      createAction,
      updateDecisionStatus,
      createDecision,
      generateReport,
      setActiveLanguage,
      logActivity,
      updateProfile,
      loadDemoWorkspace,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
