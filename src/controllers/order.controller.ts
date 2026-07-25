import { Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import { validateCreateOrderDto, validateUpdateOrderStatusDto } from "../dtos/order.dto";
import { orderRepository } from "../repositories/order.repository";
import { orderService } from "../services/order.service";
import { asyncHandler } from "../utils/async-handler";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw HttpError.unauthorized();
  const dto = validateCreateOrderDto(req.body);
  const order = await orderService.create(dto, req.user.userId);
  res.status(201).json(order);
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw HttpError.unauthorized();
  const order = await orderService.getById(req.params.id, req.user.userId, req.user.role);
  res.status(200).json(order);
});

export const listMyOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw HttpError.unauthorized();
  const orders = await orderService.listForBuyer(req.user.userId);
  res.status(200).json(orders);
});

export const listBakerOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw HttpError.unauthorized();
  const orders = await orderService.listForBaker(req.user.userId);
  res.status(200).json(orders);
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw HttpError.unauthorized();
  const dto = validateUpdateOrderStatusDto(req.body);
  const order = await orderService.updateStatus(req.params.id, dto.status, req.user.userId);
  res.status(200).json(order);
});

export const listAllOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await orderRepository.findAll();
  res.status(200).json(orders);
});
