import express from "express";
import {
  authenticate,
  requirePermission,
} from "../middlewares/auth.middleware";
import { upload } from "../config/multer";
import shopController from "../controllers/seller/shop.controller";
import { PermissionCode } from "../constants/permissionCode";
const router = express.Router();
router.use(authenticate);
router.get(
  "/me",
  requirePermission([PermissionCode.VIEW_SHOP]),
  shopController.getMyShop,
);
router.post(
  "/",
  requirePermission([PermissionCode.CREATE_SHOP]),
  shopController.create,
);
router.patch(
  "/",
  requirePermission([PermissionCode.UPDATE_SHOP]),
  shopController.update,
);
router.patch(
  "/logo",
  requirePermission([PermissionCode.UPDATE_SHOP]),
  upload.single("logo"),
  shopController.updateLogo,
);
router.patch(
  "/background",
  requirePermission([PermissionCode.UPDATE_SHOP]),
  upload.single("background"),
  shopController.updateBackground,
);

export default router;
