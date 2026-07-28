import { validateLoginUserDto, validateRegisterUserDto } from "../dtos/user.dto";
import { UserRole } from "../types/user.type";

describe("user dto validation", () => {
  it("accepts a valid buyer registration payload", () => {
    const dto = validateRegisterUserDto({
      fullName: "Sita Sharma",
      email: "Sita@Example.com",
      phone: "9800000000",
      password: "password123",
      role: UserRole.BUYER,
    });

    expect(dto.email).toBe("sita@example.com");
    expect(dto.role).toBe(UserRole.BUYER);
  });

  it("requires bakeryName for baker registration", () => {
    expect(() =>
      validateRegisterUserDto({
        fullName: "Baker Bina",
        email: "bina@example.com",
        phone: "9811111111",
        password: "password123",
        role: UserRole.BAKER,
      })
    ).toThrow("bakeryName is required for baker accounts");
  });

  it("rejects an invalid email", () => {
    expect(() =>
      validateRegisterUserDto({
        fullName: "Sita Sharma",
        email: "not-an-email",
        phone: "9800000000",
        password: "password123",
        role: UserRole.BUYER,
      })
    ).toThrow("Invalid email format");
  });

  it("rejects a short password", () => {
    expect(() =>
      validateRegisterUserDto({
        fullName: "Sita Sharma",
        email: "sita@example.com",
        phone: "9800000000",
        password: "123",
        role: UserRole.BUYER,
      })
    ).toThrow("Password must be at least 6 characters");
  });

  it("validates login payloads", () => {
    const dto = validateLoginUserDto({ email: "Sita@Example.com", password: "secret" });
    expect(dto.email).toBe("sita@example.com");
  });

  it("rejects login without a password", () => {
    expect(() => validateLoginUserDto({ email: "sita@example.com" })).toThrow("password is required");
  });
});
