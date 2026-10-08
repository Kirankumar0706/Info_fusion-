import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  FileSpreadsheet, 
  FileCheck, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface UploadSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadSourceModal: React.FC<UploadSourceModalProps> = ({ isOpen, onClose }) => {
  const { uploadSource, isProcessingUpload, uploadStage } = useWorkspace();
  const [dragActive, setDragActive] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'file' | 'paste'>('file');
  const [pastedText, setPastedText] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setErrorMsg('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const handleStartIngestion = async () => {
    if (selectedTab === 'file') {
      if (!selectedFile) {
        setErrorMsg('Please select a file to upload.');
        return;
      }
      try {
        await uploadSource(selectedFile);
        onClose();
        setSelectedFile(null);
      } catch (err) {
        setErrorMsg('Failed to process source. Please try again.');
      }
    } else {
      if (!pastedText.trim()) {
        setErrorMsg('Please enter document content.');
        return;
      }
      const title = documentTitle.trim() || `Pasted_Document_${new Date().toISOString().slice(0, 10)}.txt`;
      try {
        await uploadSource({
          name: title,
          type: 'txt',
          size: pastedText.length,
          content: pastedText,
        });
        onClose();
        setPastedText('');
        setDocumentTitle('');
      } catch (err) {
        setErrorMsg('Failed to analyze pasted text.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[#0F172A] border border-white/[0.1] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <UploadCloud className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-base text-white">Ingest Information Source</h3>
              <p className="text-xs text-slate-400">PDF, DOCX, XLSX, CSV, Markdown, Images, or Direct Text</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessingUpload}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 flex border-b border-white/[0.06] gap-4">
          <button
            onClick={() => setSelectedTab('file')}
            disabled={isProcessingUpload}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all ${
              selectedTab === 'file' 
                ? 'border-indigo-500 text-indigo-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => setSelectedTab('paste')}
            disabled={isProcessingUpload}
            className={`pb-2.5 text-xs font-semibold border-b-2 transition-all ${
              selectedTab === 'paste' 
                ? 'border-indigo-500 text-indigo-300' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Paste Text or Notes
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {isProcessingUpload ? (
            /* Multi-stage Intelligent Loading Animation (Section 32) */
            <div className="py-8 text-center space-y-6">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-2 border-sky-400/20 border-b-sky-400 animate-spin" style={{ animationDirection: 'reverse' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                </div>
              </div>

              <div>
                <h4 className="text-base font-semibold text-white mb-1">
                  AI Pipeline Active
                </h4>
                <p className="text-xs font-mono text-indigo-300 font-medium animate-pulse">
                  {uploadStage}
                </p>
              </div>

              {/* Pipeline Step Indicators */}
              <div className="grid grid-cols-4 gap-2 pt-2 text-[10px] font-mono text-slate-400">
                <div className="p-2 rounded bg-surface-100 border border-indigo-500/30 text-indigo-300">
                  1. Ingest
                </div>
                <div className="p-2 rounded bg-surface-100 border border-indigo-500/30 text-indigo-300">
                  2. Extract
                </div>
                <div className="p-2 rounded bg-surface-100 border border-indigo-500/30 text-indigo-300">
                  3. Normalize
                </div>
                <div className="p-2 rounded bg-surface-100 border border-indigo-500/30 text-indigo-300">
                  4. Verify
                </div>
              </div>
            </div>
          ) : selectedTab === 'file' ? (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,.md,.png,.jpg,.jpeg"
                onChange={handleFileChange}
              />

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-indigo-500 bg-indigo-500/10' 
                    : 'border-white/[0.12] hover:border-indigo-500/50 hover:bg-white/[0.02]'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-white mb-1">
                  Click or drag and drop file here
                </p>
                <p className="text-xs text-slate-400 mb-3">
                  Supports PDF, DOCX, XLSX spreadsheets, CSV, TXT, Markdown, or Images
                </p>
                <span className="inline-block px-3 py-1 text-[11px] font-mono rounded-full bg-surface-100 border border-white/[0.08] text-slate-300">
                  Automatic Fact Extraction & Contradiction Radar
                </span>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-100 border border-indigo-500/30">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white truncate">{selectedFile.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="text-slate-400 hover:text-red-400 text-xs px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Title / Reference</label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="e.g. Audit Assessment or Compliance Policy - March 2026"
                  className="w-full px-3 py-2 rounded-lg bg-surface-100 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Content</label>
                <textarea
                  rows={6}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste policy clauses, audit findings, financial statements, or requirements here..."
                  className="w-full px-3 py-2 rounded-lg bg-surface-100 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-surface-200/50 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Supabase Encrypted Storage
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isProcessingUpload}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartIngestion}
              disabled={isProcessingUpload || (selectedTab === 'file' ? !selectedFile : !pastedText.trim())}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-all shadow-glow-primary"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ingest & Analyze
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
