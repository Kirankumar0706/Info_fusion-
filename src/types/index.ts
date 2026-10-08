export type WorkspaceStatus = 'active' | 'archived' | 'review_required' | 'completed';
export type MemberRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'member';
export type ProcessingStatus = 'uploading' | 'extracting' | 'structuring' | 'analyzing' | 'ready' | 'completed' | 'failed';
export type FactStatus = 'supported' | 'uncertain' | 'conflicting' | 'missing_evidence';
export type ConflictSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ConflictStatus = 'open' | 'under_review' | 'resolved' | 'dismissed' | 'unresolved' | 'investigating';
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type DecisionStatus = 'approved' | 'rejected' | 'review_required' | 'draft' | 'ready' | 'blocked' | 'insufficient_evidence';
export type ActionPriority = 'urgent' | 'high' | 'medium' | 'low';
export type ActionStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'pending';
export type ReportType = 'executive_brief' | 'detailed_analysis' | 'conflict_report' | 'evidence_report' | 'action_plan' | 'complete_workspace';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  organization: string;
  role: string;
  preferred_language: string;
  avatar_url?: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  created_by?: string;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
}

export interface Workspace {
  id: string;
  organization_id?: string;
  name: string;
  description: string;
  owner_id: string;
  created_by?: string;
  organization: string;
  industry?: string;
  use_case?: string;
  status: WorkspaceStatus;
  created_at: string;
  updated_at: string;
  members_count?: number;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: MemberRole;
  created_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  workspace_id: string;
  chunk_index: number;
  content: string;
  page_number?: number;
  created_at: string;
}

export interface Source {
  id: string;
  organization_id?: string;
  workspace_id: string;
  uploaded_by: string;
  file_name: string;
  file_type: 'pdf' | 'docx' | 'xlsx' | 'csv' | 'txt' | 'md' | 'image' | string;
  storage_path: string;
  file_size: number;
  processing_status: ProcessingStatus;
  extracted_text: string;
  metadata: {
    page_count?: number;
    author?: string;
    version?: string;
    date?: string;
    row_count?: number;
    [key: string]: unknown;
  };
  facts_count?: number;
  conflicts_count?: number;
  created_at: string;
  updated_at: string;
}

// Document alias for database parity
export type Document = Source;

export interface Fact {
  id: string;
  organization_id?: string;
  workspace_id: string;
  document_id?: string;
  source_id: string;
  source_name?: string;
  subject?: string;
  attribute?: string;
  value?: string;
  claim: string;
  fact_text?: string;
  fact_type?: string;
  normalized_key: string;
  normalized_value: string;
  value_type: 'string' | 'number' | 'currency' | 'date' | 'boolean' | 'duration';
  category: 'commercial' | 'legal' | 'technical' | 'sla' | 'compliance' | 'delivery' | 'security' | 'general' | string;
  confidence: number;
  status: FactStatus;
  verification_status?: 'verified' | 'uncertain' | 'unverified';
  source_location: string;
  source_document_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Conflict {
  id: string;
  organization_id?: string;
  workspace_id: string;
  subject?: string;
  attribute?: string;
  fact_a_id: string;
  fact_b_id: string;
  claim_a: string;
  claim_b: string;
  source_a_id: string;
  source_a_name: string;
  source_a_location: string;
  source_b_id: string;
  source_b_name: string;
  source_b_location: string;
  difference_summary: string;
  description?: string;
  conflict_type: string;
  severity: ConflictSeverity;
  explanation: string;
  detection_reason?: string;
  confidence: number;
  status: ConflictStatus;
  resolution_note?: string;
  resolved_by?: string;
  resolved_at?: string;
  evidence_a_id?: string;
  evidence_b_id?: string;
  created_at: string;
}

// Contradiction alias
export type Contradiction = Conflict;

export interface EvidenceItem {
  id: string;
  organization_id?: string;
  workspace_id: string;
  fact_id?: string;
  document_id?: string;
  source_id: string;
  source_name: string;
  source_location: string;
  evidence_text: string;
  evidence_type?: string;
  confidence: number;
  created_at: string;
}

export interface EvidenceGap {
  id: string;
  organization_id?: string;
  workspace_id: string;
  fact_id?: string;
  claim: string;
  description?: string;
  category: string;
  claimed_in_source: string;
  claimed_location: string;
  required_evidence?: string;
  missing_evidence_type?: string;
  severity?: ConflictSeverity;
  status: 'evidence_required' | 'unverified' | 'open' | 'under_review' | 'resolved';
  recommended_action: string;
  confidence: number;
  created_at: string;
}

export interface Finding {
  id: string;
  organization_id?: string;
  workspace_id: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  confidence: number;
  status: 'active' | 'mitigated' | 'resolved';
  category?: 'Risk' | 'Conflict' | 'Missing Evidence' | 'Important Change' | 'Anomaly' | 'Verification Required' | 'Opportunity' | 'General Finding' | string;
  finding_type: 'inconsistency' | 'missing_evidence' | 'compliance_gap' | 'commercial_risk' | 'opportunity' | string;
  evidence_count: number;
  sources_involved: string[];
  supporting_facts?: string[];
  supporting_fact_ids?: string[];
  related_contradictions?: string[];
  related_evidence_gaps?: string[];
  explanation: string;
  recommended_action: string;
  created_at: string;
}

export interface DecisionFactor {
  factor: string;
  factor_name?: string;
  status: 'supported' | 'conflict' | 'unverified' | 'pass' | 'fail' | string;
  impact?: 'Critical' | 'High' | 'Medium' | 'Low' | string;
  detail?: string;
  finding?: string;
  weight?: number;
}

export interface Decision {
  id: string;
  organization_id?: string;
  workspace_id: string;
  title: string;
  decision?: string;
  recommendation?: string;
  confidence?: number;
  status: DecisionStatus;
  summary: string;
  reasoning: string;
  factors: DecisionFactor[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: string;
  organization_id?: string;
  workspace_id: string;
  decision_id?: string;
  title: string;
  description: string;
  priority: ActionPriority;
  status: ActionStatus;
  assigned_to: string;
  due_date: string;
  related_finding?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportItem {
  id: string;
  organization_id?: string;
  workspace_id: string;
  report_type: ReportType;
  title: string;
  content?: string;
  generated_by: string;
  summary: string;
  download_url?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  organization_id?: string;
  workspace_id: string;
  user_id?: string;
  user_name: string;
  action_type: string;
  action?: string;
  entity_type: string;
  entity_title: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface MultilingualQuery {
  query: string;
  detected_language: string;
  target_language: string;
}

export interface AssistantAnswer {
  answer: string;
  language: string;
  language_used?: string;
  issues_count?: number;
  key_points?: string[];
  citations?: string[];
  sources_used: {
    source_name: string;
    location: string;
    quote: string;
  }[];
  confidence: number;
  status?: string;
}

