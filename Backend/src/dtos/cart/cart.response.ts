export type CartResponseDto = {
  quantity: number;
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
