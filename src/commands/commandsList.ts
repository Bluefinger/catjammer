import type { Command } from "./type";

export const commandsList: Command = {
  name: "commands",
  description: "Lists the available commands to the user",
  definition: "commands",
  async execute({ message, commands }): Promise<void> {
    let response = "available commands are:\n";
    commands.forEach((command) => {
      response += `${command.name} - ${command.description}\n`;
    });
    await message.reply(response);
  },
};
