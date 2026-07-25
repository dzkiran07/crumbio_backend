import { Request, Response } from "express";
import { validateUpdateUserStatusDto } from "../dtos/admin.user.dto";
import { userService } from "../services/user.service";
import { asyncHandler } from "../utils/async-handler";

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const role = typeof req.query.role === "string" ? req.query.role : undefined;
  const users = await userService.listUsers(role);
  res.status(200).json(users);
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const dto = validateUpdateUserStatusDto(req.body);
  const user = await userService.setUserStatus(req.params.id, dto.isActive);
  res.status(200).json(user);
});
