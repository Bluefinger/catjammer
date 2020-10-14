import type { Services } from "../index.types";
import type { PermissionGuard } from "./types";
import { AllowablePermission, PermissionLevels, PermissionType } from "../constants";

export const permissionGuard = ({ permissions }: Services): PermissionGuard => ({
  message,
  command,
}) => {
  const { author, guild } = message;
  const permissionLevel: AllowablePermission = command.permission ?? PermissionLevels.NORMAL;
  if (guild) {
    const userCheck = permissions.getPermission(`${guild.id}::${author.id}`, PermissionType.USER);
    const roleId = author.presence.member?.roles.highest.id || "";
    const roleCheck = permissions.getPermission(`${guild.id}::${roleId}`, PermissionType.ROLE);
    return userCheck + roleCheck >= permissionLevel;
  }
  return false;
};
