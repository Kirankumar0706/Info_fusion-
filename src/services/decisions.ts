import { supabase } from '../lib/supabase';
import { Decision, DecisionStatus } from '../types';
import { safeMutation } from './safeSupabase';
import { generateId, isUUID } from '../lib/uuid';

const STORAGE_KEY_DECISIONS = 'infofusion_decisions_v3';

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

export const decisionService = {
  getDecisions(workspaceId: string): Decision[] {
    const list = getLocal<Decision[]>(STORAGE_KEY_DECISIONS, []);
    return list.filter(d => d.workspace_id === workspaceId);
  },

  createDecision(decision: Decision): void {
    const list = getLocal<Decision[]>(STORAGE_KEY_DECISIONS, []);
    list.unshift(decision);
    setLocal(STORAGE_KEY_DECISIONS, list);

    if (supabase) {
      safeMutation(
        supabase.from('decisions').insert({
          id: isUUID(decision.id) ? decision.id : generateId(),
          workspace_id: decision.workspace_id,
          title: decision.title,
          decision: decision.summary || decision.title,
          reasoning: decision.reasoning || '',
          status: decision.status,
        })
      );
    }
  },

  updateDecision(id: string, status: DecisionStatus, reasoning?: string): void {
    const list = getLocal<Decision[]>(STORAGE_KEY_DECISIONS, []);
    const idx = list.findIndex(d => d.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      if (reasoning) list[idx].reasoning = reasoning;
      list[idx].updated_at = new Date().toISOString();
      setLocal(STORAGE_KEY_DECISIONS, list);
    }

    if (supabase) {
      safeMutation(
        supabase.from('decisions').update({
          status,
          reasoning,
        }).eq('id', id)
      );
    }
  }
};
