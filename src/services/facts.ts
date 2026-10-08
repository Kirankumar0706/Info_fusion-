import { supabase } from '../lib/supabase';
import { Fact } from '../types';
import { safeMutation } from './safeSupabase';

const STORAGE_KEY_FACTS = 'infofusion_facts_v3';

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

export const factService = {
  getFacts(workspaceId: string): Fact[] {
    const list = getLocal<Fact[]>(STORAGE_KEY_FACTS, []);
    return list.filter(f => f.workspace_id === workspaceId);
  },

  async fetchFactsAsync(workspaceId: string): Promise<Fact[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('facts')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data as Fact[];
        }
      } catch (err) {
        console.warn('Supabase fetchFactsAsync fallback:', err);
      }
    }
    return this.getFacts(workspaceId);
  },

  addFacts(workspaceId: string, newFacts: Fact[]): void {
    const list = getLocal<Fact[]>(STORAGE_KEY_FACTS, []);
    const updated = [...newFacts, ...list];
    setLocal(STORAGE_KEY_FACTS, updated);

    if (supabase && newFacts.length > 0) {
      safeMutation(
        supabase.from('facts').insert(
          newFacts.map(f => ({
            workspace_id: workspaceId,
            document_id: f.document_id || (f.source_id.startsWith('src-') ? undefined : f.source_id),
            fact_text: f.claim || f.fact_text || '',
            fact_type: f.category || f.fact_type || 'general',
            value: f.value || f.normalized_value || '',
            source_location: f.source_location,
            confidence: f.confidence,
            verification_status: f.verification_status || 'verified',
            normalized_key: f.normalized_key,
            normalized_value: f.normalized_value,
            status: f.status,
          }))
        )
      );
    }
  },

  updateFact(id: string, updates: Partial<Fact>): void {
    const list = getLocal<Fact[]>(STORAGE_KEY_FACTS, []);
    const idx = list.findIndex(f => f.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
      setLocal(STORAGE_KEY_FACTS, list);
    }
  }
};
