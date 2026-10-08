import { supabase } from '../lib/supabase';
import { ActivityLog } from '../types';
import { safeMutation } from './safeSupabase';

const STORAGE_KEY_ACTIVITY = 'infofusion_activity_v3';

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

export const activityService = {
  getActivityLogs(workspaceId: string): ActivityLog[] {
    const list = getLocal<ActivityLog[]>(STORAGE_KEY_ACTIVITY, []);
    return list.filter(a => a.workspace_id === workspaceId);
  },

  logActivity(
    workspaceId: string, 
    entry: {
      user_name?: string;
      action_type: string;
      entity_type: string;
      entity_title: string;
      user_id?: string;
      metadata?: Record<string, unknown>;
    }
  ): ActivityLog {
    const list = getLocal<ActivityLog[]>(STORAGE_KEY_ACTIVITY, []);
    const newLog: ActivityLog = {
      id: `actlog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      workspace_id: workspaceId,
      user_id: entry.user_id,
      user_name: entry.user_name || 'System Analyst',
      action_type: entry.action_type,
      entity_type: entry.entity_type,
      entity_title: entry.entity_title,
      metadata: entry.metadata,
      timestamp: new Date().toISOString(),
    };

    list.unshift(newLog);
    setLocal(STORAGE_KEY_ACTIVITY, list.slice(0, 100)); // Cap to latest 100

    if (supabase) {
      safeMutation(
        supabase.from('activity_logs').insert({
          workspace_id: workspaceId,
          user_id: entry.user_id || null,
          action: entry.action_type,
          entity_type: entry.entity_type,
          metadata: { ...entry.metadata, title: entry.entity_title, user_name: entry.user_name },
        })
      );
    }

    return newLog;
  }
};
