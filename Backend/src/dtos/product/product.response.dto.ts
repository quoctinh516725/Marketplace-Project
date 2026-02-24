import { ProductStatus } from "../../constants/productStatus";
import { PaginatedResponseDto } from "../common";

type IdName = {
  id: string;
  name: string;
};
type ProductBrand = IdName & {
  logoUrl: string | null;
};

export type ProductBasicResponseDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string;
  originalPrice: number | null;
  soldCount: number;
  rating: number | null;
  status: ProductStatus;
};

//PUBLIC
export type ProductDetailResponseDto = ProductBasicResponseDto & {
  shop: IdName;
  category: IdName;
  brand: ProductBrand | null;
  images: { id: string; imageUrl: string }[];
  variants: {
    id: string;
    sku: string;
    variantName: string | null;
    imageUrl: string | null;
    price: number;
    stock: number;
    weight: number | null;
    status: ProductStatus;
    attribute: {
      attributeId: string;
      code: string;
      valueId: string | null;
      value: string | null;
    }[];
  }[];
  tags: { id: string; tag: string }[];
};

export type ProductListResponseDto =
  PaginatedResponseDto<ProductBasicResponseDto>;

//MANAGER
export type ProductDetailManageResponseDto = ProductDetailResponseDto & {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
export type ProductListManageResponseDto =
  PaginatedResponseDto<ProductBasicResponseDto>;
