import express from "express";
import { authenticate, requirePermission } from "../middlewares/auth.middleware";
import reviewController from "../controllers/review.controller";
import { PermissionCode } from "../constants/permissionCode";

const router = express.Router();

// All review routes require authentication
router.use(authenticate);

// Create review
router.post(
  "/",
  requirePermission([PermissionCode.CREATE_REVIEW]),
  reviewController.createReview
);

// Get reviews by product
router.get("/products/:productId", reviewController.getProductReviews);

// Update review
router.patch(
  "/:id",
  requirePermission([PermissionCode.UPDATE_REVIEW]),
  reviewController.updateReview
);

// Delete review
router.delete(
  "/:id",
  requirePermission([PermissionCode.DELETE_REVIEW]),
  reviewController.deleteReview
);

// Get review by ID
router.get("/:id", reviewController.getReviewById);

export default router;
