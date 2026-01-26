import express, { Router } from "express";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import userController from "../controllers/user.controller";
import { UserRole } from "../constants";
import { validatePagination } from "../validations/public.validation";
import roleController from "../controllers/role.controller";

const router = express.Router();
router.use(authenticate);

// --- USER ROUTE --- //
const userRoute = Router();
userRoute.use(requireRole([UserRole.STAFF, UserRole.ADMIN]));

userRoute.get("/", validatePagination, userController.getUsers);
userRoute.get("/:id", userController.getUserById);
userRoute.delete("/:id", userController.delete);
router.use("/users", userRoute);

// --- ROLE ROUTE --- //
const roleRoute = Router();
roleRoute.use(requireRole([UserRole.ADMIN]));

roleRoute.post("/user/:id", roleController.asignRoleToUser);
router.use("/roles", roleRoute);

export default router;
