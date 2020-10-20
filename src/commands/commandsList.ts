import { getCommandsByPermission } from "./helpers/permissions";
import type { Command } from "./type";

const formatCommandList = (msg: string, { name, description }: Command) =>
  `${msg}\`${name}\` - ${description}\n`;

export const commandsList: Command = {
  name: "commands",
  description: "Lists the available commands to the user",
  definition: "commands",
  help: "has no arguments, just use !commands",
  async execute(payload): Promise<void> {
    const { message } = payload;
    const list = getCommandsByPermission(payload).reduce(
      formatCommandList,
      "Commands that are available to you are as follows:\n\n"
    );
    await message.reply(list);
  },
};
