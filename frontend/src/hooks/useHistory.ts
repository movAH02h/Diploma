'use client';

import { useState, useEffect, useCallback } from 'react';
import { HistoryItem } from '@/lib/types';
import { fetchHistory, deleteAllHistory } from '@/lib/api';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
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
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await deleteAllHistory();
      setHistory([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Clear failed');
      throw err;
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return { history, loading, error, loadHistory, clearHistory };
}