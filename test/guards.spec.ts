import { expect } from "chai";
import type { Message } from "discord.js";
import { PermissionLevels, PermissionType } from "../src/constants";
import { guildGuard, messageGuard, permissionGuard, routeGuard } from "../src/guards";
import type { Config, GuildMessage, Services } from "../src/index.types";
import type { RoutedCommand } from "../src/router";
import { Permissions } from "../src/services";

describe("guards", () => {
  describe("messageGuard", () => {
    const messageGuardTests: [string, unknown, boolean][] = [
      [
        "should filter out messages by bots",
        { author: { bot: true }, content: "a message" },
        false,
      ],
      [
        "should filter out messages that don't start with a prefix",
        { author: { bot: false }, content: "a message" },
        false,
      ],
      [
        "should not filter out messages that start with a prefix",
        { author: { bot: false }, content: "!message" },
        true,
      ],
    ];
    const guard = messageGuard({ prefix: "!" } as Config);
    for (const [description, payload, result] of messageGuardTests) {
      it(description, () => {
        expect(guard(payload as GuildMessage)).to.equal(result);
      });
    }
  });

  describe("routeGuard", () => {
    it("should filter out undefined emits", () => {
      expect(routeGuard(undefined)).to.be.false;
    });
    it("should allow routed command emits", () => {
      expect(routeGuard({} as RoutedCommand)).to.be.true;
    });
  });

  describe("permissionGuard", () => {
    const permissions = new Permissions();
    permissions.assignPermission("guild::id1", PermissionLevels.OFFICER, PermissionType.ROLE);
    permissions.assignPermission("guild::id2", PermissionLevels.OFFICER, PermissionType.USER);
    permissions.assignPermission("guild::id3", PermissionLevels.BANNED, PermissionType.ROLE);
    permissions.assignPermission("guild::id4", PermissionLevels.BANNED, PermissionType.USER);
    const guard = permissionGuard({ permissions } as Services);

    const permissionGuardTests: [string, unknown, boolean][] = [
      [
        "should filter messages from a user without granted permissions",
        {
          message: {
            author: {
              id: "id0",
            },
            guild: {
              id: "guild",
            },
            member: {
              roles: {
                highest: {
                  id: "id9",
                },
              },
            },
          },
          command: {
            permission: PermissionLevels.OFFICER,
          },
        },
        false,
      ],
      [
        "should allow messages from a user with a role containing the right permission",
        {
          message: {
            author: {
              id: "id0",
            },
            guild: {
              id: "guild",
            },
            member: {
              roles: {
                highest: {
                  id: "id1",
                },
              },
            },
          },
          command: {
            permission: PermissionLevels.OFFICER,
          },
        },
        true,
      ],
      [
        "should allow messages from a user with explicit permissions",
        {
          message: {
            author: {
              id: "id2",
            },
            guild: {
              id: "guild",
            },
            member: {
              roles: {
                highest: {
                  id: "id0",
                },
              },
            },
          },
          command: {
            permission: PermissionLevels.OFFICER,
          },
        },
        true,
      ],
      [
        "should filter messages from a banned user",
        {
          message: {
            author: {
              id: "id4",
            },
            guild: {
              id: "guild",
            },
            member: {
              roles: {
                highest: {
                  id: "id0",
                },
              },
            },
          },
          command: {},
        },
        false,
      ],
      [
        "should filter messages from a banned role",
        {
          message: {
            author: {
              id: "id0",
            },
            guild: {
              id: "guild",
            },
            member: {
              roles: {
                highest: {
                  id: "id3",
                },
              },
            },
          },
          command: {},
        },
        false,
      ],
    ];

    for (const [description, payload, result] of permissionGuardTests) {
      it(description, () => {
        expect(guard(payload as RoutedCommand)).to.equal(result);
      });
    }
  });
  describe("guildGuard", () => {
    const guildTests: [string, unknown, boolean][] = [
      ["should reject messages without a guild", { guild: null, member: null }, false],
      ["should reject messages without a member", { guild: {}, member: null }, false],
      ["should allow messages with a guild and a member", { guild: {}, member: {} }, true],
    ];

    for (const [description, message, result] of guildTests) {
      it(description, () => {
        expect(guildGuard(message as Message)).to.equal(result);
      });
    }
  });
});
