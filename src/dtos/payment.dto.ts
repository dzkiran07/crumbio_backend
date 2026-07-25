import { HttpError } from "../errors/http-error";

export interface InitiateKhaltiPaymentDto {
  orderId: string;
  returnUrl: string;
}

export interface VerifyKhaltiPaymentDto {
  pidx: string;
}

export interface InitiateEsewaPaymentDto {
  orderId: string;
}

export interface VerifyEsewaPaymentDto {
  orderId: string;
  transactionUuid: string;
  totalAmount: string;
}

function assertNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw HttpError.badRequest(`${field} is required`);
  }
  return value.trim();
}

export function validateInitiateKhaltiPaymentDto(body: Record<string, unknown>): InitiateKhaltiPaymentDto {
  return {
    orderId: assertNonEmptyString(body.orderId, "orderId"),
    returnUrl: assertNonEmptyString(body.returnUrl, "returnUrl"),
  };
}

export function validateVerifyKhaltiPaymentDto(body: Record<string, unknown>): VerifyKhaltiPaymentDto {
  return { pidx: assertNonEmptyString(body.pidx, "pidx") };
}

export function validateInitiateEsewaPaymentDto(body: Record<string, unknown>): InitiateEsewaPaymentDto {
  return { orderId: assertNonEmptyString(body.orderId, "orderId") };
}

export function validateVerifyEsewaPaymentDto(body: Record<string, unknown>): VerifyEsewaPaymentDto {
  return {
    orderId: assertNonEmptyString(body.orderId, "orderId"),
    transactionUuid: assertNonEmptyString(body.transactionUuid, "transactionUuid"),
    totalAmount: assertNonEmptyString(body.totalAmount, "totalAmount"),
  };
}
