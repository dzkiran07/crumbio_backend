import { Request, Response } from "express";
import { validateInitiateKhaltiPaymentDto, validateVerifyKhaltiPaymentDto } from "../dtos/payment.dto";
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
