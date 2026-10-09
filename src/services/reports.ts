import { supabase } from '../lib/supabase';
import { ReportItem } from '../types';
import { safeMutation } from './safeSupabase';
import { generateId, isUUID } from '../lib/uuid';

const STORAGE_KEY_REPORTS = 'infofusion_reports_v3';

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

export const reportService = {
  getReports(workspaceId: string): ReportItem[] {
    const list = getLocal<ReportItem[]>(STORAGE_KEY_REPORTS, []);
    return list.filter(r => r.workspace_id === workspaceId);
  },

  createReport(report: ReportItem): void {
    const list = getLocal<ReportItem[]>(STORAGE_KEY_REPORTS, []);
    list.unshift(report);
    setLocal(STORAGE_KEY_REPORTS, list);

    if (supabase) {
      safeMutation(
        supabase.from('reports').insert({
          id: isUUID(report.id) ? report.id : generateId(),
          workspace_id: report.workspace_id,
          report_type: report.report_type,
          title: report.title,
          content: report.summary,
        })
      );
    }
  }
};
