import { Request, Response } from "express";
import {
  validateInitiateEsewaPaymentDto,
  validateInitiateKhaltiPaymentDto,
  validateVerifyEsewaPaymentDto,
  validateVerifyKhaltiPaymentDto,
} from "../dtos/payment.dto";
import { esewaService } from "../services/esewa.service";
import { khaltiService } from "../services/khalti.service";
import { asyncHandler } from "../utils/async-handler";

export const initiateKhalti = asyncHandler(async (req: Request, res: Response) => {
  const dto = validateInitiateKhaltiPaymentDto(req.body);
  const result = await khaltiService.initiate(dto.orderId, dto.returnUrl);
  res.status(200).json(result);
});

export const verifyKhalti = asyncHandler(async (req: Request, res: Response) => {
  const dto = validateVerifyKhaltiPaymentDto(req.body);
  const result = await khaltiService.verify(dto.pidx);
  res.status(200).json(result);
});

export const initiateEsewa = asyncHandler(async (req: Request, res: Response) => {
  const dto = validateInitiateEsewaPaymentDto(req.body);
  const result = await esewaService.initiate(dto.orderId);
  res.status(200).json(result);
});

export const verifyEsewa = asyncHandler(async (req: Request, res: Response) => {
  const dto = validateVerifyEsewaPaymentDto(req.body);
  const result = await esewaService.verify(dto.orderId, dto.transactionUuid, dto.totalAmount);
  res.status(200).json(result);
});
