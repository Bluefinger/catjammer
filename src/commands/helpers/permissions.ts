import { PermissionType } from "../../constants";
import type { ReadonlyList } from "../../index.types";
import type { ExtractedCommand } from "../../matcher";
import type { Command } from "../type";

export const getCommandsByPermission = ({
  message,
  commands,
  services,
}: ExtractedCommand): ReadonlyList<Command> => {
  const setPermission =
    services.permissions.getPermission(
      `${message.guild.id}::${message.author.id}`,
      PermissionType.USER
    ) ||
    services.permissions.getPermission(
      `${message.guild.id}::${message.member.roles.highest.id}`,
      PermissionType.ROLE
    );
  return commands.filter(({ permission = 0 }) => setPermission >= permission);
};
