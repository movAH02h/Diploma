// components/ui/TranscriptionView.tsx
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
  
  // Сначала пытаемся использовать структурированные сегменты из ответа API
  if (result.transcriptions) {
    for (const [speaker, data] of Object.entries(result.transcriptions)) {
      for (const seg of data.segments) {
        messages.push({ speaker, text: seg.text });
      }
    }
    // Сортируем по времени начала (если есть start)
    messages.sort((a, b) => {
      // здесь можно добавить сортировку по start, если он доступен в сегменте
      return 0;
    });
  } else if (result.full_text) {
    messages = parseTextToSegments(result.full_text);
  }

  if (messages.length === 0) {
    return <p className="text-slate-400 italic text-center py-8">No dialogue segments found</p>;
  }

  // Определяем стороны для спикеров (чередование лево/право)
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
        return (
          <div key={idx} className={`flex flex-col ${side === 'left' ? 'items-start' : 'items-end'}`}>
            <span className="text-xs font-semibold text-slate-500 mb-1 px-3">
              {msg.speaker}
            </span>
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                side === 'left'
                  ? 'bg-slate-100 border border-slate-200 rounded-bl-md'
                  : 'bg-emerald-50 border border-emerald-200 rounded-br-md text-emerald-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}