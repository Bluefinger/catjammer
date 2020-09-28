import { TextChannel,  GuildChannel, DMChannel, NewsChannel } from "discord.js";

export const days: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export const validateTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.exec(time) !== null;
}

export const validateDay = (day: string): boolean => {
  return day in days;
}

export const isTextChannel = (channel: GuildChannel | TextChannel | DMChannel | NewsChannel): channel is TextChannel => channel.type === "text";
