import { Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import { validateCreateProductDto, validateUpdateProductDto } from "../dtos/product.dto";
import { productService } from "../services/product.service";
import { userService } from "../services/user.service";
import { asyncHandler } from "../utils/async-handler";

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw HttpError.unauthorized();
  const dto = validateCreateProductDto(req.body);
  const baker = await userService.getById(req.user.userId);
  const product = await productService.create(dto, req.user.userId, baker.bakeryName ?? baker.fullName);
  res.status(201).json(product);
});

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { category, baker, search } = req.query;
  const products = await productService.list({
    category: typeof category === "string" ? category : undefined,
    baker: typeof baker === "string" ? baker : undefined,
    search: typeof search === "string" ? search : undefined,
  });
  res.status(200).json(products);
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getById(req.params.id);
  res.status(200).json(product);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw HttpError.unauthorized();
  const dto = validateUpdateProductDto(req.body);
  const product = await productService.update(req.params.id, dto, req.user.userId, req.user.role);
  res.status(200).json(product);
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw HttpError.unauthorized();
  await productService.remove(req.params.id, req.user.userId, req.user.role);
  res.status(204).send();
});

export const uploadProductImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw HttpError.unauthorized();
  if (!req.file) {
    throw HttpError.badRequest("No image file uploaded");
  }
  const imagePath = `/uploads/${req.file.filename}`;
  const product = await productService.addImage(req.params.id, imagePath, req.user.userId, req.user.role);
  res.status(201).json(product);
});
