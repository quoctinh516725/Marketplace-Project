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
import adminController from "../controllers/admin.controller";

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
userRoute.patch(
  "/:id/status",
  requirePermission([PermissionCode.MANAGE_USER_STATUS]),
  userController.updateUserStatus,
);

userRoute.post(
  "/:userId/roles",
  requireRole([UserRole.ADMIN]),
  roleController.assignRoleToUser,
);
userRoute.delete(
  "/:userId/roles",
  requireRole([UserRole.ADMIN]),
  roleController.revokeRoleFromUser,
);

userRoute.post(
  "/:userId/permissions",
  requireRole([UserRole.ADMIN]),
  permissionController.assignPermissionToUser,
);
userRoute.delete(
  "/:userId/permissions",
  requireRole([UserRole.ADMIN]),
  permissionController.removePermissionFromUser,
);
router.use("/users", userRoute);

// --- ROLE ROUTE --- //
const roleRoute = Router();
roleRoute.use(requireRole([UserRole.ADMIN]));

roleRoute.get("/", roleController.getAllRoles);
roleRoute.get("/:id", roleController.getRoleById);

roleRoute.post("/", roleController.create);
roleRoute.patch("/:id", roleController.updateRole);
roleRoute.delete("/:id", roleController.delete);

roleRoute.post(
  "/:roleId/permissions",
  permissionController.assignPermissionToRole,
);
roleRoute.delete(
  "/:roleId/permissions",
  permissionController.removePermissionFromRole,
);

router.use("/roles", roleRoute);

// --- PERMISION ROUTE --- //
const permissionRoute = Router();
permissionRoute.use(requireRole([UserRole.ADMIN]));

permissionRoute.post("/", permissionController.create);
permissionRoute.get("/", validatePagination, permissionController.getAll);
permissionRoute.patch("/:id", permissionController.update);
permissionRoute.delete("/:id", permissionController.delete);

router.use("/permissions", permissionRoute);

// --- SYSTEM
const systemRoutes = Router();
systemRoutes.use(requireRole([UserRole.ADMIN]));

systemRoutes.get("/settings", adminController.getSystemSettings);
systemRoutes.post("/settings", adminController.createSystemSetting);
systemRoutes.patch("/settings/:key", adminController.updateSystemSetting);
systemRoutes.delete("/settings/:key", adminController.deleteSystemSetting);

router.use("/", systemRoutes);

export default router;
