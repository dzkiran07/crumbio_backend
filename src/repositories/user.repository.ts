import { FilterQuery } from "mongoose";
import { IUser, UserModel } from "../models/user.model";

export class UserRepository {
  create(data: Partial<IUser>) {
    return UserModel.create(data);
  }

  findById(id: string) {
    return UserModel.findById(id);
  }

  findByEmail(email: string) {
    return UserModel.findOne({ email: email.toLowerCase() });
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
}

export const userRepository = new UserRepository();
