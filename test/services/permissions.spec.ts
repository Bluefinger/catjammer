import { expect } from "chai";
import { PermissionType } from "../../src/constants";
import { Permissions } from "../../src/services";

describe("permissions.ts", () => {
  describe("Permissions Service", () => {
    it("can assign and retrieve permissions from users and roles", () => {
      const service = new Permissions();
      service.assignPermission("test", 1, PermissionType.USER);
      service.assignPermission("test", 1, PermissionType.ROLE);
      expect(service.getPermission("test", PermissionType.USER)).to.equal(1);
      expect(service.getPermission("test", PermissionType.ROLE)).to.equal(1);
    });
    it("defaults to NORMAL permissions level for non-assigned users/roles", () => {
      const service = new Permissions();
      expect(service.getPermission("test", PermissionType.USER)).to.equal(0);
      expect(service.getPermission("test", PermissionType.ROLE)).to.equal(0);
    });
    it("can remove assigned permissions from users/roles", () => {
      const service = new Permissions();
      service.assignPermission("test", 1, PermissionType.USER);
      service.assignPermission("test", 1, PermissionType.ROLE);
      expect(service.removePermission("test", PermissionType.USER)).to.be.true;
      expect(service.removePermission("test", PermissionType.ROLE)).to.be.true;
    });
  });
});
