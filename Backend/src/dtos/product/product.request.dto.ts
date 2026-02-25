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
  weight: number | null;
  attributes: CreateProductAttributeRequestData[];
};

export type CreateProductRequestData = {
  brandId: string | null;
  name: string;
  code: string;
  slug: string | null;
  description: string | null;
  thumbnailUrl: string;
  originalPrice: number | null;
  soldCount: number;
  rating: number | null;
  images: { imageUrl: string; sortOrder: number }[];
  tags: { id: string }[];
  categories: { id: string }[];
  variants: CreateProductVariantRequestData[];
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

export const createProductRequestDto = (data: any): CreateProductRequestData => {
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
  if (!Array.isArray(data.variants) || data.variants.length === 0) {
    errors.push("Sản phẩm phải có ít nhất một biến thể!");
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
        const imageUrl = typeof img?.imageUrl === "string" ? img.imageUrl.trim() : "";
        const sortOrderValue = toNumber(img?.sortOrder ?? index, "Thứ tự ảnh") as number;
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
        throw new ValidationError(`variants[${variantIndex}].price không hợp lệ!`);
      }
      if (stock < 0) {
        throw new ValidationError(`variants[${variantIndex}].stock không hợp lệ!`);
      }
      if (weight !== null && weight < 0) {
        throw new ValidationError(`variants[${variantIndex}].weight không hợp lệ!`);
      }

      const attributesRaw = Array.isArray(variant?.attributes)
        ? variant.attributes
        : [];
      const attributes: CreateProductAttributeRequestData[] = attributesRaw.map(
        (attr: any, attributeIndex: number) => {
          const attributeId =
            typeof attr?.attributeId === "string" ? attr.attributeId.trim() : "";
          if (!attributeId) {
            throw new ValidationError(
              `variants[${variantIndex}].attributes[${attributeIndex}].attributeId không hợp lệ!`,
            );
          }

          const value = typeof attr?.value === "string" ? attr.value.trim() : null;
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
          typeof variant?.imageUrl === "string" ? variant.imageUrl.trim() : null,
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
    code: typeof data.code === "string" ? data.code.trim() : "",
    slug: slug || null,
    description: description || null,
    thumbnailUrl,
    originalPrice,
    soldCount,
    rating,
    images,
    tags,
    categories,
    variants,
  };
};
