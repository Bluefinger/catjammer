import { expect } from "chai";
import type { Config, Services } from "../../src/index.types";
import { createMessageStream } from "../../src/streams";
import type { Client, Message } from "discord.js";
import { EventEmitter } from "events";
import { Permissions } from "../../src/services";
import { Command } from "../../src/commands/type";

const config: Config = {
  token: "a",
  prefix: "!",
  parenthesis: ['"', '"'],
};

const services = {
  permissions: new Permissions(),
} as Services;

const commands: Command[] = [
  {
    name: "ping",
    description: "a ping",
    help: "Something",
    permission: 0,
    definition: "ping :thing",
    execute() {
      return Promise.resolve();
    },
  },
];

describe("createMessageStream.ts", () => {
  describe("createMessageStream", () => {
    it("creates a subscribable Stream", () => {
      const fakeClient = new EventEmitter() as Client;
      const stream = createMessageStream(config, fakeClient, commands, services);
      // eslint-disable-next-line
      expect(stream.subscribe).to.be.a("function");

      // Doesn't initialise listener until subscribed
      expect((fakeClient as EventEmitter).listenerCount("message")).to.equal(0);
      stream.subscribe({
        next: () => {
          expect.fail("Should not execute if no value has been received");
        },
      });
      expect((fakeClient as EventEmitter).listenerCount("message")).to.equal(1);
    });
    it("emits valid message events", () => {
      const assertions = 1;
      let assertionCount = 0;
      const fakeClient = new EventEmitter() as Client;
      const stream = createMessageStream(config, fakeClient, commands, services);
      const fakeMessage = {
        author: {
          bot: false,
          id: "id0",
          presence: {
            member: {
              roles: {
                highest: {
                  id: "id3",
                },
              },
            },
          },
        },
        guild: {
          id: "guild",
        },
        content: "!ping me",
      } as unknown;
      stream.subscribe({
        next: (message) => {
          expect(message).to.deep.equal({
            matched: true,
            message: fakeMessage,
            services,
            commands,
            command: commands[0],
            args: { thing: "me" },
          });
          assertionCount += 1;
        },
      });
      fakeClient.emit("message", fakeMessage as Message);
      expect(assertionCount).to.equal(assertions);
    });
    it("filters messages from a bot", () => {
      const fakeClient = new EventEmitter() as Client;
      const stream = createMessageStream(config, fakeClient, commands, services);
      const fakeMessage = {
        author: {
          bot: true,
        },
        content: "!bot says hi",
      } as unknown;
      stream.subscribe({
        next: () => {
          expect.fail("should not receive emitted message");
        },
      });
      fakeClient.emit("message", fakeMessage as Message);
    });
    it("filters messages that don't begin with the prefix", () => {
      const fakeClient = new EventEmitter() as Client;
      const stream = createMessageStream(config, fakeClient, commands, services);
      const fakeMessage = {
        author: {
          bot: false,
          id: "id0",
          presence: {
            member: {
              roles: {
                highest: {
                  id: "id3",
                },
              },
            },
          },
        },
        guild: {
          id: "guild",
        },
        content: "someone says hi",
      } as unknown;
      stream.subscribe({
        next: () => {
          expect.fail("should not receive emitted message");
        },
      });
      fakeClient.emit("message", fakeMessage as Message);
    });
    it("cleans up event handlers when subscription is ended", () => {
      const fakeClient = new EventEmitter() as Client;
      const stream = createMessageStream(config, fakeClient, commands, services);
      const subscription = stream.subscribe({
        next: () => {
          expect.fail("should not receive emitted message");
        },
      });
      expect((fakeClient as EventEmitter).listenerCount("message")).to.equal(1);
      subscription.unsubscribe();
      expect((fakeClient as EventEmitter).listenerCount("message")).to.equal(0);
    });
  });
});
