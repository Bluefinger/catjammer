import type { Command } from "../commands/type";
import { GuildMessage } from "../index.types";

export interface RoutedCommand {
  message: GuildMessage;
  command: Command;
}

export type CommandRouter = (message: GuildMessage) => RoutedCommand | undefined;
