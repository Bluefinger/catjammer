import type { Command } from "../commands/type";
import type { CommandDefinition } from "./types";

/**
 * Matches all invalid characters that are needed to be escaped.
 */
const TO_ESCAPE = /[-{}[\]+?.,\\^$|#]/g;
/**
 * Matches single whitespaces in definitions. Definitions should not
 * have extra whitespaces.
 */
const WHITESPACE = /\s/g;
/**
 * Matches a `:argument` component in a definition. Argument names assume
 * alphanumeric and underscore characters, no whitespaces.
 */
const ARGUMENT = /:\w+/g;
/**
 * Matches a `@name` component in a definition. Name arguments assume the
 * same restrictions as normal arguments, alphanumeric characters and
 * underscores, no whitespaces.
 */
const NAME = /@\w+/g;
/**
 * Matches a `*` component in a definition. Must be used at
 * the end of a definition.
 */
const ALL = /\*/g;

/**
 * Fixes invalid characters by escaping them.
 */
const ESCAPED_CHARS = "\\$&";
/**
 * Allows for extra whitespaces and linebreaks in commands.
 */
const FILLER = "\\s+";
/**
 * Matches a defined argument in a command. Arguments accept any
 * characters except whitespaces or linebreaks.
 */
const ARGUMENT_MATCH = "(\\S+)";
/**
 * Matches a defined name in a command. Names are put inside
 * `""` to allow for whitespaces, but not linebreaks.
 */
const NAME_MATCH = '"(.+)"';
/**
 * Matches everything on a catch-all point. Includes linebreaks.
 */
const CATCH_ALL_MATCH = "([\\s\\S]*)";

export const createErrorDefinition = (prefix: string): RegExp =>
  new RegExp(`(${prefix.replace(TO_ESCAPE, ESCAPED_CHARS)}\\w+)`);

/**
 * Takes a prefix and a command and generates a `CommandDefinition` for
 * matching and extracting arguments relevant for a given command.
 * @param prefix A prefix for recognising commands
 * @param command A command for the bot to execute
 */
export const createCommandDefinition = (prefix: string, command: Command): CommandDefinition => {
  const args: string[] = [];
  const matchPattern = command.definition
    .replace(ARGUMENT, (match) => {
      args.push(match.slice(1));
      return ARGUMENT_MATCH;
    })
    .replace(NAME, (match) => {
      args.push(match.slice(1));
      return NAME_MATCH;
    })
    .replace(ALL, () => {
      args.push("message");
      return CATCH_ALL_MATCH;
    })
    .replace(WHITESPACE, FILLER);
  return {
    command,
    match: new RegExp(`^${prefix.replace(TO_ESCAPE, ESCAPED_CHARS)}${matchPattern}\\s*$`),
    args,
  };
};
