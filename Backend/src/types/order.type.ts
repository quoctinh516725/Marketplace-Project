import { Prisma } from "../../generated/prisma/client";
import { PaginatedResult } from "../dtos";

export const selectedSubOrderBasic = {
  id: true,
  subOrderCode: true,
  status: true,
  shopId: true,
  itemsTotal: true,
  currentPaymentId: true,
  shippingFee: true,
  discountAmount: true,
  totalAmount: true,
  realAmount: true,
} satisfies Prisma.SubOrderSelect;

export const selectedSubOrderDetail = {
  ...selectedSubOrderBasic,
  masterOrder: { select: { id: true, userId: true } },
  orderItems: {
    select: {
      id: true,
      productName: true,
      variantName: true,
      variantId: true,

      imageUrl: true,
      quantity: true,
      price: true,
      totalPrice: true,
    },
  },
  paymentAllocations: {
    select: {
      id: true,
      amount: true,
      payment: { select: { id: true, status: true } },
    },
  },
} satisfies Prisma.SubOrderSelect;

export type DetailSubOrder = Prisma.SubOrderGetPayload<{
  select: typeof selectedSubOrderDetail;
}>;

export type BasicSubOrder = Prisma.SubOrderGetPayload<{
  select: typeof selectedSubOrderBasic;
}>;

export type DetailSubOrderList = PaginatedResult<DetailSubOrder>;

export const selectedOrderDetail = {
  id: true,
  orderCode: true,
  originalTotalAmount: true,
  status: true,
  user: {
    select: {
      id: true,
      email: true,
      username: true,
    },
  },
  subOrders: {
    select: { ...selectedSubOrderDetail },
  },
} satisfies Prisma.MasterOrderSelect;

export type DetailOrder = Prisma.MasterOrderGetPayload<{
  select: typeof selectedOrderDetail;
}>;

export type OrderListItem = PaginatedResult<DetailOrder>;
