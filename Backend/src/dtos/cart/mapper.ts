import { CartDetailResult } from "../../types/cart.type";
import { CartResponseDto } from "./cart.response";

export const toCartResponse = (cart: CartDetailResult): CartResponseDto[] => {
  return cart.cartItems.map((c) => ({
    quantity: c.quantity,
    shopId: c.product.shopId,
    product: {
      id: c.product.id,
      name: c.product.name,
      thumbnailUrl: c.product.thumbnailUrl,
    },
    ...(c.variant && {
      variant: {
        id: c.variant.id,
        imageUrl: c.variant.imageUrl,
        price: c.variant.price.toNumber(),
        stock: c.variant.stock,
        variantName: c.variant.variantName,
      },
    }),
    addedAt: c.createdAt.getTime(),
  }));
};
