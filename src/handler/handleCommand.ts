import { Collection } from "discord.js";
import { Command } from "../commands/type";
import { HandlerEvent } from "./types";

export const handleCommand = (commandCollection: Collection<string, Command>) => async ({
  message,
  command,
  args,
}: HandlerEvent): Promise<void> => {
  try {
    await commandCollection.get(command)?.execute(message, args);
  } catch (error) {
    console.error(error);
    void message.reply("there was an error executing that command");
  }
};
