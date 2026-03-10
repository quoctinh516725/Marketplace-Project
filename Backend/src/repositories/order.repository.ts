import { Prisma } from "../../generated/prisma/client";
import { PrismaType } from "../types";

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
    orderId: string,
    data: UpdateOrderData,
  ) => {
    return await client.masterOrder.update({ where: { id: orderId }, data });
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

  findById = async (client: PrismaType, id: string, userId: string) => {
    return await client.masterOrder.findUnique({ where: { id, userId } });
  };

  findOrderItemBySubOrderIds = async (client: PrismaType, ids: string[]) => {
    return await client.orderItem.findMany({
      where: { subOrderId: { in: ids } },
    });
  };
}
export default new OrderRepository();
