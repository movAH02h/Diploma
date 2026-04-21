import { UploadResponse, TranscriptionResult, HistoryItem } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function uploadAudio(file: File, modelType: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model_type', modelType);

  const res = await fetch(`${API_BASE}/api/v1/process_audio`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload failed: ${res.status} ${errorText}`);
  }
  return res.json();
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${API_BASE}/api/v1/results`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function fetchResultById(id: number): Promise<TranscriptionResult> {
  const res = await fetch(`${API_BASE}/api/v1/results/${id}`);
  if (!res.ok) throw new Error('Failed to fetch result');
  return res.json();
}

export async function deleteAllHistory(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/results`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete history');
}