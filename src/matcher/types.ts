import type { Command } from "../commands/type";
import type { RoutedCommand } from "../router";
import type { GuildMessage, Services } from "../index.types";

/**
 * Argument Matcher. Takes a message input and yields either
 * `ExtractedCommand` or `InvalidCommand` results
 */
export type ArgumentExtractor = (command: RoutedCommand) => ExtractedCommand | InvalidCommand;

interface BaseCommand {
  readonly message: GuildMessage;
  readonly services: Services;
}

type ReadonlyList<T> = Readonly<Readonly<T>[]>;

export interface ExtractedCommand extends BaseCommand {
  readonly matched: true;
  readonly commands: ReadonlyList<Command>;
  readonly command: Command;
  readonly args: Record<string, string>;
}
export interface InvalidCommand extends BaseCommand {
  readonly matched: false;
  readonly details: string;
}

export interface ArgumentDefinition {
  readonly match: RegExp;
  readonly args: string[];
}
