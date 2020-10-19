import { expect } from "chai";
import { spy } from "sinon";
import type { Client } from "discord.js";
import type { Services } from "../../src/index.types";
import { permission } from "../../src/commands/permission";
import { PermissionType } from "../../src/constants";
import { Permissions } from "../../src/services";
import { ExtractedCommand } from "../../src/matcher";

describe("Permission command", () => {
  describe("init", () => {
    const fakeClient = {
      guilds: {
        cache: [
          { id: "guild0", ownerID: "id0" },
          { id: "guild1", ownerID: "id1" },
        ],
      },
    } as unknown;
    const permissions = new Permissions();
    const spiedAssign = spy(permissions, "assignPermission");
    const services = {
      store: {
        get: (key: string) =>
          Promise.resolve(
            key === "permissions::guild1" ? [["guild1::id2", 1, PermissionType.ROLE]] : undefined
          ),
      },
      permissions,
    } as unknown;
    it("creates permissions for guild owners and loads stored permissions on initialisation", async () => {
      await permission.init(fakeClient as Client, services as Services);
      expect(spiedAssign.callCount).to.equal(3);
      expect(spiedAssign.args).to.deep.equal([
        ["guild0::id0", 1, "users"],
        ["guild1::id1", 1, "users"],
        ["guild1::id2", 1, "roles"],
      ]);
    });
  });
  describe("execute", () => {
    const reply = spy();
    const permissions = new Permissions();
    const fakeStore = {
      get: (key: string) =>
        Promise.resolve(key === "permissions::000" ? [["000::114", 1, "roles"]] : undefined),
      set: () => Promise.resolve(),
    };
    const services = { permissions, store: fakeStore };
    const tests: [string, unknown, string][] = [
      [
        "grants permissions to users",
        {
          message: {
            reply,
            channel: {
              send: reply,
            },
            guild: {
              id: "001",
              ownerID: "111",
            },
          },
          services,
          args: {
            modifier: "give",
            role: "<@112>",
          },
        },
        "Permission granted",
      ],
      [
        "grants permissions to roles",
        {
          message: {
            reply,
            channel: {
              send: reply,
            },
            guild: {
              id: "001",
              ownerID: "111",
            },
          },
          services,
          args: {
            modifier: "give",
            role: "<@&113>",
          },
        },
        "Permission granted",
      ],
      [
        "cannot grant permission that are already given",
        {
          message: {
            reply,
            channel: {
              send: reply,
            },
            guild: {
              id: "000",
              ownerID: "111",
            },
          },
          services,
          args: {
            modifier: "give",
            role: "<@&114>",
          },
        },
        "Permission already granted",
      ],
      [
        "disallows permissions of guild owners to be modified",
        {
          message: {
            reply,
            channel: {
              send: reply,
            },
            guild: {
              id: "000",
              ownerID: "111",
            },
          },
          services,
          args: {
            modifier: "remove",
            role: "<@!111>",
          },
        },
        "You cannot change the permissions of a Guild owner",
      ],
      [
        "removes permissions from users/roles",
        {
          message: {
            reply,
            channel: {
              send: reply,
            },
            guild: {
              id: "000",
              ownerID: "111",
            },
          },
          services,
          args: {
            modifier: "remove",
            role: "<@&114>",
          },
        },
        "Permission removed",
      ],
      [
        "cannot remove permissions that don't exist",
        {
          message: {
            reply,
            channel: {
              send: reply,
            },
            guild: {
              id: "001",
              ownerID: "111",
            },
          },
          services,
          args: {
            modifier: "remove",
            role: "<@!112>",
          },
        },
        "No permissions to remove",
      ],
      [
        "cannot remove permissions from users/roles that don't exist",
        {
          message: {
            reply,
            channel: {
              send: reply,
            },
            guild: {
              id: "000",
              ownerID: "111",
            },
          },
          services,
          args: {
            modifier: "remove",
            role: "<@!119>",
          },
        },
        "No permissions to remove",
      ],
      [
        "can ban users/roles",
        {
          message: {
            reply,
            channel: {
              send: reply,
            },
            guild: {
              id: "000",
              ownerID: "111",
            },
          },
          services,
          args: {
            modifier: "ban",
            role: "<@&115>",
          },
        },
        "BANNED from using the bot",
      ],
      [
        "does not recognise invalid modifiers",
        {
          message: {
            reply,
            channel: {
              send: reply,
            },
            guild: {
              id: "000",
              ownerID: "111",
            },
          },
          services,
          args: {
            modifier: "banz0r",
            role: "<@&115>",
          },
        },
        "Invalid permission modifier. You can either `give`, `remove`, or `ban`.",
      ],
    ];

    beforeEach(() => reply.resetHistory());

    for (const [description, payload, result] of tests) {
      it(description, async () => {
        await permission.execute(payload as ExtractedCommand);
        expect(reply.firstCall.args[0]).to.equal(result);
      });
    }
  });
});
