import { Router } from "express";
import { validatePagination } from "../validations/public.validation";
import productController from "../controllers/public/product.controller";
import userController from "../controllers/user.controller";
import shopController from "../controllers/public/shop.controller";
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

router.use("/products", productRoute);
export default router;
