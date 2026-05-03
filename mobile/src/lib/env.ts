/**
 * API: `EXPO_PUBLIC_API_URL` — e.g. http://192.168.1.5:3000/api (device) or http://localhost:3000/api (simulator).
 * Socket: optional `EXPO_PUBLIC_SOCKET_URL` — same host without `/api`, e.g. http://192.168.1.5:3000
 */
export function getApiBaseUrl(): string {
  const u = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (u) return u.replace(/\/$/, '');
  return 'http://localhost:3000/api';
}

export function getSocketUrl(): string {
  const s = process.env.EXPO_PUBLIC_SOCKET_URL?.trim();
  if (s) return s.replace(/\/$/, '');
  return getApiBaseUrl().replace(/\/api$/, '');
}
