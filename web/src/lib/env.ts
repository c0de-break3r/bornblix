/** @returns e.g. http://localhost:3000/api */
export function getApiBaseUrl(): string {
  const u = import.meta.env.VITE_API_URL?.trim();
  if (u) return u.replace(/\/$/, '');
  return 'http://localhost:3000/api';
}

export function getSocketUrl(): string {
  const s = import.meta.env.VITE_SOCKET_URL?.trim();
  if (s) return s.replace(/\/$/, '');
  return getApiBaseUrl().replace(/\/api$/, '');
}
