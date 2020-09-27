import { Message } from "discord.js";

export interface Config {
  readonly token: string;
  readonly prefix: string;
  readonly parenthesis: [string, string];
}

export interface HandlerEvent {
  command: string;
  args: string[];
  message: Message;
}
