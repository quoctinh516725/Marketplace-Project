import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import voucherController from "../controllers/voucher.controller";
import { validatePagination } from "../validations/public.validation";

const router = express.Router();
router.use(authenticate);

router.post("/", voucherController.createVoucher);
router.get("/", validatePagination, voucherController.getAllVouchers);
router.get("/platform", voucherController.getPlatformVouchers);
router.get("/shop/:shopId", voucherController.getVouchersByShop);
router.get("/:id", voucherController.getVoucherById);
router.patch("/:id", voucherController.updateVoucher);
router.delete("/:id", voucherController.deleteVoucher);

export default router;
