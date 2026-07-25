import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { config } from "../config";
import { HttpError } from "../errors/http-error";
import { userRepository } from "../repositories/user.repository";
import {
  LoginUserDto,
  RegisterUserDto,
  ResetPasswordDto,
  SendOtpDto,
  VerifyOtpDto,
} from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { JwtPayload } from "../types/user.type";

const SALT_ROUNDS = 10;
const OTP_TTL_MINUTES = 10;

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function signToken(user: IUser): string {
  const payload: JwtPayload = { userId: user._id.toString(), role: user.role };
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions);
}

async function sendOtpEmail(email: string, otp: string): Promise<void> {
  if (!config.mail.host) {
    console.log(`[mail:otp] (SMTP not configured) OTP for ${email}: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    auth: { user: config.mail.user, pass: config.mail.pass },
  });

  await transporter.sendMail({
    from: config.mail.from,
    to: email,
    subject: "Crumbio password reset code",
    text: `Your Crumbio verification code is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes.`,
  });
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

  async sendForgotPasswordOtp(dto: SendOtpDto) {
    const user = await userRepository.findByEmail(dto.email);
    if (!user) {
      throw HttpError.notFound("No account found with this email");
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
    await userRepository.setOtp(dto.email, otp, expiresAt);
    await sendOtpEmail(dto.email, otp);

    return { message: "OTP sent to email" };
  }

  async verifyForgotPasswordOtp(dto: VerifyOtpDto) {
    const user = await userRepository.findByEmail(dto.email, true);
    if (!user || !user.otp || !user.otpExpiresAt) {
      throw HttpError.badRequest("No OTP request found for this email");
    }
    if (user.otp !== dto.otp) {
      throw HttpError.badRequest("Invalid OTP");
    }
    if (user.otpExpiresAt.getTime() < Date.now()) {
      throw HttpError.badRequest("OTP has expired");
    }

    return { message: "OTP verified" };
  }

  async resetForgotPassword(dto: ResetPasswordDto) {
    const user = await userRepository.findByEmail(dto.email, true);
    if (!user || !user.otp || !user.otpExpiresAt) {
      throw HttpError.badRequest("No OTP request found for this email");
    }
    if (user.otp !== dto.otp) {
      throw HttpError.badRequest("Invalid OTP");
    }
    if (user.otpExpiresAt.getTime() < Date.now()) {
      throw HttpError.badRequest("OTP has expired");
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await userRepository.updateById(user._id.toString(), { passwordHash });
    await userRepository.clearOtp(user._id.toString());

    return { message: "Password reset successful" };
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
