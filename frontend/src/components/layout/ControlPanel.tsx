'use client';

import { useState, useRef } from 'react';
import FileUpload from '@/components/ui/FileUpload';
import ModelSelector from '@/components/ui/ModelSelector';
import HistoryList from '@/components/ui/HistoryList';
import { TranscriptionResult } from '@/lib/types';
import { useHistory } from '@/hooks/useHistory';
import { useTranscription } from '@/hooks/useTranscription';

interface ControlPanelProps {
  onProcessingStart: () => void;
  onResult: (result: TranscriptionResult) => void;
  onError: () => void;
  onClear: () => void;
}

export default function ControlPanel({ onProcessingStart, onResult, onError, onClear }: ControlPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modelType, setModelType] = useState('base');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { isProcessing, error, transcribe, result } = useTranscription();
  const { history, loadHistory, clearHistory } = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setUploadError(null);
  };

  const handleTranscribe = async () => {
    if (!selectedFile) return;
    onProcessingStart();
    try {
      const res = await transcribe(selectedFile, modelType);
      onResult(res);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Transcription failed');
      onError();
    }
    await loadHistory();
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadError(null);
    onClear();
  };

  const handleHistorySelect = (res: TranscriptionResult) => {
    onResult(res);
  };

  const handleClearHistory = async () => {
    await clearHistory();
    onClear();
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
        Meeting Studio
      </h2>
      
      <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-200">
        <FileUpload 
          onFileChange={handleFileChange}
          onClear={handleClearFile}
          error={uploadError}
          ref={fileInputRef}
        />

        {isProcessing ? (
          <div className="bg-blue-100 border border-blue-300 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="animate-spin text-xl">⏳</span>
              <span className="text-blue-700 font-semibold">Processing...</span>
            </div>
          </div>
        ) : (
          <button
            onClick={handleTranscribe}
            disabled={!selectedFile}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-full transition flex items-center justify-center gap-2"
          >
            🎤 Transcribe
          </button>
        )}
        
        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}
      </div>

      <ModelSelector value={modelType} onChange={setModelType} />

      <HistoryList 
        history={history} 
        onSelect={handleHistorySelect}
        onClear={handleClearHistory}
        onRefresh={loadHistory}
      />
    </div>
  );
}
