import { createClient } from '@supabase/supabase-js';

// Sanitize URL by removing trailing /rest/v1 or trailing slashes
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://ysotsjbcoovxbqpshmat.supabase.co').trim();
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
export const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

// Extract project reference ID (e.g. ysotsjbcoovxbqpshmat)
export const supabaseProjectId = (() => {
  try {
    const u = new URL(supabaseUrl);
    return u.hostname.split('.')[0] || 'ysotsjbcoovxbqpshmat';
  } catch {
    return 'ysotsjbcoovxbqpshmat';
  }
})();

// Create official Supabase client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;

// Local persistence keys for fallback & offline execution
export const STORAGE_KEYS = {
  CURRENT_WORKSPACE: 'infofusion_current_workspace_id',
  WORKSPACES: 'infofusion_workspaces_v1',
  SOURCES: 'infofusion_sources_v1',
  FACTS: 'infofusion_facts_v1',
  CONFLICTS: 'infofusion_conflicts_v1',
  EVIDENCE: 'infofusion_evidence_v1',
  EVIDENCE_GAPS: 'infofusion_evidence_gaps_v1',
  FINDINGS: 'infofusion_findings_v1',
  DECISIONS: 'infofusion_decisions_v1',
  ACTIONS: 'infofusion_actions_v1',
  REPORTS: 'infofusion_reports_v1',
  ACTIVITY: 'infofusion_activity_v1',
  USER_PROFILE: 'infofusion_user_profile_v1',
  SETTINGS: 'infofusion_settings_v1',
};

/**
 * Check connectivity to Supabase backend API
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  authHealthy: boolean;
  tablesCreated: boolean;
  error?: string;
}> {
  if (!supabase) {
    return { connected: false, authHealthy: false, tablesCreated: false, error: 'Supabase client not initialized' };
  }

  try {
    // 1. Test Auth health
    const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: {
        apikey: supabaseAnonKey,
      }
    });
    const authHealthy = res.ok;

    // 2. Test if tables exist (e.g. workspaces table)
    let tablesCreated = false;
    try {
      const { data, error } = await supabase.from('workspaces').select('id').limit(1);
      if (!error) {
        tablesCreated = true;
      } else if (error.code === '42501') {
        // Table exists in Postgres, RLS/grants active
        tablesCreated = true;
      }
    } catch {
      tablesCreated = false;
    }

    return {
      connected: authHealthy,
      authHealthy,
      tablesCreated,
    };
  } catch (err) {
    return {
      connected: false,
      authHealthy: false,
      tablesCreated: false,
      error: (err as Error).message,
    };
  }
}
