import { Router } from "express";
import chatController from "../controllers/chat.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validatePagination } from "../validations/public.validation";

const router = Router();
router.use(authenticate);
router.post("/start", chatController.startConversation);
router.get("/conversations", chatController.getConversations);
router.get(
  "/:conversationId/messages",
  validatePagination,
  chatController.getMessages,
);
router.post("/:conversationId/messages", chatController.sendMessage);
router.post("/:conversationId/mark-as-read", chatController.markAsRead);

export default router;
