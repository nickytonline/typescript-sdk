import { TokenStorage } from './token-storage.js';
import { defaultConfig } from './config.js';

let config = defaultConfig;

export function configure(newConfig: Partial<typeof config>) {
  config = { ...config, ...newConfig };
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = config.tokenStorage.getToken();
  if (!token) {
    throw new Error('No access token available');
  }

  // Create new Headers object from existing headers or empty object
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);

  // Create new options object with updated headers
  const newOptions: RequestInit = {
    ...options,
    headers,
  };

  return fetch(url, newOptions);
}