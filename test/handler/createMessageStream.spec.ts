import { expect } from "chai";
import { Config, createMessageStream } from "../../src/handler";
import { spy } from "sinon";
import { Client, Message } from "discord.js";
import { EventEmitter } from "events";
import { MatchedCommand } from "../../src/matcher";

const config: Config = {
  token: "a",
  prefix: "!",
  parenthesis: ['"', '"'],
};

describe("createMessageStream.ts", () => {
  describe("createMessageStream", () => {
    it("creates a subscribable Stream", () => {
      const spyMatcher = spy(() => ({} as MatchedCommand));
      const fakeClient = new EventEmitter() as Client;
      const stream = createMessageStream(config, fakeClient, spyMatcher);
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
      const spyMatcher = spy((message: Message) => ({ message } as MatchedCommand));
      const fakeClient = new EventEmitter() as Client;
      const stream = createMessageStream(config, fakeClient, spyMatcher);
      const fakeMessage = {
        author: {
          bot: false,
        },
        content: "!command",
      } as unknown;
      stream.subscribe({
        next: (message) => {
          expect(message).to.deep.equal({ message: fakeMessage });
          expect(spyMatcher.callCount).to.equal(1);
        },
      });
      fakeClient.emit("message", fakeMessage as Message);
    });
    it("filters messages from a bot", () => {
      const spyMatcher = spy((message: Message) => ({ message } as MatchedCommand));
      const fakeClient = new EventEmitter() as Client;
      const stream = createMessageStream(config, fakeClient, spyMatcher);
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
      expect(spyMatcher.callCount).to.equal(0);
    });
    it("filters messages that don't begin with the prefix", () => {
      const spyMatcher = spy((message: Message) => ({ message } as MatchedCommand));
      const fakeClient = new EventEmitter() as Client;
      const stream = createMessageStream(config, fakeClient, spyMatcher);
      const fakeMessage = {
        author: {
          bot: false,
        },
        content: "someone says hi",
      } as unknown;
      stream.subscribe({
        next: () => {
          expect.fail("should not receive emitted message");
        },
      });
      fakeClient.emit("message", fakeMessage as Message);
      expect(spyMatcher.callCount).to.equal(0);
    });
    it("cleans up event handlers when subscription is ended", () => {
      const spyMatcher = spy((message: Message) => ({ message } as MatchedCommand));
      const fakeClient = new EventEmitter() as Client;
      const stream = createMessageStream(config, fakeClient, spyMatcher);
      const subscription = stream.subscribe({
        complete: () => {
          expect((fakeClient as EventEmitter).listenerCount("message")).to.equal(0);
        },
      });
      subscription.unsubscribe();
    });
  });
});
