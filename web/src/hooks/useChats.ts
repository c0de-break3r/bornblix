import { useApi } from '@/lib/api';
import type { BornblixChat } from '@/types/chat';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useChats() {
  const { apiWithAuth } = useApi();

  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const res = await apiWithAuth<BornblixChat[]>({ method: 'GET', url: '/chat' });
      return res.data.data;
    },
  });
}

export function useEnsureAiChat() {
  const { apiWithAuth } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await apiWithAuth<BornblixChat>({
        method: 'POST',
        url: '/chat',
        data: { kind: 'ai' },
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}
