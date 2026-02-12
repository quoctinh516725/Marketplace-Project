import { ValidationError } from "../error/AppError";
import { CreateShop } from "../repositories/shop.repository";
import { generateSlug } from "../utils/slug";

const ShopValidation = {
  createShopValidation: (data: CreateShop) => {
    if (!data) throw new ValidationError("Không có dữ liệu được truyền!");

    const { name, address, phone, description } = data;
    let { slug } = data;

    const errors: string[] = [];
    if (!name) errors.push("Vui lòng cung cấp tên cửa hàng");
    if (!address) errors.push("Vui lòng cung cấp địa chỉ cửa hàng");
    if (!phone) errors.push("Vui lòng cung cấp số điện thoại cửa hàng");

    if (errors.length > 0) {
      throw new ValidationError(errors.join(", "));
    }

    if (!slug) {
      slug = generateSlug(name);
    }

    return {
      name,
      address,
      phone,
      slug,
      description,
    };
  },
};

export default ShopValidation;
