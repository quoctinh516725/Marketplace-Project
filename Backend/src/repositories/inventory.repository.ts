import { ValidationError } from "../error/AppError";
import { PrismaType } from "../types";

class InventoryRepository {
  lockStock = async (
    client: PrismaType,
    item: { variantId: string; quantity: number },
  ) => {
    const result = await client.$executeRaw`
    UPDATE "productVariant"
    SET "reservedStock" = "reservedStock" + ${item.quantity}
    WHERE "id" = ${item.variantId}
    AND "deletedAt" IS NULL
    AND "stock" - "reservedStock" >= ${item.quantity}
    `;

    if (result === 0) {
      throw new ValidationError("Sản phẩm không đủ tồn kho!");
    }
  };

  releaseStock = async (
    client: PrismaType,
    item: { variantId: string; reversedStock: number },
  ) => {
    return client.productVariant.updateMany({
      where: { id: item.variantId  },
      data: {
        reservedStock: { decrement: item.reversedStock },
      },
    });
  };

  decrementStock = async (
    client: PrismaType,
    item: { variantId: string; reversedStock: number },
  ) => {
    return client.productVariant.update({
      where: { id: item.variantId },
      data: {
        stock: { decrement: item.reversedStock },
        reservedStock: { decrement: item.reversedStock },
      },
    });
  };

  incrementStock = async (
    client: PrismaType,
    item: { variantId: string; quantity: number },
  ) => {
    return client.productVariant.update({
      where: { id: item.variantId },
      data: {
        stock: { increment: item.quantity },
      },
    });
  };
}

export default new InventoryRepository();
