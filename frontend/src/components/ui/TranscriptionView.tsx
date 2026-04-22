'use client';

import { TranscriptionResult } from '@/lib/types';

interface ParsedSegment {
  speaker: string;
  text: string;
  start?: number;
  end?: number;
}

function parseTextToSegments(fullText: string): ParsedSegment[] {
  const segments: ParsedSegment[] = [];
  const speakerPattern = /^(SPEAKER_\d+|SPEAKER \d+):\s*/gm;
  const parts = fullText.split(speakerPattern);
  
  if (parts.length > 1) {
    let i = 1;
    while (i < parts.length) {
      const speaker = parts[i]?.trim();
      const text = parts[i + 1]?.trim() || '';
      if (speaker && text) {
        segments.push({ speaker, text });
      }
      i += 2;
    }
  } else {
    const lines = fullText.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        segments.push({ speaker: 'UNKNOWN', text: trimmed });
      }
    }
  }
  return segments;
}

export default function TranscriptionView({ result }: { result: TranscriptionResult }) {
  let messages: ParsedSegment[] = [];
  
  if (result.transcriptions) {
    for (const [speaker, data] of Object.entries(result.transcriptions)) {
      for (const seg of data.segments) {
        messages.push({ speaker, text: seg.text });
      }
    }
  } else if (result.full_text) {
    messages = parseTextToSegments(result.full_text);
  }

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