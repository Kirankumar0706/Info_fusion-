import { supabase } from '../lib/supabase';
import { Finding } from '../types';
import { safeMutation } from './safeSupabase';
import { generateId, isUUID } from '../lib/uuid';

const STORAGE_KEY_FINDINGS = 'infofusion_findings_v3';

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

export const findingService = {
  getFindings(workspaceId: string): Finding[] {
    const list = getLocal<Finding[]>(STORAGE_KEY_FINDINGS, []);
    return list.filter(f => f.workspace_id === workspaceId);
  },

  addFindings(workspaceId: string, items: Finding[]): void {
    const list = getLocal<Finding[]>(STORAGE_KEY_FINDINGS, []);
    const updated = [...items, ...list];
    setLocal(STORAGE_KEY_FINDINGS, updated);

    if (supabase && items.length > 0) {
      safeMutation(
        supabase.from('findings').insert(
          items.map(f => ({
            id: isUUID(f.id) ? f.id : generateId(),
            workspace_id: workspaceId,
            title: f.title,
            description: f.description,
            severity: f.severity,
            supporting_fact_ids: f.supporting_facts || [],
            status: f.status,
          }))
        )
      );
    }
  }
};

// Aliased export for compatibility
export const intelligenceService = {
  getFindings: findingService.getFindings,
  addFindings: findingService.addFindings,
};
