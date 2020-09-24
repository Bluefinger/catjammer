import { Message } from "discord.js";
import { HandlerEvent } from "./types";

export const processMessageAsCommand = (prefix: string) => (message: Message): HandlerEvent => {
  const [command, ...args] = message.content.slice(prefix.length).trim().split(/ +/);
  return { command, message, args };
};
