import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import userController from "../controllers/user.controller";
import { upload } from "../config/multer";
const router = express.Router();
router.use(authenticate);

router.get("/me", userController.getMe);
router.get("/profile/:id", userController.getProfile);
router.patch("/", userController.update);
router.patch("/avatar", upload.single("avatar"), userController.updateAvatar);
router.post("/address", userController.createUserAddress);
router.patch("/address/:id", userController.updateUserAddress);
router.delete("/address/:id", userController.deleteUserAddress);


export default router;
