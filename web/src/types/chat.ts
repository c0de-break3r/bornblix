export type BornblixChatKind = 'ai' | 'direct' | 'group';

export type BornblixChat = {
  _id: string;
  participants: string[];
  kind: BornblixChatKind;
  title?: string;
  createdBy: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BornblixMessage = {
  _id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SocketNewMessagePayload = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: string;
  timestamp: string | Date;
  isFromBoon?: boolean;
};

export type ApiEnvelope<T> = { success: boolean; data: T; message?: string };
