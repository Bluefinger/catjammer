import type { Command } from "./type";

export const cancel: Command = {
  name: "cancel",
  description: "Cancels a scheduled message",
  definition: "cancel :name",
  help: "use !cancel <name>\n <name> name of the scheduled message you want to cancel",
  async execute({ message, args, services }): Promise<void> {
    const { name } = args;

    if (!message.guild) {
      await message.reply("Must be used in a guild channel");
      return;
    }

    if (!services.scheduler.has(name, message.guild.name)) {
      await message.reply("Job does not exist");
      return;
    }

    services.scheduler.cancel(name, message.guild.name);
    //remove persistance once implemented
    await message.reply("Job removed");
  },
};
