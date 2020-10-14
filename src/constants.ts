export const enum PermissionType {
  USER = "users",
  ROLE = "roles",
}

export const enum PermissionLevels {
  BANNED = -9,
  NORMAL = 0,
  OFFICER = 1,
}

export type SetPermission = PermissionLevels.BANNED | PermissionLevels.OFFICER;
export type AllowablePermission = PermissionLevels.NORMAL | PermissionLevels.OFFICER;
