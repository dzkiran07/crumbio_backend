import { HttpError } from "../errors/http-error";
import { UserRole } from "../types/user.type";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RegisterUserDto {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  bakeryName?: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface SendOtpDto {
  email: string;
}

export interface VerifyOtpDto {
  email: string;
  otp: string;
}

export interface ResetPasswordDto {
  email: string;
  otp: string;
  newPassword: string;
}

export interface UpdateProfileDto {
  fullName?: string;
  phone?: string;
  address?: string;
}

function assertNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw HttpError.badRequest(`${field} is required`);
  }
  return value.trim();
}

export function validateRegisterUserDto(body: Record<string, unknown>): RegisterUserDto {
  const fullName = assertNonEmptyString(body.fullName, "fullName");
  const email = assertNonEmptyString(body.email, "email").toLowerCase();
  const phone = assertNonEmptyString(body.phone, "phone");
  const password = assertNonEmptyString(body.password, "password");
  const role = body.role === UserRole.BAKER ? UserRole.BAKER : UserRole.BUYER;

  if (!EMAIL_REGEX.test(email)) {
    throw HttpError.badRequest("Invalid email format");
  }
  if (password.length < 6) {
    throw HttpError.badRequest("Password must be at least 6 characters");
  }
  if (role === UserRole.BAKER && typeof body.bakeryName !== "string") {
    throw HttpError.badRequest("bakeryName is required for baker accounts");
  }

  return {
    fullName,
    email,
    phone,
    password,
    role,
    bakeryName: typeof body.bakeryName === "string" ? body.bakeryName.trim() : undefined,
  };
}

export function validateLoginUserDto(body: Record<string, unknown>): LoginUserDto {
  return {
    email: assertNonEmptyString(body.email, "email").toLowerCase(),
    password: assertNonEmptyString(body.password, "password"),
  };
}

export function validateSendOtpDto(body: Record<string, unknown>): SendOtpDto {
  return { email: assertNonEmptyString(body.email, "email").toLowerCase() };
}

export function validateVerifyOtpDto(body: Record<string, unknown>): VerifyOtpDto {
  return {
    email: assertNonEmptyString(body.email, "email").toLowerCase(),
    otp: assertNonEmptyString(body.otp, "otp"),
  };
}

export function validateResetPasswordDto(body: Record<string, unknown>): ResetPasswordDto {
  const newPassword = assertNonEmptyString(body.newPassword, "newPassword");
  if (newPassword.length < 6) {
    throw HttpError.badRequest("Password must be at least 6 characters");
  }
  return {
    email: assertNonEmptyString(body.email, "email").toLowerCase(),
    otp: assertNonEmptyString(body.otp, "otp"),
    newPassword,
  };
}

export function validateUpdateProfileDto(body: Record<string, unknown>): UpdateProfileDto {
  const dto: UpdateProfileDto = {};
  if (body.fullName !== undefined) {
    dto.fullName = assertNonEmptyString(body.fullName, "fullName");
  }
  if (body.phone !== undefined) {
    dto.phone = assertNonEmptyString(body.phone, "phone");
  }
  if (body.address !== undefined) {
    dto.address = typeof body.address === "string" ? body.address.trim() : "";
  }
  return dto;
}
