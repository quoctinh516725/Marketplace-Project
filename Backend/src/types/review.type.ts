import { Prisma } from "../../generated/prisma/client";

export const selectedReview = {
  id: true,
  userId: true,
  productId: true,
  orderItemId: true,
  rating: true,
  comment: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      username: true,
      fullName: true,
      avatarUrl: true,
    },
  },
  product: {
    select: {
      id: true,
      name: true,
      thumbnailUrl: true,
    },
  },
  orderItem: {
    select: {
      id: true,
      productName: true,
      variantName: true,
      imageUrl: true,
    },
  },
} satisfies Prisma.ProductReviewSelect;
