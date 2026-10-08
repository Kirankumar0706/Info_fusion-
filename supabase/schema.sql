-- ====================================================================
-- INFOFUSION: ENTERPRISE SUPABASE MULTI-ORGANIZATION SCHEMA & RLS
-- "From scattered information to trusted decisions."
-- ====================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. ORGANIZATIONS & MEMBERSHIP
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Profiles table for user metadata
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    organization_name TEXT,
    role TEXT DEFAULT 'Intelligence Lead',
    preferred_language TEXT DEFAULT 'en',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 2. WORKSPACES
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    use_case TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'review_required', 'completed')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 3. DOCUMENTS & CHUNKS
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    storage_path TEXT,
    file_size BIGINT DEFAULT 0,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    processing_status TEXT DEFAULT 'ready' CHECK (processing_status IN ('uploading', 'extracting', 'structuring', 'analyzing', 'ready', 'completed', 'failed')),
    extracted_text TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    page_number INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 4. FACTS & EVIDENCE
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    fact_text TEXT NOT NULL,
    fact_type TEXT DEFAULT 'general',
    value TEXT NOT NULL,
    source_location TEXT,
    confidence NUMERIC(4, 3) DEFAULT 0.950,
    verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN ('verified', 'uncertain', 'unverified')),
    normalized_key TEXT,
    normalized_value TEXT,
    category TEXT DEFAULT 'general',
    status TEXT DEFAULT 'supported' CHECK (status IN ('supported', 'uncertain', 'conflicting', 'missing_evidence')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    fact_id UUID REFERENCES public.facts(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    source_location TEXT,
    evidence_text TEXT NOT NULL,
    evidence_type TEXT DEFAULT 'direct_statement',
    confidence NUMERIC(4, 3) DEFAULT 0.950,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 5. CONTRADICTIONS & EVIDENCE GAPS
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.contradictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    fact_a_id UUID NOT NULL REFERENCES public.facts(id) ON DELETE CASCADE,
    fact_b_id UUID NOT NULL REFERENCES public.facts(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'high' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed', 'unresolved', 'investigating')),
    explanation TEXT,
    confidence NUMERIC(4, 3) DEFAULT 0.960,
    resolution_note TEXT,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.evidence_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    fact_id UUID REFERENCES public.facts(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    required_evidence TEXT NOT NULL,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'evidence_required', 'under_review', 'resolved', 'unverified')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 6. FINDINGS, DECISIONS & ACTIONS
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'high' CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
    supporting_fact_ids JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'mitigated', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    decision TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    status TEXT DEFAULT 'review_required' CHECK (status IN ('approved', 'rejected', 'review_required', 'draft', 'ready', 'blocked', 'insufficient_evidence')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    decision_id UUID REFERENCES public.decisions(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'high' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked')),
    assigned_to TEXT,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 7. REPORTS & ACTIVITY LOGS
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 8. COMPATIBILITY VIEWS (for seamless frontend & backend interop)
-- ====================================================================

CREATE OR REPLACE VIEW public.sources AS 
    SELECT * FROM public.documents;

CREATE OR REPLACE VIEW public.conflicts AS 
    SELECT * FROM public.contradictions;

-- ====================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contradictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID, u_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = org_id AND user_id = u_id
    ) OR EXISTS (
        SELECT 1 FROM public.organizations
        WHERE id = org_id AND created_by = u_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID, u_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT organization_id INTO org_id FROM public.workspaces WHERE id = ws_id;
    IF org_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN public.is_org_member(org_id, u_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organization Policies
CREATE POLICY "Users can view their organizations" ON public.organizations
    FOR SELECT USING (public.is_org_member(id, auth.uid()));

CREATE POLICY "Users can create organizations" ON public.organizations
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners can update organization" ON public.organizations
    FOR UPDATE USING (auth.uid() = created_by);

-- Organization Members Policies
CREATE POLICY "Members can view membership" ON public.organization_members
    FOR SELECT USING (public.is_org_member(organization_id, auth.uid()));

CREATE POLICY "Owners can insert membership" ON public.organization_members
    FOR INSERT WITH CHECK (public.is_org_member(organization_id, auth.uid()));

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Workspace Policies
CREATE POLICY "Members can view workspaces" ON public.workspaces
    FOR SELECT USING (public.is_org_member(organization_id, auth.uid()));

CREATE POLICY "Members can create workspaces" ON public.workspaces
    FOR INSERT WITH CHECK (public.is_org_member(organization_id, auth.uid()));

CREATE POLICY "Members can update workspaces" ON public.workspaces
    FOR UPDATE USING (public.is_org_member(organization_id, auth.uid()));

CREATE POLICY "Members can delete workspaces" ON public.workspaces
    FOR DELETE USING (public.is_org_member(organization_id, auth.uid()));

-- Documents Policies
CREATE POLICY "Manage documents" ON public.documents
    FOR ALL USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Manage chunks" ON public.document_chunks
    FOR ALL USING (public.is_workspace_member(workspace_id, auth.uid()));

-- Facts Policies
CREATE POLICY "Manage facts" ON public.facts
    FOR ALL USING (public.is_workspace_member(workspace_id, auth.uid()));

-- Evidence Policies
CREATE POLICY "Manage evidence" ON public.evidence
    FOR ALL USING (public.is_workspace_member(workspace_id, auth.uid()));

-- Contradictions Policies
CREATE POLICY "Manage contradictions" ON public.contradictions
    FOR ALL USING (public.is_workspace_member(workspace_id, auth.uid()));

-- Evidence Gaps Policies
CREATE POLICY "Manage evidence gaps" ON public.evidence_gaps
    FOR ALL USING (public.is_workspace_member(workspace_id, auth.uid()));

-- Findings Policies
CREATE POLICY "Manage findings" ON public.findings
    FOR ALL USING (public.is_workspace_member(workspace_id, auth.uid()));

-- Decisions Policies
CREATE POLICY "Manage decisions" ON public.decisions
    FOR ALL USING (public.is_workspace_member(workspace_id, auth.uid()));

-- Actions Policies
CREATE POLICY "Manage actions" ON public.actions
    FOR ALL USING (public.is_workspace_member(workspace_id, auth.uid()));

-- Reports Policies
CREATE POLICY "Manage reports" ON public.reports
    FOR ALL USING (public.is_workspace_member(workspace_id, auth.uid()));

-- Activity Logs Policies
CREATE POLICY "Manage activity logs" ON public.activity_logs
    FOR ALL USING (public.is_workspace_member(workspace_id, auth.uid()));

-- ====================================================================
-- 10. STORAGE BUCKET CONFIGURATION
-- ====================================================================

-- Ensure the workspace-documents bucket exists in Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-documents', 'workspace-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for documents bucket
CREATE POLICY "Workspace members can upload documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'workspace-documents' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Workspace members can read documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'workspace-documents' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Workspace members can delete documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'workspace-documents' AND
        auth.role() = 'authenticated'
    );

-- ====================================================================
-- 11. INDEXES FOR HIGH-PERFORMANCE INTELLIGENCE QUERIES
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_workspaces_org ON public.workspaces(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_ws ON public.documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_chunks_doc ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_facts_ws ON public.facts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_facts_doc ON public.facts(document_id);
CREATE INDEX IF NOT EXISTS idx_evidence_ws ON public.evidence(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contradictions_ws ON public.contradictions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_gaps_ws ON public.evidence_gaps(workspace_id);
CREATE INDEX IF NOT EXISTS idx_findings_ws ON public.findings(workspace_id);
CREATE INDEX IF NOT EXISTS idx_decisions_ws ON public.decisions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_actions_ws ON public.actions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_reports_ws ON public.reports(workspace_id);
CREATE INDEX IF NOT EXISTS idx_activity_ws ON public.activity_logs(workspace_id);
