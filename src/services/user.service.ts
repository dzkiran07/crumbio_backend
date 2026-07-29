import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { HttpError } from "../errors/http-error";
import { userRepository } from "../repositories/user.repository";
import {
  ChangePasswordDto,
  DeleteAccountDto,
  LoginUserDto,
  RegisterUserDto,
  UpdateProfileDto,
} from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { JwtPayload } from "../types/user.type";

const SALT_ROUNDS = 10;

function signToken(user: IUser): string {
  const payload: JwtPayload = { userId: user._id.toString(), role: user.role };
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions);
}

function sanitizeUser(user: IUser) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    bakeryName: user.bakeryName,
    address: user.address,
    profileImage: user.profileImage,
    isActive: user.isActive,
  };
}

export class UserService {
  async register(dto: RegisterUserDto) {
    const existing = await userRepository.findByEmail(dto.email);
    if (existing) {
      throw HttpError.conflict("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await userRepository.create({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      role: dto.role,
      bakeryName: dto.bakeryName,
    });

    return { user: sanitizeUser(user), token: signToken(user) };
  }

  async login(dto: LoginUserDto) {
    const user = await userRepository.findByEmailWithPassword(dto.email);
    if (!user) {
      throw HttpError.unauthorized("Invalid email or password");
    }
    if (!user.isActive) {
      throw HttpError.forbidden("This account has been deactivated");
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw HttpError.unauthorized("Invalid email or password");
    }

    return { user: sanitizeUser(user), token: signToken(user) };
  }

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw HttpError.notFound("User not found");
    }
    return sanitizeUser(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await userRepository.updateById(id, dto);
    if (!user) {
      throw HttpError.notFound("User not found");
    }
    return sanitizeUser(user);
  }

  async updateProfileImage(id: string, imagePath: string) {
    const user = await userRepository.updateById(id, { profileImage: imagePath });
    if (!user) {
      throw HttpError.notFound("User not found");
    }
    return sanitizeUser(user);
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw HttpError.notFound("User not found");
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      // 400, not 401 — the caller is already authenticated (valid JWT); this
      // is a validation failure, and 401 here would trip the frontend's
      // global "session expired" interceptor and log the user out.
      throw HttpError.badRequest("Current password is incorrect");
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await userRepository.updateById(id, { passwordHash });

    return { message: "Password changed successfully" };
  }

  async deleteAccount(id: string, dto: DeleteAccountDto) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw HttpError.notFound("User not found");
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isMatch) {
      // 400, not 401 — the caller is already authenticated (valid JWT); this
      // is a validation failure, and 401 here would trip the frontend's
      // global "session expired" interceptor and log the user out.
      throw HttpError.badRequest("Current password is incorrect");
    }

    await userRepository.updateById(id, { isActive: false });
    return { message: "Account deleted successfully" };
  }

  async listUsers(role?: string) {
    const users = await userRepository.findAll(role ? { role } : {});
    return users.map(sanitizeUser);
  }

  async setUserStatus(id: string, isActive: boolean) {
    const user = await userRepository.updateById(id, { isActive });
    if (!user) {
      throw HttpError.notFound("User not found");
    }
    return sanitizeUser(user);
  }
}

export const userService = new UserService();
