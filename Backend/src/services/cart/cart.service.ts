import cacheTag from "../../cache/cache.tag";
import { CacheTTL } from "../../cache/cache.ttl";
import redis from "../../config/redis";
import { CartResponseDto, toCartResponse } from "../../dtos/cart";
import { NotFoundError } from "../../error/AppError";
import { cartQueue } from "../../queues/cart.queue";
import cartRepository from "../../repositories/cart.repository";
import productRepository from "../../repositories/product.repository";
import { PrismaType } from "../../types";
import { getCartCache, setCartCache } from "./cart.cache";

export type CartIdentify = {
  type: "user" | "guest";
  id: string;
};

class CartService {
  private identifyCacheKey = (identify: CartIdentify): string => {
    return identify.type === "user"
      ? `cart:${identify.id}`
      : `cart:guest:${identify.id}`;
  };

  private getTtl = (identify: CartIdentify): number => {
    return identify.type === "user" ? CacheTTL.cart.user : CacheTTL.cart.guest;
  };

  private scheduleSyncCart = async (identify: CartIdentify): Promise<void> => {
    if (identify.type !== "user") return;

    const jobId = `sync:cart:${identify.id}`;
    const existingJob = await cartQueue.getJob(jobId);
    if (existingJob) await existingJob.remove();

    await cartQueue.add(
      "syncCart",
      { identify },
      {
        jobId,
        delay: 5000,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  };

  addToCart = async (
    identify: CartIdentify,
    variantId: string,
    quantity: number,
  ): Promise<CartResponseDto> => {
    const script = `
    local key = KEYS[1]
    local variantId = ARGV[1]
    local quantity = tonumber(ARGV[2])
    local ttl = tonumber(ARGV[3])
    local newItem = ARGV[4]

    local item = redis.call("HGET", key, variantId)

    if item then
        local data = cjson.decode(item)
        data.quantity = data.quantity + quantity

        local encodeData = cjson.encode(data)
        redis.call("HSET", key, variantId, encodeData)
        redis.call("EXPIRE", key, ttl)
        return encodeData
    end

    if newItem and newItem ~= "" then
        redis.call("HSET", key, variantId, newItem)
        redis.call("EXPIRE", key, ttl)
        return newItem
    end

    return nil
    `;

    const key = this.identifyCacheKey(identify);
    const ttl = this.getTtl(identify);
    let result = await redis.eval(
      script,
      1,
      key,
      variantId,
      quantity.toString(),
      ttl.toString(),
      "",
    );

    if (result) {
      const item = JSON.parse(result as string) as CartResponseDto;
      await this.scheduleSyncCart(identify);
      return item;
    }

    const productVariant =
      await productRepository.getProductVariantById(variantId);
    if (
      !productVariant ||
      productVariant.deletedAt != null ||
      productVariant.product.deletedAt != null
    ) {
      throw new NotFoundError("Sản phẩm không hợp lệ hoặc đã bị gỡ!");
    }

    const product = productVariant.product;
    const mapCartCache: CartResponseDto = {
      quantity,
      shopId: product.shop.id,
      product: {
        id: product.id,
        name: product.name,
        thumbnailUrl: product.thumbnailUrl,
      },
      variant: {
        id: productVariant.id,
        variantName: productVariant.variantName,
        imageUrl: productVariant.imageUrl,
        price: productVariant.price.toNumber(),
        stock: productVariant.stock,
      },
      addedAt: Date.now(),
    };

    result = await redis.eval(
      script,
      1,
      key,
      variantId,
      quantity.toString(),
      ttl.toString(),
      JSON.stringify(mapCartCache),
    );

    await cacheTag.add(`product:cart:${product.id}`, key, ttl);
    await this.scheduleSyncCart(identify);

    return result
      ? (JSON.parse(result as string) as CartResponseDto)
      : mapCartCache;
  };

  getCart = async (identify: CartIdentify): Promise<CartResponseDto[]> => {
    const key = this.identifyCacheKey(identify);
    const cartCache = await getCartCache(key);

    if (cartCache !== null) {
      return cartCache;
    }

    if (identify.type === "user") {
      const cart = await cartRepository.getCart(identify.id);
      if (cart) {
        const mapCart = toCartResponse(cart);
        await setCartCache(key, mapCart, this.getTtl(identify));

        return mapCart;
      }
    }
    return [];
  };

  removeItem = async (
    identify: CartIdentify,
    variantId: string,
  ): Promise<number | null> => {
    const key = this.identifyCacheKey(identify);
    const variant = await productRepository.getProductVariantById(variantId);
    if (!variant)
      throw new NotFoundError("Sản phẩm không tồn tại hoặc đã bị xóa!");

    const result = await redis
      .multi()
      .hdel(key, variant.id)
      .expire(key, this.getTtl(identify))
      .exec();

    const deletedCount = result?.[0]?.[1];

    if (deletedCount === 1) {
      await this.scheduleSyncCart(identify);
      return 1;
    }

    return null;
  };
  removeItems = async (
    identify: CartIdentify,
    variantIds: string[],
  ): Promise<number | null> => {
    const key = this.identifyCacheKey(identify);
    const variantIdSets = [...new Set(variantIds)];
    const variants =
      await productRepository.getProductVariantByIds(variantIdSets);
    if (variants.length < variantIdSets.length)
      throw new NotFoundError("Một số sản phẩm không tồn tại hoặc đã bị xóa!");

    const result = await redis
      .multi()
      .hdel(key, ...variantIdSets)
      .expire(key, this.getTtl(identify))
      .exec();

    const deletedCount = result?.[0]?.[1] as number;

    if (deletedCount && deletedCount > 0) {
      await this.scheduleSyncCart(identify);
      return 1;
    }

    return null;
  };

  updateQuantity = async (
    identify: CartIdentify,
    variantId: string,
    quantity: number,
  ): Promise<CartResponseDto | null | number> => {
    const script = `
        local key = KEYS[1]
        local variantId = ARGV[1]
        local stock = tonumber(ARGV[2])
        local delta = tonumber(ARGV[3])
        local ttl = tonumber(ARGV[4])

        local cart = redis.call("HGET", key, variantId)

        if not cart then
          return
        end

        local data = cjson.decode(cart)
        local newQuantity = data.quantity + delta

        if newQuantity > stock then
          return cjson.encode({ status = "OUT_OF_STOCK" })
        end

        if newQuantity <= 0 then
          local deleted = redis.call("HDEL", key, variantId)
          redis.call("EXPIRE", key, ttl)

          if deleted == 1 then
            return cjson.encode({ status = "DELETED" })
          else
            return cjson.encode({ status = "NOT_FOUND" })
          end
        end

        data.quantity = newQuantity
        local encoded = cjson.encode(data)

        redis.call("HSET", key, variantId, encoded)
        redis.call("EXPIRE", key, ttl)

        return cjson.encode({
          status = "UPDATED",
          data = data
        })
    `;

    const key = this.identifyCacheKey(identify);
    const variant = await productRepository.getProductVariantById(variantId);
    if (!variant)
      throw new NotFoundError("Sản phẩm không tồn tại hoặc đã bị xóa!");
    const raw = await redis.eval(
      script,
      1,
      key,
      variant.id,
      variant.stock,
      quantity,
      this.getTtl(identify),
    );

    if (!raw) return null;

    const result = JSON.parse(raw as string);
    console.log(result);

    switch (result.status) {
      case "UPDATED":
        await this.scheduleSyncCart(identify);
        return result.data;

      case "DELETED":
        await this.scheduleSyncCart(identify);
        return 1;

      case "OUT_OF_STOCK":
        return -1;

      default:
        return null;
    }
  };

  mergeGuestCartToUserCart = async (guestId: string, userId: string) => {
    const guestKey = `cart:guest:${guestId}`;
    const userKey = `cart:${userId}`;

    const [guestCart, userCart] = await Promise.all([
      redis.hgetall(guestKey),
      redis.hgetall(userKey),
    ]);

    if (!guestCart || Object.values(guestCart).length === 0) return;

    const pipline = redis.multi();
    for (const [variantId, item] of Object.entries(guestCart)) {
      const guestItem = JSON.parse(item);

      if (userCart[variantId]) {
        const userItem = JSON.parse(userCart[variantId]);
        guestItem.quantity += userItem.quantity;
      }
      console.log(guestItem);

      pipline.hset(userKey, variantId, JSON.stringify(guestItem));
    }
    pipline.del(guestKey);
    pipline.expire(userKey, CacheTTL.cart.user);

    await pipline.exec();
    await this.scheduleSyncCart({ type: "user", id: userId });
  };
}

export default new CartService();
