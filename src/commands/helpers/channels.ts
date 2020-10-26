import type { TextChannel, GuildChannel, DMChannel, NewsChannel } from "discord.js";
import type { GuildMessage } from "../../index.types";

export const isTextChannel = (
  channel: GuildChannel | TextChannel | DMChannel | NewsChannel
): channel is TextChannel => channel.type === "text";

export const getTextChannel = (message: GuildMessage, channelId: string): TextChannel => {
  const channel = message.guild.channels.cache.find(({ id }) => id === channelId);
  if (channel && isTextChannel(channel)) {
    return channel;
  } else {
    throw new Error("Not a text channel");
  }
};
