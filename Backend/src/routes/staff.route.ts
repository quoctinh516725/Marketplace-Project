import express, { Router } from "express";
import {
  authenticate,
  requirePermission,
} from "../middlewares/auth.middleware";
import { PermissionCode } from "../constants/permissionCode";
import { validatePagination } from "../validations/public.validation";
import shopController from "../controllers/staff/shop.controller";
import productController from "../controllers/staff/product.controller";
import categoryController from "../controllers/staff/category.controller";

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

const categoryRoute = Router();
categoryRoute.get(
  "/",
  validatePagination,
  requirePermission([PermissionCode.VIEW_PRODUCT]),
  categoryController.getAllCategory,
);
categoryRoute.get(
  "/tree",
  requirePermission([PermissionCode.VIEW_PRODUCT]),
  categoryController.getCategoryTree,
);
categoryRoute.get(
  "/:id",
  requirePermission([PermissionCode.VIEW_PRODUCT]),
  categoryController.getCategoryById,
);
categoryRoute.post(
  "/",
  requirePermission([PermissionCode.CREATE_CATEGORY]),
  categoryController.createCategory,
);
categoryRoute.patch(
  "/:id",
  requirePermission([PermissionCode.UPDATE_CATEGORY]),
  categoryController.updateCategory,
);
categoryRoute.patch(
  "/:id/status",
  requirePermission([PermissionCode.UPDATE_CATEGORY]),
  categoryController.updateCategoryStatus,
);
categoryRoute.delete(
  "/:id",
  requirePermission([PermissionCode.DELETE_CATEGORY]),
  categoryController.deleteCategory,
);
categoryRoute.post(
  "/:id/attributes",
  requirePermission([PermissionCode.UPDATE_CATEGORY]),
  categoryController.createCategoryAttribute,
);
categoryRoute.delete(
  "/:id/attributes/:attributeId",
  requirePermission([PermissionCode.UPDATE_CATEGORY]),
  categoryController.deleteCategoryAttribute,
);


router.use("/categories", categoryRoute);

export default router;
