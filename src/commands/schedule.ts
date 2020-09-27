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
  definition: "schedule :day :time *",
  async execute(
    { channel, reply }: Message,
    { day, time, message }: Record<string, string>
  ): Promise<void> {
    if (day in days === false) {
      await reply("Invalid day argument. Spell full name of day");
      return;
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.exec(time)) {
      await reply("Invalid time argument (24 hour time eg 13:30)");
      return;
    }

    const [hour, minute] = time.split(":");

    scheduleJob({ minute, hour, dayOfWeek: days[day] }, () => {
      void channel.send(message);
    });

    await channel.send("Message scheduled");
  },
};
