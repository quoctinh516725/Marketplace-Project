import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { PrismaType } from "../types";

type CreateRefundData = Prisma.RefundUncheckedCreateInput;
type UpdateRefundData = Prisma.RefundUncheckedUpdateInput;

class RefundRepository {
  createRefund = async (client: PrismaType, data: CreateRefundData) => {
    return await client.refund.create({ data });
  };

  updateRefund = async (
    client: PrismaType,
    id: string,
    data: UpdateRefundData,
  ) => {
    return await client.refund.update({ where: { id }, data });
  };

  findRefundById = async (id: string) => {
    return await prisma.refund.findUnique({
      where: { id },
      select: {
        id: true,
        reason: true,
        status: true,
        subOrder: {
          select: {
            id: true,
            shopId: true,
            orderItems: {
              select: {
                variantId: true,
                quantity: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            paymentMethod: true,
          },
        },
      },
    });
  };
}

export default new RefundRepository();
