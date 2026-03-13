import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import notificationController from "../controllers/notification.controller";
import { validatePagination } from "../validations/public.validation";

const router = express.Router();
router.use(authenticate);

router.get("/", validatePagination, notificationController.getNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/:id/read", notificationController.markAsRead);
router.patch("/read-all", notificationController.markAllAsRead);
router.delete("/:id", notificationController.deleteNotification);

export default router;
