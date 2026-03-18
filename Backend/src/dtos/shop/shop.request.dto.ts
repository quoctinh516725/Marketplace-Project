import { ShopStatus } from "../../constants/shopStatus";
import { ValidationError } from "../../error/AppError";
import { generateSlug } from "../../utils/generate";

export type CreateShopRequestDto = {
  name: string;
  address: string;
  phone: string;
  slug: string;
  provinceId: number;
  districtId: number;
  wardCode: string;
  description?: string;
};
export type UpdateShopRequestDto = Partial<CreateShopRequestDto> & {
  logoUrl?: string;
  backgroundUrl?: string;
};

export const createShopRequestDto = (data: any): CreateShopRequestDto => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Dữ liệu không hợp lệ!");
  }
  if (!data) throw new ValidationError("Không có dữ liệu được truyền!");

  const {
    name,
    address,
    phone,
    provinceId,
    districtId,
    wardCode,
    description,
  } = data;
  let { slug } = data;

  const errors: string[] = [];
  if (!name) errors.push("Vui lòng cung cấp tên cửa hàng");
  if (!address) errors.push("Vui lòng cung cấp địa chỉ cửa hàng");
  if (!phone) errors.push("Vui lòng cung cấp số điện thoại cửa hàng");
  if (!provinceId) errors.push("Vui lòng cung cấp mã tỉnh của cửa hàng");
  if (!districtId) errors.push("Vui lòng cung cấp mã huyện cửa hàng");
  if (!wardCode) errors.push("Vui lòng cung cấp mã đường cửa hàng");

  if (errors.length > 0) {
    throw new ValidationError(errors.join(", "));
  }

  if (!slug) {
    slug = generateSlug(name);
  }

  return {
    name,
    address,
    provinceId,
    districtId,
    wardCode,
    phone,
    slug,
    description,
  };
};
export const updateShopRequestDto = (data: any): UpdateShopRequestDto => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Dữ liệu không hợp lệ!");
  }

  const dto: UpdateShopRequestDto = {};

  if (data.name !== undefined) {
    const name = data.name.trim();
    if (!name) throw new ValidationError("Tên cửa hàng không hợp lệ");
    dto.name = name;

    if (!data.slug) {
      dto.slug = generateSlug(name);
    }
  }

  if (data.slug !== undefined) {
    const slug = data.slug.trim();
    if (!slug) throw new ValidationError("Slug không hợp lệ");
    dto.slug = slug;
  }

  if (data.address !== undefined) {
    dto.address = data.address.trim();
  }

  if (data.provinceId !== undefined) {
    dto.provinceId = data.provinceId;
  }

  if (data.districtId !== undefined) {
    dto.districtId = data.districtId;
  }

  if (data.wardCode !== undefined) {
    dto.wardCode = data.wardCode;
  }

  if (data.phone !== undefined) {
    dto.phone = data.phone.trim();
  }

  if (data.description !== undefined) {
    dto.description = data.description?.trim() || undefined;
  }

  if (data.logoUrl !== undefined) {
    dto.logoUrl = data.logoUrl;
  }

  if (data.backgroundUrl !== undefined) {
    dto.backgroundUrl = data.backgroundUrl;
  }

  if (Object.keys(dto).length === 0) {
    throw new ValidationError("Không có dữ liệu để cập nhật");
  }

  return dto;
};
export const updateShopStatusRequestDto = (data: any): ShopStatus => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Dữ liệu không hợp lệ!");
  }

  if (!data.status) throw new ValidationError("Không có status nào được chọn!");

  // Seller only update Active/Inactive status
  const allowedStatuses: ShopStatus[] = [
    ShopStatus.ACTIVE,
    ShopStatus.INACTIVE,
  ];
  if (data.status && !allowedStatuses.includes(data.status as ShopStatus)) {
    throw new ValidationError(`Trạng thái cập nhật không hợp lệ!`);
  }
  return data.status;
};
