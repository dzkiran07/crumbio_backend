import { validateUpdateUserStatusDto } from "../dtos/admin.user.dto";

describe("admin user dto validation", () => {
  it("accepts a boolean isActive flag", () => {
    expect(validateUpdateUserStatusDto({ isActive: false })).toEqual({ isActive: false });
  });

  it("rejects a non-boolean isActive flag", () => {
    expect(() => validateUpdateUserStatusDto({ isActive: "no" })).toThrow("isActive must be a boolean");
  });
});
