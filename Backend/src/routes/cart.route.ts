import { Router } from "express";
import cartController from "../controllers/cart.controller";
import { optionalAuthenticate } from "../middlewares/auth.middleware";
const router = Router();
router.use(optionalAuthenticate);

router.post("/", cartController.addToCart);
router.get("/", cartController.getCart);
router.patch("/:id", cartController.updateQuantity);
router.delete("/:id", cartController.removeCart);

export default router;
