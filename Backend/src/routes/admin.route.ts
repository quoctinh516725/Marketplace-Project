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
  requirePermission([PermissionCode.MANAGE_ROLES]),
  roleController.assignRoleToUser,
);
userRoute.delete(
  "/:userId/roles",
  requirePermission([PermissionCode.MANAGE_ROLES]),
  roleController.revokeRoleFromUser,
);

userRoute.post(
  "/:userId/permissions",
  requirePermission([PermissionCode.MANAGE_PERMISSIONS]),
  permissionController.assignPermissionToUser,
);
userRoute.delete(
  "/:userId/permissions",
  requirePermission([PermissionCode.MANAGE_PERMISSIONS]),
  permissionController.removePermissionFromUser,
);
router.use("/users", userRoute);

// --- ROLE ROUTE --- //
const roleRoute = Router();
roleRoute.use(requirePermission([PermissionCode.MANAGE_ROLES]));

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
permissionRoute.use(requirePermission([PermissionCode.MANAGE_PERMISSIONS]));

permissionRoute.post("/", permissionController.create);
permissionRoute.get("/", validatePagination, permissionController.getAll);
permissionRoute.patch("/:id", permissionController.update);
permissionRoute.delete("/:id", permissionController.delete);

router.use("/permissions", permissionRoute);

// --- SYSTEM
const systemRoutes = Router();
systemRoutes.get(
  "/settings",
  requirePermission([PermissionCode.MANAGE_SYSTEM_SETTINGS]),
  adminController.getSystemSettings
);
systemRoutes.post(
  "/settings",
  requirePermission([PermissionCode.MANAGE_SYSTEM_SETTINGS]),
  adminController.createSystemSetting
);
systemRoutes.patch(
  "/settings/:key",
  requirePermission([PermissionCode.MANAGE_SYSTEM_SETTINGS]),
  adminController.updateSystemSetting
);
systemRoutes.delete(
  "/settings/:key",
  requirePermission([PermissionCode.MANAGE_SYSTEM_SETTINGS]),
  adminController.deleteSystemSetting
);

systemRoutes.get(
  "/analytics/overview",
  requirePermission([PermissionCode.VIEW_SYSTEM_REPORTS]),
  adminController.getOverview,
);
systemRoutes.get(
  "/analytics/revenue",
  requirePermission([PermissionCode.VIEW_SYSTEM_REPORTS]),
  adminController.getRevenueByTime,
);
systemRoutes.get(
  "/analytics/top-products",
  requirePermission([PermissionCode.VIEW_SYSTEM_REPORTS]),
  adminController.getTopProducts,
);
systemRoutes.get(
  "/analytics/top-shops",
  requirePermission([PermissionCode.VIEW_SYSTEM_REPORTS]),
  adminController.getTopShops,
);

router.use("/", systemRoutes);

export default router;
