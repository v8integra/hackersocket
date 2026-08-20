import { prisma } from "@/lib/prisma";

export type ConversationPreview = {
  otherUser: {
    id: string;
    name: string | null;
    username: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: Date;
    fromMe: boolean;
  };
  unreadCount: number;
};

export type ThreadMessage = {
  id: string;
  content: string;
  createdAt: Date;
  fromMe: boolean;
};

export async function getConversations(userId: string): Promise<ConversationPreview[]> {
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { recipientId: userId }] },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, name: true, username: true } },
      recipient: { select: { id: true, name: true, username: true } },
    },
  });

  const conversations = new Map<string, ConversationPreview>();

  for (const message of messages) {
    const otherUser = message.senderId === userId ? message.recipient : message.sender;
    const existing = conversations.get(otherUser.id);

    if (!existing) {
      conversations.set(otherUser.id, {
        otherUser,
        lastMessage: {
          content: message.content,
          createdAt: message.createdAt,
          fromMe: message.senderId === userId,
        },
        unreadCount: 0,
      });
    }

    if (message.recipientId === userId && !message.readAt) {
      const entry = conversations.get(otherUser.id)!;
      entry.unreadCount += 1;
    }
  }

  return Array.from(conversations.values()).sort(
    (a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime(),
  );
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  return prisma.message.count({ where: { recipientId: userId, readAt: null } });
}

export async function getThread(userId: string, otherUserId: string): Promise<ThreadMessage[]> {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  return messages.map((message) => ({
    id: message.id,
    content: message.content,
    createdAt: message.createdAt,
    fromMe: message.senderId === userId,
  }));
}
