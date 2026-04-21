'use client';

import { useState } from 'react';
import { HistoryItem, TranscriptionResult } from '@/lib/types';
import { fetchResultById } from '@/lib/api';
import ConfirmModal from './ConfirmModal';

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (result: TranscriptionResult) => void;
  onClear: () => Promise<void>;
  onRefresh: () => void;
}

export default function HistoryList({ history, onSelect, onClear, onRefresh }: HistoryListProps) {
  const [showClearModal, setShowClearModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (item: HistoryItem) => {
    setSelectedId(item.id);
    setLoading(true);
    try {
      const result = await fetchResultById(item.id);
      onSelect(result);
    } catch (err) {
      console.error('Failed to load result:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearConfirm = async () => {
    await onClear();
    setShowClearModal(false);
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-700">📋 History</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setShowClearModal(true)}
            disabled={history.length === 0}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🗑️ Clear
          </button>
          <button
            onClick={onRefresh}
            className="text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
          >
            ⟳
          </button>
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
        {history.length === 0 ? (
          <p className="text-slate-400 text-center py-4 text-sm italic">No saved transcriptions</p>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                handleSelect(item);
              }}
              className={`p-3 rounded-xl cursor-pointer transition border ${
                selectedId === item.id
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <p className="font-medium text-sm">📄 {item.filename}</p>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>👥 {item.speakers_count} speaker{item.speakers_count !== 1 ? 's' : ''}</span>
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearConfirm}
        title="Clear all history?"
        message="This will permanently delete all saved transcriptions. This action cannot be undone."
      />
    </div>
  );
}