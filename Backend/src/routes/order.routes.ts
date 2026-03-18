import { Router } from "express";
import orderController from "../controllers/order.controller";
import { authenticate } from "../middlewares/auth.middleware";
import paymentController from "../controllers/payment.controller";
import { validatePagination } from "../validations/public.validation";
import { idempotencyMiddleware } from "../middlewares/idempotency.middleware";

const router = Router();

router.use(authenticate);

router.post("/checkout", orderController.checkout);
router.post("/:orderId/payments", idempotencyMiddleware, paymentController.getPaymentUrl);
router.get("/", validatePagination, orderController.getMyOrders);
router.get("/:id", orderController.getSubOrderDetail);
router.post("/cancel/:id", idempotencyMiddleware, orderController.cancelSubOrder);
router.post("/confirm/:id", idempotencyMiddleware, orderController.confirmReceived);

export default router;
