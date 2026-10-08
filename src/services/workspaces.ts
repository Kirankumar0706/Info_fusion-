import { supabase } from '../lib/supabase';
import { Workspace } from '../types';

const STORAGE_KEY_WORKSPACES = 'infofusion_workspaces_v3';

function getLocal<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to store ${key}:`, err);
  }
}

export const workspaceService = {
  getWorkspaces(orgId?: string): Workspace[] {
    const list = getLocal<Workspace[]>(STORAGE_KEY_WORKSPACES, []);
    if (orgId) {
      return list.filter(w => !w.organization_id || w.organization_id === orgId);
    }
    return list;
  },

  async fetchWorkspacesAsync(orgId?: string): Promise<Workspace[]> {
    if (supabase) {
      try {
        let query = supabase.from('workspaces').select('*').order('created_at', { ascending: false });
        if (orgId) {
          query = query.eq('organization_id', orgId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const mapped: Workspace[] = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            organization_id: d.organization_id,
            organization: d.organization || 'Enterprise Org',
            description: d.description || '',
            industry: d.industry,
            use_case: d.use_case,
            owner_id: d.created_by || d.owner_id || 'user-current',
            status: d.status || 'active',
            created_at: d.created_at,
            updated_at: d.updated_at || d.created_at,
          }));
          setLocal(STORAGE_KEY_WORKSPACES, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetchWorkspaces fallback:', err);
      }
    }
    return this.getWorkspaces(orgId);
  },

  getWorkspace(id: string): Workspace | null {
    const list = this.getWorkspaces();
    return list.find(w => w.id === id) || null;
  },

  createWorkspace(data: {
    name: string;
    organization: string;
    organization_id?: string;
    description: string;
    industry?: string;
    use_case?: string;
    owner_id?: string;
  }): Workspace {
    const list = this.getWorkspaces();
    const newWs: Workspace = {
      id: `ws-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      organization_id: data.organization_id,
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
    setLocal(STORAGE_KEY_WORKSPACES, list);

    // Asynchronously replicate to Supabase if available
    if (supabase && data.owner_id && data.organization_id) {
      (async () => {
        try {
          await supabase.from('workspaces').insert({
            organization_id: data.organization_id,
            name: newWs.name,
            description: newWs.description,
            industry: newWs.industry,
            use_case: newWs.use_case,
            created_by: data.owner_id,
            status: 'active',
          });
        } catch (err) {
          console.warn('Supabase insert workspace:', err);
        }
      })();
    }

    return newWs;
  },

  updateWorkspace(id: string, updates: Partial<Workspace>): Workspace | null {
    const list = this.getWorkspaces();
    const idx = list.findIndex(w => w.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    setLocal(STORAGE_KEY_WORKSPACES, list);

    if (supabase) {
      (async () => {
        try {
          await supabase.from('workspaces').update({
            name: list[idx].name,
            description: list[idx].description,
            status: list[idx].status,
          }).eq('id', id);
        } catch {}
      })();
    }

    return list[idx];
  },

  deleteWorkspace(id: string): void {
    const list = this.getWorkspaces().filter(w => w.id !== id);
    setLocal(STORAGE_KEY_WORKSPACES, list);

    // Cascade delete workspace data across all local collections
    const cascadeKeys = [
      'infofusion_sources_v3',
      'infofusion_facts_v3',
      'infofusion_conflicts_v3',
      'infofusion_evidence_v3',
      'infofusion_evidence_gaps_v3',
      'infofusion_findings_v3',
      'infofusion_decisions_v3',
      'infofusion_actions_v3',
      'infofusion_reports_v3',
      'infofusion_activity_v3',
    ];

    cascadeKeys.forEach(k => {
      const items = getLocal<Array<{ workspace_id: string }>>(k, []).filter(item => item.workspace_id !== id);
      setLocal(k, items);
    });

    if (supabase) {
      (async () => {
        try {
          await supabase.from('workspaces').delete().eq('id', id);
        } catch {}
      })();
    }
  }
};
