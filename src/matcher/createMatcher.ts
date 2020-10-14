import type { Command } from "../commands/type";
import type { ArgumentExtractor, ArgumentDefinition } from "./types";
import type { Config, Services } from "../index.types";
import { createArgumentDefinition } from "./createDefinitions";

const extractMatchedArguments = (matches: RegExpExecArray, args: string[]) =>
  args.reduce<Record<string, string>>((matched, arg, index) => {
    matched[arg] = matches[index + 1];
    return matched;
  }, {});

/**
 * Creates a function to match incoming messages to commands.
 * @param prefix Prefix for commands
 * @param commands A record of all available commands
 */
export const createArgumentMatcher = (
  config: Config,
  commands: Command[],
  services: Services
): ArgumentExtractor => {
  const indexedCommands = commands.reduce<Record<string, ArgumentDefinition>>(
    (definitions, command) => {
      definitions[command.name] = createArgumentDefinition(config, command);
      return definitions;
    },
    {}
  );
  return ({ command, message }) => {
    const { match, args } = indexedCommands[command.name];
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
    return {
      matched: false,
      message,
      services,
      details: `Invalid ${config.prefix}${command.name} command. Please try again.`,
    };
  };
};
