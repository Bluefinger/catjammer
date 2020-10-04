import { Command } from "../commands/type";
import { CommandMatcher, Services } from "./types";
import { createCommandDefinition, createErrorDefinition } from "./createDefinitions";
import { Config } from "../handler";

const extractMatchedArguments = (matches: RegExpExecArray, args: string[]) =>
  args.reduce<Record<string, string>>((matched, arg, index) => {
    matched[arg] = matches[index + 1];
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
  config: Config,
  commands: Command[],
  services: Services
): CommandMatcher => {
  const indexedCommands = commands.map((command) => createCommandDefinition(config, command));
  const errorCheck = createErrorDefinition(config.prefix);
  return (message) => {
    for (const { command, match, args } of indexedCommands) {
      const matchedCommand = match.exec(message.content);
      if (matchedCommand) {
        return {
          matched: true,
          commands,
          command,
          message,
          services,
          args: extractMatchedArguments(matchedCommand, args),
        };
      }
    }
    return {
      matched: false,
      message,
      services,
      details: extractError(errorCheck.exec(message.content)),
    };
  };
};
