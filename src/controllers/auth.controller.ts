import { Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import {
  validateChangePasswordDto,
  validateDeleteAccountDto,
  validateLoginUserDto,
  validateRegisterUserDto,
  validateResetPasswordDto,
  validateSendOtpDto,
  validateUpdateProfileDto,
  validateVerifyOtpDto,
} from "../dtos/user.dto";
import { userService } from "../services/user.service";
import { asyncHandler } from "../utils/async-handler";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const dto = validateRegisterUserDto(req.body);
  const result = await userService.register(dto);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const dto = validateLoginUserDto(req.body);
  const result = await userService.login(dto);
  res.status(200).json(result);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw HttpError.unauthorized();
  }
  const user = await userService.getById(req.user.userId);
  res.status(200).json(user);
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw HttpError.unauthorized();
  }
  const dto = validateUpdateProfileDto(req.body);
  const user = await userService.updateProfile(req.user.userId, dto);
  res.status(200).json(user);
});

export const uploadProfileImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw HttpError.unauthorized();
  }
  if (!req.file) {
    throw HttpError.badRequest("No image file uploaded");
  }
  const user = await userService.updateProfileImage(req.user.userId, `/uploads/${req.file.filename}`);
  res.status(200).json(user);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw HttpError.unauthorized();
  }
  const dto = validateChangePasswordDto(req.body);
  const result = await userService.changePassword(req.user.userId, dto);
  res.status(200).json(result);
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw HttpError.unauthorized();
  }
  const dto = validateDeleteAccountDto(req.body);
  const result = await userService.deleteAccount(req.user.userId, dto);
  res.status(200).json(result);
});

export const sendForgotPasswordOtp = asyncHandler(async (req: Request, res: Response) => {
  const dto = validateSendOtpDto(req.body);
  const result = await userService.sendForgotPasswordOtp(dto);
  res.status(200).json(result);
});

export const verifyForgotPasswordOtp = asyncHandler(async (req: Request, res: Response) => {
  const dto = validateVerifyOtpDto(req.body);
  const result = await userService.verifyForgotPasswordOtp(dto);
  res.status(200).json(result);
});

export const resetForgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const dto = validateResetPasswordDto(req.body);
  const result = await userService.resetForgotPassword(dto);
  res.status(200).json(result);
});
