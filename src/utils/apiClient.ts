'use client';

const DEFAULT_API_BASE_URL = 'http://localhost:8000/api';

export type UploadResponse = {
  url: string;
  publicId: string;
  secureUrl: string;
  originalFilename?: string | null;
};

export function getApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    DEFAULT_API_BASE_URL
  );
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function uploadImageToCloudinary(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${getApiBaseUrl()}/uploads/image`, {
    method: 'POST',
    body: formData,
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || `Upload failed with status ${response.status}`);
  }

  return response.json() as Promise<UploadResponse>;
}
