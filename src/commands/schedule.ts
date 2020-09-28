import type { Command } from "./type";
import { GuildChannel, TextChannel } from "discord.js";
import { scheduleJob } from "node-schedule";
import { validate, days } from "./helpers/scheduleValidators";

const isTextChannel = (channel: GuildChannel): channel is TextChannel => channel.type === "text";

export const schedule: Command = {
  name: "schedule",
  description: "Schedule reoccuring messages",
  definition: "schedule :day :time :channelStr *",
  async execute(command, { day, time, channelStr, message }): Promise<void> {
    if (!validate.day(day)) {
      await command.reply("Invalid day argument. Day must be spelt in full");
      return;
    }

    if (!validate.time(time)) {
      await command.reply("Invalid time argument. Must use 24 hour time seperated by :");
      return;
    }

    if (!validate.channel(command.channel, "text")) {
      await command.reply("Can only be used in a guild channel");
      return;
    }

    const { guild } = command.channel as TextChannel;
    const targetChannel = guild.channels.cache.find((channel) => channel.name === channelStr);

    if (!targetChannel) {
      await command.reply(`Channel does not exist`);
      return;
    }

    const [hour, minute] = time.split(":");

    if (!isTextChannel(targetChannel)) {
      await command.reply(`Not a text channel`);
      return;
    }

    scheduleJob({ minute, hour, dayOfWeek: days[day] }, () => {
      void targetChannel.send(message);
    });

    await command.reply("Schedule successful");
  },
};
