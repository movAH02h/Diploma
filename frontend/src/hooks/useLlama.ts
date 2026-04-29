'use client';

import { useState } from 'react';
import { summarizeTranscription, askQuestion } from '@/lib/api';

interface QAPair {
  question: string;
  answer: string;
}

export function useLlama(resultId: number | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [keyPoints, setKeyPoints] = useState<string | null>(null);
  const [qaHistory, setQaHistory] = useState<QAPair[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async () => {
    if (!resultId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { result } = await summarizeTranscription(resultId, 'summary');
      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const extractKeyPoints = async () => {
    if (!resultId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { result } = await summarizeTranscription(resultId, 'key_points');
      setKeyPoints(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const ask = async (question: string) => {
    if (!resultId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { result } = await askQuestion(resultId, question);
      setQaHistory(prev => [...prev, { question, answer: result }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setSummary(null);
    setKeyPoints(null);
    setQaHistory([]);
    setError(null);
  };

  return {
    isLoading,
    summary,
    keyPoints,
    qaHistory,
    error,
    generateSummary,
    extractKeyPoints,
    ask,
    reset,
  };
}