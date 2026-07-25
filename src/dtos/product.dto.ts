import { HttpError } from "../errors/http-error";
import { AvailabilityStatus, IProductVariant, ProductCategory } from "../models/product.model";

export interface CreateProductDto {
  name: string;
  description: string;
  category: ProductCategory;
  basePrice: number;
  variants: IProductVariant[];
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  category?: ProductCategory;
  basePrice?: number;
  variants?: IProductVariant[];
  availability?: AvailabilityStatus;
}

function assertNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw HttpError.badRequest(`${field} is required`);
  }
  return value.trim();
}

function assertPositiveNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    throw HttpError.badRequest(`${field} must be a non-negative number`);
  }
  return value;
}

function validateVariants(value: unknown): IProductVariant[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw HttpError.badRequest("At least one variant is required");
  }
  return value.map((variant, index) => {
    if (typeof variant !== "object" || variant === null) {
      throw HttpError.badRequest(`variants[${index}] must be an object`);
    }
    const v = variant as Record<string, unknown>;
    return {
      size: assertNonEmptyString(v.size, `variants[${index}].size`),
      flavor: typeof v.flavor === "string" ? v.flavor.trim() : undefined,
      price: assertPositiveNumber(v.price, `variants[${index}].price`),
      stock: assertPositiveNumber(v.stock, `variants[${index}].stock`),
    };
  });
}

export function validateCreateProductDto(body: Record<string, unknown>): CreateProductDto {
  const category = body.category as ProductCategory;
  if (!Object.values(ProductCategory).includes(category)) {
    throw HttpError.badRequest("Invalid category");
  }
  return {
    name: assertNonEmptyString(body.name, "name"),
    description: assertNonEmptyString(body.description, "description"),
    category,
    basePrice: assertPositiveNumber(body.basePrice, "basePrice"),
    variants: validateVariants(body.variants),
  };
}

export function validateUpdateProductDto(body: Record<string, unknown>): UpdateProductDto {
  const dto: UpdateProductDto = {};

  if (body.name !== undefined) dto.name = assertNonEmptyString(body.name, "name");
  if (body.description !== undefined) dto.description = assertNonEmptyString(body.description, "description");
  if (body.basePrice !== undefined) dto.basePrice = assertPositiveNumber(body.basePrice, "basePrice");
  if (body.variants !== undefined) dto.variants = validateVariants(body.variants);

  if (body.category !== undefined) {
    if (!Object.values(ProductCategory).includes(body.category as ProductCategory)) {
      throw HttpError.badRequest("Invalid category");
    }
    dto.category = body.category as ProductCategory;
  }

  if (body.availability !== undefined) {
    if (!Object.values(AvailabilityStatus).includes(body.availability as AvailabilityStatus)) {
      throw HttpError.badRequest("Invalid availability status");
    }
    dto.availability = body.availability as AvailabilityStatus;
  }

  return dto;
}
