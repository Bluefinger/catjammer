import { Collection, Message } from "discord.js";
import { Command } from "../commands/type";
import { HandlerEvent } from "./types";

export const filterMessage = (prefix: string) => ({ author, content }: Message): boolean =>
  !author.bot && content.startsWith(prefix);

export const filterCommand = (collection: Collection<string, Command>) => ({
  command,
}: HandlerEvent): boolean => collection.has(command);
