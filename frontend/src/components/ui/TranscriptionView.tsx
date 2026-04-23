'use client';

import { TranscriptionResult } from '@/lib/types';

interface ParsedSegment {
  speaker: string;
  text: string;
  start?: number;
  end?: number;
}

function combineSegments(result: TranscriptionResult): ParsedSegment[] {
  const allSegments: ParsedSegment[] = [];

  if (result.transcriptions) {
    for (const [speaker, data] of Object.entries(result.transcriptions)) {
      for (const seg of data.segments) {
        allSegments.push({
          speaker,
          text: seg.text,
          start: seg.start,
          end: seg.end
        });
      }
    }
  }

  allSegments.sort((a, b) => (a.start || 0) - (b.start || 0));

  const combined: ParsedSegment[] = [];
  for (const seg of allSegments) {
    if (!seg.text.trim()) continue;
    
    const last = combined[combined.length - 1];
    if (last && last.speaker === seg.speaker) {
      last.text += ' ' + seg.text;
      if (seg.end) last.end = seg.end;
    } else {
      combined.push({ ...seg });
    }
  }

  return combined;
}

export default function TranscriptionView({ result }: { result: TranscriptionResult }) {
  const messages = combineSegments(result);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-[#888]">No dialogue segments found</p>
      </div>
    );
  }

  const speakerSides = new Map<string, 'left' | 'right'>();
  const seenSpeakers: string[] = [];
  messages.forEach(msg => {
    if (!speakerSides.has(msg.speaker)) {
      speakerSides.set(msg.speaker, seenSpeakers.length % 2 === 0 ? 'left' : 'right');
      seenSpeakers.push(msg.speaker);
    }
  });

  return (
    <div className="space-y-4">
      {messages.map((msg, idx) => {
        const side = speakerSides.get(msg.speaker)!;
        const isLeft = side === 'left';
        return (
          <div 
            key={idx} 
            className={`flex flex-col ${isLeft ? 'items-start' : 'items-end'}`}
          >
            <span className="text-xs text-[#89dceb] mb-1 px-2">
              {msg.speaker}
            </span>
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                isLeft
                  ? 'bg-[#2a2a2a] border border-[#3d3d3d] rounded-bl-md'
                  : 'bg-[#89dceb]/10 border border-[#89dceb]/30 rounded-br-md'
              }`}
            >
              <p className="text-white whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}