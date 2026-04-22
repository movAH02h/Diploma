'use client';

import { useState } from 'react';
import { HistoryItem, TranscriptionResult } from '@/lib/types';
import { fetchResultById } from '@/lib/api';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface ControlPanelProps {
  history: HistoryItem[];
  onSelect: (result: TranscriptionResult) => void;
  onClear: () => Promise<void>;
  onRefresh: () => void;
  selectedId: number | null;
}

export default function ControlPanel({ history, onSelect, onClear, onRefresh, selectedId }: ControlPanelProps) {
  const [loading, setLoading] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleSelect = async (item: HistoryItem) => {
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
    <div className="flex flex-col gap-4">
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 border-[#89dceb] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="bg-[#1a1a1a] rounded-xl p-4 border border-[#3d3d3d]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-[#888]">Transcription History</h3>
          <div className="flex gap-2">
            <button
              onClick={onRefresh}
              className="p-1.5 hover:bg-[#333] rounded-lg transition"
            >
              <svg className="w-4 h-4 text-[#888]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={() => setShowClearModal(true)}
              disabled={history.length === 0}
              className="text-xs text-[#888] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {history.length === 0 ? (
            <p className="text-[#666] text-sm text-center py-6">No transcriptions yet</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`p-3 rounded-lg cursor-pointer transition border ${
                  selectedId === item.id
                    ? 'bg-[#89dceb]/10 border-[#89dceb]/50'
                    : 'bg-[#252525] border-transparent hover:bg-[#2a2a2a]'
                }`}
              >
                <p className="text-white text-sm font-medium truncate">{item.filename}</p>
                <div className="flex justify-between text-xs text-[#666] mt-1">
                  <span>{item.speakers_count} speaker{item.speakers_count !== 1 ? 's' : ''}</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearConfirm}
        title="Clear all history?"
        message="This will permanently delete all saved transcriptions."
      />
    </div>
  );
}