import { InvalidCommand, MatchedCommand } from "../matcher";

export const handleCommand = async (
  commandEvent: MatchedCommand | InvalidCommand
): Promise<void> => {
  try {
    if (commandEvent.matched) {
      await commandEvent.command.execute(commandEvent);
    } else if (commandEvent.details) {
      await commandEvent.message.reply(commandEvent.details);
    }
  } catch (error) {
    commandEvent.services.log.error(error);
    await commandEvent.message.reply("there was an error executing that command");
  }
};
