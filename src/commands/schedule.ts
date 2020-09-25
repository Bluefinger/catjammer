import type { Command } from "./type";
import { Message } from "discord.js";
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

export const schedule: Command = {
  name: "schedule",
  description: "Schedule reoccuring messages",
  async execute(message: Message, args: string[]): Promise<void> {
    const [day, time, post] = args;

    if (day in days === false) {
      await message.channel.send("Invalid day argument. Spell full name of day");
      return;
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.exec(time)) {
      void message.channel.send("Invalid time argument (24 hour time eg 13:30)");
      return;
    }

    const [hour, minute] = time.split(":");

    scheduleJob({ minute, hour, dayOfWeek: days[day] }, () => {
      void message.channel.send(post);
    });

    await message.channel.send("Message scheduled");
  },
};
