import { Message } from "discord.js";
import { RoutedCommand } from "../matcher";

export const filterMessage = (prefix: string) => ({ author, content }: Message): boolean =>
  !author.bot && content.startsWith(prefix);

export const filterRouted = (command: RoutedCommand | undefined): command is RoutedCommand =>
  command !== undefined;
