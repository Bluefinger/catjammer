import type { MatchedCommand } from "../matcher";

export interface Command {
  readonly name: string;
  readonly description: string;
  readonly definition: string;
  execute(command: MatchedCommand): Promise<void>;
}
