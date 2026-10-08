import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Files, 
  UploadCloud, 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  Trash2, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Search,
  Sparkles,
  Building2
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { UploadSourceModal } from '../components/common/UploadSourceModal';
import { NoWorkspaceState } from '../components/common/NoWorkspaceState';
import { Source } from '../types';

export const SourcesPage: React.FC = () => {
  const { currentWorkspace, sources, deleteSource } = useWorkspace();
  const navigate = useNavigate();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  if (!currentWorkspace) {
    return (
      <div className="py-4">
        <NoWorkspaceState 
          title="Select or Create a Workspace to Upload Documents"
          subtitle="All uploaded documents and extracted intelligence belong to a workspace. Create or select a workspace to begin."
        />
      </div>
    );
  }

  const filteredSources = sources.filter(s => 
    s.file_name.toLowerCase().includes(search.toLowerCase()) ||
    s.file_type.toLowerCase().includes(search.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-indigo-400" />;
      case 'docx':
      case 'doc':
        return <FileText className="w-5 h-5 text-sky-400" />;
      case 'md':
      case 'txt':
        return <FileCode className="w-5 h-5 text-cyan-400" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-indigo-500/20 shadow-glass">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <Files className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-indigo-400">
              DOCUMENT SOURCES • {currentWorkspace.name}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Information Sources
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Upload and manage your organization's documents (PDF, DOCX, XLSX, CSV, TXT, Markdown, Images). All files are isolated strictly to <strong>{currentWorkspace.name}</strong> and analyzed for facts and contradictions.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 transition-all shadow-glow-primary shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Processing Pipeline Flowchart Indicator (Section 6) */}
      <div className="p-4 rounded-xl bg-surface-100 border border-white/[0.08] flex items-center justify-between text-xs overflow-x-auto">
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400 shrink-0">
          <span className="font-bold text-white uppercase">Pipeline:</span>
          <span className="text-indigo-400">1. Upload</span>
          <span>→</span>
          <span className="text-indigo-400">2. Extract</span>
          <span>→</span>
          <span className="text-indigo-400">3. Structure</span>
          <span>→</span>
          <span className="text-indigo-400">4. Analyze</span>
          <span>→</span>
          <span className="text-indigo-400">5. Verify</span>
          <span>→</span>
          <span className="text-emerald-400 font-bold">6. Results</span>
        </div>
        <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 shrink-0 pl-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          Workspace Isolated • {sources.length} Documents
        </div>
      </div>

      {/* If No Sources Uploaded: Empty State (Section 5) */}
      {sources.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-5 border-white/[0.08]">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
            <Files className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-white">No documents uploaded yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload your first document to extract facts, verify statements, and identify cross-document inconsistencies.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-2 transition-all shadow-glow-primary"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Your First Document</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Search Bar */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-100 border border-white/[0.08]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter ingested sources by filename or extension..."
              className="bg-transparent text-xs text-white placeholder-slate-500 w-full focus:outline-none"
            />
          </div>

          {/* Source Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSources.map((src) => (
              <div
                key={src.id}
                onClick={() => navigate(`/sources/${src.id}`)}
                className="glass-panel p-5 rounded-2xl border-white/[0.08] hover:border-indigo-500/40 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-surface-100 border border-white/[0.08] flex items-center justify-center group-hover:border-indigo-500/40 transition-colors">
                        {getFileIcon(src.file_type)}
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-surface-100 text-slate-300 border border-white/[0.06]">
                        {src.file_type}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors truncate" title={src.file_name}>
                      {src.file_name}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-3">
                      <span>{(src.file_size / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span>{src.facts_count || 0} Facts Extracted</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(src.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSource(src.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/[0.04] transition-colors"
                      title="Delete Source"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-indigo-400 group-hover:text-indigo-300 font-semibold flex items-center gap-1">
                      <span>Explore</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Upload Source Modal */}
      <UploadSourceModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </div>
  );
};
