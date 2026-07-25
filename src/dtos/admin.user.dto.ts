import { HttpError } from "../errors/http-error";

export interface UpdateUserStatusDto {
  isActive: boolean;
}

export function validateUpdateUserStatusDto(body: Record<string, unknown>): UpdateUserStatusDto {
  if (typeof body.isActive !== "boolean") {
    throw HttpError.badRequest("isActive must be a boolean");
  }
  return { isActive: body.isActive };
}
