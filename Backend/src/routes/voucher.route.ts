import express from "express";
import { authenticate, requirePermission } from "../middlewares/auth.middleware";
import voucherController from "../controllers/voucher.controller";
import { validatePagination } from "../validations/public.validation";
import { PermissionCode } from "../constants/permissionCode";

const router = express.Router();
router.use(authenticate);

router.post(
  "/",
  requirePermission([PermissionCode.CREATE_VOUCHER]),
  voucherController.createVoucher
);
router.get("/", validatePagination, voucherController.getAllVouchers);
router.get("/platform", voucherController.getPlatformVouchers);
router.get("/shop/:shopId", voucherController.getVouchersByShop);
router.get("/:id", voucherController.getVoucherById);
router.patch(
  "/:id",
  requirePermission([PermissionCode.UPDATE_VOUCHER]),
  voucherController.updateVoucher
);
router.delete(
  "/:id",
  requirePermission([PermissionCode.DELETE_VOUCHER]),
  voucherController.deleteVoucher
);

export default router;
