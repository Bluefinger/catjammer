import type { Command } from "./type";
import { scheduleJob } from "node-schedule";
import { validateDay, validateTime, days, isTextChannel } from "./helpers/scheduleValidators";

export const schedule: Command = {
  name: "schedule",
  description: "Schedule reoccuring messages",
  definition: "schedule :day :time :channelStr *",
  help:
    "use !schedule <day> <time> <channel> <message>\n<day> should be spelt with full name and capital first letter\n<time> ##:## 24 hour format\n<channel>name as appears of channel\n<message>rest of command should just be your message",
  async execute({ message: command, args }): Promise<void> {
    const { day, time, channelStr, message } = args;
    if (!validateDay(day)) {
      await command.reply("Invalid day argument. Day must be spelt in full");
      return;
    }

    if (!validateTime(time)) {
      await command.reply("Invalid time argument. Must use 24 hour time seperated by :");
      return;
    }

    if (!isTextChannel(command.channel)) {
      await command.reply("Can only be used in a guild channel");
      return;
    }

    const { guild } = command.channel;
    const targetChannel = guild.channels.cache.find((channel) => channel.name === channelStr);

    if (!targetChannel) {
      await command.reply(`Channel does not exist`);
      return;
    }

    if (!isTextChannel(targetChannel)) {
      await command.reply(`Not a text channel`);
      return;
    }

    const [hour, minute] = time.split(":");

    scheduleJob({ minute, hour, dayOfWeek: days[day] }, () => {
      void targetChannel.send(message);
    });

    await command.reply("Schedule successful");
  },
};
