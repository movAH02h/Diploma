'use client';

import { useState, useCallback } from 'react';
import { HistoryItem } from '@/lib/types';
import { fetchHistory, deleteAllHistory } from '@/lib/api';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (loading) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      setHistory([]);
      return;
    }
    
    try {
      setLoading(true);
      const data = await fetchHistory();
      setHistory(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const clearHistory = useCallback(async () => {
    try {
      await deleteAllHistory();
      setHistory([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Clear failed');
      throw err;
    }
  }, []);

  return { history, loading, error, loadHistory, clearHistory };
}