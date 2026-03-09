export type CartResponseDto = {
  quantity: number;
  shopId: string;
  product: {
    id: string;
    name: string;
    thumbnailUrl: string;
  };
  variant?: {
    id: string;
    imageUrl: string | null;
    price: number;
    stock: number;
    variantName: string | null;
  };
  addedAt: number;
};
