import { getCommandsByPermission } from "./helpers/permissions";
import type { Command } from "./type";

export const help: Command = {
  name: "help",
  description: "provides instruction on how to call commands",
  definition: "help :command",
  help: "use !help <>, replacing the brackets with the name of the command",
  async execute(payload): Promise<void> {
    const { message, args } = payload;
    const { command } = args;
    const result = getCommandsByPermission(payload).find(({ name }) => name === command);

    if (!result) {
      await message.reply("Command does not exist or you do not have permission to use it");
    } else {
      await message.reply(result.help);
    }
  },
};
