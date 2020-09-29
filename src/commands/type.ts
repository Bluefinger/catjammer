import type { Message } from "discord.js";
import type { MatchedCommand } from "../matcher";

export interface Command {
  name: string;
  description: string;
  definition: string;
  execute(command: MatchedCommand): Promise<void>;
}
