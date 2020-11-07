import type { ReadonlyList } from "../../index.types";
import type { ExtractedCommand } from "../../matcher";
import type { Command } from "../type";

export const getCommandsByPermission = ({
  message,
  commands,
  services,
}: ExtractedCommand): ReadonlyList<Command> => {
  const userPermission = services.permissions.resolvePermissionLevel(message.member);
  return commands.filter(({ permission = 0 }) => userPermission >= permission);
};
