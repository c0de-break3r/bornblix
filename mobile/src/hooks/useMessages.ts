import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/src/lib/api';
import type { BornblixMessage } from '@/src/types/chat';

export function useMessages(chatId: string | undefined) {
  const { apiWithAuth } = useApi();

  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: async (): Promise<BornblixMessage[]> => {
      const res = await apiWithAuth<BornblixMessage[]>({
        method: 'GET',
        url: `/messages/${chatId}`,
      });
      return res.data.data;
    },
    enabled: Boolean(chatId),
  });
}
