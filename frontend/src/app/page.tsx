'use client';

import { useState, useRef, useEffect } from 'react';
import ControlPanel from '@/components/layout/ControlPanel';
import ResultPanel from '@/components/layout/ResultPanel';
import AuthModal from '@/components/ui/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { TranscriptionResult } from '@/lib/types';
import { useTranscription } from '@/hooks/useTranscription';
import { useHistory } from '@/hooks/useHistory';
import { useLlama } from '@/hooks/useLlama';
import LlamaPanel from '@/components/ui/LlamaPanel';
import { uploadAudio } from '@/lib/api';

export default function Home() {
  const [currentResult, setCurrentResult] = useState<TranscriptionResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modelType, setModelType] = useState('base');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isFromHistory, setIsFromHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, logout, isLoading, setOnAuthSuccess } = useAuth();
  const { isProcessing, transcribe, reset } = useTranscription();
  const { history, loadHistory, clearHistory } = useHistory();
  const llama = useLlama(currentResult?.id || null);

  useEffect(() => {
    if (!isLoading && user) {
      loadHistory();
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      setOnAuthSuccess?.(() => () => loadHistory());
    }
  }, [isLoading, setOnAuthSuccess, loadHistory]);

  const handleResultLoaded = (result: TranscriptionResult) => {
    setCurrentResult(result);
  };

  const handleClearResult = () => {
    setCurrentResult(null);
    setSelectedFile(null);
    setUploadError(null);
    setIsFromHistory(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    reset();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
      setIsFromHistory(false);
      setCurrentResult(null);
    }
  };

  const handleTranscribe = async () => {
    if (!selectedFile) return;
    try {
      const result = await transcribe(selectedFile, modelType);
      setCurrentResult(result);
      await loadHistory();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Transcription failed');
    }
  };

  const handleHistorySelect = (result: TranscriptionResult) => {
    setCurrentResult(result);
    setIsFromHistory(true);
    setSelectedFile(null);
    setShowHistory(false);
  };

  const handleClearHistory = async () => {
    await clearHistory();
    handleClearResult();
  };

  const openLogin = () => {
    setShowAuthModal(true);
    setAuthMode('login');
  };

  const openRegister = () => {
    setShowAuthModal(true);
    setAuthMode('register');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="w-8 h-8 border-2 border-[#89dceb] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="bg-[#252525] rounded-2xl p-8 shadow-2xl text-center max-w-md border border-[#3d3d3d]">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#89dceb] to-[#b4a7d6] rounded-full flex items-center justify-center">
            <span className="text-3xl">🎙️</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Meeting Studio</h1>
          <p className="text-[#888] mb-8">Sign in to transcribe your meetings</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={openLogin}
              className="w-full bg-[#89dceb] hover:bg-[#79c8db] text-[#1a1a1a] font-semibold py-3 px-6 rounded-xl transition"
            >
              Sign In
            </button>
            <button
              onClick={openRegister}
              className="w-full bg-transparent hover:bg-[#333] text-[#89dceb] font-semibold py-3 px-6 rounded-xl transition border border-[#89dceb]"
            >
              Create Account
            </button>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
      <header className="sticky top-0 z-50 h-14 bg-[#252525] border-b border-[#3d3d3d] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-[#333] rounded-lg transition"
          >
            <svg className="w-5 h-5 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-medium">Meeting Studio</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#89dceb] rounded-full flex items-center justify-center">
            <span className="text-[#1a1a1a] font-semibold text-sm">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm text-[#888] hover:text-white hover:bg-[#333] rounded-lg transition"
          >
            Exit
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - только история */}
        <div className={`fixed left-0 top-14 bottom-0 w-72 bg-[#252525] border-r border-[#3d3d3d] transform transition-transform duration-300 z-40 ${showHistory ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 border-b border-[#3d3d3d] flex items-center justify-between">
            <h2 className="text-white font-medium">History</h2>
            <button
              onClick={() => setShowHistory(false)}
              className="p-1 hover:bg-[#333] rounded"
            >
              <svg className="w-5 h-5 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
            <ControlPanel 
              history={history}
              onSelect={handleHistorySelect}
              onClear={handleClearHistory}
              onRefresh={loadHistory}
              selectedId={currentResult?.id || null}
            />
          </div>
        </div>

        {showHistory && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setShowHistory(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center pt-4 px-4 overflow-y-auto">
          <div className="w-full max-w-3xl">
            {/* Кнопки по центру */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 bg-[#252525] hover:bg-[#333] disabled:opacity-50 text-white rounded-xl border border-[#3d3d3d] transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Audio
              </button>
              <button
                onClick={handleClearResult}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 bg-[#252525] hover:bg-[#333] disabled:opacity-50 text-white rounded-xl border border-[#3d3d3d] transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            </div>

{/* Файл и кнопки транскрибации */}
            {selectedFile && !isFromHistory && (
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="flex items-center gap-3 px-4 py-2 bg-[#252525] rounded-lg border border-[#3d3d3d]">
                  <svg className="w-5 h-5 text-[#89dceb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <span className="text-white text-sm">{selectedFile.name}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex bg-[#252525] rounded-lg p-1 border border-[#3d3d3d]">
                    <button
                      onClick={() => setModelType('base')}
                      className={`py-1.5 px-3 rounded-md text-sm transition ${
                        modelType === 'base'
                          ? 'bg-[#89dceb] text-[#1a1a1a]'
                          : 'text-[#888] hover:text-white'
                      }`}
                    >
                      Base
                    </button>
                    <button
                      onClick={() => setModelType('pro')}
                      className={`py-1.5 px-3 rounded-md text-sm transition ${
                        modelType === 'pro'
                          ? 'bg-[#89dceb] text-[#1a1a1a]'
                          : 'text-[#888] hover:text-white'
                      }`}
                    >
                      Pro
                    </button>
                  </div>

                  <button
                    onClick={handleTranscribe}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-2 bg-[#89dceb] hover:bg-[#79c8db] disabled:bg-[#3d3d3d] disabled:text-[#666] text-[#1a1a1a] font-semibold rounded-lg transition"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        Transcribe
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="text-center mb-6">
                <p className="text-red-400 text-sm">{uploadError}</p>
              </div>
            )}

            <ResultPanel 
              result={currentResult} 
              isLoading={false}
            />
            
            {currentResult && (
              <LlamaPanel
                resultId={currentResult.id}
                onGenerateSummary={llama.generateSummary}
                onExtractKeyPoints={llama.extractKeyPoints}
                onAsk={llama.ask}
                isLoading={llama.isLoading}
                summary={llama.summary}
                keyPoints={llama.keyPoints}
                qaHistory={llama.qaHistory}
                error={llama.error}
              />
            )}
          </div>
        </main>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
}