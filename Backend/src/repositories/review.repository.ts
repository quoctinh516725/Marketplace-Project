import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { selectedReview } from "../types/review.type";

export interface CreateReviewData {
  userId: string;
  productId: string;
  orderItemId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

export interface ReviewWithRelations {
  id: string;
  userId: string;
  productId: string;
  orderItemId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
  product: {
    id: string;
    name: string;
    thumbnailUrl: string;
  };
  orderItem: {
    id: string;
    productName: string;
    variantName: string;
    imageUrl: string | null;
  };
}

class ReviewRepository {
  findByOrderItem = async (orderItemId: string) => {
    return await prisma.productReview.findUnique({
      where: { orderItemId },
    });
  };

  findByProduct = async (
    productId: string,
    page: number = 1,
    limit: number = 10,
  ) => {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.productReview.findMany({
        where: { productId },
        include: {
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
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.productReview.count({
        where: { productId },
      }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  };

  findById = async (id: string) => {
    return await prisma.productReview.findUnique({
      where: { id },
      select: selectedReview,
    });
  };

  create = async (data: CreateReviewData) => {
    return await prisma.productReview.create({
      data,
      select: selectedReview,
    });
  };

  update = async (id: string, data: UpdateReviewData) => {
    return await prisma.productReview.update({
      where: { id },
      data,
      select: selectedReview,
    });
  };

  delete = async (id: string) => {
    return await prisma.productReview.delete({
      where: { id },
    });
  };

  findByUserAndOrderItem = async (userId: string, orderItemId: string) => {
    return await prisma.productReview.findFirst({
      where: {
        userId,
        orderItemId,
      },
    });
  };
}

export default new ReviewRepository();
