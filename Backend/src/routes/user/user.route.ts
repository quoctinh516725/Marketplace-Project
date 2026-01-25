import express from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import userController from "../../controllers/user.controller";
import { upload } from "../../config/multer";
const router = express.Router();
router.use(authenticate);

router.get("/me", userController.getMe);
router.patch("/", userController.update);

router.patch("/avatar", upload.single("avatar"), userController.updateAvatar);

export default router;
