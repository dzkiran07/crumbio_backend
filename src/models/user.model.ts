import { Schema, model, Document, Types } from "mongoose";
import { UserRole } from "../types/user.type";

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  bakeryName?: string;
  address?: string;
  profileImage?: string;
  isActive: boolean;
  otp?: string;
  otpExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.BUYER },
    bakeryName: { type: String, trim: true },
    address: { type: String, trim: true },
    profileImage: { type: String },
    isActive: { type: Boolean, default: true },
    otp: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("User", userSchema);
