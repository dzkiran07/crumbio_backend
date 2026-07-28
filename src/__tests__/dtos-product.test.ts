import { validateCreateProductDto, validateUpdateProductDto } from "../dtos/product.dto";
import { AvailabilityStatus, ProductCategory } from "../models/product.model";

describe("product dto validation", () => {
  const validVariants = [{ size: "Half kg", flavor: "Chocolate", price: 800, stock: 5 }];

  it("accepts a valid create payload", () => {
    const dto = validateCreateProductDto({
      name: "Chocolate Truffle Cake",
      description: "Rich chocolate cake with truffle icing",
      category: ProductCategory.CAKE,
      basePrice: 800,
      variants: validVariants,
    });
    expect(dto.variants).toHaveLength(1);
  });

  it("rejects an invalid category", () => {
    expect(() =>
      validateCreateProductDto({
        name: "Chocolate Truffle Cake",
        description: "Rich chocolate cake",
        category: "candy",
        basePrice: 800,
        variants: validVariants,
      })
    ).toThrow("Invalid category");
  });

  it("rejects an empty variants array", () => {
    expect(() =>
      validateCreateProductDto({
        name: "Chocolate Truffle Cake",
        description: "Rich chocolate cake",
        category: ProductCategory.CAKE,
        basePrice: 800,
        variants: [],
      })
    ).toThrow("At least one variant is required");
  });

  it("allows partial update payloads", () => {
    const dto = validateUpdateProductDto({ availability: AvailabilityStatus.SOLD_OUT });
    expect(dto.availability).toBe(AvailabilityStatus.SOLD_OUT);
  });

  it("rejects an invalid availability value on update", () => {
    expect(() => validateUpdateProductDto({ availability: "on_sale" })).toThrow("Invalid availability status");
  });
});
