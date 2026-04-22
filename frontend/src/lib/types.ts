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

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}