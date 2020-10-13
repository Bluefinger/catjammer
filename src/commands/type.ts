import { Client } from "discord.js";
import { AllowablePermission } from "../constants";
import type { ExtractedCommand, Services } from "../matcher";

export interface Command {
  readonly name: string;
  readonly description: string;
  readonly definition: string;
  readonly help: string;
  readonly permission?: AllowablePermission;
  execute(command: ExtractedCommand): Promise<void>;
}

export interface CommandWithInit extends Command {
  init(client: Client, services: Services): Promise<void>;
}
