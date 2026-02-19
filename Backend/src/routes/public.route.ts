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
router.use("/shops", shopRoute)

// PRODUCT ROUTE
const productRoute = Router();

// Get Product by Shop
productRoute.get(
  "/shop/:shopId",
  validatePagination,
  productController.getShopProducts,
);
router.use("/products", productRoute);
export default router;
