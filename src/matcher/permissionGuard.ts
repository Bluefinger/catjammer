import { AllowablePermission, PermissionLevels, PermissionType } from "../constants";
import type { PermissionGuard, Services } from "./types";

export const createPermissionGuard = ({ permissions }: Services): PermissionGuard => ({
  message,
  command,
}) => {
  const { author, guild } = message;
  const permissionLevel: AllowablePermission = command.permission ?? PermissionLevels.NORMAL;
  if (guild) {
    const userCheck = permissions.hasPermission(
      `${guild.id}::${author.id}`,
      permissionLevel,
      PermissionType.USER
    );
    const roleId = author.presence.member?.roles.highest.id;
    const roleCheck =
      !!roleId &&
      permissions.hasPermission(`${guild.id}::${roleId}`, permissionLevel, PermissionType.ROLE);
    return userCheck || roleCheck;
  }
  return false;
};
