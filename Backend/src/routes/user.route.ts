import express from "express";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import userController from "../controllers/user.controller";
import { upload } from "../config/multer";
import { validatePagination } from "../validations/public.validation";
import { UserRole } from "../constants";
const router = express.Router();
router.use(authenticate);

router.get("/me", userController.getMe);
router.get("/profile/:id", userController.getProfile);
router.patch("/", userController.update);
router.patch("/avatar", upload.single("avatar"), userController.updateAvatar);

export default router;
