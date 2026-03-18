export const formatMoneyVND = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
};

export const formatDate = (date: Date) =>
  date.toISOString().replace(/[-:T]/g, "").slice(0, 14);
