import axios, { type AxiosResponse } from 'axios';
import { useAuth } from '@clerk/clerk-expo';
import { useCallback } from 'react';
import { getApiBaseUrl } from './env';

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

export type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

export function unwrapData<T>(res: AxiosResponse<ApiEnvelope<T>>): T {
  return res.data.data;
}

/**
 * Whisper-style hook: authenticated requests with Clerk session JWT.
 */
export function useApi() {
  const { getToken } = useAuth();

  const apiWithAuth = useCallback(
    async <T>(config: Parameters<typeof api.request>[0]) => {
      const token = await getToken();
      return api.request<ApiEnvelope<T>>({
        ...config,
        headers: {
          ...config.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    },
    [getToken]
  );

  return { api, apiWithAuth };
}
