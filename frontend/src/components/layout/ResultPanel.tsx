import TranscriptionView from '@/components/ui/TranscriptionView';
import { TranscriptionResult } from '@/lib/types';

interface ResultPanelProps {
  result: TranscriptionResult | null;
  isLoading: boolean;
}

export default function ResultPanel({ result, isLoading }: ResultPanelProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#89dceb] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#888]">Processing audio...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-[#252525] rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">🎙️</span>
        </div>
        <p className="text-[#888] text-center">
          Upload an audio file to start transcription
        </p>
      </div>
    );
  }

  return (
    <TranscriptionView result={result} />
  );
}