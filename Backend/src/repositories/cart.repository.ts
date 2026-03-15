import { prisma } from "../config/prisma";
import { CartDetailResult, selectCartDetail } from "../types/cart.type";

type CreateCart = {
  productId: string;
  variantId: string;
  quantity: number;
};
class CartRepository {
  upsertCart = async (userId: string, data: CreateCart[]) => {
    return await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: { userId: userId },
        update: {},
        create: { userId: userId },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      await tx.cartItem.createMany({
        data: data.map((d) => ({
          cartId: cart.id,
          quantity: d.quantity,
          productId: d.productId,
          variantId: d.variantId,
        })),
      });
    });
  };

  getCart = async (id: string): Promise<CartDetailResult | null> => {
    return await prisma.cart.findUnique({
      where: { userId: id },
      select: selectCartDetail,
    });
  };
  
  clearCart = async (id: string) => {
    return await prisma.cart.deleteMany({ where: { userId: id } });
  };
}

export default new CartRepository();
