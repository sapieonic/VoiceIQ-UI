import { auth } from '../firebase/config';

const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

/**
 * API error with status code and message
 */
export class ApiError extends Error {
  readonly status: number;
  readonly data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Get the API base URL from localStorage or environment
 */
export function getApiBaseUrl(): string {
  return localStorage.getItem('apiBaseUrl') || DEFAULT_API_BASE_URL;
}

/**
 * Set the API base URL in localStorage
 */
export function setApiBaseUrl(url: string): void {
  localStorage.setItem('apiBaseUrl', url);
}

/**
 * Get the current Firebase ID token
 * Returns null if user is not authenticated
 */
async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) {
    return null;
  }

  try {
    // getIdToken(true) forces a refresh if token is expired
    return await user.getIdToken();
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

/**
 * Options for API requests
 */
export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
}

/**
 * Make an authenticated API request
 *
 * @param endpoint - API endpoint (e.g., '/api/call')
 * @param options - Fetch options with optional body as object
 * @returns Parsed JSON response
 * @throws ApiError if request fails
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { body, skipAuth = false, headers: customHeaders, ...fetchOptions } = options;

  const baseUrl = getApiBaseUrl();

  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...customHeaders,
  };

  // Add authorization header if authenticated and not skipped
  if (!skipAuth) {
    const token = await getAuthToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  // Build request options
  const requestOptions: RequestInit = {
    ...fetchOptions,
    headers,
  };

  // Add body if present
  if (body !== undefined) {
    requestOptions.body = JSON.stringify(body);
  }

  // Make request
  const response = await fetch(`${baseUrl}${endpoint}`, requestOptions);

  // Parse response
  let data: unknown;
  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // Handle errors
  if (!response.ok) {
    const errorMessage =
      typeof data === 'object' && data !== null && 'error' in data
        ? (data as { error: string }).error
        : `HTTP ${response.status}`;

    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}

/**
 * Make a GET request
 */
export async function apiGet<T = unknown>(
  endpoint: string,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * Make a POST request
 */
export async function apiPost<T = unknown>(
  endpoint: string,
  body?: unknown,
  options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, method: 'POST', body });
}

/**
 * Check if a URL is absolute (starts with http:// or https://)
 */
function isAbsoluteUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Download a file from the API
 * Returns the response for handling blob/buffer data
 * @param urlOrEndpoint - Full URL or API endpoint (e.g., '/api/call/123/download')
 */
export async function apiDownload(
  urlOrEndpoint: string,
  options: Omit<ApiRequestOptions, 'body'> = {}
): Promise<Response> {
  const { skipAuth = false, headers: customHeaders, ...fetchOptions } = options;

  // Use URL as-is if absolute, otherwise prepend base URL
  const url = isAbsoluteUrl(urlOrEndpoint)
    ? urlOrEndpoint
    : `${getApiBaseUrl()}${urlOrEndpoint}`;

  const headers: HeadersInit = {
    'Accept': '*/*',
    ...customHeaders,
  };

  if (!skipAuth) {
    const token = await getAuthToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new ApiError(`Download failed: HTTP ${response.status}`, response.status);
  }

  return response;
}

/**
 * Fetch an audio file and return a blob URL for playback
 * @param endpoint - API endpoint for the audio file
 * @returns Blob URL that can be used in audio elements
 */
export async function fetchAudioBlobUrl(endpoint: string): Promise<string> {
  const response = await apiDownload(endpoint);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

/**
 * Trigger a file download with authentication
 * @param endpoint - API endpoint for the file
 * @param filename - Suggested filename for the download
 */
export async function downloadFile(endpoint: string, filename: string): Promise<void> {
  const response = await apiDownload(endpoint);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the blob URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
