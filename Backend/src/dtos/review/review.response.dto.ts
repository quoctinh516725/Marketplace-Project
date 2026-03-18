export interface ReviewResponse {
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

export interface ProductReviewsResponse {
  reviews: ReviewResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
