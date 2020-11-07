import type { Services } from "../index.types";
import type { PermissionGuard } from "./types";
import { PermissionLevels } from "../constants";

export const permissionGuard = ({ permissions }: Services): PermissionGuard => ({
  message,
  command,
}) => {
  const commandPermissionLevel = command.permission ?? PermissionLevels.NORMAL;
  return permissions.resolvePermissionLevel(message.member) >= commandPermissionLevel;
};
