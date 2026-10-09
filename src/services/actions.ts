import { supabase } from '../lib/supabase';
import { ActionItem, ActionStatus } from '../types';
import { safeMutation } from './safeSupabase';
import { generateId, isUUID } from '../lib/uuid';

const STORAGE_KEY_ACTIONS = 'infofusion_actions_v3';

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

export const actionService = {
  getActions(workspaceId: string): ActionItem[] {
    const list = getLocal<ActionItem[]>(STORAGE_KEY_ACTIONS, []);
    return list.filter(a => a.workspace_id === workspaceId);
  },

  createAction(action: ActionItem): void {
    const list = getLocal<ActionItem[]>(STORAGE_KEY_ACTIONS, []);
    list.unshift(action);
    setLocal(STORAGE_KEY_ACTIONS, list);

    if (supabase) {
      safeMutation(
        supabase.from('actions').insert({
          id: isUUID(action.id) ? action.id : generateId(),
          workspace_id: action.workspace_id,
          decision_id: isUUID(action.decision_id) ? action.decision_id : null,
          title: action.title,
          description: action.description,
          priority: action.priority,
          status: action.status,
          assigned_to: action.assigned_to,
          due_date: action.due_date || null,
        })
      );
    }
  },

  updateActionStatus(id: string, status: ActionStatus): void {
    const list = getLocal<ActionItem[]>(STORAGE_KEY_ACTIONS, []);
    const idx = list.findIndex(a => a.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      list[idx].updated_at = new Date().toISOString();
      setLocal(STORAGE_KEY_ACTIONS, list);
    }

    if (supabase) {
      safeMutation(supabase.from('actions').update({ status }).eq('id', id));
    }
  }
};
