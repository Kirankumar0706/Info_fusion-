import { supabase } from '../lib/supabase';
import { Organization, OrganizationMember } from '../types';

const STORAGE_KEY_ORGS = 'infofusion_organizations_v3';
const STORAGE_KEY_MEMBERS = 'infofusion_org_members_v3';

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

export const organizationService = {
  async getOrganizations(): Promise<Organization[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setLocal(STORAGE_KEY_ORGS, data);
          return data as Organization[];
        }
      } catch (err) {
        console.warn('Supabase organizations fetch skipped, using local store:', err);
      }
    }
    return getLocal<Organization[]>(STORAGE_KEY_ORGS, []);
  },

  async createOrganization(name: string, userId?: string): Promise<Organization> {
    const newOrg: Organization = {
      id: `org-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      created_by: userId,
      created_at: new Date().toISOString(),
    };

    if (supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .insert({
            name: newOrg.name,
            created_by: userId,
          })
          .select()
          .single();

        if (!error && data) {
          const org = data as Organization;
          // Also register owner member
          await supabase.from('organization_members').insert({
            organization_id: org.id,
            user_id: userId,
            role: 'owner',
          });
          const list = getLocal<Organization[]>(STORAGE_KEY_ORGS, []);
          setLocal(STORAGE_KEY_ORGS, [org, ...list]);
          return org;
        }
      } catch (err) {
        console.warn('Supabase createOrganization fallback:', err);
      }
    }

    // Local fallback
    const list = getLocal<Organization[]>(STORAGE_KEY_ORGS, []);
    list.unshift(newOrg);
    setLocal(STORAGE_KEY_ORGS, list);

    if (userId) {
      const members = getLocal<OrganizationMember[]>(STORAGE_KEY_MEMBERS, []);
      members.push({
        id: `mem-${Date.now()}`,
        organization_id: newOrg.id,
        user_id: userId,
        role: 'owner',
        created_at: new Date().toISOString(),
      });
      setLocal(STORAGE_KEY_MEMBERS, members);
    }

    return newOrg;
  },

  async getMembers(organizationId: string): Promise<OrganizationMember[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('organization_members')
          .select('*')
          .eq('organization_id', organizationId);
        if (!error && data) {
          return data as OrganizationMember[];
        }
      } catch {}
    }
    const members = getLocal<OrganizationMember[]>(STORAGE_KEY_MEMBERS, []);
    return members.filter(m => m.organization_id === organizationId);
  }
};
