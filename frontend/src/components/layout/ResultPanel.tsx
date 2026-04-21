import TranscriptionView from '@/components/ui/TranscriptionView';
import { TranscriptionResult } from '@/lib/types';

interface ResultPanelProps {
  result: TranscriptionResult | null;
  isLoading: boolean;
}

export default function ResultPanel({ result, isLoading }: ResultPanelProps) {
  return (
    <>
      <h2 className="text-2xl font-bold border-l-4 border-blue-500 pl-4 text-slate-800">
        Transcription results
      </h2>
      <div className="flex-1 overflow-y-auto mt-4 pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400 italic">Processing audio...</p>
          </div>
        ) : result ? (
          <TranscriptionView result={result} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400 italic">Here will be a result</p>
          </div>
        )}
      </div>
    </>
  );
}