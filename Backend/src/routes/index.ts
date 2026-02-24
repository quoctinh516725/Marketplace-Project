import { Router } from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import adminRoute from "./admin.route";
import shopRoute from "./seller.route";
import staffRoute from "./staff.route";
import publicRoute from "./public.route";

const router = Router();

router.use("/auth", authRoute);
router.use("/admin", adminRoute);
router.use("/staff", staffRoute);

router.use("/users", userRoute);
router.use("/seller", shopRoute);
router.use("/public", publicRoute);

export default router;
