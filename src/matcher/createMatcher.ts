import { Command } from "../commands/type";
import { CommandMatcher } from "./types";
import { createCommandDefinition, createErrorDefinition } from "./createDefinitions";

const extractMatchedArguments = (matches: RegExpExecArray, args: string[]) =>
  args.reduce<Record<string, string>>((matched, arg, index) => {
    const value = matches[index + 1];
    if (value) {
      matched[arg] = value;
    }
    return matched;
  }, {});

const extractError = (content: RegExpExecArray | null) => {
  if (content) {
    return `Invalid ${content[1]} command. Please try again.`;
  }
  return content;
};

/**
 * Creates a function to match incoming messages to commands.
 * @param prefix Prefix for commands
 * @param commands A record of all available commands
 */
export const createCommandMatcher = (
  prefix: string,
  commands: Record<string, Command>
): CommandMatcher => {
  const indexedCommands = Object.values(commands).map((command) =>
    createCommandDefinition(prefix, command)
  );
  const errorCheck = createErrorDefinition(prefix);
  return (message) => {
    for (const { command, match, args } of indexedCommands) {
      const matchedCommand = match.exec(message.content);
      if (matchedCommand) {
        return {
          matched: true,
          command,
          message,
          args: extractMatchedArguments(matchedCommand, args),
        };
      }
    }
    return {
      matched: false,
      message,
      details: extractError(errorCheck.exec(message.content)),
    };
  };
};
