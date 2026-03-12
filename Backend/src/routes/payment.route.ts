import { Router } from "express";
import paymentController from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);
router.get("/payment-return", paymentController.getPaymentReturn);
router.get("/vnpay-ipn", paymentController.vnpayIPN);
export default router;
