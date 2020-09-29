import type { Message } from "discord.js";
import type { Command } from "../commands/type";

/**
 * Command Matcher. Takes a message input and yields either
 * `MatchedCommand` or `InvalidCommand` results
 */
export type CommandMatcher = (message: Message) => MatchedCommand | InvalidCommand;

interface BaseCommand {
  message: Message;
}

export interface MatchedCommand extends BaseCommand {
  matched: true;
  commands: Command[];
  command: Command;
  args: Record<string, string>;
}
export interface InvalidCommand extends BaseCommand {
  matched: false;
  details: string | null;
}

export interface CommandDefinition {
  command: Command;
  match: RegExp;
  args: string[];
}
