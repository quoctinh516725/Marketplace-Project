import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import chatService from "../services/chat/chat.service";
import { sendSuccess } from "../utils/response";

class ChatController {
  startConversation = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const { receiverId } = req.body;

    const conversation = await chatService.startConversation(
      userId,
      receiverId,
    );
    return sendSuccess(res, conversation, "Bắt đầu hội thoại thành công!");
  });

  getConversations = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const conversations = await chatService.getConversations(userId);
    return sendSuccess(
      res,
      conversations,
      "Lấy danh sách hội thoại thành công!",
    );
  });

  getMessages = asyncHandler(async (req: Request, res: Response) => {
    const conversationId = req.params.conversationId as string;
    const { page, limit } = req.pagination!;
    const messages = await chatService.getMessages(conversationId, {
      page,
      limit,
    });
    return sendSuccess(res, messages, "Lấy danh sách tin nhắn thành công!");
  });

  sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const conversationId = req.params.conversationId as string;
    const senderId = req.user?.userId as string;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      throw new Error("Nội dung tin nhắn không được để trống!");
    }

    const message = await chatService.sendMessage(
      conversationId,
      senderId,
      content,
    );
    return sendSuccess(res, message, "Gửi tin nhắn thành công!");
  });

  markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const conversationId = req.params.conversationId as string;
    const userId = req.user?.userId as string;
    await chatService.markMessagesAsRead(conversationId, userId);
    return sendSuccess(res, {}, "Đánh dấu tin nhắn đã đọc thành công!");
  });
}
export default new ChatController();
