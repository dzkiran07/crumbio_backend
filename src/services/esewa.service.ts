import crypto, { randomUUID } from "crypto";
import { config } from "../config";
import { HttpError } from "../errors/http-error";
import { OrderModel, PaymentStatus } from "../models/order.model";
import { orderRepository } from "../repositories/order.repository";

const SIGNED_FIELDS = "total_amount,transaction_uuid,product_code";

function sign(totalAmount: string, transactionUuid: string): string {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${config.esewa.merchantCode}`;
  return crypto.createHmac("sha256", config.esewa.secretKey).update(message).digest("base64");
}

export class EsewaService {
  async initiate(orderId: string) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw HttpError.notFound("Order not found");
    }
    if (order.paymentStatus === PaymentStatus.PAID) {
      throw HttpError.conflict("Order has already been paid for");
    }
    if (!config.esewa.merchantCode || !config.esewa.secretKey) {
      throw HttpError.internal("eSewa is not configured on this server");
    }

    const transactionUuid = randomUUID();
    const totalAmount = order.totalAmount.toFixed(2);
    const signature = sign(totalAmount, transactionUuid);

    await orderRepository.updatePayment(orderId, PaymentStatus.UNPAID, transactionUuid);

    return {
      formUrl: `${config.esewa.baseUrl}/main/v2/form`,
      fields: {
        amount: totalAmount,
        tax_amount: "0",
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: config.esewa.merchantCode,
        product_service_charge: "0",
        product_delivery_charge: "0",
        signed_field_names: SIGNED_FIELDS,
        signature,
      },
    };
  }

  async verify(orderId: string, transactionUuid: string, totalAmount: string) {
    if (!config.esewa.merchantCode) {
      throw HttpError.internal("eSewa is not configured on this server");
    }

    const response = await fetch(
      `${config.esewa.baseUrl}/transaction/status/?product_code=${config.esewa.merchantCode}&total_amount=${totalAmount}&transaction_uuid=${transactionUuid}`
    );

    if (!response.ok) {
      throw HttpError.internal("Failed to verify eSewa payment");
    }

    const data = (await response.json()) as { status: string };
    const paymentStatus = data.status === "COMPLETE" ? PaymentStatus.PAID : PaymentStatus.FAILED;
    await orderRepository.updatePayment(orderId, paymentStatus, transactionUuid);

    return { order: orderId, paymentStatus, esewaStatus: data.status };
  }
}

export const esewaService = new EsewaService();
