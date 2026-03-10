import { Router } from "express";
import orderController from "../controllers/order.controller";
import { authenticate } from "../middlewares/auth.middleware";
import paymentController from "../controllers/payment.controller";

const router = Router();

router.use(authenticate);

router.post("/checkout", orderController.checkout);
router.post("/:orderId/payments", paymentController.getPaymentUrl);
// router.get("/my-orders", orderController.getMyOrders);
// router.get("/:orderId", orderController.getOrderDetail);
// router.post("/cancel/:subOrderId", orderController.cancelSubOrder);

export default router;
