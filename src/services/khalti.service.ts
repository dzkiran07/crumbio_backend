import { config } from "../config";
import { HttpError } from "../errors/http-error";
import { OrderModel, PaymentStatus } from "../models/order.model";
import { orderRepository } from "../repositories/order.repository";

interface KhaltiInitiateResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
}

interface KhaltiLookupResponse {
  pidx: string;
  status: "Completed" | "Pending" | "Expired" | "User canceled" | "Refunded";
  transaction_id: string | null;
  total_amount: number;
}

export class KhaltiService {
  async initiate(orderId: string, returnUrl: string) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw HttpError.notFound("Order not found");
    }
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw HttpError.conflict("Order has already been paid for");
    }
    if (!config.khalti.secretKey) {
      throw HttpError.internal("Khalti is not configured on this server");
    }

    const response = await fetch(`${config.khalti.baseUrl}/epayment/initiate/`, {
      method: "POST",
      headers: {
        Authorization: `Key ${config.khalti.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        return_url: returnUrl,
        website_url: returnUrl,
        amount: Math.round(order.totalAmount * 100),
        purchase_order_id: order._id.toString(),
        purchase_order_name: `Crumbio order ${order._id.toString()}`,
      }),
    });

    if (!response.ok) {
      throw HttpError.internal("Failed to initiate Khalti payment");
    }

    const data = (await response.json()) as KhaltiInitiateResponse;
    await orderRepository.updatePayment(orderId, PaymentStatus.UNPAID, data.pidx);
    return data;
  }

  async verify(pidx: string) {
    if (!config.khalti.secretKey) {
      throw HttpError.internal("Khalti is not configured on this server");
    }

    const response = await fetch(`${config.khalti.baseUrl}/epayment/lookup/`, {
      method: "POST",
      headers: {
        Authorization: `Key ${config.khalti.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx }),
    });

    if (!response.ok) {
      throw HttpError.internal("Failed to verify Khalti payment");
    }

    const data = (await response.json()) as KhaltiLookupResponse;
    const order = await OrderModel.findOne({ paymentReference: pidx });
    if (!order) {
      throw HttpError.notFound("No order found for this payment");
    }

    const paymentStatus = data.status === "Completed" ? PaymentStatus.PAID : PaymentStatus.FAILED;
    await orderRepository.updatePayment(order._id.toString(), paymentStatus, pidx);

    return { order: order._id.toString(), paymentStatus, khaltiStatus: data.status };
  }
}

export const khaltiService = new KhaltiService();
