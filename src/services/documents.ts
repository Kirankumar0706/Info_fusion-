import { supabase } from '../lib/supabase';
import { Source, DocumentChunk, ProcessingStatus } from '../types';
import { safeMutation } from './safeSupabase';
import { generateId, isUUID } from '../lib/uuid';

const STORAGE_KEY_SOURCES = 'infofusion_sources_v3';
const STORAGE_KEY_CHUNKS = 'infofusion_document_chunks_v3';

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

export const documentService = {
  getDocuments(workspaceId: string): Source[] {
    const list = getLocal<Source[]>(STORAGE_KEY_SOURCES, []);
    return list.filter(s => s.workspace_id === workspaceId);
  },

  async fetchDocumentsAsync(workspaceId: string): Promise<Source[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mapped: Source[] = data.map((d: any) => ({
            id: d.id,
            workspace_id: d.workspace_id,
            organization_id: d.organization_id,
            uploaded_by: d.uploaded_by || 'user-current',
            file_name: d.file_name,
            file_type: d.file_type,
            storage_path: d.storage_path || '',
            file_size: Number(d.file_size) || 0,
            processing_status: (d.processing_status as ProcessingStatus) || 'ready',
            extracted_text: d.extracted_text || '',
            metadata: d.metadata || {},
            facts_count: 0,
            conflicts_count: 0,
            created_at: d.created_at,
            updated_at: d.updated_at || d.created_at,
          }));
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetchDocumentsAsync fallback:', err);
      }
    }
    return this.getDocuments(workspaceId);
  },

  getSource(id: string): Source | null {
    const list = getLocal<Source[]>(STORAGE_KEY_SOURCES, []);
    return list.find(s => s.id === id) || null;
  },

  addSource(source: Source): void {
    const list = getLocal<Source[]>(STORAGE_KEY_SOURCES, []);
    list.unshift(source);
    setLocal(STORAGE_KEY_SOURCES, list);

    if (supabase) {
      safeMutation(
        supabase.from('documents').insert({
          id: isUUID(source.id) ? source.id : undefined,
          workspace_id: source.workspace_id,
          organization_id: isUUID(source.organization_id) ? source.organization_id : undefined,
          uploaded_by: isUUID(source.uploaded_by) ? source.uploaded_by : null,
          file_name: source.file_name,
          file_type: source.file_type,
          storage_path: source.storage_path,
          file_size: source.file_size,
          processing_status: source.processing_status,
          extracted_text: source.extracted_text,
          metadata: source.metadata,
        })
      );
    }
  },

  deleteSource(id: string): void {
    const list = getLocal<Source[]>(STORAGE_KEY_SOURCES, []).filter(s => s.id !== id);
    setLocal(STORAGE_KEY_SOURCES, list);

    if (supabase) {
      safeMutation(supabase.from('documents').delete().eq('id', id));
    }
  },

  updateSourceStatus(id: string, status: ProcessingStatus): void {
    const list = getLocal<Source[]>(STORAGE_KEY_SOURCES, []);
    const idx = list.findIndex(s => s.id === id);
    if (idx !== -1) {
      list[idx].processing_status = status;
      list[idx].updated_at = new Date().toISOString();
      setLocal(STORAGE_KEY_SOURCES, list);
    }
  },

  /**
   * Upload file blob to Supabase Storage bucket ('workspace-documents')
   */
  async uploadFileToStorage(file: File, workspaceId: string): Promise<string> {
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `workspaces/${workspaceId}/${Date.now()}_${sanitizedName}`;

    if (supabase) {
      try {
        const { error } = await supabase.storage
          .from('workspace-documents')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (!error) {
          return storagePath;
        } else {
          console.warn('Supabase storage upload note:', error.message);
        }
      } catch (err) {
        console.warn('Supabase storage upload error:', err);
      }
    }

    return storagePath;
  },

  /**
   * Store extracted document chunks for granular evidence tracing
   */
  storeDocumentChunks(documentId: string, workspaceId: string, fullText: string): DocumentChunk[] {
    const paragraphs = fullText
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 20);

    const chunks: DocumentChunk[] = (paragraphs.length > 0 ? paragraphs : [fullText]).map((content, idx) => ({
      id: generateId(),
      document_id: documentId,
      workspace_id: workspaceId,
      chunk_index: idx + 1,
      content,
      page_number: Math.floor(idx / 3) + 1,
      created_at: new Date().toISOString(),
    }));

    const existingChunks = getLocal<DocumentChunk[]>(STORAGE_KEY_CHUNKS, []);
    setLocal(STORAGE_KEY_CHUNKS, [...chunks, ...existingChunks]);

    if (supabase) {
      safeMutation(
        supabase.from('document_chunks').insert(
          chunks.map(c => ({
            id: c.id,
            document_id: isUUID(c.document_id) ? c.document_id : undefined,
            workspace_id: c.workspace_id,
            chunk_index: c.chunk_index,
            content: c.content,
            page_number: c.page_number,
          }))
        )
      );
    }

    return chunks;
  }
};

// Aliased export
export const sourceService = {
  getSources: documentService.getDocuments,
  fetchDocumentsAsync: documentService.fetchDocumentsAsync,
  getSource: documentService.getSource,
  addSource: documentService.addSource,
  deleteSource: documentService.deleteSource,
  updateSourceStatus: documentService.updateSourceStatus,
  uploadFileToStorage: documentService.uploadFileToStorage,
  storeDocumentChunks: documentService.storeDocumentChunks,
};
