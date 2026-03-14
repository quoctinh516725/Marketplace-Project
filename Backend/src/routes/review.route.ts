import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import reviewController from "../controllers/review.controller";

const router = express.Router();

// All review routes require authentication
router.use(authenticate);

// Create review
router.post("/", reviewController.createReview);

// Get reviews by product
router.get("/products/:productId", reviewController.getProductReviews);

// Update review
router.patch("/:id", reviewController.updateReview);

// Delete review
router.delete("/:id", reviewController.deleteReview);

// Get review by ID
router.get("/:id", reviewController.getReviewById);

export default router;
