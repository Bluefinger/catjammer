import { PermissionLevels, SetPermission } from "../constants";

export class Permissions {
  private cache = new Map<string, SetPermission>();
  assignPermission(key: string, level: SetPermission): void {
    this.cache.set(key, level);
  }
  removePermission(key: string): boolean {
    return this.cache.delete(key);
  }
  hasPermission(key: string): PermissionLevels {
    return this.cache.get(key) ?? PermissionLevels.NORMAL;
  }
}
