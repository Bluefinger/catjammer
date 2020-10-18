import { GuildMember } from "discord.js";
import { Services } from "../index.types";

export const handleGreeting = ({ log, store }: Services) => async (
  member: GuildMember
): Promise<void> => {
  try {
    const greeting = await store.get<string>(`greeting::${member.guild.id}`);
    if (greeting) {
      await member.send(greeting);
    }
  } catch (error) {
    log.error(error);
  }
};
