import { expect } from "chai";
import { Client } from "discord.js";
import { spy } from "sinon";
import { reactor } from "../../src/commands/reactor";
import { Services } from "../../src/index.types";
import { ExtractedCommand } from "../../src/matcher";

describe("reactor command", () => {
  describe("init", () => {
    const add = spy();
    const client: unknown = {
      guilds: {
        cache: [{ id: "id0" }, { id: "id1" }],
      },
    };
    const services: unknown = {
      store: {
        get: (id: string) => Promise.resolve(id === "reactor::id1" ? ["some", "thing"] : undefined),
      },
      roleReactor: {
        add,
      },
    };
    it("loads saved reactor message ids into the role reactor service", async () => {
      await reactor.init(client as Client, services as Services);
      expect(add.callCount).to.equal(1);
      expect(add.firstCall.firstArg).to.equal("thing");
    });
  });
  describe("execute", () => {
    const reply = spy();
    const send = spy(() => Promise.resolve({ id: "thing" }));
    const spies = {
      reply,
      send,
    };
    const services: unknown = {
      roleReactor: {
        setup: async () => {},
        list: (msg: string) => `${msg}\nA List\n`,
        add: () => {},
        remove: () => {},
      },
      store: {
        delete: async () => {},
        set: async () => {},
        get: (id: string) => {
          let result;
          if (id === "reactor::guild1") {
            result = ["1111", "thing"];
          } else if (id === "reactor::guild2") {
            result = ["1111", "fail"];
          }
          return Promise.resolve(result);
        },
      },
      log: {
        error: () => {},
      },
    };
    const cache = [
      {
        id: "1111",
        type: "text",
        send,
        messages: {
          delete: async () => {},
          fetch: () =>
            Promise.resolve({ get: (id: string) => (id === "thing" ? { edit: send } : undefined) }),
        },
      },
    ];
    beforeEach(() => {
      reply.resetHistory();
      send.resetHistory();
    });
    const testCases: [string, string, unknown, [keyof typeof spies, unknown][]][] = [
      [
        "doesn't try to execute invalid actions",
        "guild1",
        {
          action: "do",
        },
        [["reply", "Invalid action"]],
      ],
      [
        "doesn't try to set over an existing reactor message",
        "guild1",
        {
          action: "set",
          channel: "<#1111>",
          message: " a post",
        },
        [
          ["reply", "A reactor message already exists, try doing an `update` instead."],
          ["send", false],
        ],
      ],
      [
        "sets a new reactor message",
        "guild0",
        {
          action: "set",
          channel: "<#1111>",
          message: " a post",
        },
        [
          ["reply", "Reactor message set"],
          ["send", "a post\nA List\n"],
        ],
      ],
      [
        "catches errors and handles them when trying to set a message",
        "guild0",
        {
          action: "set",
          channel: "<#1112>",
          message: " a post",
        },
        [
          ["reply", "Invalid set"],
          ["send", false],
        ],
      ],
      [
        "can't edit a non-existant reactor message",
        "guild0",
        {
          action: "update",
          channel: "<#1111>",
          message: " an updated post",
        },
        [
          ["reply", "There is no reactor message to edit"],
          ["send", false],
        ],
      ],
      [
        "won't edit a reactor message that exists in store but not in a channel",
        "guild2",
        {
          action: "update",
          channel: "<#1111>",
          message: " an updated post",
        },
        [
          ["reply", "Invalid update"],
          ["send", false],
        ],
      ],
      [
        "can edit an existing reactor message",
        "guild1",
        {
          action: "update",
          channel: "<#1111>",
          message: " an updated post",
        },
        [
          ["reply", "Reactor message updated"],
          ["send", "an updated post\nA List\n"],
        ],
      ],
      [
        "can delete an existing reactor message",
        "guild1",
        {
          action: "clear",
          channel: "<#1111>",
        },
        [["reply", "Reactor message deleted"]],
      ],
      [
        "can't delete a non-existant reactor message",
        "guild0",
        {
          action: "clear",
          channel: "<#1111>",
        },
        [["reply", "There is no reactor message to delete"]],
      ],
      [
        "won't delete a reactor message that exists in store but not in a channel",
        "guild2",
        {
          action: "clear",
          channel: "<#1111>",
        },
        [["reply", "Invalid clear"]],
      ],
    ];

    for (const [description, guildId, args, assertions] of testCases) {
      it(description, async () => {
        const message: unknown = {
          guild: {
            id: guildId,
            channels: {
              cache,
            },
          },
          channel: {
            send: reply,
          },
          reply,
        };
        await reactor.execute({ message, services, args } as ExtractedCommand);
        for (const [spyName, assertion] of assertions) {
          if (assertion) {
            expect(spies[spyName].called).to.be.true;
            expect(spies[spyName].firstCall.firstArg).to.equal(assertion);
          } else {
            expect(spies[spyName].called).to.be.false;
          }
        }
      });
    }
  });
});
