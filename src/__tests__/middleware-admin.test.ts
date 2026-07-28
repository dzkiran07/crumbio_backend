import { Request, Response } from "express";
import { adminMiddleware, bakerMiddleware } from "../middleware/admin.middleware";
import { HttpError } from "../errors/http-error";
import { UserRole } from "../types/user.type";

function makeRequest(user?: { userId: string; role: UserRole }): Request {
  return { user } as unknown as Request;
}

describe("adminMiddleware", () => {
  it("calls next when the user is an admin", () => {
    const req = makeRequest({ userId: "1", role: UserRole.ADMIN });
    const next = jest.fn();
    adminMiddleware(req, {} as Response, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("throws forbidden for a non-admin user", () => {
    const req = makeRequest({ userId: "1", role: UserRole.BUYER });
    expect(() => adminMiddleware(req, {} as Response, jest.fn())).toThrow(HttpError);
  });

  it("throws unauthorized when there is no user", () => {
    expect(() => adminMiddleware(makeRequest(undefined), {} as Response, jest.fn())).toThrow(HttpError);
  });
});

describe("bakerMiddleware", () => {
  it("allows baker and admin roles", () => {
    const next = jest.fn();
    bakerMiddleware(makeRequest({ userId: "1", role: UserRole.BAKER }), {} as Response, next);
    bakerMiddleware(makeRequest({ userId: "2", role: UserRole.ADMIN }), {} as Response, next);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it("rejects buyer role", () => {
    expect(() =>
      bakerMiddleware(makeRequest({ userId: "1", role: UserRole.BUYER }), {} as Response, jest.fn())
    ).toThrow(HttpError);
  });
});
