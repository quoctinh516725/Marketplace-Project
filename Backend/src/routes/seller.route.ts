import express from "express";
import {
  authenticate,
  requirePermission,
} from "../middlewares/auth.middleware";
import { upload } from "../config/multer";
import shopController from "../controllers/seller/shop.controller";
import { PermissionCode } from "../constants/permissionCode";
import { validatePagination } from "../validations/public.validation";
import productController from "../controllers/seller/product.controller";

const router = express.Router();
router.use(authenticate);

// MANAGE SHOP
const shopRouter = express.Router();
shopRouter.get(
  "/me",
  requirePermission([PermissionCode.VIEW_SHOP]),
  shopController.getMyShop,
);

shopRouter.post(
  "/",
  requirePermission([PermissionCode.CREATE_SHOP]),
  shopController.create,
);
shopRouter.patch(
  "/",
  requirePermission([PermissionCode.UPDATE_SHOP]),
  shopController.update,
);
shopRouter.patch(
  "/status",
  requirePermission([PermissionCode.UPDATE_SHOP]),
  shopController.updateShopStatus,
);
shopRouter.patch(
  "/logo",
  requirePermission([PermissionCode.UPDATE_SHOP]),
  upload.single("logo"),
  shopController.updateLogo,
);
shopRouter.patch(
  "/background",
  requirePermission([PermissionCode.UPDATE_SHOP]),
  upload.single("background"),
  shopController.updateBackground,
);
router.use("/shops", shopRouter);

// MANAGE PRODUCT
const productRouter = express.Router();
productRouter.get(
  "/",
  validatePagination,
  requirePermission([PermissionCode.VIEW_PRODUCT]),
  productController.getMyProducts,
);
productRouter.get(
  "/:id",
  requirePermission([PermissionCode.VIEW_PRODUCT]),
  productController.getMyProductById,
);
productRouter.post(
  "/",
  requirePermission([PermissionCode.CREATE_PRODUCT]),
  productController.createProduct,
);

productRouter.post(
  "/:id/thumbnail",
  requirePermission([PermissionCode.CREATE_PRODUCT]),
  upload.single("thumbnail"),
  productController.uploadThumbnail,
);

productRouter.post(
  "/:id/images",
  requirePermission([PermissionCode.CREATE_PRODUCT]),
  upload.array("images", 10),
  productController.uploadImages,
);
productRouter.patch(
  "/:id",
  requirePermission([PermissionCode.UPDATE_PRODUCT]),
  productController.updateProduct,
);
productRouter.patch(
  "/:id/status",
  requirePermission([PermissionCode.UPDATE_PRODUCT]),
  productController.updateProductStatus,
);
productRouter.delete(
  "/:id",
  requirePermission([PermissionCode.DELETE_PRODUCT]),
  productController.deleteProduct,
);

router.use("/products", productRouter);

export default router;
