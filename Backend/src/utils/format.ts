export const formatMoneyVND = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
};
