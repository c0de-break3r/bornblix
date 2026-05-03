import { BOON_SENDER_ID } from '@/src/constants/boon';
import { useMessages } from '@/src/hooks/useMessages';
import { useSocketStore } from '@/src/lib/socketStore';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BornblixMessage } from '@/src/types/chat';

export default function ChatDetailScreen() {
  const { id: rawId, title: rawTitle } = useLocalSearchParams<{ id?: string; title?: string }>();
  const chatId = typeof rawId === 'string' ? rawId : rawId?.[0];
  const title =
    (typeof rawTitle === 'string' ? rawTitle : rawTitle?.[0]) ?? 'Chat';

  const { userId } = useAuth();
  const { data: messages, isLoading } = useMessages(chatId);
  const joinChat = useSocketStore((s) => s.joinChat);
  const leaveChat = useSocketStore((s) => s.leaveChat);
  const sendMessage = useSocketStore((s) => s.sendMessage);
  const sendTyping = useSocketStore((s) => s.sendTyping);
  const isConnected = useSocketStore((s) => s.isConnected);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<FlatList<BornblixMessage>>(null);

  useEffect(() => {
    if (!chatId || !isConnected) return;
    joinChat(chatId);
    return () => leaveChat(chatId);
  }, [chatId, isConnected, joinChat, leaveChat]);

  useEffect(() => {
    if (messages?.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages?.length]);

  const onChangeText = useCallback(
    (v: string) => {
      setText(v);
      if (!chatId || !isConnected) return;
      if (v.length > 0) {
        sendTyping(chatId, true);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => sendTyping(chatId, false), 1200);
      } else {
        sendTyping(chatId, false);
      }
    },
    [chatId, isConnected, sendTyping]
  );

  const onSend = useCallback(async () => {
    const t = text.trim();
    if (!t || !chatId || !userId || sending) return;
    setSending(true);
    setText('');
    sendTyping(chatId, false);
    sendMessage(chatId, t, userId);
    setSending(false);
  }, [chatId, text, userId, sending, sendMessage, sendTyping]);

  if (!chatId) {
    return (
      <SafeAreaView className="flex-1 bg-bgPrimary items-center justify-center">
        <Text className="text-textSec" style={{ fontFamily: 'Nunito_400Regular' }}>
          Missing chat
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bgPrimary" edges={['top']}>
      <View className="flex-row items-center px-3 py-2 border-b border-white/10">
        <Pressable onPress={() => router.back()} hitSlop={12} className="p-2">
          <Ionicons name="chevron-back" size={24} color="#F97316" />
        </Pressable>
        <Text
          className="flex-1 text-gold text-lg font-semibold ml-1"
          style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {!isConnected ? (
          <Text className="text-textSec text-xs" style={{ fontFamily: 'Nunito_400Regular' }}>
            …
          </Text>
        ) : null}
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#F97316" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages ?? []}
            keyExtractor={(item) => String(item._id)}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            renderItem={({ item }) => {
              const isSelf = item.senderId === userId;
              const isBoon = item.senderId === BOON_SENDER_ID || item.type === 'ai';
              const align = isSelf ? 'items-end' : 'items-start';
              const bg = isSelf ? 'bg-gold/25' : isBoon ? 'bg-white/15' : 'bg-white/10';
              return (
                <View className={`mb-3 ${align}`}>
                  <View className={`max-w-[85%] rounded-2xl px-3 py-2 ${bg}`}>
                    <Text className="text-text text-[15px]" style={{ fontFamily: 'Nunito_400Regular' }}>
                      {item.content}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        <View className="flex-row items-end px-3 pb-4 pt-2 border-t border-white/10 gap-2">
          <TextInput
            className="flex-1 rounded-2xl bg-white/10 text-text px-4 py-3 max-h-32"
            placeholder="Message…"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={text}
            onChangeText={onChangeText}
            multiline
            style={{ fontFamily: 'Nunito_400Regular' }}
          />
          <Pressable
            onPress={onSend}
            disabled={sending || !text.trim()}
            className="bg-gold rounded-full p-3 opacity-100 disabled:opacity-40"
          >
            <Ionicons name="send" size={20} color="#0D0D14" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
