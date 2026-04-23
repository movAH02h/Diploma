'use client';

import { useState } from 'react';

interface LlamaPanelProps {
  resultId: number | null;
  onGenerateSummary: () => Promise<void>;
  onExtractKeyPoints: () => Promise<void>;
  onAsk: (question: string) => Promise<void>;
  isLoading: boolean;
  summary: string | null;
  keyPoints: string | null;
  answer: string | null;
  error: string | null;
}

export default function LlamaPanel({
  resultId,
  onGenerateSummary,
  onExtractKeyPoints,
  onAsk,
  isLoading,
  summary,
  keyPoints,
  answer,
  error,
}: LlamaPanelProps) {
  const [question, setQuestion] = useState('');

  if (!resultId) return null;

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    await onAsk(question);
    setQuestion('');
  };

  return (
    <div className="bg-[#252525] rounded-xl border border-[#3d3d3d] p-4 mt-4">
      <h3 className="text-lg font-semibold text-white mb-4">AI Analysis</h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={onGenerateSummary}
          disabled={isLoading}
          className="flex-1 bg-[#333] hover:bg-[#444] disabled:opacity-50 text-white py-2 px-4 rounded-lg transition text-sm"
        >
          Summary
        </button>
        <button
          onClick={onExtractKeyPoints}
          disabled={isLoading}
          className="flex-1 bg-[#333] hover:bg-[#444] disabled:opacity-50 text-white py-2 px-4 rounded-lg transition text-sm"
        >
          Key Points
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-[#89dceb] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {summary && (
        <div className="mb-4 p-3 bg-[#1a1a1a] rounded-lg border border-[#3d3d3d]">
          <h4 className="text-xs text-[#89dceb] mb-2">Summary</h4>
          <p className="text-white text-sm whitespace-pre-wrap">{summary}</p>
        </div>
      )}

      {keyPoints && (
        <div className="mb-4 p-3 bg-[#1a1a1a] rounded-lg border border-[#3d3d3d]">
          <h4 className="text-xs text-[#89dceb] mb-2">Key Points</h4>
          <p className="text-white text-sm whitespace-pre-wrap">{keyPoints}</p>
        </div>
      )}

      <div className="border-t border-[#3d3d3d] pt-4 mt-4">
        <h4 className="text-xs text-[#89dceb] mb-2">Ask a question</h4>
        <form onSubmit={handleAsk} className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What was discussed about...?"
            className="flex-1 bg-[#1a1a1a] border border-[#3d3d3d] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#89dceb]"
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="bg-[#89dceb] hover:bg-[#79c8db] disabled:opacity-50 text-[#1a1a1a] font-semibold py-2 px-4 rounded-lg transition text-sm"
          >
            Ask
          </button>
        </form>
      </div>

      {answer && (
        <div className="mt-4 p-3 bg-[#1a1a1a] rounded-lg border border-[#3d3d3d]">
          <h4 className="text-xs text-[#89dceb] mb-2">Answer</h4>
          <p className="text-white text-sm whitespace-pre-wrap">{answer}</p>
        </div>
      )}
    </div>
  );
}