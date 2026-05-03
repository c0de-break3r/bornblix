import { useChats, useEnsureAiChat } from '@/src/hooks/useChats';
import { useSocketStore } from '@/src/lib/socketStore';
import type { BornblixChat } from '@/src/types/chat';
import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function ChatRow({
  chat,
  unread,
}: {
  chat: BornblixChat;
  unread: boolean;
}) {
  const title = chat.title ?? (chat.kind === 'ai' ? 'Bōōns' : 'Chat');
  const subtitle = chat.lastMessage ?? 'Tap to open';

  return (
    <Pressable
      onPress={() =>
        router.push(
          `/chat/${String(chat._id)}?title=${encodeURIComponent(title)}` as Href
        )
      }
      className="mx-4 mb-3 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 active:opacity-80"
    >
      <View className="flex-row items-center justify-between">
        <Text
          className="text-gold text-lg font-semibold flex-1 mr-2"
          style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {unread ? <View className="w-2 h-2 rounded-full bg-gold" /> : null}
      </View>
      <Text
        className="text-textSec text-sm mt-1"
        style={{ fontFamily: 'Nunito_400Regular' }}
        numberOfLines={2}
      >
        {subtitle}
      </Text>
      <Text className="text-textSec/60 text-xs mt-2 uppercase" style={{ fontFamily: 'Nunito_400Regular' }}>
        {chat.kind}
      </Text>
    </Pressable>
  );
}

export default function ChatsTab() {
  const { data: chats, isLoading, refetch, isRefetching } = useChats();
  const ensureAi = useEnsureAiChat();
  const unread = useSocketStore((s) => s.unreadChats);

  const openBoons = async () => {
    const chat = await ensureAi.mutateAsync();
    const t = chat.title ?? 'Bōōns';
    router.push(`/chat/${String(chat._id)}?title=${encodeURIComponent(t)}` as Href);
  };

  return (
    <SafeAreaView className="flex-1 bg-bgPrimary" edges={['top']}>
      <View className="px-4 pt-2 pb-4 flex-row items-center justify-between">
        <Text className="text-gold text-2xl font-bold" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>
          Chats
        </Text>
        <Pressable onPress={() => refetch()} className="p-2">
          <Ionicons name="refresh" size={22} color="#F97316" />
        </Pressable>
      </View>

      <Pressable
        onPress={openBoons}
        disabled={ensureAi.isPending}
        className="mx-4 mb-4 rounded-2xl bg-gold/20 border border-gold/40 px-4 py-4 flex-row items-center gap-3"
      >
        <Ionicons name="sparkles" size={24} color="#F97316" />
        <View className="flex-1">
          <Text className="text-gold font-bold" style={{ fontFamily: 'Nunito_700Bold' }}>
            Bōōns (AI)
          </Text>
          <Text className="text-textSec text-sm" style={{ fontFamily: 'Nunito_400Regular' }}>
            Open or create your companion thread
          </Text>
        </View>
        {ensureAi.isPending ? <ActivityIndicator color="#F97316" /> : null}
      </Pressable>

      {isLoading || isRefetching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#F97316" />
        </View>
      ) : (
        <FlatList
          data={chats ?? []}
          keyExtractor={(c) => String(c._id)}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <Text className="text-textSec text-center px-8 mt-8" style={{ fontFamily: 'Nunito_400Regular' }}>
              No threads yet. Start with Bōōns above.
            </Text>
          }
          renderItem={({ item }) => (
            <ChatRow chat={item} unread={unread.has(String(item._id))} />
          )}
        />
      )}
    </SafeAreaView>
  );
}
