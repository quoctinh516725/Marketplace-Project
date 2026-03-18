import { Router } from "express";
import orderController from "../controllers/order.controller";
import { authenticate, requirePermission } from "../middlewares/auth.middleware";
import paymentController from "../controllers/payment.controller";
import { validatePagination } from "../validations/public.validation";
import { idempotencyMiddleware } from "../middlewares/idempotency.middleware";
import { PermissionCode } from "../constants/permissionCode";

const router = Router();

router.use(authenticate);

router.post(
  "/checkout",
  requirePermission([PermissionCode.CREATE_ORDER]),
  orderController.checkout
);
router.post(
  "/:orderId/payments",
  idempotencyMiddleware,
  requirePermission([PermissionCode.UPDATE_ORDER]),
  paymentController.getPaymentUrl
);
router.get(
  "/",
  validatePagination,
  requirePermission([PermissionCode.VIEW_ORDER]),
  orderController.getMyOrders
);
router.get(
  "/:id",
  requirePermission([PermissionCode.VIEW_ORDER]),
  orderController.getSubOrderDetail
);
router.post(
  "/cancel/:id",
  idempotencyMiddleware,
  requirePermission([PermissionCode.CANCEL_ORDER]),
  orderController.cancelSubOrder
);
router.post(
  "/confirm/:id",
  idempotencyMiddleware,
  requirePermission([PermissionCode.UPDATE_ORDER]),
  orderController.confirmReceived
);

export default router;
