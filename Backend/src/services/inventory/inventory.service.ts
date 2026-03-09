import inventoryRepository from "../../repositories/inventory.repository";
import { PrismaType } from "../../types";

class InventoryService {
  async lockStock(
    client: PrismaType,
    items: { variantId: string; quantity: number }[],
  ) {
    await Promise.all(
      items.map((item) =>
        inventoryRepository.lockStock(client, {
          variantId: item.variantId,
          quantity: item.quantity,
        }),
      ),
    );
  }

  async releaseStock(
    client: PrismaType,
    items: { variantId: string; quantity: number }[],
  ) {
    await Promise.all(
      items.map((item) =>
        inventoryRepository.releaseStock(client, {
          variantId: item.variantId,
          reversedStock: item.quantity,
        }),
      ),
    );
  }

  async decrementStock(
    client: PrismaType,
    items: { variantId: string; quantity: number }[],
  ) {
    await Promise.all(
      items.map((item) =>
        inventoryRepository.decrementStock(client, {
          variantId: item.variantId,
          reversedStock: item.quantity,
        }),
      ),
    );
  }
}

export default new InventoryService();
