import type { GuildMember, MessageReaction } from "discord.js";
import type { GuildMessage } from "../index.types";

export interface ReactorRole {
  emoji: string;
  data: {
    name: string;
    color?: string;
  };
}

export class RoleReactor {
  private roleList: ReactorRole[];
  private cachedReactors = new Set<string>();

  constructor(roles: ReactorRole[]) {
    this.roleList = roles;
  }

  extractRoleFromEmoji(reaction: MessageReaction): ReactorRole | undefined {
    const emoji = reaction.emoji.toString();
    return this.roleList.find((role) => role.emoji === emoji);
  }

  list(msg: string): string {
    return this.roleList.reduce(
      (acc, { emoji, data }) => `${acc}${emoji} - ${data.name}\n`,
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
    for (const { emoji } of this.roleList) {
      await message.react(emoji);
    }
  }
  async applyRole(reaction: MessageReaction, member: GuildMember): Promise<void> {
    const role = this.extractRoleFromEmoji(reaction);
    if (role) {
      const gRole = member.guild.roles.cache.find(({ name }) => name === role.data.name);
      if (gRole) {
        if (!member.roles.cache.has(gRole.id)) await member.roles.add(gRole);
      } else {
        await member.roles.add(await member.guild.roles.create({ data: role.data }));
      }
    }
  }
  async removeRole(reaction: MessageReaction, member: GuildMember): Promise<void> {
    const role = this.extractRoleFromEmoji(reaction);
    if (role) {
      const gRole = member.guild.roles.cache.find(({ name }) => name === role.data.name);
      if (gRole) {
        await member.roles.remove(gRole);
      }
    }
  }
}
