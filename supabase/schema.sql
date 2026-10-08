-- ====================================================================
-- INFOFUSION: ENTERPRISE SUPABASE POSTGRESQL SCHEMA & RLS POLICIES
-- "From scattered information to trusted decisions."
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    organization TEXT,
    role TEXT DEFAULT 'Procurement Lead',
    preferred_language TEXT DEFAULT 'en',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORKSPACES TABLE
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    organization TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'review_required', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WORKSPACE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- 4. SOURCES TABLE
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    storage_path TEXT,
    file_size BIGINT DEFAULT 0,
    processing_status TEXT DEFAULT 'ready' CHECK (processing_status IN ('uploading', 'extracting', 'structuring', 'analyzing', 'ready', 'failed')),
    extracted_text TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FACTS TABLE
CREATE TABLE IF NOT EXISTS facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    claim TEXT NOT NULL,
    normalized_key TEXT NOT NULL,
    normalized_value TEXT NOT NULL,
    value_type TEXT DEFAULT 'string' CHECK (value_type IN ('string', 'number', 'currency', 'date', 'boolean', 'duration')),
    category TEXT DEFAULT 'general',
    confidence NUMERIC(4, 3) DEFAULT 0.950,
    status TEXT DEFAULT 'supported' CHECK (status IN ('supported', 'uncertain', 'conflicting', 'missing_evidence')),
    source_location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONFLICTS TABLE
CREATE TABLE IF NOT EXISTS conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    fact_a_id UUID NOT NULL REFERENCES facts(id) ON DELETE CASCADE,
    fact_b_id UUID NOT NULL REFERENCES facts(id) ON DELETE CASCADE,
    conflict_type TEXT NOT NULL,
    severity TEXT DEFAULT 'high' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    explanation TEXT NOT NULL,
    confidence NUMERIC(4, 3) DEFAULT 0.960,
    status TEXT DEFAULT 'unresolved' CHECK (status IN ('unresolved', 'resolved', 'investigating', 'dismissed')),
    resolution_note TEXT,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EVIDENCE TABLE
CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    fact_id UUID REFERENCES facts(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    source_location TEXT,
    evidence_text TEXT NOT NULL,
    confidence NUMERIC(4, 3) DEFAULT 0.950,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FINDINGS TABLE
CREATE TABLE IF NOT EXISTS findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'high' CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
    confidence NUMERIC(4, 3) DEFAULT 0.950,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'mitigated', 'resolved')),
    finding_type TEXT DEFAULT 'inconsistency' CHECK (finding_type IN ('inconsistency', 'missing_evidence', 'compliance_gap', 'commercial_risk', 'opportunity')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FINDING_EVIDENCE TABLE
CREATE TABLE IF NOT EXISTS finding_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id UUID NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
    evidence_id UUID NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    UNIQUE(finding_id, evidence_id)
);

-- 10. DECISIONS TABLE
CREATE TABLE IF NOT EXISTS decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'review_required' CHECK (status IN ('approved', 'rejected', 'review_required', 'draft')),
    summary TEXT NOT NULL,
    reasoning TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ACTIONS TABLE
CREATE TABLE IF NOT EXISTS actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    decision_id UUID REFERENCES decisions(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'high' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked')),
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL CHECK (report_type IN ('executive_brief', 'detailed_analysis', 'conflict_report', 'evidence_report', 'action_plan', 'complete_workspace')),
    title TEXT NOT NULL,
    generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ACTIVITY_LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE finding_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check workspace membership
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID, u_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_id = ws_id AND user_id = u_id
    ) OR EXISTS (
        SELECT 1 FROM workspaces
        WHERE id = ws_id AND owner_id = u_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Workspaces: Access only if owner or member
CREATE POLICY "Workspace members can view workspace" ON workspaces
    FOR SELECT USING (is_workspace_member(id, auth.uid()));
CREATE POLICY "Owners can update workspace" ON workspaces
    FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can create workspace" ON workspaces
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Workspace members: Viewable by workspace members
CREATE POLICY "View workspace members" ON workspace_members
    FOR SELECT USING (is_workspace_member(workspace_id, auth.uid()));

-- Sources: Accessible by workspace members
CREATE POLICY "View sources" ON sources
    FOR SELECT USING (is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Insert sources" ON sources
    FOR INSERT WITH CHECK (is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Delete sources" ON sources
    FOR DELETE USING (is_workspace_member(workspace_id, auth.uid()));

-- Facts: Accessible by workspace members
CREATE POLICY "View facts" ON facts
    FOR SELECT USING (is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Manage facts" ON facts
    FOR ALL USING (is_workspace_member(workspace_id, auth.uid()));

-- Conflicts: Accessible by workspace members
CREATE POLICY "View conflicts" ON conflicts
    FOR SELECT USING (is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Update conflicts" ON conflicts
    FOR UPDATE USING (is_workspace_member(workspace_id, auth.uid()));

-- Evidence: Accessible by workspace members
CREATE POLICY "View evidence" ON evidence
    FOR SELECT USING (is_workspace_member(workspace_id, auth.uid()));

-- Findings: Accessible by workspace members
CREATE POLICY "View findings" ON findings
    FOR SELECT USING (is_workspace_member(workspace_id, auth.uid()));

-- Decisions: Accessible by workspace members
CREATE POLICY "View decisions" ON decisions
    FOR SELECT USING (is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Manage decisions" ON decisions
    FOR ALL USING (is_workspace_member(workspace_id, auth.uid()));

-- Actions: Accessible by workspace members
CREATE POLICY "View actions" ON actions
    FOR SELECT USING (is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Manage actions" ON actions
    FOR ALL USING (is_workspace_member(workspace_id, auth.uid()));

-- Reports: Accessible by workspace members
CREATE POLICY "View reports" ON reports
    FOR SELECT USING (is_workspace_member(workspace_id, auth.uid()));

-- Activity Logs: Accessible by workspace members
CREATE POLICY "View activity logs" ON activity_logs
    FOR SELECT USING (is_workspace_member(workspace_id, auth.uid()));

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_sources_workspace ON sources(workspace_id);
CREATE INDEX IF NOT EXISTS idx_facts_workspace ON facts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_conflicts_workspace ON conflicts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_evidence_workspace ON evidence(workspace_id);
CREATE INDEX IF NOT EXISTS idx_findings_workspace ON findings(workspace_id);
CREATE INDEX IF NOT EXISTS idx_decisions_workspace ON decisions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_actions_workspace ON actions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_activity_workspace ON activity_logs(workspace_id);
