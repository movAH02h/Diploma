// hooks/useTranscription.ts
'use client';

import { useState, useCallback } from 'react';
import { uploadAudio } from '@/lib/api';
import { TranscriptionResult } from '@/lib/types';

interface UseTranscriptionReturn {
  isProcessing: boolean;
  error: string | null;
  result: TranscriptionResult | null;
  transcribe: (file: File, modelType: string) => Promise<TranscriptionResult>;
  reset: () => void;
}

export function useTranscription(): UseTranscriptionReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);

  const transcribe = useCallback(async (file: File, modelType: string): Promise<TranscriptionResult> => {
    setIsProcessing(true);
    setError(null);
    try {
      const data = await uploadAudio(file, modelType);
      setResult(data);
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Transcription failed';
      setError(errorMsg);
      setResult(null);
      throw new Error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setError(null);
    setResult(null);
  }, []);

  return { isProcessing, error, result, transcribe, reset };
}