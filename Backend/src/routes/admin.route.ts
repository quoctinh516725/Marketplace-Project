import express, { Router } from "express";
import {
  authenticate,
  requirePermission,
  requireRole,
} from "../middlewares/auth.middleware";
import userController from "../controllers/user.controller";
import { UserRole } from "../constants";
import { validatePagination } from "../validations/public.validation";
import roleController from "../controllers/role.controller";
import permissionController from "../controllers/permission.controller";
import { PermissionCode } from "../constants/permissionCode";

const router = express.Router();
router.use(authenticate);

// --- USER ROUTE --- //
const userRoute = Router();

userRoute.get(
  "/",
  validatePagination,
  requirePermission([PermissionCode.VIEW_USER]),
  userController.getUsers,
);
userRoute.get(
  "/:id",
  requirePermission([PermissionCode.VIEW_USER]),
  userController.getUserById,
);
userRoute.delete(
  "/:id",
  requirePermission([PermissionCode.DELETE_USER]),
  userController.delete,
);
router.use("/users", userRoute);

// --- ROLE ROUTE --- //
const roleRoute = Router();
roleRoute.use(requireRole([UserRole.ADMIN]));

roleRoute.get("/", roleController.getAllRoles);
roleRoute.post("/", roleController.create);
roleRoute.patch("/:id", roleController.updateRole);
roleRoute.delete("/:id", roleController.delete);

roleRoute.post("/:id/users", roleController.asignRoleToUser);
roleRoute.delete("/:id/users", roleController.revokeRoleFromUser);
router.use("/roles", roleRoute);

// --- PERMISION ROUTE --- //
const permissionRoute = Router();
permissionRoute.use(requireRole([UserRole.ADMIN]));

permissionRoute.post("/", permissionController.create);
permissionRoute.get("/", validatePagination, permissionController.getAll);
permissionRoute.patch("/:id", permissionController.update);
permissionRoute.delete("/:id", permissionController.delete);

permissionRoute.post(
  "/:roleId/roles",
  permissionController.assignPermissionToRole,
);
permissionRoute.delete(
  "/:roleId/roles",
  permissionController.removePermissionFromRole,
);
permissionRoute.post(
  "/:userId/users",
  permissionController.assignPermissionToUser,
);
permissionRoute.delete(
  "/:userId/users",
  permissionController.removePermissionFromUser,
);

router.use("/permission", permissionRoute);

export default router;
