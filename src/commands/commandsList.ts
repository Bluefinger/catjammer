import { PermissionType } from "../constants";
import type { Command } from "./type";

const formatCommandList = (msg: string, { name, description }: Command) =>
  `${msg}\`${name}\` - ${description}\n`;

export const commandsList: Command = {
  name: "commands",
  description: "Lists the available commands to the user",
  definition: "commands",
  help: "has no arguments, just use !commands",
  async execute({ message, commands, services }): Promise<void> {
    if (!message.guild || !message.member) {
      await message.reply("Must be used in a guild channel");
      return;
    }
    const setPermission =
      services.permissions.getPermission(
        `${message.guild.id}::${message.author.id}`,
        PermissionType.USER
      ) ||
      services.permissions.getPermission(
        `${message.guild.id}::${message.member.roles.highest.id}`,
        PermissionType.ROLE
      );
    const response = commands
      .filter(({ permission = 0 }) => setPermission >= permission)
      .reduce(formatCommandList, "Commands that are available to you are as follows:\n\n");
    await message.reply(response);
  },
};
