import { OrderResponseDto } from "../../dtos/order/order.response.dto";
import { OrderRequestDto } from "../../dtos/order";
import userRepository from "../../repositories/user.repository";
import { prisma } from "../../config/prisma";
import { UserStatus } from "../../constants";
import { NotFoundError, ValidationError } from "../../error/AppError";
import cartService from "../cart/cart.service";
import { randomInt } from "node:crypto";
import productRepository from "../../repositories/product.repository";
import inventoryRepository from "../../repositories/inventory.repository";
import inventoryService from "../inventory/inventory.service";
import orderRepository from "../../repositories/order.repository";
import voucherService from "../voucher/voucher.service";
import { VoucherResponseDto } from "../../dtos";
import adminService from "../admin/admin.service";
import { System } from "../../constants/system/systemKey";
import { DEFAULT_COMMISSION_RATE_VALUE } from "../../constants/system/systemValue";
import ghnService from "../shipping/ghn.service,";

type ShopVariantItem = {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string | null;
  shopId: string;
  price: number;
  stock: number;
  quantity: number;
  weight: number;
};

class OrderService {
  private generateOrderCode = (prefix: string): string => {
    const timestamp = new Date().toDateString().slice(0, 10).replace(/-/g, "");
    const random = randomInt(1000, 9999).toString();
    return `${prefix}-${timestamp}-${random}`;
  };

  createOrder = async (
    userId: string,
    data: OrderRequestDto,
  ): Promise<OrderResponseDto> => {
    const user = await userRepository.findBasicById(prisma, userId);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new NotFoundError("Người dùng không tồn tại hoặc không hoạt động!");
    }

    // Lấy tất cả dữ liệu cart để lấy thông tin chi tiết sản phẩm
    const allCartCache = await cartService.getCart({
      id: user.id,
      type: "user",
    });

    const cartVariantIdsCache = new Set(allCartCache.map((i) => i.variant?.id));
    const selectedVariantIds = data.items.map((i) => i.variantId);

    const isInvalidItem = selectedVariantIds.some(
      (item) => !cartVariantIdsCache.has(item),
    );

    if (isInvalidItem)
      throw new ValidationError(
        `Một số sản phẩm không còn trong giỏ hàng. Vui lòng kiểm tra lại!`,
      );

    const variants =
      await productRepository.getProductVariantByIds(selectedVariantIds);
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // Lấy đầy đủ thông tin của những item có tồn tại trong cart
    const enrichedItems = data.items.map((v) => {
      const variant = variantMap.get(v.variantId);
      if (!variant) {
        throw new ValidationError("Biến thể không hợp lệ");
      }

      if (!variant.product || variant.product.deletedAt !== null) {
        throw new ValidationError("Sản phẩm không tồn tại hoặc đã bị xóa");
      }

      return {
        variantId: variant.id,
        productId: variant.product.id,
        productName: variant.product.name,
        variantName: variant.variantName,
        shopId: variant.product.shop.id,
        price: variant.price.toNumber(),
        stock: variant.stock,
        quantity: v.quantity,
        weight: variant.weight,
      };
    });

    // Group Shop
    const shopInforMaps = new Map(
      variants.map((v) => [
        v.product.shop.id,
        {
          id: v.product.shop.id,
          commissionRate: v.product.shop.commissionRate?.toNumber(),
          districtId: v.product.shop.districtId,
          provinceId: v.product.shop.provinceId,
          wardCode: v.product.shop.wardCode,
        },
      ]),
    );

    const shopItemMaps = new Map<string, ShopVariantItem[]>();
    enrichedItems.forEach((item) => {
      const shopId = item.shopId;
      if (!shopItemMaps.has(shopId)) shopItemMaps.set(shopId, []);
      shopItemMaps.get(shopId)!.push(item);
    });

    // Generate Master Order
    const masterOrderCode = this.generateOrderCode("ORD");

    // Caculation Original Total to validation Vocher
    const itemsTotal = enrichedItems.reduce(
      (sum, item) => (sum += item.price * item.quantity),
      0,
    );

    // Validate Platform Voucher
    let totalPlatformDiscount = 0;
    let platformVoucher: VoucherResponseDto;

    const shopVoucherMaps = new Map<
      string,
      { discountAmount: number; voucher: VoucherResponseDto }
    >();

    if (data.vouchers?.platform) {
      const result = await voucherService.validationPlatformVoucher(
        prisma,
        userId,
        { code: data.vouchers.platform.code, orderTotal: itemsTotal },
      );

      totalPlatformDiscount = result.discountAmount;
      platformVoucher = result.voucher;
    }

    if (data.vouchers?.shop) {
      const vocherInputs = data.vouchers.shop.map((v) => {
        const data = shopItemMaps.get(v.shopId);
        if (!data)
          throw new NotFoundError(
            `Mã giảm giá ${v.code} không thuộc bất kì sản phẩm nào được mua. Vui lòng kiểm tra lại! `,
          );

        const shopOrderTotal = data.reduce(
          (sum, item) => (sum += item.price * item.quantity),
          0,
        );

        return { shopId: v.shopId, code: v.code, shopOrderTotal };
      });

      const results = await voucherService.validationShopVoucher(
        prisma,
        userId,
        vocherInputs,
      );

      results.forEach((i) =>
        shopVoucherMaps.set(i.shopId, {
          discountAmount: i.discountAmount,
          voucher: i.voucher,
        }),
      );
    }

    // Get Default CommissionRate
    const defaultCommissionRate = parseFloat(
      await adminService.getSetting(
        System.DEFAULT_COMMISSION_RATE,
        DEFAULT_COMMISSION_RATE_VALUE.toString(),
      ),
    );

    const result = await prisma.$transaction(async (tx) => {
      // Create MasterOrder
      const masterOrder = await orderRepository.createOrder(tx, {
        userId,
        orderCode: masterOrderCode,
        itemsTotal,
        shippingTotal: 0,
        originalTotalAmount: 0,
        platformDiscount: totalPlatformDiscount,
        receiverAddress: data.receiverAddress,
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
      });

      // Create SubOrder

      let originalTotalAmount = 0;
      let shippingTotal = 0;
      let totalMasterOrder = 0;

      const subOrders = [];
      for (const [shopId, items] of shopItemMaps) {
        const shop = shopInforMaps.get(shopId)!;

        // Generate SubOrder
        const subOrderCode = this.generateOrderCode("SUB");

        // Caculate totalAmout
        const totalAmount = items.reduce(
          (sum, item) => (sum += item.price * item.quantity),
          0,
        );
        // Caculate Shiping Fee
        const shippingData = {
          fromDistrictId: shop.districtId,
          fromWardCode: shop.wardCode,
          toDistrictId: data.districtId,
          toWardCode: data.wardCode,
          weight: items.reduce((sum, item) => (sum += item.weight), 0),
          totalAmount,
        };
        const shippingFee = await ghnService.calculateFee(shippingData);

        // Caculate Shop Vocher Discount
        const totalShopDiscount =
          shopVoucherMaps.get(shopId)?.discountAmount ?? 0;

        // Caculate Platform Discount Share
        const totalPlatformDiscountShare =
          (totalAmount / itemsTotal) * totalPlatformDiscount;

        const totalDiscountSubOrder =
          totalShopDiscount + totalPlatformDiscountShare;

        // Caculate Commission Amount
        const totalAmountAfterDiscountSubOrder =
          totalAmount - totalDiscountSubOrder;
        const commissionAmount =
          totalAmountAfterDiscountSubOrder *
          (shop.commissionRate ?? defaultCommissionRate);

        // Caculate Real Amount Shop get
        const realAmount =
          totalAmountAfterDiscountSubOrder + shippingFee - commissionAmount;

        // Caculate Real Amount User pay
        const subOrderTotal =
          realAmount + shippingFee - totalPlatformDiscountShare;

        const subOrderData = await orderRepository.createSubOrder(tx, {
          masterOrderId: masterOrder.id,
          shopId,
          itemsTotal: totalAmount,
          shippingFee,
          discountAmount: totalDiscountSubOrder,
          commissionAmount,
          realAmount,
          totalAmount: subOrderTotal,
          subOrderCode,
          orderItems: {
            createMany: {
              data: items.map((i) => ({
                productId: i.productId,
                variantId: i.variantId,
                productName: i.productName,
                variantName: i.variantName,
                quantity: i.quantity,
                price: i.price,
                totalPrice: Number(i.price) * i.quantity,
              })),
            },
          },
        });

        totalMasterOrder += subOrderTotal;
        originalTotalAmount += totalAmount + shippingFee;
        shippingTotal += shippingFee;
        subOrders.push(subOrderData);
      }

      

      // Update Master Order
      await orderRepository.updateOrder(tx, masterOrder.id, {
        shippingTotal,
        originalTotalAmount,
        totalAmountAtBuy: totalMasterOrder,
      });

      // Lock Stock
      const lockItems = enrichedItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));
      await inventoryService.lockStock(tx, lockItems);

      // Lock Usage Voucher
      const usageVouchers = [
        ...(platformVoucher?.id ? [platformVoucher.id] : []),
        ...Array.from(shopVoucherMaps.values()).map((v) => v.voucher.id),
      ];
      const lockVocherDatas = usageVouchers.map((v) => ({
        voucherId: v,
        userId,
        usedAt: new Date(),
      }));
      if (usageVouchers.length > 0) {
        await voucherService.applyVoucher(tx, lockVocherDatas);
      }
    });

    // Remove Cart
    await cartService.removeItems(
      { id: userId, type: "user" },
      enrichedItems.map((i) => i.variantId),
    );

    return result;
  };
}

export default new OrderService();
