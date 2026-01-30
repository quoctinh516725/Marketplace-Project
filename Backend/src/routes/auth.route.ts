import express from "express";
import authController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { rateLimit } from "../middlewares/rateLimit.middleware";

const router = express.Router();

router.post(
  "/login",
  rateLimit({
    prefix: "login",
    limit: 5,
    windowSeconds: 60,
  }),
  authController.login,
);
router.post("/register", authController.register);
router.post(
  "/refresh_token",
  rateLimit({ prefix: "refresh_token", limit: 5, windowSeconds: 60 }),
  authController.refreshToken,
);

router.post("/logout", authenticate, authController.logout);

export default router;
