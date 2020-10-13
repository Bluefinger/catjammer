import type { Message } from "discord.js";
import type { Command } from "../commands/type";
import type { Logger, Store, Scheduler, Permissions } from "../services";

/**
 * Command Matcher. Takes a message input and yields either
 * `MatchedCommand` or `InvalidCommand` results
 */
export type ArgumentExtractor = (command: RoutedCommand) => ExtractedCommand | InvalidCommand;

export interface Services {
  readonly store: Store;
  readonly log: Logger;
  readonly scheduler: Scheduler;
  readonly permissions: Permissions;
}

interface BaseCommand {
  readonly message: Message;
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

export interface CommandDefinition {
  readonly match: RegExp;
  readonly args: string[];
}

export interface RoutedCommand {
  message: Message;
  command: Command;
}

export type CommandRouter = (message: Message) => RoutedCommand | undefined;
export type PermissionGuard = (command: RoutedCommand) => boolean;
