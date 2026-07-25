import { Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import {
  validateLoginUserDto,
  validateRegisterUserDto,
  validateResetPasswordDto,
  validateSendOtpDto,
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
