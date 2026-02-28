import { Prisma } from "../../generated/prisma/client";

export const selectCartDetail = {
  id: true,
  cartItems: {
    select: {
      id: true,
      quantity: true,
      product: {
        select: {
          id: true,
          code: true,
          name: true,
          thumbnailUrl: true,
        },
      },
      variant: {
        select: {
          id: true,
          imageUrl: true,
          price: true,
          stock: true,
          variantName: true,
        },
      },
    },
  },
} satisfies Prisma.CartSelect;

export type CartDetailResult = Prisma.CartGetPayload<{
  select: typeof selectCartDetail;
}>;
