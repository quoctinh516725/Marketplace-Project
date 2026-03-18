import { PaymentStatus } from "../../constants/payment/paymentStatus";

export type OrderResponseDto = {
  orderId: string;
  orderCode: string;
  totalAmount: number;
  paymentMethod: string;
  paymentUrl?: string;
  status: PaymentStatus;
};

