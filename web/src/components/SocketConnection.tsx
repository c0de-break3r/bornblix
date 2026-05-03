import { useSocketStore } from '@/lib/socketStore';
import { useAuth } from '@clerk/clerk-react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/** Connect Socket.IO when signed in (Whisper-style). */
export default function SocketConnection() {
  const { getToken, isSignedIn, userId } = useAuth();
  const queryClient = useQueryClient();
  const connect = useSocketStore((s) => s.connect);
  const disconnect = useSocketStore((s) => s.disconnect);

  useEffect(() => {
    if (!isSignedIn || !userId) {
      disconnect();
      return;
    }

    let cancelled = false;
    void getToken().then((token) => {
      if (cancelled || !token) return;
      connect(token, queryClient, userId);
    });

    return () => {
      cancelled = true;
      disconnect();
    };
  }, [isSignedIn, userId, connect, disconnect, getToken, queryClient]);

  return null;
}
