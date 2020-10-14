import type { Message } from "discord.js";
import type { Config } from "../index.types";

export const messageGuard = ({ prefix }: Config) => ({ author, content }: Message): boolean =>
  !author.bot && content.startsWith(prefix);
