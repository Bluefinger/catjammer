import { Message } from "discord.js";
import { HandlerEvent } from "./types";
import { argParser, Parentheses } from "../utils/argParser";

export const processMessageAsCommand = (prefix: string) => (message: Message): HandlerEvent => {
  const parentheses: Parentheses = {
    opening: '"',
    closing: '"',
  };
  const [command, ...args] = argParser(prefix, parentheses, message.content);
  return { command, message, args };
};
