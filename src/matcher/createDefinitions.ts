import type { Command } from "../commands/type";
import { Config } from "../handler";
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
 * Matches a `@name` component in a definition. Names are for capturing user/role
 * mentions, targetting the snowflake format to ensure correct usage.
 */
const NAME = /@\w+/g;
/**
 * Matches a `"text` component. This is to capture a block of text within a
 * parenthesis section. Text blocks don't capture new lines.
 */
const PAREN = /"\w+/;
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
 * Matches a defined username/role in a command. Usernames/role provided by mentions
 * come in a specific format
 */
const NAME_MATCH = "(<@(?:!|&)\\d+>)";
/**
 * Matches everything on a catch-all point. Includes linebreaks.
 */
const CATCH_ALL_MATCH = "([\\s\\S]*)";

const addToArguments = (args: string[], match: string) => args.push(match.slice(1));
const escapeCharacters = (text: string) => text.replace(TO_ESCAPE, ESCAPED_CHARS);
const applyParenthesis = ([left, right]: [string, string]) =>
  `${escapeCharacters(left)}([^${left}${right}\\n]+)${escapeCharacters(right)}`;

export const createCommandNameDefinition = (prefix: string): RegExp =>
  new RegExp(`${escapeCharacters(prefix)}(\\w+)`);

/**
 * Takes a prefix and a command and generates a `CommandDefinition` for
 * matching and extracting arguments relevant for a given command.
 * @param prefix A prefix for recognising commands
 * @param command A command for the bot to execute
 */
export const createCommandDefinition = (
  { prefix, parenthesis }: Config,
  { definition }: Command
): CommandDefinition => {
  const args: string[] = [];
  const matchPattern = definition
    .replace(ARGUMENT, (match) => {
      addToArguments(args, match);
      return ARGUMENT_MATCH;
    })
    .replace(NAME, (match) => {
      addToArguments(args, match);
      return NAME_MATCH;
    })
    .replace(PAREN, (match) => {
      addToArguments(args, match);
      return applyParenthesis(parenthesis);
    })
    .replace(ALL, () => {
      args.push("message");
      return CATCH_ALL_MATCH;
    })
    .replace(WHITESPACE, FILLER);
  return {
    match: new RegExp(`^${escapeCharacters(prefix)}${matchPattern}\\s*$`),
    args,
  };
};
