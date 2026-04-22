'use client';

import { useState } from 'react';
import ControlPanel from '@/components/layout/ControlPanel';
import ResultPanel from '@/components/layout/ResultPanel';
import AuthModal from '@/components/ui/AuthModal';
import { useAuth } from '@/context/AuthContext';
import { TranscriptionResult } from '@/lib/types';

export default function Home() {
  const [currentResult, setCurrentResult] = useState<TranscriptionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user, logout, isLoading } = useAuth();

  const handleResultLoaded = (result: TranscriptionResult) => {
    setCurrentResult(result);
    setIsProcessing(false);
  };

  const handleClearResult = () => {
    setCurrentResult(null);
  };

  const openLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const openRegister = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-md">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
            Meeting Studio
          </h1>
          <p className="text-slate-600 mb-8">Please login or register to use the service</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={openLogin}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-full transition"
            >
              Login
            </button>
            <button
              onClick={openRegister}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-full transition border border-slate-300"
            >
              Register
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
    <main className="flex h-screen gap-6 p-6 bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-[400px] bg-white/95 rounded-3xl shadow-xl p-6 flex flex-col gap-6 border border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            {user.username}
          </h2>
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </div>
        <ControlPanel 
          onProcessingStart={() => setIsProcessing(true)}
          onResult={handleResultLoaded}
          onError={() => setIsProcessing(false)}
          onClear={handleClearResult}
        />
      </div>
      <div className="flex-1 bg-white rounded-3xl shadow-xl p-6 flex flex-col border border-slate-200">
        <ResultPanel 
          result={currentResult} 
          isLoading={isProcessing}
        />
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </main>
  );
}