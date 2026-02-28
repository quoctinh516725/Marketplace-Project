import { Router } from "express";
import {
  validatePagination,
  validateSearchProducts,
} from "../validations/public.validation";
import productController from "../controllers/public/product.controller";
import userController from "../controllers/user.controller";
import shopController from "../controllers/public/shop.controller";
import categoryController from "../controllers/public/category.controller";

const router = Router();

// USER ROUTE
const userRoute = Router();
userRoute.get("/profile/:id", userController.getProfile);
router.use("/users", userRoute);

// SHOP ROUTE
const shopRoute = Router();
shopRoute.get("/:slug", shopController.getShopBySlug);
router.use("/shops", shopRoute);

// PRODUCT ROUTE
const productRoute = Router();
productRoute.get("/", validatePagination, productController.getAllProducts);
productRoute.get(
  "/search",
  validatePagination,
  validateSearchProducts,
  productController.searchProducts,
);
productRoute.get("/:id", validatePagination, productController.getProductById);
productRoute.get(
  "/shop/:shopId",
  validatePagination,
  productController.getShopProducts,
);
productRoute.get(
  "/category/:categoryId",
  validatePagination,
  productController.getCategoryProducts,
);
productRoute.get("/slug/:slug", productController.getProductBySlug);
router.use("/products", productRoute);

// CATEGORY ROUTE
const categoryRoute = Router();
categoryRoute.get("/", validatePagination, categoryController.getActiveCategory);
categoryRoute.get("/tree", categoryController.getCategoryTree);
categoryRoute.get("/slug/:slug", categoryController.getCategoryBySlug);
categoryRoute.get("/:id/attributes", categoryController.getAttributeByCategoryId);
categoryRoute.get("/:id", categoryController.getCategoryById);
router.use("/categories", categoryRoute);

export default router;
