import type { Receipt, Summary } from '../types';

const API_BASE =
  import.meta.env.VITE_API_URL ?? 'http://localhost:5279';
  
function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export async function fetchReceipts(token: string): Promise<Receipt[]> {
  const res = await fetch(`${API_BASE}/receipts`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Failed to load receipts: ${res.status}`);
  return res.json();
}

export async function fetchSummaries(token: string): Promise<Summary[]> {
  const res = await fetch(`${API_BASE}/summary`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Failed to load summary: ${res.status}`);
  return res.json();
}

interface UploadSasResponse {
  uploadUrl: string;
}

export async function requestUploadUrl(token: string): Promise<UploadSasResponse> {
  const res = await fetch(`${API_BASE}/uploads/sas`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Failed to create upload URL: ${res.status}`);
  return res.json();
}

export async function uploadFileToBlob(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });
  if (!res.ok) throw new Error(`Blob upload failed: ${res.status}`);
}
