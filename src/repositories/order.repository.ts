import { FilterQuery } from "mongoose";
import { IOrder, OrderModel, OrderStatus } from "../models/order.model";

export class OrderRepository {
  create(data: Partial<IOrder>) {
    return OrderModel.create(data);
  }

  findById(id: string) {
    return OrderModel.findById(id);
  }

  findByBuyer(buyerId: string) {
    return OrderModel.find({ buyer: buyerId }).sort({ createdAt: -1 });
  }

  findByBaker(bakerId: string) {
    return OrderModel.find({ baker: bakerId }).sort({ createdAt: -1 });
  }

  findAll(filter: FilterQuery<IOrder> = {}) {
    return OrderModel.find(filter).sort({ createdAt: -1 });
  }

  updateStatus(id: string, status: OrderStatus) {
    return OrderModel.findByIdAndUpdate(id, { status }, { new: true });
  }

  updatePayment(id: string, paymentStatus: IOrder["paymentStatus"], paymentReference?: string) {
    return OrderModel.findByIdAndUpdate(id, { paymentStatus, paymentReference }, { new: true });
  }
}

export const orderRepository = new OrderRepository();
