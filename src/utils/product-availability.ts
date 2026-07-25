import { AvailabilityStatus, IProductVariant } from "../models/product.model";

export function totalStock(variants: IProductVariant[]): number {
  return variants.reduce((sum, variant) => sum + variant.stock, 0);
}

export function deriveAvailability(
  variants: IProductVariant[],
  currentStatus: AvailabilityStatus
): AvailabilityStatus {
  if (currentStatus === AvailabilityStatus.UNLISTED) {
    return AvailabilityStatus.UNLISTED;
  }
  return totalStock(variants) > 0 ? AvailabilityStatus.AVAILABLE : AvailabilityStatus.SOLD_OUT;
}

export function isPurchasable(status: AvailabilityStatus): boolean {
  return status === AvailabilityStatus.AVAILABLE;
}
