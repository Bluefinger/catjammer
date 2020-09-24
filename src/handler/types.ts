import { Message } from "discord.js";

export interface Config {
  token: string;
  prefix: string;
}

export interface HandlerEvent {
  command: string;
  args: string[];
  message: Message;
}
