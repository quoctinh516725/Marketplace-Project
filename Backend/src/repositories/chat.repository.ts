import { Conversation } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { InputAll } from "../types";

class ClassRepository {
  existConversation(
    userId1: string,
    userId2: string,
  ): Promise<Conversation | null> {
    return prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: userId1 } } },
          { participants: { some: { userId: userId2 } } },
        ],
      },
      include: { participants: true },
    });
  }

  findConversationById(conversationId: string) {
    return prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        participants: { select: { userId: true } },
      },
    });
  }

  getConversationsByUserId(userId: string) {
    return prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
    });
  }

  getMessagesByConversationId(conversationId: string, input: InputAll) {
    const { page, limit } = input;

    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  createConversation(userId1: string, userId2: string) {
    return prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: userId1 }, { userId: userId2 }],
        },
      },
    });
  }

  createMessage(conversationId: string, senderId: string, content: string) {
    return prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
      },
    });
  }

  markMessagesAsRead(conversationId: string, userId: string) {
    return prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });
  }
}
export default new ClassRepository();
