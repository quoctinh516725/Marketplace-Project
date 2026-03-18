import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { OrderStatus } from "../constants/orderStatus";
import { ValidationError } from "../error/AppError";
import { InputAll, PrismaType } from "../types";
import {
  DetailOrder,
  DetailSubOrder,
  DetailSubOrderList,
  OrderListItem,
  selectedOrderDetail,
  selectedSubOrderDetail,
} from "../types/order.type";

type CreateOrder = {
  userId: string;
  orderCode: string;
  itemsTotal: number;
  shippingTotal: number;
  originalTotalAmount: number;
  platformDiscount: number;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
};
type UpdateOrderData = Prisma.MasterOrderUncheckedUpdateInput;

type CreateSubOrderData = Prisma.SubOrderUncheckedCreateInput;
type UpdateSubOrderData = Prisma.SubOrderUncheckedUpdateInput;

class OrderRepository {
  createOrder = async (client: PrismaType, data: CreateOrder) => {
    return await client.masterOrder.create({ data });
  };

  updateOrder = async (
    client: PrismaType,
    id: string,
    data: UpdateOrderData,
  ) => {
    return await client.masterOrder.update({ where: { id }, data });
  };

  createSubOrder = async (client: PrismaType, data: CreateSubOrderData) => {
    return await client.subOrder.create({ data });
  };

  updateSubOrders = async (
    client: PrismaType,
    ids: string[],
    data: UpdateSubOrderData,
  ) => {
    const result = await client.subOrder.updateMany({
      where: { id: { in: ids } },
      data,
    });
    return result;
  };

  updateSubOrder = async (
    client: PrismaType,
    id: string,
    data: UpdateSubOrderData,
  ) => {
    const result = await client.subOrder.update({
      where: { id },
      data,
    });
    return result;
  };

  findById = async (
    client: PrismaType,
    id: string,
    userId: string,
  ): Promise<DetailOrder | null> => {
    return await client.masterOrder.findUnique({
      where: { id, userId },
      select: selectedOrderDetail,
    });
  };

  findSubOrderById = async (id: string): Promise<DetailSubOrder | null> => {
    return await prisma.subOrder.findUnique({
      where: { id },
      select: selectedSubOrderDetail,
    });
  };

  findOrderItemBySubOrderIds = async (client: PrismaType, ids: string[]) => {
    return await client.orderItem.findMany({
      where: { subOrderId: { in: ids } },
    });
  };

  findOrderItemById = async (id: string) => {
    return await prisma.orderItem.findUnique({
      where: { id },
      include: {
        subOrder: {
          include: {
            masterOrder: true,
          },
        },
      },
    });
  };

  findOrdersByUserId = async (
    userId: string,
    input: InputAll,
  ): Promise<OrderListItem> => {
    const { page, limit, status, search } = input;
    const skip = (page - 1) * limit;
    const take = limit;

    const where: Prisma.MasterOrderWhereInput = {
      userId,
      ...(status && { status }),
      ...(search && {
        OR: [{ orderCode: { contains: search } }],
      }),
    };

    const [subOrders, total] = await Promise.all([
      prisma.masterOrder.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: selectedOrderDetail,
      }),
      prisma.masterOrder.count({ where }),
    ]);

    return { data: subOrders, total };
  };

  findSubOrdersByShopId = async (
    shopId: string,
    input: InputAll,
  ): Promise<DetailSubOrderList> => {
    const { page, limit, status, search } = input;
    const skip = (page - 1) * limit;
    const take = limit;
    const where: Prisma.SubOrderWhereInput = {
      shopId,
      ...(status && { status }),
      ...(search && {
        OR: [{ subOrderCode: { contains: search } }],
      }),
    };
    const [subOrders, total] = await Promise.all([
      prisma.subOrder.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: selectedSubOrderDetail,
      }),
      prisma.subOrder.count({ where }),
    ]);

    return { data: subOrders, total };
  };

  cancelOrder = async (client: PrismaType, orderId: string) => {
    const result = await client.masterOrder.updateMany({
      where: { id: orderId, status: OrderStatus.PENDING_PAYMENT },
      data: { status: OrderStatus.CANCELLED },
    });

    if (result.count === 0) {
      throw new ValidationError("Hủy đơn hàng thất bại!");
    }
  };

  cancelSubOrder = async (client: PrismaType, subOrderId: string[]) => {
    const result = await client.subOrder.updateMany({
      where: { id: { in: subOrderId }, status: OrderStatus.PENDING_PAYMENT },
      data: { status: OrderStatus.CANCELLED },
    });

    if (result.count === 0) {
      throw new ValidationError("Hủy đơn hàng thất bại!");
    }
  };
}
export default new OrderRepository();
