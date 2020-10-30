import type { GuildMember, MessageReaction } from "discord.js";
import type { GuildMessage } from "../index.types";

const enum ReactorRoles {
  MPLUSDPS = "⚔",
  MPLUSTANK = "🛡",
  MPLUSHEALS = "🚑",
  BGDPS = "🔥",
  BGHEALS = "❤",
  ARENADPS = "🥇",
  ARENAHEALS = "🥈",
}

const roleList: readonly [ReactorRoles, string][] = [
  [ReactorRoles.MPLUSDPS, "M+ DPS"],
  [ReactorRoles.MPLUSTANK, "M+ Tank"],
  [ReactorRoles.MPLUSHEALS, "M+ Healer"],
  [ReactorRoles.BGDPS, "BG DPS"],
  [ReactorRoles.BGHEALS, "BG Healer"],
  [ReactorRoles.ARENADPS, "Arena DPS"],
  [ReactorRoles.ARENAHEALS, "Arena Healer"],
];

const extractRoleFromEmoji = (reaction: MessageReaction): string | undefined => {
  const emoji = reaction.emoji.toString();
  return roleList.find(([roleEmoji]) => roleEmoji === emoji)?.[1];
};

export class RoleReactor {
  private cachedReactors = new Set<string>();
  list(msg: string): string {
    return roleList.reduce(
      (acc, [role, label]) => `${acc}${role} - ${label}\n`,
      `${msg}\n\nList of roles available:\n`
    );
  }
  add(id: string): void {
    this.cachedReactors.add(id);
  }
  has(id: string): boolean {
    return this.cachedReactors.has(id);
  }
  remove(id: string): boolean {
    return this.cachedReactors.delete(id);
  }
  async setup(message: GuildMessage): Promise<void> {
    for (const [emoji] of roleList) {
      await message.react(emoji);
    }
  }
  async applyRole(reaction: MessageReaction, member: GuildMember): Promise<void> {
    const role = extractRoleFromEmoji(reaction);
    if (role) {
      const gRole = member.guild.roles.cache.find(({ name }) => name === role);
      if (gRole) {
        if (!member.roles.cache.has(gRole.id)) await member.roles.add(gRole);
      } else {
        await member.roles.add(await member.guild.roles.create({ data: { name: role } }));
      }
    }
  }
  async removeRole(reaction: MessageReaction, member: GuildMember): Promise<void> {
    const role = extractRoleFromEmoji(reaction);
    if (role) {
      const gRole = member.guild.roles.cache.find(({ name }) => name === role);
      if (gRole) {
        await member.roles.remove(gRole);
      }
    }
  }
}
