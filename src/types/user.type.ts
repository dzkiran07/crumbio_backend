export enum UserRole {
  BUYER = "buyer",
  BAKER = "baker",
  ADMIN = "admin",
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
