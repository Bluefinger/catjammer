import type { Message } from "discord.js";
import type { Command } from "../commands/type";

export interface RoutedCommand {
  message: Message;
  command: Command;
}

export type CommandRouter = (message: Message) => RoutedCommand | undefined;
