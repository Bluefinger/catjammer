import type { Command } from "../commands/type";
import type { Config } from "../handler";
import { createCommandNameDefinition } from "./createDefinitions";
import type { CommandRouter } from "./types";

export const createCommandRouter = ({ prefix }: Config, commands: Command[]): CommandRouter => {
  const commandCheck = createCommandNameDefinition(prefix);
  return (message) => {
    const matchedCommand = commandCheck.exec(message.content);
    if (matchedCommand) {
      const command = commands.find(({ name }) => name === matchedCommand[1]);
      if (command) {
        return {
          message,
          command,
        };
      }
    }
  };
};
