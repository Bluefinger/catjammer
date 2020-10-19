import type { Config, GuildMessage } from "../index.types";

export const messageGuard = ({ prefix }: Config) => ({ author, content }: GuildMessage): boolean =>
  !author.bot && content.startsWith(prefix);
