import type { Message } from "discord.js";
import type { GuildMessage } from "../index.types";

export const guildGuard = (message: Message): message is GuildMessage =>
  !(message.guild == null || message.member == null);
