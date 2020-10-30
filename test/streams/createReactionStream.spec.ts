import { expect } from "chai";
import { EventEmitter } from "events";
import type { Client } from "discord.js";
import { spy } from "sinon";
import { createReactionStream } from "../../src/streams";
import type { Services } from "../../src/index.types";

describe("createReactionStream", () => {
  const handler = spy();
  const error = spy();

  beforeEach(() => {
    handler.resetHistory();
    error.resetHistory();
  });

  const spies = {
    handler,
    error,
  };

  const services: unknown = {
    log: {
      error,
    },
    roleReactor: {
      has: (id: string) => id === "test",
    },
  };

  const testCases: [string, string, unknown, unknown, [keyof typeof spies, unknown][]][] = [
    [
      "fetches a reaction if it is partial",
      "messageReactionAdd",
      {
        partial: true,
        fetch: () => Promise.resolve(),
        message: {
          id: "fail",
        },
      },
      {},
      [["handler", false]],
    ],
    [
      "handles a failed reaction fetch by logging the error",
      "messageReactionAdd",
      {
        partial: true,
        fetch: () => Promise.reject("fail"),
      },
      {},
      [
        ["handler", false],
        ["error", "fail"],
      ],
    ],
    [
      "filters out reactions from bots",
      "messageReactionRemove",
      {
        partial: false,
      },
      {
        bot: true,
      },
      [["handler", false]],
    ],
    [
      "filters out reactions from not from a guild",
      "messageReactionRemove",
      {
        partial: false,
        message: {
          id: "test",
          guild: null,
        },
      },
      {
        bot: false,
      },
      [["handler", false]],
    ],
    [
      "filters out reactions that are not from a reactor message",
      "messageReactionRemove",
      {
        partial: false,
        message: {
          id: "not-the-reactor",
          guild: {
            members: {
              fetch: () => Promise.resolve({}),
            },
          },
        },
      },
      {
        bot: false,
        id: "user",
      },
      [["handler", false]],
    ],
    [
      "handles errors from a reaction made by a user not from the guild",
      "messageReactionRemove",
      {
        partial: false,
        message: {
          id: "test",
          guild: {
            members: {
              fetch: () => Promise.reject("fail"),
            },
          },
        },
      },
      {
        bot: false,
        id: "user",
      },
      [
        ["handler", false],
        ["error", "fail"],
      ],
    ],
    [
      "allows reactions that are from a reactor message",
      "messageReactionAdd",
      {
        partial: false,
        message: {
          id: "test",
          guild: {
            members: {
              fetch: () => Promise.resolve({}),
            },
          },
        },
      },
      {
        bot: false,
        id: "user",
      },
      [["handler", true]],
    ],
  ];

  for (const [description, event, message, user, assertions] of testCases) {
    it(description, async () => {
      if (!assertions.length) expect.fail("No assertions to test");
      const client = new EventEmitter();
      const stream = createReactionStream(client as Client, services as Services);
      stream.subscribe(handler);
      client.emit(event, message, user);
      await Promise.resolve();
      for (const [spyName, result] of assertions) {
        if (typeof result !== "boolean") {
          expect(spies[spyName].firstCall.firstArg).to.deep.equal(result);
        } else {
          expect(spies[spyName].called).to.equal(result);
        }
      }
    });
  }

  it("cleans up event handlers when subscription is ended", () => {
    const client = new EventEmitter();
    const stream = createReactionStream(client as Client, services as Services);
    const subscription = stream.subscribe(handler);
    expect(client.listenerCount("messageReactionAdd")).to.equal(1);
    expect(client.listenerCount("messageReactionRemove")).to.equal(1);
    subscription.unsubscribe();
    expect(client.listenerCount("messageReactionAdd")).to.equal(0);
    expect(client.listenerCount("messageReactionRemove")).to.equal(0);
  });
});