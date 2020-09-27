import { InvalidCommand, MatchedCommand } from "../matcher";

export const handleCommand = async (
  commandEvent: MatchedCommand | InvalidCommand
): Promise<void> => {
  try {
    if (commandEvent.matched) {
      await commandEvent.command.execute(commandEvent.message, commandEvent.args);
    } else if (commandEvent.details) {
      await commandEvent.message.reply(commandEvent.details);
    }
  } catch (error) {
    console.error(error);
    void commandEvent.message.reply("there was an error executing that command");
  }
};
