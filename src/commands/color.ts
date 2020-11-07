import type { Command } from "./type";
import { GuildMember } from "discord.js";

const hexRegex = /^#[0-9a-f]{6}$/;

export const color: Command = {
  name: "color",
  description: "Sets color of member in the guild",
  definition: "color :colorHex",
  help:
    "use !color <hex>\n<hex> #ffffff hexadecimal format. Google color picker and most will give you this value",
  async execute({ message, args }): Promise<void> {
    const { colorHex: hexArg } = args;
    const hex = hexArg.toLowerCase();
    if (!isValidHex(hex)) {
      await message.reply("Invalid hex value");
      return;
    }

    const roles = await message.guild.roles.fetch();

    if (!roles) {
      throw new Error("Role fetch failed");
    }
    //check if role with color already exists
    const role = roles.cache.find((role) => role.name === hex);

    const { author, guild } = message;
    const guildMember = guild.members.cache.find((member) => {
      return member.user.id === author.id;
    });

    if (!guildMember) {
      throw new Error("GuildMember find failed");
    }

    await removePreviousColor(guildMember, hexRegex);

    if (role) {
      await guildMember.roles.add(role);
    } else {
      const newRole = await guild.roles.create({
        data: {
          name: hex,
          color: hex,
        },
      });
      await guildMember.roles.add(newRole);
    }
    await message.reply("New color set");
  },
};

export const isValidHex = (hex: string): boolean => {
  if (hexRegex.exec(hex)) {
    return true;
  } else {
    return false;
  }
};

export const removePreviousColor = async (
  user: GuildMember,
  nameRegex: RegExp
): Promise<boolean> => {
  const role = user.roles.cache.find((role) => nameRegex.exec(role.name) !== null);
  if (role) {
    await user.roles.remove(role);
    if (role.members.size === 0) {
      await role.delete();
    }
    return true;
  } else {
    return false;
  }
};
