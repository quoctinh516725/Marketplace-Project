import { Prisma, Shop } from "../../../../generated/prisma/client";
import { CacheKey } from "../../../cache/cache.key";
import cacheTag from "../../../cache/cache.tag";
import { CacheTTL } from "../../../cache/cache.ttl";
import { prisma } from "../../../config/prisma";
import { UserRole } from "../../../constants";
import { ShopStatus } from "../../../constants/shopStatus";
import { ShopDetailResponseDto, ShopListResponseDto } from "../../../dtos/shop";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../../error/AppError";
import roleRepository from "../../../repositories/role.repository";
import shopRepository from "../../../repositories/shop.repository";
import userRepository from "../../../repositories/user.repository";
import { InputAll } from "../../../types";
import { cacheAsync } from "../../../utils/cache";
import { deleteAuthUserCache } from "../../auth/auth.cache";
import { deleteUserCache } from "../../user/user.cache";

class ShopService {
  getAllShop = async (input: InputAll): Promise<ShopListResponseDto> => {
    return cacheAsync(
      CacheKey.shop.list(input),
      CacheTTL.shop.list,
      ["shop:list"],
      async () => {
        const { page, limit, status, search } = input;
        if (
          status &&
          !Object.values(ShopStatus).includes(status as ShopStatus)
        ) {
          throw new ValidationError("Trạng thái không hợp lệ!");
        }

        const shops = await shopRepository.getAll({
          page,
          limit,
          status,
          search,
        });

        const data = {
          data: shops.data,
          pagination: {
            page,
            limit,
            total: shops.total,
          },
        };

        return { data };
      },
    );
  };
  reviewRequestCreateShop = async (
    staffId: string,
    shopId: string,
    data: { status: ShopStatus; reason?: string },
  ): Promise<ShopDetailResponseDto> => {
    const shop = await shopRepository.findShopById(shopId);
    if (!shop) throw new NotFoundError("Cửa hàng không tồn tại!");

    const allowedStatuses: ShopStatus[] = [
      ShopStatus.REJECTED,
      ShopStatus.ACTIVE,
    ];

    if (!data.status || !allowedStatuses.includes(data.status)) {
      throw new ValidationError("Trạng thái không hợp lệ!");
    }

    if (data.status === ShopStatus.REJECTED && !data.reason) {
      throw new ValidationError("Vui lòng cung cấp lý do từ chối!");
    }

    const updatedShop = await prisma.$transaction(async (tx) => {
      if (data.status === ShopStatus.ACTIVE) {
        const role = await roleRepository.findRoleByCode(UserRole.SELLER);
        if (!role) throw new NotFoundError("Chức năng không tồn tại!");

        const user = await userRepository.findUserDetailById(tx, shop.sellerId);
        if (!user) throw new NotFoundError("Người dùng không tồn tại!");
        const userRoles = user.userRoles.map((r) => r.role.id);
        const allRoles = [...new Set([...userRoles, role?.id])];

        await roleRepository.assignRoleToUser(tx, shop.sellerId, allRoles);
      }

      return await shopRepository.update(tx, shopId, {
        status: data.status,
      });
    });

    await Promise.all([
      deleteAuthUserCache(shop.sellerId),
      deleteUserCache(shop.sellerId),
      cacheTag.invalidateTag("shop:list"),
      cacheTag.invalidateTag(`shop:${shop.id}`),
    ]);

    return updatedShop;
  };

  bannedShop = async (staffId: string, shopId: string): Promise<ShopDetailResponseDto> => {
    const shop = await shopRepository.findShopById(shopId);
    if (!shop) throw new NotFoundError("Cửa hàng không tồn tại!");

    const sellerRole = await roleRepository.findRoleByCode(UserRole.SELLER);
    if (!sellerRole) throw new NotFoundError("Chức năng không tồn tại!");

    const updatedShop = await prisma.$transaction(async (tx) => {
      const result = await shopRepository.update(tx, shopId, {
        status: ShopStatus.BANNED,
      });

      await roleRepository.revokeRoleFromUser(tx, shop.sellerId, [
        sellerRole.id,
      ]);

      return result;
    });

    await Promise.all([
      deleteAuthUserCache(shop.sellerId),
      deleteUserCache(shop.sellerId),
      cacheTag.invalidateTag("shop:list"),
      cacheTag.invalidateTag(`shop:${shop.id}`),
    ]);

    return updatedShop;
  };
}

export default new ShopService();
