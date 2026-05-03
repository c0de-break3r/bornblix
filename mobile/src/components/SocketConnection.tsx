import { useSocketStore } from '@/src/lib/socketStore';
import { useAuth } from '@clerk/clerk-expo';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * Whisper-style: connect Socket.IO when signed in; disconnect on sign-out.
 */
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
    getToken().then((token) => {
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
