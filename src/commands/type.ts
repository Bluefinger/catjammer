import type { Message } from "discord.js";

export interface Command {
  name: string;
  description: string;
  definition: string;
  execute(message: Message, args: Record<string, string>): Promise<void>;
}
