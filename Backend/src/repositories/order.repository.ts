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

type CreateSubOrderData = Prisma.SubOrderUncheckedCreateInput;
type UpdateOrderData = Prisma.MasterOrderUncheckedUpdateInput;

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
}
export default new OrderRepository();
