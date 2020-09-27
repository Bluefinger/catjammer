import type { Command } from "./type";
import { GuildChannel, Message, TextChannel } from "discord.js";
import { scheduleJob } from "node-schedule";
import { validate, days } from "./helpers/scheduleValidators";

const isTextChannel = (channel: GuildChannel): channel is TextChannel => channel.type === "text";

export const schedule: Command = {
  name: "schedule",
  description: "Schedule reoccuring messages",
  definition: "schedule :day :time :channelStr *",
  async execute(
    { channel, reply }: Message,
    { day, time, channelStr, message }: Record<string, string>
  ): Promise<void> {
    if (!validate.day(day)) {
      await reply("Invalid day argument. Day must be spelt in full");
      return;
    }

    if (!validate.time(time)) {
      await reply("Invalid time argument. Must use 24 hour time seperated by :");
      return;
    }

    if (!validate.channel(channel, "text")) {
      await reply("Can only be used in a guild channel");
      return;
    }

    const { guild } = channel as TextChannel;
    const targetChannel = guild.channels.cache.find((channel) => channel.name === channelStr);

    if (!targetChannel) {
      await reply(`${channelStr} channel does not exist`);
      return;
    }

    if (!isTextChannel(targetChannel)) {
      await reply(`${channelStr} is not a text channel`);
      return;
    }

    const [hour, minute] = time.split(":");

    scheduleJob({ minute, hour, dayOfWeek: days[day] }, () => {
      void targetChannel.send(message);
    });

    await reply("Schedule successful");
  },
};
