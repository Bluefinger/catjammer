import type { Command } from "../../src/commands/type";
import type { ExtractedCommand } from "../../src/matcher";
import { expect } from "chai";
import { spy } from "sinon";
import { commandsList } from "../../src/commands/commandsList";
import { PermissionLevels } from "../../src/constants";

const reply = spy();

const commands = [
  { name: "ping", description: "Ping!" } as Command,
  { name: "commands", description: "Lists the available commands to the user" } as Command,
  { name: "privileged", description: "A privileged command", permission: 1 } as Command,
];

const testCases: [
  string,
  { getPermission: (key: string) => PermissionLevels },
  unknown,
  string
][] = [
  [
    "will error if used in a non-guild channel",
    {
      getPermission: () => PermissionLevels.NORMAL,
    },
    {
      guild: null,
      member: null,
      reply,
    },
    "Must be used in a guild channel",
  ],
  [
    "will error if used with a non-guild member",
    {
      getPermission: () => PermissionLevels.NORMAL,
    },
    {
      guild: { id: "1111" },
      member: null,
      reply,
    },
    "Must be used in a guild channel",
  ],
  [
    "will return a list of all commands for a privileged user",
    {
      getPermission: () => PermissionLevels.OFFICER,
    },
    {
      author: { id: "1234" },
      guild: { id: "1111" },
      member: {
        roles: {
          highest: {
            id: "4321",
          },
        },
      },
      reply,
    },
    "Commands that are available to you are as follows:\n\n`ping` - Ping!\n`commands` - Lists the available commands to the user\n`privileged` - A privileged command\n",
  ],
  [
    "will return a list of all commands for a privileged role",
    {
      getPermission: (key: string) =>
        key === "1111::4321" ? PermissionLevels.OFFICER : PermissionLevels.NORMAL,
    },
    {
      author: { id: "1234" },
      guild: { id: "1111" },
      member: {
        roles: {
          highest: {
            id: "4321",
          },
        },
      },
      reply,
    },
    "Commands that are available to you are as follows:\n\n`ping` - Ping!\n`commands` - Lists the available commands to the user\n`privileged` - A privileged command\n",
  ],
  [
    "will return a reduced list of commands for a non-privileged user/role",
    {
      getPermission: () => PermissionLevels.NORMAL,
    },
    {
      author: { id: "1234" },
      guild: { id: "1111" },
      member: {
        roles: {
          highest: {
            id: "4321",
          },
        },
      },
      reply,
    },
    "Commands that are available to you are as follows:\n\n`ping` - Ping!\n`commands` - Lists the available commands to the user\n",
  ],
];

describe("Commands list command", () => {
  describe("execute", () => {
    beforeEach(() => reply.resetHistory());

    for (const [description, permissions, message, result] of testCases) {
      const services: unknown = {
        permissions,
      };
      const payload: unknown = { message, commands, services };

      it(description, async () => {
        await commandsList.execute(payload as ExtractedCommand);
        expect(reply.firstCall.args[0]).to.equal(result);
      });
    }
  });
});
