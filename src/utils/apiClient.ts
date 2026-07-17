'use client';

const DEFAULT_API_BASE_URL = 'https://api.blacksoft.site/api';

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

const AUTH_TOKEN_KEY = 'blacksoft_dashboard_access_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 401) clearAuthToken();
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
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : undefined,
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || `Upload failed with status ${response.status}`);
  }

  return response.json() as Promise<UploadResponse>;
}
