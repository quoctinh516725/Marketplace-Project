import { Router } from "express";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import adminRoute from "./admin.route";

const router = Router();

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/admin", adminRoute);

export default router;
