'use client';

import { useState } from 'react';
import ControlPanel from '@/components/layout/ControlPanel';
import ResultPanel from '@/components/layout/ResultPanel';
import { TranscriptionResult } from '@/lib/types';

export default function Home() {
  const [currentResult, setCurrentResult] = useState<TranscriptionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleResultLoaded = (result: TranscriptionResult) => {
    setCurrentResult(result);
    setIsProcessing(false);
  };

  const handleClearResult = () => {
    setCurrentResult(null);
  };

  return (
    <main className="flex h-screen gap-6 p-6 bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-[400px] bg-white/95 rounded-3xl shadow-xl p-6 flex flex-col gap-6 border border-slate-200">
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
    </main>
  );
}