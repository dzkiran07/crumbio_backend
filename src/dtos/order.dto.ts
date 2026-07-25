import { HttpError } from "../errors/http-error";
import { FulfillmentType, OrderStatus, PaymentMethod } from "../models/order.model";

export interface CreateOrderItemDto {
  product: string;
  size: string;
  flavor?: string;
  quantity: number;
}

export interface CreateOrderDto {
  items: CreateOrderItemDto[];
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string;
  pickupNote?: string;
  paymentMethod: PaymentMethod;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

function assertNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw HttpError.badRequest(`${field} is required`);
  }
  return value.trim();
}

function validateItems(value: unknown): CreateOrderItemDto[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw HttpError.badRequest("Order must contain at least one item");
  }
  return value.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw HttpError.badRequest(`items[${index}] must be an object`);
    }
    const i = item as Record<string, unknown>;
    const quantity = i.quantity;
    if (typeof quantity !== "number" || quantity < 1) {
      throw HttpError.badRequest(`items[${index}].quantity must be at least 1`);
    }
    return {
      product: assertNonEmptyString(i.product, `items[${index}].product`),
      size: assertNonEmptyString(i.size, `items[${index}].size`),
      flavor: typeof i.flavor === "string" ? i.flavor.trim() : undefined,
      quantity,
    };
  });
}

export function validateCreateOrderDto(body: Record<string, unknown>): CreateOrderDto {
  const fulfillmentType = body.fulfillmentType as FulfillmentType;
  if (!Object.values(FulfillmentType).includes(fulfillmentType)) {
    throw HttpError.badRequest("Invalid fulfillmentType");
  }
  if (
    fulfillmentType === FulfillmentType.DELIVERY &&
    (typeof body.deliveryAddress !== "string" || body.deliveryAddress.trim().length === 0)
  ) {
    throw HttpError.badRequest("deliveryAddress is required for delivery orders");
  }

  const paymentMethod = body.paymentMethod as PaymentMethod;
  if (!Object.values(PaymentMethod).includes(paymentMethod)) {
    throw HttpError.badRequest("Invalid paymentMethod");
  }

  return {
    items: validateItems(body.items),
    fulfillmentType,
    deliveryAddress: typeof body.deliveryAddress === "string" ? body.deliveryAddress.trim() : undefined,
    pickupNote: typeof body.pickupNote === "string" ? body.pickupNote.trim() : undefined,
    paymentMethod,
  };
}

export function validateUpdateOrderStatusDto(body: Record<string, unknown>): UpdateOrderStatusDto {
  const status = body.status as OrderStatus;
  if (!Object.values(OrderStatus).includes(status)) {
    throw HttpError.badRequest("Invalid order status");
  }
  return { status };
}
