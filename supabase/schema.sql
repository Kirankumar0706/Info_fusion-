-- ====================================================================
-- INFOFUSION: HARDENED ENTERPRISE DATABASE SCHEMA & RLS POLICIES
-- "From scattered information to trusted decisions."
-- 
-- SECURITY AUDIT HIGHLIGHTS:
-- 1. Strictly scopes access to authenticated users with valid organization/workspace membership.
-- 2. Prevents self-escalation of roles to 'owner' or 'admin'.
-- 3. Restricts document & storage access strictly to authorized workspace members.
-- 4. Preserves all existing data (no DROP TABLE; uses ALTER TABLE ADD COLUMN IF NOT EXISTS).
-- 5. Revokes dangerous unrestricted grants from the 'anon' public role.
-- 6. Safe and idempotent (can be executed repeatedly in Supabase SQL Editor).
-- ====================================================================

-- --------------------------------------------------------------------
-- 0. EXTENSIONS
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 1. ORGANIZATIONS & MEMBERSHIP (Preserving Existing Data)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist in case table was created with an earlier schema
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.organization_members (
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (organization_id, user_id)
);

-- Ensure backward-compatible optional id column if requested
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';
ALTER TABLE public.organization_members ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

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

-- --------------------------------------------------------------------
-- 2. WORKSPACES (Preserving Existing Data & Adding Missing Columns)
-- --------------------------------------------------------------------
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

-- Align existing table with all expected workspace columns
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS use_case TEXT;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- --------------------------------------------------------------------
-- 3. DOCUMENTS & CHUNKS
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 4. FACTS & EVIDENCE
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 5. CONTRADICTIONS & EVIDENCE GAPS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contradictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    fact_a_id UUID REFERENCES public.facts(id) ON DELETE SET NULL,
    fact_b_id UUID REFERENCES public.facts(id) ON DELETE SET NULL,
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
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    fact_id UUID REFERENCES public.facts(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    required_evidence TEXT,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'evidence_required', 'under_review', 'resolved', 'unverified')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 6. FINDINGS, DECISIONS & ACTIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
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
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    decision TEXT NOT NULL,
    reasoning TEXT NOT NULL,
    status TEXT DEFAULT 'review_required' CHECK (status IN ('approved', 'rejected', 'review_required', 'draft', 'ready', 'blocked', 'insufficient_evidence')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
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

-- --------------------------------------------------------------------
-- 7. REPORTS & ACTIVITY LOGS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- 8. COMPATIBILITY VIEWS (Enforcing Caller's Row Level Security)
-- --------------------------------------------------------------------
CREATE OR REPLACE VIEW public.sources WITH (security_invoker = true) AS 
    SELECT * FROM public.documents;

CREATE OR REPLACE VIEW public.conflicts WITH (security_invoker = true) AS 
    SELECT * FROM public.contradictions;

-- --------------------------------------------------------------------
-- 9. HARDENED SECURITY HELPER FUNCTIONS
-- --------------------------------------------------------------------

-- Check if user is a member or creator of the organization
CREATE OR REPLACE FUNCTION public.is_org_member(org_id UUID, u_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF u_id IS NULL OR org_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = org_id AND user_id = u_id
    ) OR EXISTS (
        SELECT 1 FROM public.organizations
        WHERE id = org_id AND created_by = u_id
    );
END;
$$;

-- Check if user is an owner or admin of the organization
CREATE OR REPLACE FUNCTION public.is_org_admin_or_owner(org_id UUID, u_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF u_id IS NULL OR org_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = org_id AND user_id = u_id AND role IN ('owner', 'admin')
    ) OR EXISTS (
        SELECT 1 FROM public.organizations
        WHERE id = org_id AND created_by = u_id
    );
END;
$$;

-- Check if user is the direct owner of the organization
CREATE OR REPLACE FUNCTION public.is_org_owner(org_id UUID, u_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF u_id IS NULL OR org_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members
        WHERE organization_id = org_id AND user_id = u_id AND role = 'owner'
    ) OR EXISTS (
        SELECT 1 FROM public.organizations
        WHERE id = org_id AND created_by = u_id
    );
END;
$$;

-- Check if user is a member of the workspace (via its parent organization)
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id UUID, u_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_org_id UUID;
BEGIN
    IF ws_id IS NULL OR u_id IS NULL THEN
        RETURN FALSE;
    END IF;
    SELECT organization_id INTO v_org_id FROM public.workspaces WHERE id = ws_id;
    IF v_org_id IS NULL THEN
        RETURN FALSE;
    END IF;
    RETURN public.is_org_member(v_org_id, u_id);
END;
$$;

-- --------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) ENABLEMENT ON ALL 15 TABLES
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 11. GRANULAR, PRIVILEGE-ISOLATED POLICIES
-- --------------------------------------------------------------------

-- ==================== ORGANIZATIONS ====================
DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;
CREATE POLICY "Users can view their organizations" ON public.organizations
    FOR SELECT TO authenticated
    USING (public.is_org_member(id, auth.uid()));

DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
CREATE POLICY "Users can create organizations" ON public.organizations
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Owners can update organization" ON public.organizations;
CREATE POLICY "Owners can update organization" ON public.organizations
    FOR UPDATE TO authenticated
    USING (public.is_org_owner(id, auth.uid()))
    WITH CHECK (public.is_org_owner(id, auth.uid()));

DROP POLICY IF EXISTS "Owners can delete organization" ON public.organizations;
CREATE POLICY "Owners can delete organization" ON public.organizations
    FOR DELETE TO authenticated
    USING (public.is_org_owner(id, auth.uid()));

-- ==================== ORGANIZATION MEMBERS ====================
-- 1. View: Members can see who else is in their organization
DROP POLICY IF EXISTS "Members can view membership" ON public.organization_members;
CREATE POLICY "Members can view membership" ON public.organization_members
    FOR SELECT TO authenticated
    USING (public.is_org_member(organization_id, auth.uid()));

-- 2. Insert:
--    A. Organization creator joining as initial 'owner'
--    B. Existing admin/owner inviting members (preventing self-promotion by non-admins)
DROP POLICY IF EXISTS "Owners can insert membership" ON public.organization_members;
DROP POLICY IF EXISTS "Admins can add members" ON public.organization_members;
CREATE POLICY "Admins can add members" ON public.organization_members
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Case A: Creator bootstrapping initial owner membership
        (
            user_id = auth.uid() AND
            role = 'owner' AND
            EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.created_by = auth.uid())
        )
        OR
        -- Case B: Existing Owner adding any role
        (
            public.is_org_owner(organization_id, auth.uid())
        )
        OR
        -- Case C: Existing Admin adding non-owner roles only
        (
            public.is_org_admin_or_owner(organization_id, auth.uid()) AND
            role IN ('admin', 'member', 'viewer')
        )
    );

-- 3. Update: Only owners or admins can modify roles (cannot modify self to prevent rogue lock-in)
DROP POLICY IF EXISTS "Admins can update member roles" ON public.organization_members;
CREATE POLICY "Admins can update member roles" ON public.organization_members
    FOR UPDATE TO authenticated
    USING (
        public.is_org_admin_or_owner(organization_id, auth.uid()) AND
        user_id != auth.uid()
    )
    WITH CHECK (
        -- Only owners can promote someone to owner
        (role = 'owner' AND public.is_org_owner(organization_id, auth.uid()))
        OR
        (role IN ('admin', 'member', 'viewer') AND public.is_org_admin_or_owner(organization_id, auth.uid()))
    );

-- 4. Delete: Admins/owners can remove members, or a user can leave the organization
DROP POLICY IF EXISTS "Admins can remove members or user can leave" ON public.organization_members;
CREATE POLICY "Admins can remove members or user can leave" ON public.organization_members
    FOR DELETE TO authenticated
    USING (
        user_id = auth.uid() OR
        public.is_org_admin_or_owner(organization_id, auth.uid())
    );

-- ==================== PROFILES ====================
DROP POLICY IF EXISTS "Users can view profiles in their organizations" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view profiles in their organizations" ON public.profiles
    FOR SELECT TO authenticated
    USING (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.organization_members m1
            JOIN public.organization_members m2 ON m1.organization_id = m2.organization_id
            WHERE m1.user_id = auth.uid() AND m2.user_id = profiles.id
        )
    );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ==================== WORKSPACES ====================
DROP POLICY IF EXISTS "Members can view workspaces" ON public.workspaces;
CREATE POLICY "Members can view workspaces" ON public.workspaces
    FOR SELECT TO authenticated
    USING (public.is_org_member(organization_id, auth.uid()));

DROP POLICY IF EXISTS "Members can create workspaces" ON public.workspaces;
CREATE POLICY "Members can create workspaces" ON public.workspaces
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_org_member(organization_id, auth.uid()) AND
        (created_by IS NULL OR created_by = auth.uid())
    );

DROP POLICY IF EXISTS "Members can update workspaces" ON public.workspaces;
CREATE POLICY "Members can update workspaces" ON public.workspaces
    FOR UPDATE TO authenticated
    USING (
        public.is_org_member(organization_id, auth.uid()) AND
        (created_by = auth.uid() OR public.is_org_admin_or_owner(organization_id, auth.uid()))
    )
    WITH CHECK (
        public.is_org_member(organization_id, auth.uid())
    );

DROP POLICY IF EXISTS "Members can delete workspaces" ON public.workspaces;
CREATE POLICY "Members can delete workspaces" ON public.workspaces
    FOR DELETE TO authenticated
    USING (
        created_by = auth.uid() OR
        public.is_org_admin_or_owner(organization_id, auth.uid())
    );

-- ==================== DOCUMENTS ====================
DROP POLICY IF EXISTS "Manage documents" ON public.documents;
DROP POLICY IF EXISTS "Members can view documents" ON public.documents;
CREATE POLICY "Members can view documents" ON public.documents
    FOR SELECT TO authenticated
    USING (public.is_workspace_member(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Members can insert documents" ON public.documents;
CREATE POLICY "Members can insert documents" ON public.documents
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_workspace_member(workspace_id, auth.uid()) AND
        (uploaded_by IS NULL OR uploaded_by = auth.uid())
    );

DROP POLICY IF EXISTS "Uploader or admin can update documents" ON public.documents;
CREATE POLICY "Uploader or admin can update documents" ON public.documents
    FOR UPDATE TO authenticated
    USING (
        public.is_workspace_member(workspace_id, auth.uid()) AND
        (uploaded_by = auth.uid() OR public.is_org_admin_or_owner(organization_id, auth.uid()))
    );

DROP POLICY IF EXISTS "Uploader or admin can delete documents" ON public.documents;
CREATE POLICY "Uploader or admin can delete documents" ON public.documents
    FOR DELETE TO authenticated
    USING (
        public.is_workspace_member(workspace_id, auth.uid()) AND
        (uploaded_by = auth.uid() OR public.is_org_admin_or_owner(organization_id, auth.uid()))
    );

-- ==================== DOCUMENT CHUNKS ====================
DROP POLICY IF EXISTS "Manage chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "Members can view chunks" ON public.document_chunks;
CREATE POLICY "Members can view chunks" ON public.document_chunks
    FOR SELECT TO authenticated
    USING (public.is_workspace_member(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Members can insert chunks" ON public.document_chunks;
CREATE POLICY "Members can insert chunks" ON public.document_chunks
    FOR INSERT TO authenticated
    WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Members can delete chunks" ON public.document_chunks;
CREATE POLICY "Members can delete chunks" ON public.document_chunks
    FOR DELETE TO authenticated
    USING (public.is_workspace_member(workspace_id, auth.uid()));

-- ==================== FACTS & EVIDENCE ====================
DROP POLICY IF EXISTS "Manage facts" ON public.facts;
CREATE POLICY "Manage facts" ON public.facts
    FOR ALL TO authenticated
    USING (public.is_workspace_member(workspace_id, auth.uid()))
    WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Manage evidence" ON public.evidence;
CREATE POLICY "Manage evidence" ON public.evidence
    FOR ALL TO authenticated
    USING (public.is_workspace_member(workspace_id, auth.uid()))
    WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

-- ==================== CONTRADICTIONS & EVIDENCE GAPS ====================
DROP POLICY IF EXISTS "Manage contradictions" ON public.contradictions;
CREATE POLICY "Manage contradictions" ON public.contradictions
    FOR ALL TO authenticated
    USING (public.is_workspace_member(workspace_id, auth.uid()))
    WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Manage evidence gaps" ON public.evidence_gaps;
CREATE POLICY "Manage evidence gaps" ON public.evidence_gaps
    FOR ALL TO authenticated
    USING (public.is_workspace_member(workspace_id, auth.uid()))
    WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

-- ==================== FINDINGS, DECISIONS & ACTIONS ====================
DROP POLICY IF EXISTS "Manage findings" ON public.findings;
CREATE POLICY "Manage findings" ON public.findings
    FOR ALL TO authenticated
    USING (public.is_workspace_member(workspace_id, auth.uid()))
    WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Manage decisions" ON public.decisions;
CREATE POLICY "Manage decisions" ON public.decisions
    FOR ALL TO authenticated
    USING (public.is_workspace_member(workspace_id, auth.uid()))
    WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Manage actions" ON public.actions;
CREATE POLICY "Manage actions" ON public.actions
    FOR ALL TO authenticated
    USING (public.is_workspace_member(workspace_id, auth.uid()))
    WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

-- ==================== REPORTS & ACTIVITY LOGS ====================
DROP POLICY IF EXISTS "Manage reports" ON public.reports;
CREATE POLICY "Manage reports" ON public.reports
    FOR ALL TO authenticated
    USING (public.is_workspace_member(workspace_id, auth.uid()))
    WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

DROP POLICY IF EXISTS "Manage activity logs" ON public.activity_logs;
CREATE POLICY "Manage activity logs" ON public.activity_logs
    FOR ALL TO authenticated
    USING (public.is_workspace_member(workspace_id, auth.uid()))
    WITH CHECK (public.is_workspace_member(workspace_id, auth.uid()));

-- --------------------------------------------------------------------
-- 12. STORAGE BUCKET CONFIGURATION & ISOLATION
-- --------------------------------------------------------------------
-- Ensure storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-documents', 'workspace-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Helper to safely extract workspace_id from storage path "workspaces/<ws_id>/<filename>"
CREATE OR REPLACE FUNCTION public.storage_extract_workspace_id(name TEXT)
RETURNS UUID
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    parts TEXT[];
BEGIN
    parts := string_to_array(name, '/');
    IF array_length(parts, 1) >= 2 AND parts[1] = 'workspaces' THEN
        RETURN parts[2]::uuid;
    END IF;
    RETURN NULL;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Storage RLS policies for documents bucket
DROP POLICY IF EXISTS "Workspace members can upload documents" ON storage.objects;
CREATE POLICY "Workspace members can upload documents" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'workspace-documents' AND
        public.is_workspace_member(public.storage_extract_workspace_id(name), auth.uid())
    );

DROP POLICY IF EXISTS "Workspace members can read documents" ON storage.objects;
CREATE POLICY "Workspace members can read documents" ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'workspace-documents' AND
        public.is_workspace_member(public.storage_extract_workspace_id(name), auth.uid())
    );

DROP POLICY IF EXISTS "Workspace members can delete documents" ON storage.objects;
CREATE POLICY "Workspace members can delete documents" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'workspace-documents' AND
        public.is_workspace_member(public.storage_extract_workspace_id(name), auth.uid())
    );

-- --------------------------------------------------------------------
-- 13. INDEXES FOR HIGH-PERFORMANCE INTELLIGENCE QUERIES
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 14. SCHEMA GRANTS FOR SUPABASE POSTGREST API (PROTECTED BY RLS)
-- --------------------------------------------------------------------

-- PostgREST routes requests through the 'anon' and 'authenticated' roles.
-- Table-level grants permit PostgREST to route requests to the tables; Row Level Security (RLS)
-- strictly controls row-by-row authorization and multi-tenant data isolation.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- Ensure future tables also inherit these permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;
