import type { Command } from "./type";
import { Message } from "discord.js";
import { scheduleJob, RecurrenceRule } from "node-schedule";

export const schedule: Command = {
  name: "schedule",
  description: "Schedule reoccuring messages",
  execute(message: Message, args: string[]): void {
    const [day, time, post] = args;

    const dayRegex = /^[0-6]$/;
    if (dayRegex.exec(day)) {
      void message.channel.send(
        "Invalid day argument (must be number between 0 and 6 with 0 being sunday)"
      );
      return;
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (timeRegex.exec(time)) {
      void message.channel.send("Invalid time argument (24 hour time eg 13:30)");
      return;
    }

    const [hour, minute] = time.split(":");
    const rule = new RecurrenceRule();
    rule.minute = minute;
    rule.hour = hour;
    rule.dayOfWeek = day;

    scheduleJob(rule, () => {
      void message.channel.send(post);
    });
  },
};
