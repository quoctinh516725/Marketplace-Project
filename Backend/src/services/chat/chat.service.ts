import { prisma } from "../../config/prisma";
import chatRepository from "../../repositories/chat.repository";
import userRepository from "../../repositories/user.repository";
import { socketService } from "../../socket";
import { InputAll } from "../../types";

class ChatService {
  startConversation = async (userId: string, receiverId: string) => {
    const conversation = await chatRepository.existConversation(
      userId,
      receiverId,
    );

    const user = await userRepository.findBasicById(prisma, receiverId);
    if (!user) {
      throw new Error("Người dùng không tồn tại!");
    }

    if (conversation) {
      return conversation;
    }
    const conversationCreated = await chatRepository.createConversation(
      userId,
      receiverId,
    );

    socketService.emitToUser(
      receiverId,
      "new_conversation",
      conversationCreated.id,
    );

    return conversationCreated;
  };

  getConversations = async (userId: string) => {
    return await chatRepository.getConversationsByUserId(userId);
  };

  getMessages = async (conversationId: string, input: InputAll) => {
    return await chatRepository.getMessagesByConversationId(
      conversationId,
      input,
    );
  };

  sendMessage = async (
    conversationId: string,
    senderId: string,
    content: string,
  ) => {
    const conversation =
      await chatRepository.findConversationById(conversationId);
    if (!conversation) {
      throw new Error("Hội thoại không tồn tại!");
    }

    const user = await userRepository.findBasicById(prisma, senderId);
    if (!user) {
      throw new Error("Người dùng không tồn tại!");
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId === senderId,
    );
    if (!isParticipant) {
      throw new Error("Bạn không phải là thành viên của hội thoại này!");
    }

    const message = await chatRepository.createMessage(
      conversationId,
      senderId,
      content,
    );

    socketService.emitToSendMessage(conversationId, "receive_message", message);
    return message;
  };

  markMessagesAsRead = async (conversationId: string, userId: string) => {
    const conversation =
      await chatRepository.findConversationById(conversationId);
    if (!conversation) {
      throw new Error("Hội thoại không tồn tại!");
    }

    return await chatRepository.markMessagesAsRead(conversationId, userId);
  };
}
export default new ChatService();
