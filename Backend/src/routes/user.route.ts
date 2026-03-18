import express from "express";
import { authenticate, requirePermission } from "../middlewares/auth.middleware";
import userController from "../controllers/user.controller";
import { upload } from "../config/multer";
import { PermissionCode } from "../constants/permissionCode";

const router = express.Router();
router.use(authenticate);

router.get("/me", userController.getMe);
router.get("/profile/:id", userController.getProfile);
router.patch("/", userController.update);
router.patch("/avatar", upload.single("avatar"), userController.updateAvatar);

router.post(
  "/address",
  requirePermission([PermissionCode.CREATE_ADDRESS]),
  userController.createUserAddress
);
router.patch(
  "/address/:id",
  requirePermission([PermissionCode.UPDATE_ADDRESS]),
  userController.updateUserAddress
);
router.delete(
  "/address/:id",
  requirePermission([PermissionCode.DELETE_ADDRESS]),
  userController.deleteUserAddress
);


export default router;
