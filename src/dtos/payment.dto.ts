import { HttpError } from "../errors/http-error";

export interface InitiateKhaltiPaymentDto {
  orderId: string;
  returnUrl: string;
}

export interface VerifyKhaltiPaymentDto {
  pidx: string;
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
