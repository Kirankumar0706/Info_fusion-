import { supabase } from '../lib/supabase';
import { EvidenceItem, EvidenceGap } from '../types';
import { safeMutation } from './safeSupabase';
import { generateId, isUUID } from '../lib/uuid';

const STORAGE_KEY_EVIDENCE = 'infofusion_evidence_v3';
const STORAGE_KEY_GAPS = 'infofusion_evidence_gaps_v3';

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

export const evidenceService = {
  getEvidenceItems(workspaceId: string): EvidenceItem[] {
    const list = getLocal<EvidenceItem[]>(STORAGE_KEY_EVIDENCE, []);
    return list.filter(e => e.workspace_id === workspaceId);
  },

  addEvidenceItems(workspaceId: string, items: EvidenceItem[]): void {
    const list = getLocal<EvidenceItem[]>(STORAGE_KEY_EVIDENCE, []);
    const updated = [...items, ...list];
    setLocal(STORAGE_KEY_EVIDENCE, updated);

    if (supabase && items.length > 0) {
      safeMutation(
        supabase.from('evidence').insert(
          items.map(e => ({
            id: isUUID(e.id) ? e.id : generateId(),
            workspace_id: workspaceId,
            fact_id: isUUID(e.fact_id) ? e.fact_id : null,
            source_location: e.source_location,
            evidence_text: e.evidence_text,
            evidence_type: e.evidence_type || 'direct_statement',
            confidence: e.confidence,
          }))
        )
      );
    }
  },

  getEvidenceGaps(workspaceId: string): EvidenceGap[] {
    const list = getLocal<EvidenceGap[]>(STORAGE_KEY_GAPS, []);
    return list.filter(g => g.workspace_id === workspaceId);
  },

  addEvidenceGaps(workspaceId: string, gaps: EvidenceGap[]): void {
    const list = getLocal<EvidenceGap[]>(STORAGE_KEY_GAPS, []);
    const updated = [...gaps, ...list];
    setLocal(STORAGE_KEY_GAPS, updated);

    if (supabase && gaps.length > 0) {
      safeMutation(
        supabase.from('evidence_gaps').insert(
          gaps.map(g => ({
            id: isUUID(g.id) ? g.id : generateId(),
            workspace_id: workspaceId,
            fact_id: isUUID(g.fact_id) ? g.fact_id : null,
            description: g.claim || g.description || '',
            required_evidence: g.recommended_action || g.required_evidence || 'Direct verification certificate required',
            severity: g.severity || 'medium',
            status: g.status,
          }))
        )
      );
    }
  },

  updateEvidenceGapStatus(id: string, status: EvidenceGap['status']): void {
    const list = getLocal<EvidenceGap[]>(STORAGE_KEY_GAPS, []);
    const idx = list.findIndex(g => g.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      setLocal(STORAGE_KEY_GAPS, list);
    }
  }
};
