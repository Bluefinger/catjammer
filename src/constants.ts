export const enum PermissionLevels {
  BANNED = -1,
  NORMAL,
  OFFICER,
}

export type SetPermission = PermissionLevels.BANNED | PermissionLevels.OFFICER;
export type AllowablePermission = PermissionLevels.NORMAL | PermissionLevels.OFFICER;
