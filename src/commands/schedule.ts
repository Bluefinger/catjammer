import type { Command } from "./type";
import { GuildChannel, Message, TextChannel } from "discord.js";
import { scheduleJob } from "node-schedule";

const days: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const isTextChannel = (channel: GuildChannel): channel is TextChannel => channel.type === "text";

export const schedule: Command = {
  name: "schedule",
  description: "Schedule reoccuring messages",
  async execute(message: Message, args: string[]): Promise<void> {
    const [day, time, channelStr, post] = args;

    if (day in days === false) {
      void message.channel.send("Invalid day argument. Spell full name of day");
      return;
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.exec(time)) {
      void message.channel.send("Invalid time argument (24 hour time eg 13:30)");
      return;
    }

    if (message.channel.type !== "text") {
      void message.channel.send("This can only be used in a guild channel");
      return;
    }

    const { guild } = message.channel;
    const channel = guild.channels.cache.find((channel) => channel.name === channelStr);

    if (!channel) {
      void message.channel.send(`${channelStr} channel does not exist`);
      return;
    }

    if (!isTextChannel(channel)) {
      void message.channel.send(`${channelStr} is not a text channel`);
      return;
    }

    const [hour, minute] = time.split(":");

    scheduleJob({ minute, hour, dayOfWeek: days[day] }, () => {
      void channel.send(post);
    });

    await message.channel.send("Message scheduled");
  },
};
