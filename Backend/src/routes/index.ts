import { Router } from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import adminRoute from "./admin.route";
import shopRoute from "./seller.route";
import staffRoute from "./staff.route";
import publicRoute from "./public.route";
import cartRoute from "./cart.route";
import paymentRoute from "./payment.route";
import chatRoute from "./chat.route";
import notificationRoute from "./notification.route";
import voucherRoute from "./voucher.route";
import reviewRoute from "./review.route";
import orderRoute from "./order.routes";

const router = Router();

router.use("/auth", authRoute);
router.use("/admin", adminRoute);
router.use("/staff", staffRoute);

router.use("/users", userRoute);
router.use("/seller", shopRoute);
router.use("/public", publicRoute);
router.use("/cart", cartRoute);
router.use("/orders", orderRoute);
router.use("/payments", paymentRoute);
router.use("/chat", chatRoute);
router.use("/notifications", notificationRoute);
router.use("/vouchers", voucherRoute);
router.use("/reviews", reviewRoute);

export default router;
