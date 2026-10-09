import { supabase } from '../lib/supabase';
import { Conflict, ConflictStatus } from '../types';
import { safeMutation } from './safeSupabase';
import { generateId, isUUID } from '../lib/uuid';

const STORAGE_KEY_CONFLICTS = 'infofusion_conflicts_v3';

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

export const contradictionService = {
  getContradictions(workspaceId: string): Conflict[] {
    const list = getLocal<Conflict[]>(STORAGE_KEY_CONFLICTS, []);
    return list.filter(c => c.workspace_id === workspaceId);
  },

  addContradictions(workspaceId: string, items: Conflict[]): void {
    const list = getLocal<Conflict[]>(STORAGE_KEY_CONFLICTS, []);
    const updated = [...items, ...list];
    setLocal(STORAGE_KEY_CONFLICTS, updated);

    if (supabase && items.length > 0) {
      safeMutation(
        supabase.from('contradictions').insert(
          items.map(c => ({
            id: isUUID(c.id) ? c.id : generateId(),
            workspace_id: workspaceId,
            fact_a_id: isUUID(c.fact_a_id) ? c.fact_a_id : null,
            fact_b_id: isUUID(c.fact_b_id) ? c.fact_b_id : null,
            description: c.difference_summary || c.explanation || 'Discrepancy detected between claims',
            severity: c.severity,
            status: c.status,
            explanation: c.explanation,
            confidence: c.confidence,
          }))
        )
      );
    }
  },

  updateContradictionStatus(
    id: string, 
    status: ConflictStatus, 
    resolutionNote?: string, 
    resolvedBy?: string
  ): void {
    const list = getLocal<Conflict[]>(STORAGE_KEY_CONFLICTS, []);
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      if (resolutionNote) list[idx].resolution_note = resolutionNote;
      if (resolvedBy) list[idx].resolved_by = resolvedBy;
      if (status === 'resolved') list[idx].resolved_at = new Date().toISOString();
      setLocal(STORAGE_KEY_CONFLICTS, list);
    }

    if (supabase) {
      safeMutation(
        supabase.from('contradictions').update({
          status,
          resolution_note: resolutionNote,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        }).eq('id', id)
      );
    }
  }
};

// Aliased export for compatibility
export const conflictService = {
  getConflicts: contradictionService.getContradictions,
  addConflicts: contradictionService.addContradictions,
  updateConflictStatus: contradictionService.updateContradictionStatus,
};
