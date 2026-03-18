import { PaymentMethod } from "../../constants/payment/paymentMethod";
import { ValidationError } from "../../error/AppError";

export type OrderRequestDto = {
  items: {
    variantId: string;
    quantity: number;
  }[];
  receiverName: string;
  receiverPhone: string;
  provinceId: number;
  districtId: number;
  wardCode: string;
  receiverAddress: string; // Địa chỉ chi tiết
  paymentMethod: string;
  vouchers?: {
    platform?: { code: string };
    shop?: { shopId: string; code: string }[];
  };
};

export const orderRequestDto = (data: any): OrderRequestDto => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Dữ liệu không hợp lệ!");
  }

  const errors: string[] = [];

  // items
  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push("Danh sách sản phẩm không hợp lệ");
  }

  const items = Array.isArray(data.items)
    ? data.items.map((item: any, index: number) => {
        if (!item || typeof item !== "object") {
          errors.push(`Item tại vị trí ${index} không hợp lệ`);
          return null;
        }

        const { variantId, quantity } = item;

        if (!variantId || typeof variantId !== "string") {
          errors.push(`variantId tại item ${index} không hợp lệ`);
        }

        if (
          typeof quantity !== "number" ||
          !Number.isInteger(quantity) ||
          quantity <= 0
        ) {
          errors.push(`quantity tại item ${index} phải là số > 0`);
        }

        return {
          variantId,
          quantity,
        };
      })
    : [];

  // receiverName
  if (!data.receiverName || typeof data.receiverName !== "string") {
    errors.push("Tên người nhận không hợp lệ");
  }

  // receiverPhone
  if (!data.receiverPhone || typeof data.receiverPhone !== "string") {
    errors.push("Số điện thoại người nhận không hợp lệ");
  }

  // receiverAddress
  if (!data.receiverAddress || typeof data.receiverAddress !== "string") {
    errors.push("Địa chỉ người nhận không hợp lệ");
  }

  // provinceId
  if (
    data.provinceId === undefined ||
    typeof data.provinceId !== "number" ||
    data.provinceId <= 0
  ) {
    errors.push("Tỉnh/Thành phố không hợp lệ");
  }

  // districtId
  if (
    data.districtId === undefined ||
    typeof data.districtId !== "number" ||
    data.districtId <= 0
  ) {
    errors.push("Quận/Huyện không hợp lệ");
  }

  // wardCode
  if (
    !data.wardCode ||
    typeof data.wardCode !== "string" ||
    data.wardCode.trim() === ""
  ) {
    errors.push("Phường/Xã không hợp lệ");
  }

  // paymentMethod
  if (
    !data.paymentMethod ||
    !Object.values(PaymentMethod).includes(data.paymentMethod)
  ) {
    errors.push("Phương thức thanh toán không hợp lệ");
  }

  // platformVoucherCode
  let platformVoucherCode: string | undefined;
  if (data?.vouchers?.platform !== undefined) {
    if (typeof data?.vouchers?.platform.code !== "string") {
      errors.push("Mã giảm giá toàn sàn phải là string");
    } else {
      platformVoucherCode = data?.vouchers?.platform.code;
    }
  }

  // shopVoucherCode
  let shopVoucherCode: { shopId: string; code: string }[] | undefined;

  if (data?.vouchers?.shop !== undefined) {
    if (!Array.isArray(data?.vouchers?.shop)) {
      errors.push("Mã giảm giá cửa hàng phải là mảng");
    } else {
      const invalid = data.vouchers.shop.some((v: any) => {
        return (
          typeof v !== "object" ||
          typeof v.shopId !== "string" ||
          typeof v.code !== "string"
        );
      });

      if (invalid) {
        errors.push(
          "shopVoucherCode phải có dạng { shopId: string, code: string }",
        );
      } else {
        shopVoucherCode = data?.vouchers?.shop;
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(", "));
  }

  return {
    items: items as { variantId: string; quantity: number }[],
    receiverName: data.receiverName,
    receiverPhone: data.receiverPhone,
    districtId: data.districtId,
    provinceId: data.provinceId,
    wardCode: data.wardCode,
    receiverAddress: data.receiverAddress,
    paymentMethod: data.paymentMethod,
    vouchers: {
      platform: platformVoucherCode ? { code: platformVoucherCode } : undefined,
      shop: shopVoucherCode,
    },
  };
};
