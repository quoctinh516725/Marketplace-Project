import { ProductStatus } from "../../constants/productStatus";
import { ValidationError } from "../../error/AppError";

type CreateProductAttributeRequestData = {
  attributeId: string;
  value: string | null;
  attributeValueId: string | null;
};

type CreateProductVariantRequestData = {
  sku: string | null;
  imageUrl: string | null;
  price: number;
  stock: number;
  weight: number;
  attributes: CreateProductAttributeRequestData[];
};

export type CreateProductRequestData = {
  brandId: string | null;
  name: string;
  slug: string | null;
  description: string | null;
  thumbnailUrl: string;
  originalPrice: number | null;
  soldCount: number;
  images: { imageUrl: string; sortOrder: number }[];
  tags: { id: string }[];
  categories: { id: string }[];
  variants: CreateProductVariantRequestData[];
};

export type UpdateProductRequestData = {
  brandId?: string | null;
  name?: string;
  slug?: string;
  description?: string | null;
  originalPrice?: number | null;
  soldCount?: number;
};

const toNumber = (
  value: unknown,
  field: string,
  allowNull = false,
): number | null => {
  if (value === null || value === undefined || value === "") {
    return allowNull ? null : NaN;
  }
  const result = Number(value);
  if (Number.isNaN(result)) {
    throw new ValidationError(`${field} phải là số hợp lệ!`);
  }
  return result;
};

export const createProductRequestDto = (
  data: any,
): CreateProductRequestData => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Dữ liệu không hợp lệ!");
  }

  const errors: string[] = [];
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const thumbnailUrl =
    typeof data.thumbnailUrl === "string" ? data.thumbnailUrl.trim() : "";
  const description =
    typeof data.description === "string" ? data.description.trim() : null;
  const slug = typeof data.slug === "string" ? data.slug.trim() : null;
  const brandId = typeof data.brandId === "string" ? data.brandId.trim() : null;

  if (!name) errors.push("Tên sản phẩm không được để trống!");
  if (!thumbnailUrl) errors.push("Thumbnail sản phẩm không được để trống!");

  if (!Array.isArray(data.categories) || data.categories.length === 0) {
    errors.push("Sản phẩm phải có ít nhất một danh mục!");
  }
  if (!Array.isArray(data.tags)) {
    errors.push("Tags không hợp lệ!");
  }
  if (!Array.isArray(data.variants)) {
    errors.push("Vui lòng cung cấp biến thể!");
  }
  if (errors.length > 0) {
    throw new ValidationError(errors.join(", "));
  }

  const originalPrice = toNumber(data.originalPrice, "Giá gốc", true);
  const soldCount = toNumber(data.soldCount ?? 0, "Số lượng đã bán") as number;
  const rating = toNumber(data.rating, "Điểm đánh giá", true);

  if (soldCount < 0) {
    throw new ValidationError("Số lượng đã bán không được nhỏ hơn 0!");
  }
  if (rating !== null && (rating < 0 || rating > 5)) {
    throw new ValidationError("Điểm đánh giá phải trong khoảng từ 0 đến 5!");
  }

  const images = Array.isArray(data.images)
    ? data.images.map((img: any, index: number) => {
        const imageUrl =
          typeof img?.imageUrl === "string" ? img.imageUrl.trim() : "";
        const sortOrderValue = toNumber(
          img?.sortOrder ?? index,
          "Thứ tự ảnh",
        ) as number;
        if (!imageUrl) {
          throw new ValidationError(`images[${index}].imageUrl không hợp lệ!`);
        }
        if (sortOrderValue < 0) {
          throw new ValidationError(`images[${index}].sortOrder không hợp lệ!`);
        }
        return { imageUrl, sortOrder: sortOrderValue };
      })
    : [];

  const categories = data.categories.map((category: any, index: number) => {
    const id = typeof category?.id === "string" ? category.id.trim() : "";
    if (!id) {
      throw new ValidationError(`categories[${index}].id không hợp lệ!`);
    }
    return { id };
  });

  const tags = data.tags.map((tag: any, index: number) => {
    const id = typeof tag?.id === "string" ? tag.id.trim() : "";
    if (!id) {
      throw new ValidationError(`tags[${index}].id không hợp lệ!`);
    }
    return { id };
  });

  const variants: CreateProductVariantRequestData[] = data.variants.map(
    (variant: any, variantIndex: number) => {
      const price = toNumber(
        variant?.price,
        `variants[${variantIndex}].price`,
      ) as number;
      const stock = toNumber(
        variant?.stock,
        `variants[${variantIndex}].stock`,
      ) as number;
      const weight = toNumber(
        variant?.weight,
        `variants[${variantIndex}].weight`,
        true,
      );

      if (price < 0) {
        throw new ValidationError(
          `variants[${variantIndex}].price không hợp lệ!`,
        );
      }
      if (stock < 0) {
        throw new ValidationError(
          `variants[${variantIndex}].stock không hợp lệ!`,
        );
      }
      if (weight !== null && weight < 0) {
        throw new ValidationError(
          `variants[${variantIndex}].weight không hợp lệ!`,
        );
      }

      const attributesRaw = Array.isArray(variant?.attributes)
        ? variant.attributes
        : [];
      const attributes: CreateProductAttributeRequestData[] = attributesRaw.map(
        (attr: any, attributeIndex: number) => {
          const attributeId =
            typeof attr?.attributeId === "string"
              ? attr.attributeId.trim()
              : "";
          if (!attributeId) {
            throw new ValidationError(
              `variants[${variantIndex}].attributes[${attributeIndex}].attributeId không hợp lệ!`,
            );
          }

          const value =
            typeof attr?.value === "string" ? attr.value.trim() : null;
          const attributeValueId =
            typeof attr?.attributeValueId === "string"
              ? attr.attributeValueId.trim()
              : null;

          return {
            attributeId,
            value: value || null,
            attributeValueId: attributeValueId || null,
          };
        },
      );

      return {
        sku: typeof variant?.sku === "string" ? variant.sku.trim() : null,
        imageUrl:
          typeof variant?.imageUrl === "string"
            ? variant.imageUrl.trim()
            : null,
        price,
        stock,
        weight,
        attributes,
      };
    },
  );

  return {
    brandId: brandId || null,
    name,
    slug: slug || null,
    description: description || null,
    thumbnailUrl,
    originalPrice,
    soldCount,
    images,
    tags,
    categories,
    variants,
  };
};

export const updateProductRequestDto = (
  data: any,
): UpdateProductRequestData => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Du lieu khong hop le!");
  }

  const allowedData: UpdateProductRequestData = {};

  const ALLOWED_FIELDS: (keyof UpdateProductRequestData)[] = [
    "brandId",
    "name",
    "slug",
    "description",
    "originalPrice",
    "soldCount",
  ];

  const invalidFields = Object.keys(data).filter(
    (key) => !ALLOWED_FIELDS.includes(key as any),
  );

  if (invalidFields.length) {
    throw new ValidationError(
      `Khong duoc phep cap nhat ${invalidFields.join(", ")}`,
    );
  }

  if (data.brandId !== undefined) {
    if (data.brandId === null) {
      allowedData.brandId = null;
    } else if (typeof data.brandId === "string" && data.brandId.trim()) {
      allowedData.brandId = data.brandId.trim();
    } else {
      throw new ValidationError("Brand khong hop le!");
    }
  }

  if (data.name !== undefined) {
    if (typeof data.name !== "string" || !data.name.trim()) {
      throw new ValidationError("Ten san pham khong hop le!");
    }
    allowedData.name = data.name.trim();
  }

  if (data.slug !== undefined) {
    if (typeof data.slug !== "string" || !data.slug.trim()) {
      throw new ValidationError("Slug khong hop le!");
    }
    allowedData.slug = data.slug.trim();
  }

  if (data.description !== undefined) {
    if (data.description === null) {
      allowedData.description = null;
    } else if (typeof data.description === "string") {
      allowedData.description = data.description.trim() || null;
    } else {
      throw new ValidationError("Mo ta khong hop le!");
    }
  }

  if (data.originalPrice !== undefined) {
    if (data.originalPrice === null || data.originalPrice === "") {
      allowedData.originalPrice = null;
    } else {
      const price = Number(data.originalPrice);
      if (isNaN(price) || price < 0) {
        throw new ValidationError("Gia goc khong hop le!");
      }
      allowedData.originalPrice = price;
    }
  }

  if (data.soldCount !== undefined) {
    const sold = Number(data.soldCount);
    if (isNaN(sold) || sold < 0) {
      throw new ValidationError("So luong da ban khong hop le!");
    }
    allowedData.soldCount = sold;
  }

  if (Object.keys(allowedData).length === 0) {
    throw new ValidationError("Khong co truong hop le de cap nhat!");
  }

  return allowedData;
};

export const updateShopProductStatusRequestDto = (data: any): ProductStatus => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Dữ liệu không hợp lệ!");
  }

  if (!data.status) throw new ValidationError("Không có status nào được chọn!");

  // Seller only update Active/Inactive status
  const allowedStatuses: ProductStatus[] = [
    ProductStatus.ACTIVE,
    ProductStatus.INACTIVE,
  ];
  if (data.status && !allowedStatuses.includes(data.status as ProductStatus)) {
    throw new ValidationError(`Trạng thái cập nhật không hợp lệ!`);
  }
  return data.status;
};

export const reviewProductApprovalRequestDto = (
  data: any,
): { status: string; reason?: string } => {
  if (!data || typeof data !== "object") {
    throw new ValidationError("Dữ liệu không hợp lệ!");
  }
  const allowedStatuses: ProductStatus[] = [
    ProductStatus.REJECTED,
    ProductStatus.ACTIVE,
  ];

  if (!data.status || !allowedStatuses.includes(data.status)) {
    throw new ValidationError("Trạng thái không hợp lệ!");
  }

  if (data.status === ProductStatus.REJECTED && !data.reason) {
    throw new ValidationError("Vui lòng cung cấp lý do từ chối!");
  }

  return { status: data.status, reason: data?.reason };
};
