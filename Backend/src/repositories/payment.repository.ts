import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../config/prisma";
import { PaymentStatus } from "../constants/payment/paymentStatus";
import { PrismaType } from "../types";

type CreatePaymentData = Prisma.PaymentUncheckedCreateInput;
type CreatePaymentAllocationData = Prisma.PaymentAllocationUncheckedCreateInput;

type UpdatePaymentData = Prisma.PaymentUncheckedUpdateInput;
class PaymentRepository {
  createPayment = async (client: PrismaType, data: CreatePaymentData) => {
    return client.payment.create({ data, include: { allocations: true } });
  };

  createPaymentAllocations = async (
    client: PrismaType,
    data: CreatePaymentAllocationData[],
  ) => {
    return await client.paymentAllocation.createMany({ data });
  };

  findById = async (
    client: PrismaType,
    id: string,
    includeAllocations = false,
  ) => {
    return client.payment.findUnique({
      where: { id },
      include: { allocations: includeAllocations },
    });
  };

  findLastPaymentByOrderId = async (
    client: PrismaType,
    orderId: string,
    userId: string,
  ) => {
    return client.payment.findFirst({
      where: { masterOrderId: orderId, userId },
      orderBy: {
        createdAt: "desc",
      },
      include: { allocations: true },
    });
  };

  findByCurrentPaymentId = async (client: PrismaType, paymentId: string) => {
    return client.payment.findUnique({
      where: { id: paymentId },
    });
  };

  updateStatus = async (
    client: PrismaType,
    paymentId: string,
    status: PaymentStatus,
  ) => {
    return await client.payment.update({
      where: { id: paymentId, status: PaymentStatus.PENDING },
      data: { status },
    });
  };

  update = async (
    client: PrismaType,
    paymentId: string,
    data: UpdatePaymentData,
  ) => {
    return await client.payment.update({
      where: { id: paymentId },
      data,
    });
  };
}

export default new PaymentRepository();
