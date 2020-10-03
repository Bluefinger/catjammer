import type { Message } from "discord.js";
import type { Command } from "../commands/type";
import type { Store } from "../services";

/**
 * Command Matcher. Takes a message input and yields either
 * `MatchedCommand` or `InvalidCommand` results
 */
export type CommandMatcher = (message: Message) => MatchedCommand | InvalidCommand;

interface BaseCommand {
  readonly message: Message;
}

type ReadonlyList<T> = Readonly<Readonly<T>[]>;

export interface Services {
  readonly store: Store;
}

export interface MatchedCommand extends BaseCommand {
  readonly matched: true;
  readonly commands: ReadonlyList<Command>;
  readonly command: Command;
  readonly services: Services;
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
