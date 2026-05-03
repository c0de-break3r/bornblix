import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { useCallback } from 'react';
import type { ApiEnvelope } from '@/types/chat';
import { getApiBaseUrl } from './env';

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

/** Whisper-style authenticated API calls (Clerk session JWT). */
export function useApi() {
  const { getToken } = useAuth();

  const apiWithAuth = useCallback(
    async <T,>(config: Parameters<typeof api.request>[0]) => {
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
