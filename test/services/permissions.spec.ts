import { expect } from "chai";
import { PermissionType } from "../../src/constants";
import { Permissions } from "../../src/services";
import { GuildMember, PermissionResolvable, Permissions as DiscordPermissions } from "discord.js";

describe("permissions.ts", () => {
  describe("Permissions Service", () => {
    it("can assign and retrieve permissions from users and roles", () => {
      const service = new Permissions();
      service.assignPermission("test", 1, PermissionType.USER);
      service.assignPermission("test", 1, PermissionType.ROLE);
      expect(service.getPermission("test", PermissionType.USER)).to.equal(1);
      expect(service.getPermission("test", PermissionType.ROLE)).to.equal(1);
    });
    it("defaults to NORMAL permissions level for non-assigned users/roles", () => {
      const service = new Permissions();
      expect(service.getPermission("test", PermissionType.USER)).to.equal(0);
      expect(service.getPermission("test", PermissionType.ROLE)).to.equal(0);
    });
    it("can remove assigned permissions from users/roles", () => {
      const service = new Permissions();
      service.assignPermission("test", 1, PermissionType.USER);
      service.assignPermission("test", 1, PermissionType.ROLE);
      expect(service.removePermission("test", PermissionType.USER)).to.be.true;
      expect(service.removePermission("test", PermissionType.ROLE)).to.be.true;
    });
    it("can resolve a permissions level using Discord permissions or manual permissions", () => {
      const service = new Permissions();
      const normalUser: unknown = {
        id: "norm",
        guild: {
          id: "test",
        },
        roles: {
          highest: {
            id: "normal",
          },
        },
        hasPermission: (perm: PermissionResolvable) =>
          new DiscordPermissions([
            "SEND_MESSAGES",
            "ADD_REACTIONS",
            "CHANGE_NICKNAME",
            "ADD_REACTIONS",
          ]).has(perm),
      };
      const elevatedUser: unknown = {
        id: "banned",
        guild: {
          id: "test",
        },
        roles: {
          highest: {
            id: "normal",
          },
        },
        hasPermission: () => (perm: PermissionResolvable) =>
          new DiscordPermissions([
            "SEND_MESSAGES",
            "ADD_REACTIONS",
            "CHANGE_NICKNAME",
            "ADD_REACTIONS",
            "KICK_MEMBERS",
            "BAN_MEMBERS",
            "MANAGE_CHANNELS",
            "MANAGE_GUILD",
            "MANAGE_MESSAGES",
            "MANAGE_ROLES",
          ]).has(perm),
      };
      const bannedUser: unknown = {
        id: "banned",
        guild: {
          id: "test",
        },
        roles: {
          highest: {
            id: "normal",
          },
        },
        hasPermission: () => false,
      };
      const bannedRole: unknown = {
        id: "other",
        guild: {
          id: "test",
        },
        roles: {
          highest: {
            id: "banned",
          },
        },
        hasPermission: () => false,
      };
      service.assignPermission("test::banned", -9, PermissionType.USER);
      service.assignPermission("test::banned", -9, PermissionType.ROLE);
      expect(service.resolvePermissionLevel(normalUser as GuildMember)).to.equal(0);
      expect(service.resolvePermissionLevel(elevatedUser as GuildMember)).to.equal(1);
      expect(service.resolvePermissionLevel(bannedUser as GuildMember)).to.equal(-9);
      expect(service.resolvePermissionLevel(bannedRole as GuildMember)).to.equal(-9);
    });
  });
});
