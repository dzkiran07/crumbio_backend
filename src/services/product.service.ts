import { HttpError } from "../errors/http-error";
import { CreateProductDto, UpdateProductDto } from "../dtos/product.dto";
import { AvailabilityStatus } from "../models/product.model";
import { ProductListFilter, productRepository } from "../repositories/product.repository";
import { UserRole } from "../types/user.type";
import { deriveAvailability } from "../utils/product-availability";

export class ProductService {
  async create(dto: CreateProductDto, bakerId: string, bakerName: string) {
    const availability = deriveAvailability(dto.variants, AvailabilityStatus.AVAILABLE);

    return productRepository.create({
      ...dto,
      baker: bakerId as unknown as never,
      bakerName,
      availability,
    });
  }

  async list(filter: ProductListFilter) {
    return productRepository.findMany(filter);
  }

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw HttpError.notFound("Product not found");
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto, requesterId: string, requesterRole: UserRole) {
    const existing = await this.getById(id);
    if (existing.baker.toString() !== requesterId && requesterRole !== UserRole.ADMIN) {
      throw HttpError.forbidden("You do not own this listing");
    }

    const variants = dto.variants ?? existing.variants;
    const availability = dto.availability ?? deriveAvailability(variants, existing.availability);

    const updated = await productRepository.updateById(id, { ...dto, variants, availability });
    if (!updated) {
      throw HttpError.notFound("Product not found");
    }
    return updated;
  }

  async addImage(id: string, imagePath: string, requesterId: string, requesterRole: UserRole) {
    const existing = await this.getById(id);
    if (existing.baker.toString() !== requesterId && requesterRole !== UserRole.ADMIN) {
      throw HttpError.forbidden("You do not own this listing");
    }

    // Replaces rather than appends — the app only ever displays images[0],
    // so a re-upload is meant to swap the picture, not stack duplicates.
    const images = [imagePath];
    const updated = await productRepository.updateById(id, { images });
    if (!updated) {
      throw HttpError.notFound("Product not found");
    }
    return updated;
  }

  async remove(id: string, requesterId: string, requesterRole: UserRole) {
    const existing = await this.getById(id);
    if (existing.baker.toString() !== requesterId && requesterRole !== UserRole.ADMIN) {
      throw HttpError.forbidden("You do not own this listing");
    }
    return productRepository.softDelete(id);
  }
}

export const productService = new ProductService();
