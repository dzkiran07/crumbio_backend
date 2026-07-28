import { Schema, model, Document, Types } from "mongoose";

export enum OrderStatus {
  PENDING = "pending",
  BAKING = "baking",
  READY = "ready",
  PICKED_UP = "picked_up",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

export enum FulfillmentType {
  PICKUP = "pickup",
  DELIVERY = "delivery",
}

export enum PaymentMethod {
  KHALTI = "khalti",
  CASH_ON_DELIVERY = "cash_on_delivery",
}

export enum PaymentStatus {
  UNPAID = "unpaid",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export interface IOrderItem {
  product: Types.ObjectId;
  productName: string;
  size: string;
  flavor?: string;
  unitPrice: number;
  quantity: number;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  buyer: Types.ObjectId;
  baker: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
  deliveryAddress?: string;
  pickupNote?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    size: { type: String, required: true },
    flavor: { type: String },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    buyer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    baker: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true, validate: (v: IOrderItem[]) => v.length > 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING },
    fulfillmentType: { type: String, enum: Object.values(FulfillmentType), required: true },
    deliveryAddress: { type: String },
    pickupNote: { type: String },
    paymentMethod: { type: String, enum: Object.values(PaymentMethod), required: true },
    paymentStatus: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.UNPAID },
    paymentReference: { type: String },
  },
  { timestamps: true }
);

export const OrderModel = model<IOrder>("Order", orderSchema);
