import { HttpError } from "../errors/http-error";
import { CreateOrderDto } from "../dtos/order.dto";
import { IOrderItem, OrderStatus, PaymentStatus } from "../models/order.model";
import { orderRepository } from "../repositories/order.repository";
import { productRepository } from "../repositories/product.repository";
import { UserRole } from "../types/user.type";

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.BAKING, OrderStatus.CANCELLED],
  [OrderStatus.BAKING]: [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.PICKED_UP, OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.PICKED_UP]: [],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export class OrderService {
  async create(dto: CreateOrderDto, buyerId: string) {
    const items: IOrderItem[] = [];
    let bakerId: string | undefined;
    let totalAmount = 0;

    for (const line of dto.items) {
      const product = await productRepository.findById(line.product);
      if (!product) {
        throw HttpError.notFound(`Product ${line.product} not found`);
      }
      if (!bakerId) {
        bakerId = product.baker.toString();
      } else if (bakerId !== product.baker.toString()) {
        throw HttpError.badRequest("All items in an order must be from the same baker");
      }

      const variant = product.variants.find((v) => v.size === line.size && v.flavor === line.flavor);
      if (!variant) {
        throw HttpError.badRequest(`Selected size/flavor is not available for ${product.name}`);
      }
      if (variant.stock < line.quantity) {
        throw HttpError.badRequest(`Insufficient stock for ${product.name}`);
      }

      items.push({
        product: product._id,
        productName: product.name,
        size: line.size,
        flavor: line.flavor,
        unitPrice: variant.price,
        quantity: line.quantity,
      });
      totalAmount += variant.price * line.quantity;
    }

    if (!bakerId) {
      throw HttpError.badRequest("Order must contain at least one item");
    }

    const order = await orderRepository.create({
      buyer: buyerId as unknown as never,
      baker: bakerId as unknown as never,
      items,
      totalAmount,
      status: OrderStatus.PENDING,
      fulfillmentType: dto.fulfillmentType,
      deliveryAddress: dto.deliveryAddress,
      pickupNote: dto.pickupNote,
      paymentMethod: dto.paymentMethod,
      paymentStatus: PaymentStatus.UNPAID,
    });

    return order;
  }

  async getById(id: string, requesterId: string, role: UserRole) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw HttpError.notFound("Order not found");
    }
    const isOwner = order.buyer.toString() === requesterId || order.baker.toString() === requesterId;
    if (!isOwner && role !== UserRole.ADMIN) {
      throw HttpError.forbidden("You do not have access to this order");
    }
    return order;
  }

  async listForBuyer(buyerId: string) {
    return orderRepository.findByBuyer(buyerId);
  }

  async listForBaker(bakerId: string) {
    return orderRepository.findByBaker(bakerId);
  }

  async updateStatus(id: string, nextStatus: OrderStatus, requesterId: string) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw HttpError.notFound("Order not found");
    }
    if (order.baker.toString() !== requesterId) {
      throw HttpError.forbidden("Only the baker fulfilling this order can update its status");
    }

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed.includes(nextStatus)) {
      throw HttpError.badRequest(`Cannot transition order from ${order.status} to ${nextStatus}`);
    }

    const updated = await orderRepository.updateStatus(id, nextStatus);
    return updated;
  }
}

export const orderService = new OrderService();
