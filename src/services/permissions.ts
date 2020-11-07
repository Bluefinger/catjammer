import { GuildMember, Permissions as DiscordPermissions } from "discord.js";
import { PermissionLevels, SetPermission, PermissionType } from "../constants";

const OFFICER_LEVEL = new DiscordPermissions([
  "KICK_MEMBERS",
  "BAN_MEMBERS",
  "MANAGE_CHANNELS",
  "MANAGE_GUILD",
  "MANAGE_MESSAGES",
  "MANAGE_ROLES",
]).bitfield;

export class Permissions {
  private readonly users = new Map<string, SetPermission>();
  private readonly roles = new Map<string, SetPermission>();
  assignPermission(key: string, level: SetPermission, type: PermissionType): void {
    this[type].set(key, level);
  }
  removePermission(key: string, type: PermissionType): boolean {
    return this[type].delete(key);
  }
  getPermission(key: string, type: PermissionType): PermissionLevels {
    return this[type].get(key) ?? PermissionLevels.NORMAL;
  }
  resolvePermissionLevel(member: GuildMember): PermissionLevels {
    if (member.hasPermission(OFFICER_LEVEL)) {
      return PermissionLevels.OFFICER;
    }
    const botPerm =
      this.getPermission(`${member.guild.id}::${member.id}`, PermissionType.USER) ||
      this.getPermission(`${member.guild.id}::${member.roles.highest.id}`, PermissionType.ROLE);
    return botPerm;
  }
}
