import { Worker } from "bullmq";
import redis from "../config/redis";
import cartRepository from "../repositories/cart.repository";

new Worker(
  "cartQueue",
  async (job) => {
    const { identify } = job.data;
    if (identify.type !== "user") return;

    const key = `cart:${identify.id}`;

    const cartData = await redis.hgetall(key);

    if (!cartData || Object.values(cartData).length === 0) {
      await cartRepository.clearCart(identify.id);
      return;
    }

    const parsedItems = Object.values(cartData).map((c) => {
      const item = JSON.parse(c);

      return {
        productId: item.product.id,
        variantId: item.variant.id,
        quantity: item.quantity,
      };
    });

    await cartRepository.upsertCart(identify.id, parsedItems);
  },
  { connection: redis, concurrency: 5 },
);
