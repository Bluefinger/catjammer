import type { Command } from "./type";

export const color: Command = {
  name: "color",
  description: "Sets color of member in the guild",
  definition: "color :colorHex",
  async execute({ message, args }): Promise<void> {
    const hex = args["colorHex"];
    if (!isValidHex(hex)) {
      await message.reply("Invalid hex value");
      return;
    }

    if (!message.guild) {
      await message.reply("Must be used in a guild channel");
      return;
    }
  },
};

export const isValidHex = (hex: string): boolean => {
  const hexRegex = /^#[0-9a-f]{6}$/;
  if (hexRegex.exec(hex)) {
    return true;
  } else {
    return false;
  }
};
