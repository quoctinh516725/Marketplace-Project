import express from "express";
import {
  authenticate,
  requirePermission,
} from "../middlewares/auth.middleware";
import { upload } from "../config/multer";
import shopController from "../controllers/seller/shop.controller";
import analyticController from "../controllers/seller/analytic.controller";
import { PermissionCode } from "../constants/permissionCode";
import { validatePagination } from "../validations/public.validation";
import productController from "../controllers/seller/product.controller";
import orderController from "../controllers/seller/order.controller";

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

productRouter.delete(
  "/variants/:id",
  requirePermission([PermissionCode.DELETE_PRODUCT]),
  productController.deleteVariant,
);

router.use("/products", productRouter);

// MANAGE ORDER
const orderRouter = express.Router();
orderRouter.get(
  "/",
  validatePagination,
  requirePermission([PermissionCode.VIEW_ORDER]),
  orderController.getShopOrders,
);

orderRouter.patch(
  "/:id/status",
  requirePermission([PermissionCode.UPDATE_ORDER]),
  orderController.updateSubOrderStatus,
);

orderRouter.post(
  "/:id/refund",
  requirePermission([PermissionCode.UPDATE_ORDER]),
  orderController.handleRefundRequest,
);

router.use("/orders", orderRouter);

const analyticRouter = express.Router();
analyticRouter.get(
  "/overview",
  requirePermission([PermissionCode.VIEW_SHOP_REPORTS]),
  analyticController.getOverview,
);
analyticRouter.get(
  "/revenue",
  requirePermission([PermissionCode.VIEW_SHOP_REPORTS]),
  analyticController.getRevenueByTime,
);
analyticRouter.get(
  "/top-products",
  requirePermission([PermissionCode.VIEW_SHOP_REPORTS]),
  analyticController.getTopProducts,
);
analyticRouter.get(
  "/stats",
  requirePermission([PermissionCode.VIEW_SHOP_REPORTS]),
  analyticController.getOrderStats,
);

router.use("/analytics", analyticRouter);

export default router;
