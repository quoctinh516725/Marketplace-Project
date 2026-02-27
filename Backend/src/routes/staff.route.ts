import express, { Router } from "express";
import {
  authenticate,
  requirePermission,
} from "../middlewares/auth.middleware";
import { PermissionCode } from "../constants/permissionCode";
import { validatePagination } from "../validations/public.validation";
import shopController from "../controllers/staff/shop.controller";
import productController from "../controllers/staff/product.controller";
const router = express.Router();
router.use(authenticate);

const shopRouter = Router();
shopRouter.get(
  "/",
  validatePagination,
  requirePermission([PermissionCode.VIEW_SHOP]),
  shopController.getAllShop,
);

shopRouter.post(
  "/:shopId/review",
  requirePermission([PermissionCode.MANAGE_SHOP_STATUS]),
  shopController.reviewRequestCreateShop,
);

shopRouter.patch(
  "/:shopId/banned",
  requirePermission([PermissionCode.MANAGE_SHOP_STATUS]),
  shopController.bannedShop,
);
router.use("/shops", shopRouter);

const productRoute = Router();
productRoute.get(
  "/",
  validatePagination,
  requirePermission([PermissionCode.VIEW_PRODUCT]),
  productController.getAllProducts,
);
productRoute.get(
  "/:id",
  requirePermission([PermissionCode.VIEW_PRODUCT]),
  productController.getProductById,
);
productRoute.post(
  "/:id/review",
  requirePermission([PermissionCode.APPROVE_PRODUCT]),
  productController.reviewProductApproval,
);
productRoute.patch(
  "/:id/status",
  requirePermission([PermissionCode.APPROVE_PRODUCT]),
  productController.updateProductStatus,
);

router.use("/products", productRoute);

export default router;
