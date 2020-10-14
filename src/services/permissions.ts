import { PermissionLevels, SetPermission, PermissionType } from "../constants";

export class Permissions {
  private users = new Map<string, SetPermission>();
  private roles = new Map<string, SetPermission>();
  assignPermission(key: string, level: SetPermission, type: PermissionType): void {
    this[type].set(key, level);
  }
  removePermission(key: string, type: PermissionType): boolean {
    return this[type].delete(key);
  }
  getPermission(key: string, type: PermissionType): PermissionLevels {
    return this[type].get(key) ?? PermissionLevels.NORMAL;
  }
}
