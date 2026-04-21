export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

export interface SpeakerTranscription {
  full_text: string;
  segments: TranscriptionSegment[];
}

export interface TranscriptionResult {
  id: number;
  filename: string;
  status: string;
  full_text: string;
  created_at: string;
  transcriptions: Record<string, SpeakerTranscription>;
  speakers: string[];
}

export interface HistoryItem {
  id: number;
  filename: string;
  status: string;
  created_at: string;
  speakers_count: number;
}

export interface UploadResponse extends TranscriptionResult {}