import express from "express";
import authController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/refresh_token", authController.refreshToken);

router.post("/logout", authenticate, authController.logout);

export default router;
