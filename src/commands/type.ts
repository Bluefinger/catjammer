import { Client } from "discord.js";
import type { MatchedCommand, Services } from "../matcher";

export interface Command {
  readonly name: string;
  readonly description: string;
  readonly definition: string;
  readonly help: string;
  execute(command: MatchedCommand): Promise<void>;
}

export interface CommandWithInit extends Command {
  init(client: Client, services: Services): Promise<void>;
}
