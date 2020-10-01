import type { Command } from "./type";

export const help: Command = {
  name: "help",
  description: "provides instruction on how to call commands",
  definition: "help :command",
  help: "use !help <>, replacing the brackets with the name of the command",
  async execute({ message, args, commands }): Promise<void> {
    const commandName = args["command"];
    const result = commands.find((command) => command.name === commandName);

    if (!result) {
      await message.reply("Command does not exist");
      return;
    } else {
      await message.reply(`${result.help}`);
      return;
    }
  },
};
