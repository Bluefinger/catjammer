import { Message } from "discord.js";

export const filterMessage = (prefix: string) => ({ author, content }: Message): boolean =>
  !author.bot && content.startsWith(prefix);
