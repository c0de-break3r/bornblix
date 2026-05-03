import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';
import type { QueryClient } from '@tanstack/react-query';
import type { BornblixChat, BornblixMessage, SocketNewMessagePayload } from '@/types/chat';
import { getSocketUrl } from './env';

type TypingPayload = { userId: string; chatId: string; isTyping: boolean };

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  typingUsers: Map<string, string>;
  unreadChats: Set<string>;
  currentChatId: string | null;
  viewerClerkId: string | null;
  queryClient: QueryClient | null;

  connect: (token: string, queryClient: QueryClient, viewerClerkId: string) => void;
  disconnect: () => void;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (chatId: string, text: string, currentUserId: string) => void;
  sendTyping: (chatId: string, isTyping: boolean) => void;
}

function normalizeMessage(payload: SocketNewMessagePayload, chatKey: string): BornblixMessage {
  const ts =
    typeof payload.timestamp === 'string'
      ? payload.timestamp
      : new Date(payload.timestamp).toISOString();
  return {
    _id: payload.id,
    chatId: chatKey,
    senderId: payload.senderId,
    content: payload.content,
    type: payload.type,
    createdAt: ts,
  };
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
  typingUsers: new Map(),
  unreadChats: new Set(),
  currentChatId: null,
  viewerClerkId: null,
  queryClient: null,

  connect: (token, queryClient, viewerClerkId) => {
    const existing = get().socket;
    if (existing?.connected) return;
    existing?.disconnect();

    const socket = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => set({ isConnected: true }));
    socket.on('disconnect', () => set({ isConnected: false }));

    socket.on('online-users', ({ userIds }: { userIds: string[] }) => {
      set({ onlineUsers: new Set(userIds) });
    });
    socket.on('user-online', ({ userId }: { userId: string }) => {
      set((s) => ({ onlineUsers: new Set([...s.onlineUsers, userId]) }));
    });
    socket.on('user-offline', ({ userId }: { userId: string }) => {
      set((s) => {
        const next = new Set(s.onlineUsers);
        next.delete(userId);
        return { onlineUsers: next };
      });
    });

    socket.on('newMessage', (payload: SocketNewMessagePayload) => {
      const chatKey = payload.chatId;
      const msg = normalizeMessage(payload, chatKey);
      const { currentChatId, viewerClerkId: viewer } = get();

      queryClient.setQueryData<BornblixMessage[]>(['messages', chatKey], (old) => {
        if (!old) return [msg];
        const filtered = old.filter((m) => !String(m._id).startsWith('temp-'));
        if (filtered.some((m) => String(m._id) === msg._id)) return filtered;
        return [...filtered, msg];
      });

      queryClient.setQueryData<BornblixChat[]>(['chats'], (oldChats) =>
        oldChats?.map((c) =>
          String(c._id) === chatKey
            ? {
                ...c,
                lastMessage: msg.content.slice(0, 160),
                lastMessageAt: msg.createdAt ?? new Date().toISOString(),
              }
            : c
        )
      );

      if (viewer && currentChatId !== chatKey && payload.senderId !== viewer) {
        set((s) => ({ unreadChats: new Set([...s.unreadChats, chatKey]) }));
      }

      set((s) => {
        const typingUsers = new Map(s.typingUsers);
        typingUsers.delete(chatKey);
        return { typingUsers };
      });

    });

    socket.on('typing', (p: TypingPayload) => {
      set((s) => {
        const typingUsers = new Map(s.typingUsers);
        if (p.isTyping) typingUsers.set(p.chatId, p.userId);
        else typingUsers.delete(p.chatId);
        return { typingUsers };
      });
    });

    set({ socket, queryClient, viewerClerkId });
  },

  disconnect: () => {
    get().socket?.disconnect();
    set({
      socket: null,
      isConnected: false,
      onlineUsers: new Set(),
      typingUsers: new Map(),
      unreadChats: new Set(),
      currentChatId: null,
      viewerClerkId: null,
      queryClient: null,
    });
  },

  joinChat: (chatId) => {
    const sock = get().socket;
    set((s) => {
      const unread = new Set(s.unreadChats);
      unread.delete(chatId);
      return { currentChatId: chatId, unreadChats: unread };
    });
    sock?.emit('joinChat', chatId);
  },

  leaveChat: (chatId) => {
    const sock = get().socket;
    set({ currentChatId: null });
    sock?.emit('leaveChat', chatId);
  },

  sendMessage: (chatId, text, currentUserId) => {
    const { socket, queryClient } = get();
    if (!socket?.connected || !queryClient) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic: BornblixMessage = {
      _id: tempId,
      chatId,
      senderId: currentUserId,
      content: text,
      type: 'text',
      createdAt: new Date().toISOString(),
    };

    queryClient.setQueryData<BornblixMessage[]>(['messages', chatId], (old) =>
      old ? [...old, optimistic] : [optimistic]
    );

    socket.emit('sendMessage', { chatId, content: text, type: 'text' }, (err?: string) => {
      if (err) {
        queryClient.setQueryData<BornblixMessage[]>(['messages', chatId], (old) =>
          old?.filter((m) => m._id !== tempId) ?? []
        );
      }
    });
  },

  sendTyping: (chatId, isTyping) => {
    get().socket?.emit('typing', { chatId, isTyping });
  },
}));
