import { FilterQuery } from "mongoose";
import { IUser, UserModel } from "../models/user.model";

export class UserRepository {
  create(data: Partial<IUser>) {
    return UserModel.create(data);
  }

  findById(id: string) {
    return UserModel.findById(id);
  }

  findByEmail(email: string, withSecrets = false) {
    const query = UserModel.findOne({ email: email.toLowerCase() });
    return withSecrets ? query.select("+otp +otpExpiresAt +passwordHash") : query;
  }

  findByEmailWithPassword(email: string) {
    return UserModel.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  }

  findAll(filter: FilterQuery<IUser> = {}) {
    return UserModel.find(filter).sort({ createdAt: -1 });
  }

  updateById(id: string, data: Partial<IUser>) {
    return UserModel.findByIdAndUpdate(id, data, { new: true });
  }

  setOtp(email: string, otp: string, expiresAt: Date) {
    return UserModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp, otpExpiresAt: expiresAt },
      { new: true }
    ).select("+otp +otpExpiresAt");
  }

  clearOtp(id: string) {
    return UserModel.findByIdAndUpdate(id, { $unset: { otp: 1, otpExpiresAt: 1 } });
  }
}

export const userRepository = new UserRepository();
