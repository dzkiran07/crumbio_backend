import { AvailabilityStatus } from "../models/product.model";
import { deriveAvailability, isPurchasable, totalStock } from "../utils/product-availability";

const variants = [
  { size: "Half kg", flavor: "Vanilla", price: 500, stock: 2 },
  { size: "One kg", flavor: "Vanilla", price: 900, stock: 0 },
];

describe("product-availability utils", () => {
  it("sums stock across variants", () => {
    expect(totalStock(variants)).toBe(2);
  });

  it("marks a product as sold out when all variants are out of stock", () => {
    const soldOutVariants = variants.map((v) => ({ ...v, stock: 0 }));
    expect(deriveAvailability(soldOutVariants, AvailabilityStatus.AVAILABLE)).toBe(AvailabilityStatus.SOLD_OUT);
  });

  it("marks a product as available when any variant has stock", () => {
    expect(deriveAvailability(variants, AvailabilityStatus.SOLD_OUT)).toBe(AvailabilityStatus.AVAILABLE);
  });

  it("keeps unlisted products unlisted regardless of stock", () => {
    expect(deriveAvailability(variants, AvailabilityStatus.UNLISTED)).toBe(AvailabilityStatus.UNLISTED);
  });

  it("only treats available status as purchasable", () => {
    expect(isPurchasable(AvailabilityStatus.AVAILABLE)).toBe(true);
    expect(isPurchasable(AvailabilityStatus.SOLD_OUT)).toBe(false);
    expect(isPurchasable(AvailabilityStatus.UNLISTED)).toBe(false);
  });
});
