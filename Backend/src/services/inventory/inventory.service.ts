import inventoryRepository from "../../repositories/inventory.repository";
import { PrismaType } from "../../types";

class InventoryService {
  private sortItems = (items: { variantId: string; quantity: number }[]) => {
    return items.sort((a, b) => a.variantId.localeCompare(b.variantId)); // Sort to prevent deadlock
  };
  async lockStock(
    client: PrismaType,
    items: { variantId: string; quantity: number }[],
  ) {
    items = this.sortItems(items); // Sort to prevent deadlock
    for (const item of items) {
      await inventoryRepository.lockStock(client, {
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }
  }

  async releaseStock(
    client: PrismaType,
    items: { variantId: string; quantity: number }[],
  ) {
    items = this.sortItems(items); // Sort to prevent deadlock
    for (const item of items) {
      await inventoryRepository.releaseStock(client, {
        variantId: item.variantId,
        reversedStock: item.quantity,
      });
    }
  }

  async decrementStock(
    client: PrismaType,
    items: { variantId: string; quantity: number }[],
  ) {
    items = this.sortItems(items); // Sort to prevent deadlock

    for (const item of items) {
      await inventoryRepository.decrementStock(client, {
        variantId: item.variantId,
        reversedStock: item.quantity,
      });
    }
  }

  async incrementStock(
    client: PrismaType,
    items: { variantId: string; quantity: number }[],
  ) {
    items = this.sortItems(items); // Sort to prevent deadlock

    for (const item of items) {
      await inventoryRepository.incrementStock(client, {
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }
  }
}

export default new InventoryService();
