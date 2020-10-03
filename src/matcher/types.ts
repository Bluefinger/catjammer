import type { Message } from "discord.js";
import type { Command } from "../commands/type";
import type { Logger, Store } from "../services";

/**
 * Command Matcher. Takes a message input and yields either
 * `MatchedCommand` or `InvalidCommand` results
 */
export type CommandMatcher = (message: Message) => MatchedCommand | InvalidCommand;

export interface Services {
  readonly store: Store;
  readonly log: Logger;
}

interface BaseCommand {
  readonly message: Message;
  readonly services: Services;
}

type ReadonlyList<T> = Readonly<Readonly<T>[]>;

export interface MatchedCommand extends BaseCommand {
  readonly matched: true;
  readonly commands: ReadonlyList<Command>;
  readonly command: Command;
  readonly args: Record<string, string>;
}
export interface InvalidCommand extends BaseCommand {
  readonly matched: false;
  readonly details: string | null;
}

export interface CommandDefinition {
  readonly command: Command;
  readonly match: RegExp;
  readonly args: string[];
}
