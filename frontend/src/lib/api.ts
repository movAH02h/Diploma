import { UploadResponse, TranscriptionResult, HistoryItem } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function uploadAudio(file: File, modelType: string): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model_type', modelType);

  const res = await fetch(`${API_BASE}/api/v1/process_audio`, {
    method: 'POST',
    body: formData,
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload failed: ${res.status} ${errorText}`);
  }
  return res.json();
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${API_BASE}/api/v1/results`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function fetchResultById(id: number): Promise<TranscriptionResult> {
  const res = await fetch(`${API_BASE}/api/v1/results/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch result');
  return res.json();
}

export async function deleteAllHistory(): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/results`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete history');
}

export async function summarizeTranscription(resultId: number, mode: 'summary' | 'key_points'): Promise<{ result: string }> {
  const res = await fetch(`${API_BASE}/api/v1/llama/summarize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ result_id: resultId, mode }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to summarize: ${res.status} ${errorText}`);
  }
  const text = await res.text();
  if (!text) {
    throw new Error('Empty response from server');
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON response: ${text}`);
  }
}

export async function askQuestion(resultId: number, question: string): Promise<{ result: string }> {
  const res = await fetch(`${API_BASE}/api/v1/llama/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ result_id: resultId, question }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to ask question: ${res.status} ${errorText}`);
  }
  return res.json();
}