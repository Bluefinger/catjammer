import { InvalidCommand, ExtractedCommand } from "../matcher";

export const handleCommand = async (
  commandEvent: ExtractedCommand | InvalidCommand
): Promise<void> => {
  try {
    if (commandEvent.matched) {
      await commandEvent.command.execute(commandEvent);
    } else {
      await commandEvent.message.reply(commandEvent.details);
    }
  } catch (error) {
    commandEvent.services.log.error(error);
    await commandEvent.message.reply("there was an error executing that command");
  }
};
