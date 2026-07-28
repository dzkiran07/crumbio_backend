import { validateCreateOrderDto, validateUpdateOrderStatusDto } from "../dtos/order.dto";
import { validateInitiateKhaltiPaymentDto, validateVerifyKhaltiPaymentDto } from "../dtos/payment.dto";
import { FulfillmentType, OrderStatus, PaymentMethod } from "../models/order.model";

describe("order dto validation", () => {
  it("accepts a valid pickup order", () => {
    const dto = validateCreateOrderDto({
      items: [{ product: "abc123", size: "Half kg", quantity: 2 }],
      fulfillmentType: FulfillmentType.PICKUP,
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
    });
    expect(dto.items).toHaveLength(1);
  });

  it("requires a delivery address for delivery orders", () => {
    expect(() =>
      validateCreateOrderDto({
        items: [{ product: "abc123", size: "Half kg", quantity: 2 }],
        fulfillmentType: FulfillmentType.DELIVERY,
        paymentMethod: PaymentMethod.KHALTI,
      })
    ).toThrow("deliveryAddress is required for delivery orders");
  });

  it("rejects an empty items array", () => {
    expect(() =>
      validateCreateOrderDto({
        items: [],
        fulfillmentType: FulfillmentType.PICKUP,
        paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      })
    ).toThrow("Order must contain at least one item");
  });

  it("rejects a payment method that no longer exists (esewa)", () => {
    expect(() =>
      validateCreateOrderDto({
        items: [{ product: "abc123", size: "Half kg", quantity: 2 }],
        fulfillmentType: FulfillmentType.PICKUP,
        paymentMethod: "esewa",
      })
    ).toThrow("Invalid paymentMethod");
  });

  it("validates order status updates", () => {
    expect(validateUpdateOrderStatusDto({ status: OrderStatus.BAKING })).toEqual({ status: OrderStatus.BAKING });
    expect(() => validateUpdateOrderStatusDto({ status: "melting" })).toThrow("Invalid order status");
  });
});

describe("payment dto validation", () => {
  it("validates khalti initiate payload", () => {
    const dto = validateInitiateKhaltiPaymentDto({ orderId: "abc123", returnUrl: "https://crumbio.app/return" });
    expect(dto.orderId).toBe("abc123");
  });

  it("validates khalti verify payload", () => {
    const dto = validateVerifyKhaltiPaymentDto({ pidx: "pidx-1" });
    expect(dto.pidx).toBe("pidx-1");
  });

  it("rejects a missing pidx", () => {
    expect(() => validateVerifyKhaltiPaymentDto({})).toThrow("pidx is required");
  });
});
